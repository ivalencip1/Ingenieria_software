from django.urls import path
from . import views

urlpatterns = [
    path('misiones/', views.misiones_hoy, name='misiones-hoy'),
    path('todas-misiones/', views.todas_las_misiones, name='todas-misiones'),
    path('misiones-completadas/', views.misiones_completadas, name='misiones-completadas'),
    path('misiones/<int:mision_id>/completar/', views.completar_mision, name='completar-mision'),
    path('progreso/', views.progreso_semanal, name='progreso-semanal'),
    path('insignias/', views.insignias_usuario, name='insignias-usuario'),
]