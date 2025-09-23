from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from .models import Mision, MisionUsuario, Insignia, InsigniaUsuario
from .serializers import MisionSerializer

User = get_user_model()

@api_view(['GET'])
def misiones_hoy(request):
    """Obtener misiones activas para hoy"""
    # Usuario actual o primero para testing
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    # Obtener todas las misiones activas primero
    misiones_activas = Mision.objects.filter(activa=True)
    
    if usuario:
        # Verificar cuáles ya completó
        misiones_completadas = MisionUsuario.objects.filter(
            usuario=usuario,
            mision__in=misiones_activas,
            completada=True
        ).values_list('mision_id', flat=True)
        
        # Filtrar misiones pendientes y luego aplicar el slice
        misiones_pendientes = misiones_activas.exclude(id__in=misiones_completadas)[:3]
    else:
        # Aplicar slice al final
        misiones_pendientes = misiones_activas[:3]
    
    serializer = MisionSerializer(misiones_pendientes, many=True)
    
    return Response({
        'misiones': serializer.data,
        'total_pendientes': misiones_pendientes.count(),
        'mensaje': f'Aplica a {misiones_pendientes.count()} vacantes' if misiones_pendientes.count() > 0 else '¡Todas las misiones completadas!'
    })

@api_view(['GET'])
def misiones_completadas(request):
    """Obtener lista de misiones completadas por el usuario"""
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    # Obtener misiones completadas con información de la misión
    misiones_completadas = MisionUsuario.objects.filter(
        usuario=usuario, 
        completada=True
    ).select_related('mision').values(
        'id',
        'fecha_completada',
        'mision__id',
        'mision__nombre',
        'mision__descripcion',
        'mision__puntos',
        'mision__icono',
        'mision__tipo'
    ).order_by('-fecha_completada')
    
    return Response(list(misiones_completadas))


@api_view(['POST'])
def completar_mision(request, mision_id):
    """Marcar una misión como completada"""
    try:
        mision = Mision.objects.get(id=mision_id)
        usuario = request.user if request.user.is_authenticated else User.objects.first()
        
        if not usuario:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        mision_usuario, created = MisionUsuario.objects.get_or_create(
            usuario=usuario,
            mision=mision,
            defaults={'completada': True, 'fecha_completada': timezone.now()}
        )
        
        if not created and not mision_usuario.completada:
            mision_usuario.completada = True
            mision_usuario.fecha_completada = timezone.now()
            mision_usuario.save()
        
        # Agregar puntos al usuario
        usuario.puntos_totales += mision.puntos_recompensa
        usuario.save()
        
        # ¡NUEVO! Verificar y otorgar insignias después de completar misión
        nuevas_insignias = verificar_y_otorgar_insignias(usuario)
        
        return Response({
            'mensaje': f'¡Misión "{mision.titulo}" completada!',
            'puntos_ganados': mision.puntos_recompensa,
            'puntos_totales': usuario.puntos_totales,
            'nuevas_insignias': [{'nombre': i.insignia.nombre, 'icono_display': i.insignia.get_icono_display()} for i in nuevas_insignias]
        })
    except Mision.DoesNotExist:
        return Response({'error': 'Misión no encontrada'}, status=404)

@api_view(['GET'])
def progreso_semanal(request):
    """Calcular progreso semanal del usuario"""
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    # Calcular inicio de semana (lunes)
    hoy = timezone.now().date()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    fin_semana = inicio_semana + timedelta(days=6)
    
    # Contar misiones completadas esta semana
    misiones_completadas = MisionUsuario.objects.filter(
        usuario=usuario,
        completada=True,
        fecha_completada__date__range=[inicio_semana, fin_semana]
    ).count()
    
    # Meta semanal
    meta_semanal = 5
    progreso_porcentaje = min((misiones_completadas / meta_semanal) * 100, 100)
    
    return Response({
        'misiones_completadas': misiones_completadas,
        'meta_semanal': meta_semanal,
        'progreso_porcentaje': progreso_porcentaje,
        'racha_activa': misiones_completadas > 0,
        'inicio_semana': inicio_semana,
        'fin_semana': fin_semana
    })

