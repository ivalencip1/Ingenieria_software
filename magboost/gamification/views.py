from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from .models import Mision, MisionUsuario
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
        
        return Response({
            'mensaje': f'¡Misión "{mision.titulo}" completada!',
            'puntos_ganados': mision.puntos_recompensa,
            'puntos_totales': usuario.puntos_totales
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

