from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view
from .models import PerfilUsuario
from .serializers import PerfilUsuarioSerializer
from gamification.models import MisionUsuario, InsigniaUsuario
from django.utils import timezone
from datetime import timedelta
from rest_framework.authtoken.models import Token

User = get_user_model()

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


@api_view(['POST'])
def login_usuario(request):
    """Endpoint para login de usuarios"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email y contraseña son requeridos'}, status=400)

    try:
        usuario = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Credenciales inválidas'}, status=401)

    # Verificar contraseña
    if not usuario.check_password(password):
        return Response({'error': 'Credenciales inválidas'}, status=401)

    # Generar o obtener token
    token, created = Token.objects.get_or_create(user=usuario)

    # Preparar datos del usuario
    user_data = PerfilUsuarioSerializer(usuario).data
    user_data['id'] = usuario.id

    return Response({
        'token': token.key,
        'user': user_data,
        'message': f'Bienvenido {usuario.first_name or usuario.username}!',
    })


@api_view(['POST'])
def signup_usuario(request):
    """Endpoint para registrar nuevos usuarios"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    bio = request.data.get('bio', '')

    # Validaciones
    if not all([username, email, password]):
        return Response({'error': 'Username, email y contraseña son requeridos'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'El usuario ya existe'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'El email ya está registrado'}, status=400)

    if len(password) < 6:
        return Response({'error': 'La contraseña debe tener al menos 6 caracteres'}, status=400)

    # Crear usuario
    try:
        usuario = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            bio=bio,
        )

        # Generar token
        token, created = Token.objects.get_or_create(user=usuario)

        # Preparar datos del usuario
        user_data = PerfilUsuarioSerializer(usuario).data
        user_data['id'] = usuario.id

        return Response({
            'token': token.key,
            'user': user_data,
            'message': f'¡Bienvenido {usuario.first_name or usuario.username}!',
        }, status=201)

    except Exception as e:
        return Response({'error': f'Error al crear usuario: {str(e)}'}, status=500)


@api_view(['POST'])
def save_survey(request):
    """Endpoint para guardar las respuestas de la encuesta de onboarding"""
    usuario_id = request.data.get('usuario_id')
    
    if not usuario_id:
        return Response({'error': 'usuario_id es requerido'}, status=400)

    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

    try:
        # Actualizar campos de la encuesta
        usuario.connection_level = request.data.get('connection_level', '')
        usuario.professional_stage = request.data.get('professional_stage', '')
        usuario.challenge_types = request.data.get('challenge_types', [])
        usuario.motivating_topics = request.data.get('motivating_topics', [])
        usuario.main_motivation = request.data.get('main_motivation', '')
        usuario.frequency = request.data.get('frequency', '')
        usuario.notification_method = request.data.get('notification_method', '')
        usuario.survey_completed = True
        
        # Actualizar biografía si se proporciona
        if 'bio' in request.data and request.data.get('bio'):
            usuario.bio = request.data.get('bio')

        usuario.save()

        # Retornar datos actualizados sin serializer para evitar problemas con campos de imagen
        return Response({
            'success': True,
            'message': 'Encuesta guardada exitosamente',
            'user': {
                'id': usuario.id,
                'email': usuario.email,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'bio': usuario.bio,
                'puntos_totales': usuario.puntos_totales,
                'survey_completed': usuario.survey_completed,
            },
        }, status=200)
    except Exception as e:
        return Response({'error': f'Error al guardar encuesta: {str(e)}'}, status=500)