@api_view(['GET'])
def todas_las_misiones(request):
    """Obtener todas las misiones organizadas por tipo"""
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    # Obtener misiones completadas por el usuario
    misiones_completadas = MisionUsuario.objects.filter(
        usuario=usuario,
        completada=True
    ).values_list('mision_id', flat=True)
    
    # Organizar misiones por tipo usando TIPO_CHOICES del modelo
    misiones_por_tipo = {
        'diaria': [],
        'semanal': [],
        'mensual': []
    }
    
    # Obtener misiones por cada tipo
    for tipo_key, tipo_label in Mision.TIPO_CHOICES:
        misiones = Mision.objects.filter(tipo=tipo_key, activa=True)
        
        for mision in misiones:
            misiones_por_tipo[tipo_key].append({
                'id': mision.id,
                'titulo': mision.titulo,
                'descripcion': mision.descripcion,
                'puntos_recompensa': mision.puntos_recompensa,
                'icono': mision.icono,  # Usar icono del modelo
                'completada': mision.id in misiones_completadas,
                'estado': 'Completado' if mision.id in misiones_completadas else 'Pendiente'
            })
    
    return Response({
        'retos_diarios': misiones_por_tipo['diaria'],
        'retos_semanales': misiones_por_tipo['semanal'],
        'retos_mensuales': misiones_por_tipo['mensual']
    })


# ==================== SISTEMA DE INSIGNIAS ====================

def verificar_y_otorgar_insignias(usuario):
    """
    Función que verifica si el usuario cumple criterios para nuevas insignias
    y se las otorga automáticamente
    """
    from .models import Insignia, InsigniaUsuario
    from django.db.models import Count
    from datetime import datetime, timedelta
    
    insignias_obtenidas = []
    
    # Obtener insignias activas que el usuario no tiene
    insignias_disponibles = Insignia.objects.filter(
        activa=True
    ).exclude(
        id__in=InsigniaUsuario.objects.filter(usuario=usuario).values_list('insignia_id', flat=True)
    )
    
    for insignia in insignias_disponibles:
        cumple_criterio = False
        
        # Verificar según el tipo de insignia
        if insignia.tipo == 'misiones_completadas':
            # Contar misiones completadas por el usuario
            total_completadas = MisionUsuario.objects.filter(
                usuario=usuario, completada=True
            ).count()
            
            if total_completadas >= insignia.criterio_valor:
                cumple_criterio = True
                
        elif insignia.tipo == 'progreso_semanal':
            # Verificar si completó el progreso semanal X veces
            # Aquí contamos cuántas semanas ha cumplido la meta
            from django.utils import timezone
            hoy = timezone.now().date()
            
            # Contar semanas donde completó 5 o más misiones
            semanas_completas = 0
            for semana in range(insignia.criterio_valor * 2):  # Revisar las últimas N semanas
                inicio_semana = hoy - timedelta(days=hoy.weekday() + (semana * 7))
                fin_semana = inicio_semana + timedelta(days=6)
                
                misiones_semana = MisionUsuario.objects.filter(
                    usuario=usuario,
                    completada=True,
                    fecha_completada__date__range=[inicio_semana, fin_semana]
                ).count()
                
                if misiones_semana >= 5:  # Meta semanal
                    semanas_completas += 1
                    
            if semanas_completas >= insignia.criterio_valor:
                cumple_criterio = True
                
        elif insignia.tipo == 'puntos_acumulados':
            # Verificar puntos totales del usuario
            if usuario.puntos_totales >= insignia.criterio_valor:
                cumple_criterio = True
                
        elif insignia.tipo == 'tipo_mision':
            # Verificar misiones de un tipo específico (criterio_extra)
            tipo_mision = insignia.criterio_extra
            if tipo_mision:
                misiones_tipo = MisionUsuario.objects.filter(
                    usuario=usuario,
                    completada=True,
                    mision__tipo=tipo_mision
                ).count()
                
                if misiones_tipo >= insignia.criterio_valor:
                    cumple_criterio = True
                    
        elif insignia.tipo == 'racha_diaria':
            # Verificar días consecutivos completando al menos 1 misión
            racha_actual = calcular_racha_diaria(usuario)
            if racha_actual >= insignia.criterio_valor:
                cumple_criterio = True
        
        # Si cumple el criterio, otorgar la insignia
        if cumple_criterio:
            insignia_usuario = InsigniaUsuario.objects.create(
                usuario=usuario,
                insignia=insignia,
                progreso_actual=insignia.criterio_valor
            )
            insignias_obtenidas.append(insignia_usuario)
    
    return insignias_obtenidas


