from django.shortcuts import render
from rest_framework import viewsets
from .models import PerfilUsuario
from .serializers import PerfilUsuarioSerializer


# Create your views here.
def home(request):
    return render(request, 'core/home.html')


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer
