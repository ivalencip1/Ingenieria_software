from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.decorators import api_view
from .models import PerfilUsuario
from .serializers import PerfilUsuarioSerializer
from django.contrib.auth.hashers import make_password
import json

User = PerfilUsuario  # Usar PerfilUsuario como modelo de usuario

# Create your views here.
def home(request):
    return render(request, 'core/home.html')


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer

@api_view(['GET'])
def perfil_usuario(request):
    """Obtener datos del usuario actual por ID o el primero para testing"""
    user_id = request.GET.get('user_id')
    
    if user_id:
        try:
            usuario = User.objects.get(id=user_id)
            serializer = PerfilUsuarioSerializer(usuario)
            return Response(serializer.data)
        except User.DoesNotExist:
            pass
    
    # Si no hay user_id o no se encuentra, usar el primero
    primer_usuario = User.objects.first()
    if primer_usuario:
        serializer = PerfilUsuarioSerializer(primer_usuario)
        return Response(serializer.data)
    return Response({'error': 'No hay usuarios'}, status=404)


@api_view(['GET'])
def perfil_completo(request):
    """Obtener perfil completo del usuario con insignias, misiones y estadísticas"""
    user_id = request.GET.get('user_id')
    
    # Buscar usuario por ID si se proporciona
    if user_id:
        try:
            usuario = User.objects.get(id=user_id)
        except User.DoesNotExist:
            usuario = User.objects.first()
    else:
        usuario = User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
   
    from gamification.models import MisionUsuario, InsigniaUsuario
    from django.utils import timezone
    from datetime import timedelta
    
    # Datos básicos del usuario
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
            'icono_fallback': insignia_usuario.insignia.icono_fallback,
            'icono_display': insignia_usuario.insignia.get_icono_display(),
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
def registro_usuario(request):
    """Vista para registro rápido de usuarios estudiantes"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
            nombre_completo = data.get('nombre_completo', username)
            
            # Validar datos requeridos
            if not username or not password:
                return Response({
                    'success': False,
                    'message': 'Usuario y contraseña son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si el usuario ya existe
            if PerfilUsuario.objects.filter(username=username).exists():
                return Response({
                    'success': False,
                    'message': 'El nombre de usuario ya existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear usuario (PerfilUsuario hereda de AbstractUser)
            user = PerfilUsuario.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=nombre_completo,
                puntos_totales=0,
                bio=f"Estudiante {nombre_completo} - ¡Bienvenido a MagBoost!"
            )
            
            return Response({
                'success': True,
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'nombre_completo': user.first_name,
                    'puntos_totales': user.puntos_totales,
                    'bio': user.bio
                }
            }, status=status.HTTP_201_CREATED)
            
        except json.JSONDecodeError:
            return Response({
                'success': False,
                'message': 'Datos JSON inválidos'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def inicio_sesion(request):
    """Vista para inicio de sesión de usuarios"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return Response({
                    'success': False,
                    'message': 'Usuario y contraseña son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Autenticar usuario
            user = authenticate(username=username, password=password)
            
            if user is not None:
                login(request, user)
                
                return Response({
                    'success': True,
                    'message': 'Inicio de sesión exitoso',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'nombre_completo': user.first_name,
                        'puntos_totales': user.puntos_totales,
                        'bio': user.bio or f"Estudiante {user.first_name}"
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Credenciales incorrectas'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except json.JSONDecodeError:
            return Response({
                'success': False,
                'message': 'Datos JSON inválidos'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)