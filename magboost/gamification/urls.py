from django.urls import path
from . import views

urlpatterns = [
    path('misiones/', views.misiones_hoy, name='misiones-hoy'),
    path('todas-misiones/', views.todas_las_misiones, name='todas-misiones'),
    path('misiones/<int:mision_id>/completar/', views.completar_mision, name='completar-mision'),
    path('progreso/', views.progreso_semanal, name='progreso-semanal'),
]