def calcular_racha_diaria(usuario):
    """Calcula la racha actual de días consecutivos completando misiones"""
    from django.utils import timezone
    from datetime import timedelta
    
    hoy = timezone.now().date()
    racha = 0
    
    # Verificar día por día hacia atrás
    for dias_atras in range(30):  # Máximo 30 días hacia atrás
        fecha_check = hoy - timedelta(days=dias_atras)
        
        misiones_dia = MisionUsuario.objects.filter(
            usuario=usuario,
            completada=True,
            fecha_completada__date=fecha_check
        ).count()
        
        if misiones_dia > 0:
            racha += 1
        else:
            break  # Se rompe la racha
            
    return racha


@api_view(['GET'])
def insignias_usuario(request):
    """Obtener insignias del usuario actual"""
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    # Verificar y otorgar nuevas insignias antes de mostrar
    nuevas_insignias = verificar_y_otorgar_insignias(usuario)
    
    # Obtener insignias del usuario
    from .models import InsigniaUsuario, Insignia
    
    insignias_obtenidas = InsigniaUsuario.objects.filter(usuario=usuario).select_related('insignia')
    insignias_disponibles = Insignia.objects.filter(activa=True)
    
    # Formatear insignias obtenidas
    insignias_data = []
    for insignia_usuario in insignias_obtenidas:
        insignias_data.append({
            'id': insignia_usuario.insignia.id,
            'nombre': insignia_usuario.insignia.nombre,
            'descripcion': insignia_usuario.insignia.descripcion,
            'imagen_url': insignia_usuario.insignia.get_icono_url(),
            'icono_fallback': insignia_usuario.insignia.icono_fallback,
            'icono_display': insignia_usuario.insignia.get_icono_display(),
            'tipo': insignia_usuario.insignia.get_tipo_display(),
            'fecha_obtenida': insignia_usuario.fecha_obtenida.isoformat(),
            'obtenida': True
        })
    
    # Formatear insignias disponibles (no obtenidas)
    ids_obtenidas = [i.insignia.id for i in insignias_obtenidas]
    insignias_pendientes = []
    
    for insignia in insignias_disponibles:
        if insignia.id not in ids_obtenidas:
            # Calcular progreso actual
            progreso = calcular_progreso_insignia(usuario, insignia)
            
            insignias_pendientes.append({
                'id': insignia.id,
                'nombre': insignia.nombre,
                'descripcion': insignia.descripcion,
                'imagen_url': insignia.get_icono_url(),
                'icono_fallback': insignia.icono_fallback,
                'icono_display': insignia.get_icono_display(),
                'tipo': insignia.get_tipo_display(),
                'criterio_valor': insignia.criterio_valor,
                'progreso_actual': progreso,
                'progreso_porcentaje': min((progreso / insignia.criterio_valor) * 100, 100),
                'obtenida': False
            })
    
    return Response({
        'insignias_obtenidas': insignias_data,
        'insignias_pendientes': insignias_pendientes,
        'total_obtenidas': len(insignias_data),
        'nuevas_insignias': [{'nombre': i.insignia.nombre, 'icono_display': i.insignia.get_icono_display()} for i in nuevas_insignias]
    })


def calcular_progreso_insignia(usuario, insignia):
    """Calcula el progreso actual del usuario hacia una insignia específica"""
    if insignia.tipo == 'misiones_completadas':
        return MisionUsuario.objects.filter(usuario=usuario, completada=True).count()
        
    elif insignia.tipo == 'puntos_acumulados':
        return usuario.puntos_totales
        
    elif insignia.tipo == 'tipo_mision':
        tipo_mision = insignia.criterio_extra
        if tipo_mision:
            return MisionUsuario.objects.filter(
                usuario=usuario,
                completada=True,
                mision__tipo=tipo_mision
            ).count()
            
    elif insignia.tipo == 'racha_diaria':
        return calcular_racha_diaria(usuario)
        
    elif insignia.tipo == 'progreso_semanal':
        # Contar semanas completadas
        from django.utils import timezone
        from datetime import timedelta
        
        hoy = timezone.now().date()
        semanas_completas = 0
        
        for semana in range(10):  # Revisar últimas 10 semanas
            inicio_semana = hoy - timedelta(days=hoy.weekday() + (semana * 7))
            fin_semana = inicio_semana + timedelta(days=6)
            
            misiones_semana = MisionUsuario.objects.filter(
                usuario=usuario,
                completada=True,
                fecha_completada__date__range=[inicio_semana, fin_semana]
            ).count()
            
            if misiones_semana >= 5:
                semanas_completas += 1
                
        return semanas_completas
    
    return 0

