from django.urls import path
from . import views

urlpatterns = [
    path('verificar-tarea/', views.verificar_tarea_magneto, name='verificar_tarea_magneto'),
]