from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
import random
from datetime import datetime, timedelta
from django.utils import timezone
from gamification.models import MisionUsuario

# ==================== SIMULA QUE RECIBIMOS LA RESPUESTA DE MAGNETO AL COMPLETAR MISION ====================

def simular_verificacion_tarea():
    return random.choice([True] * 8 + [False] * 2)

def procesar_completar_mision_magneto(usuario, mision):

    verificacion_exitosa = simular_verificacion_tarea()
    
    if not verificacion_exitosa:
        return {
            'exitosa': False,
            'error': 'No se pudo verificar la tarea en la página de Magneto',
            'mensaje': ' Intenta nuevamente más tarde'
        }
    mision_usuario, created = MisionUsuario.objects.get_or_create(
        usuario=usuario,
        mision=mision,
        defaults={'completada': True, 'fecha_completada': timezone.now()}
    )
    if not created and not mision_usuario.completada:
        mision_usuario.completada = True
        mision_usuario.fecha_completada = timezone.now()
        mision_usuario.save()
    return {
        'exitosa': True,
        'mision_usuario': mision_usuario,
        'created': created,
        'mensaje': ' Tarea verificada en Magneto'
    }

@api_view(['POST'])
def verificar_tarea_magneto(request):
    tarea_id = request.data.get('tarea_id')
    usuario_id = request.data.get('usuario_id')
    
    verificacion_exitosa = simular_verificacion_tarea()
    
    return Response({
        'tarea_id': tarea_id,
        'usuario_id': usuario_id,
        'verificacion_exitosa': verificacion_exitosa,
        'timestamp': timezone.now().isoformat(),
        'mensaje': 'Tarea verificada en Magneto' if verificacion_exitosa else '❌ No se pudo verificar la tarea'
    })
