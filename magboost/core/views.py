from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from .models import PerfilUsuario
from .serializers import PerfilUsuarioSerializer

User= get_user_model()

# Create your views here.
def home(request):
    return render(request, 'core/home.html')


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer

@api_view(['GET'])
def perfil_usuario(request):
    """Obtener datos del usuario actual o el primero para testing"""
    if request.user.is_authenticated:
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data)
    else:
        # Para testing sin login
        primer_usuario = User.objects.first()
        if primer_usuario:
            serializer = PerfilUsuarioSerializer(primer_usuario)
            return Response(serializer.data)
        return Response({'error': 'No hay usuarios'}, status=404)


@api_view(['GET'])
def perfil_usuario(request):
    """Obtener datos del usuario actual o el primero para testing"""
    if request.user.is_authenticated:
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data)
    else:
        # Para testing sin login
        primer_usuario = User.objects.first()
        if primer_usuario:
            serializer = PerfilUsuarioSerializer(primer_usuario)
            return Response(serializer.data)
        return Response({'error': 'No hay usuarios'}, status=404)