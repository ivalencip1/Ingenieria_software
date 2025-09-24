from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Mision, MisionUsuario, Insignia, InsigniaUsuario
from .serializers import MisionSerializer
from magnetosimulator.views import procesar_completar_mision_magneto
from django.db.models import Count
from datetime import datetime, timedelta
import random
from core.models import PerfilUsuario
    
User = get_user_model()

@api_view(['GET'])
def misiones_hoy(request):
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    misiones_activas = Mision.objects.filter(activa=True)
    
    if usuario:
 
        misiones_completadas = MisionUsuario.objects.filter(
            usuario=usuario,
            mision__in=misiones_activas,
            completada=True
        ).values_list('mision_id', flat=True)
        
        misiones_pendientes = misiones_activas.exclude(id__in=misiones_completadas)[:3]
    else:
        misiones_pendientes = misiones_activas[:3]
    
    serializer = MisionSerializer(misiones_pendientes, many=True)
    
    return Response({
        'misiones': serializer.data,
        'total_pendientes': misiones_pendientes.count(),
        'mensaje': f'Aplica a {misiones_pendientes.count()} vacantes' if misiones_pendientes.count() > 0 else '¡Todas las misiones completadas!'
    })

@api_view(['GET'])
def misiones_completadas(request):
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
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
    try:
        mision = Mision.objects.get(id=mision_id)
        usuario_id = None
        try:
            usuario_id = request.data.get('usuario_id') if hasattr(request, 'data') else None
        except Exception:
            usuario_id = None
        if usuario_id:
            try:
                usuario = User.objects.get(id=usuario_id)
            except User.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=404)
        else:
            usuario = request.user if request.user.is_authenticated else User.objects.first()
        
        if not usuario:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        resultado_magneto = procesar_completar_mision_magneto(usuario, mision)
        
        if not resultado_magneto['exitosa']:
            return Response(resultado_magneto, status=400)
        usuario.puntos_totales += mision.puntos_recompensa
        usuario.save()
        nuevas_insignias = verificar_y_otorgar_insignias(usuario)
        
        return Response({
            'mensaje': f'¡Misión "{mision.titulo}" completada!',
            'puntos_ganados': mision.puntos_recompensa,
            'puntos_totales': usuario.puntos_totales,
            'nuevas_insignias': [{'nombre': i.insignia.nombre, 'icono_display': i.insignia.get_icono_display()} for i in nuevas_insignias],
            'verificado_en_magneto': True
        })
    except Mision.DoesNotExist:
        return Response({'error': 'Misión no encontrada'}, status=404)

@api_view(['GET'])
def progreso_semanal(request):
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    hoy = timezone.now().date()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    fin_semana = inicio_semana + timedelta(days=6)

    misiones_completadas = MisionUsuario.objects.filter(
        usuario=usuario,
        completada=True,
        fecha_completada__date__range=[inicio_semana, fin_semana]
    ).count()
    # Meta semanal
    meta_semanal = 10
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
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    misiones_completadas = MisionUsuario.objects.filter(
        usuario=usuario,
        completada=True
    ).values_list('mision_id', flat=True)
    
    misiones_por_tipo = {
        'diaria': [],
        'semanal': [],
        'mensual': []
    }
    for tipo_key, tipo_label in Mision.TIPO_CHOICES:
        misiones = Mision.objects.filter(tipo=tipo_key, activa=True)
        
        for mision in misiones:
            misiones_por_tipo[tipo_key].append({
                'id': mision.id,
                'titulo': mision.titulo,
                'descripcion': mision.descripcion,
                'puntos_recompensa': mision.puntos_recompensa,
                'icono': mision.icono,  
                'completada': mision.id in misiones_completadas,
                'estado': 'Completado' if mision.id in misiones_completadas else 'Pendiente'
            })
    
    return Response({
        'retos_diarios': misiones_por_tipo['diaria'],
        'retos_semanales': misiones_por_tipo['semanal'],
        'retos_mensuales': misiones_por_tipo['mensual']
    })


# ------------------ SISTEMA DE INSIGNIAS ---------

def verificar_y_otorgar_insignias(usuario):
    insignias_obtenidas = []

    insignias_disponibles = Insignia.objects.filter(
        activa=True
    ).exclude(
        id__in=InsigniaUsuario.objects.filter(usuario=usuario).values_list('insignia_id', flat=True)
    )
    
    for insignia in insignias_disponibles:
        cumple_criterio = False

        if insignia.tipo == 'misiones_completadas':
            total_completadas = MisionUsuario.objects.filter(
                usuario=usuario, completada=True
            ).count()
            
            if total_completadas >= insignia.criterio_valor:
                cumple_criterio = True
                
        elif insignia.tipo == 'progreso_semanal':
            from django.utils import timezone
            hoy = timezone.now().date()
            semanas_completas = 0
            for semana in range(insignia.criterio_valor * 2):  
                inicio_semana = hoy - timedelta(days=hoy.weekday() + (semana * 7))
                fin_semana = inicio_semana + timedelta(days=6)
                
                misiones_semana = MisionUsuario.objects.filter(
                    usuario=usuario,
                    completada=True,
                    fecha_completada__date__range=[inicio_semana, fin_semana]
                ).count()
                
                if misiones_semana >= 10:  # Meta semanal
                    semanas_completas += 1
                    
            if semanas_completas >= insignia.criterio_valor:
                cumple_criterio = True           
        elif insignia.tipo == 'puntos_acumulados':
            if usuario.puntos_totales >= insignia.criterio_valor:
                cumple_criterio = True              
        elif insignia.tipo == 'tipo_mision':
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
            racha_actual = calcular_racha_diaria(usuario)
            if racha_actual >= insignia.criterio_valor:
                cumple_criterio = True
        
        if cumple_criterio:
            insignia_usuario = InsigniaUsuario.objects.create(
                usuario=usuario,
                insignia=insignia,
                progreso_actual=insignia.criterio_valor
            )
            insignias_obtenidas.append(insignia_usuario)
    
    return insignias_obtenidas


def calcular_racha_diaria(usuario):
    hoy = timezone.now().date()
    racha = 0
    for dias_atras in range(30): 
        fecha_check = hoy - timedelta(days=dias_atras)
        
        misiones_dia = MisionUsuario.objects.filter(
            usuario=usuario,
            completada=True,
            fecha_completada__date=fecha_check
        ).count()
        
        if misiones_dia > 0:
            racha += 1
        else:
            break 
            
    return racha


@api_view(['GET'])
def insignias_usuario(request):
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    nuevas_insignias = verificar_y_otorgar_insignias(usuario)
    from .models import InsigniaUsuario, Insignia
    
    insignias_obtenidas = InsigniaUsuario.objects.filter(usuario=usuario).select_related('insignia')
    insignias_disponibles = Insignia.objects.filter(activa=True)

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

    ids_obtenidas = [i.insignia.id for i in insignias_obtenidas]
    insignias_pendientes = []
    
    for insignia in insignias_disponibles:
        if insignia.id not in ids_obtenidas:
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
        from django.utils import timezone
        from datetime import timedelta
        
        hoy = timezone.now().date()
        semanas_completas = 0
        
        for semana in range(10):  
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

