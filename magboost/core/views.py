from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from .models import PerfilUsuario
from .serializers import PerfilUsuarioSerializer
from gamification.models import MisionUsuario, InsigniaUsuario
from django.utils import timezone
from datetime import timedelta

User= get_user_model()

# Create your views here.
def home(request):
    return render(request, 'core/home.html')


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer


@api_view(['GET'])
def perfil_usuario(request):
    if request.user.is_authenticated:
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data)
    else:
        # Para testing sin login -->temporal
        primer_usuario = User.objects.first()
        if primer_usuario:
            serializer = PerfilUsuarioSerializer(primer_usuario)
            return Response(serializer.data)
        return Response({'error': 'No hay usuarios'}, status=404)



@api_view(['GET'])
def perfil_completo(request):
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
    
    perfil_data = PerfilUsuarioSerializer(usuario).data
    total_misiones = MisionUsuario.objects.filter(usuario=usuario, completada=True).count()
    
    misiones_diarias = MisionUsuario.objects.filter(
        usuario=usuario, completada=True, mision__tipo='diaria'
    ).count()
    misiones_semanales = MisionUsuario.objects.filter(
        usuario=usuario, completada=True, mision__tipo='semanal'
    ).count()
    misiones_mensuales = MisionUsuario.objects.filter(
        usuario=usuario, completada=True, mision__tipo='mensual'
    ).count()
    
    insignias_obtenidas = InsigniaUsuario.objects.filter(usuario=usuario).select_related('insignia')
    insignias_data = []
    
    for insignia_usuario in insignias_obtenidas:
        insignias_data.append({
            'id': insignia_usuario.insignia.id,
            'nombre': insignia_usuario.insignia.nombre,
            'descripcion': insignia_usuario.insignia.descripcion,
            'imagen_url': insignia_usuario.insignia.get_icono_url(),
            'tipo': insignia_usuario.insignia.get_tipo_display(),
            'fecha_obtenida': insignia_usuario.fecha_obtenida.isoformat(),
        })
    
    hoy = timezone.now().date()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    fin_semana = inicio_semana + timedelta(days=6)
    
    misiones_esta_semana = MisionUsuario.objects.filter(
        usuario=usuario,
        completada=True,
        fecha_completada__date__range=[inicio_semana, fin_semana]
    ).count()
    
    meta_semanal = 10
    progreso_semanal = {
        'completadas': misiones_esta_semana,
        'meta': meta_semanal,
        'porcentaje': min((misiones_esta_semana / meta_semanal) * 100, 100)
    }
    
    return Response({
        'perfil': perfil_data,
        'estadisticas': {
            'total_misiones': total_misiones,
            'misiones_diarias': misiones_diarias,
            'misiones_semanales': misiones_semanales,
            'misiones_mensuales': misiones_mensuales,
            'total_puntos': usuario.puntos_totales,
        },
        'insignias_obtenidas': insignias_data,
        'total_insignias': len(insignias_data),
        'progreso_semanal': progreso_semanal,
        'biografia': usuario.bio or "Desarrollador Full Stack apasionado por crear soluciones innovadoras.",
    })