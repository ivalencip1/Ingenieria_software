from django.urls import path
from . import views

urlpatterns = [
    path('perfil/', views.perfil_usuario, name='perfil-usuario'),
    path('perfil-completo/', views.perfil_completo, name='perfil-completo'),
    path('registro/', views.registro_usuario, name='registro-usuario'),
    path('login/', views.inicio_sesion, name='inicio-sesion'),
]