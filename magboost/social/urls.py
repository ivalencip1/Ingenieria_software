from django.urls import path
from . import views

urlpatterns = [
    path('ranking/', views.ranking_usuarios, name='ranking_usuarios'),
    path('vacantes/', views.listar_vacantes, name='listar_vacantes'),
    path('vacantes/<slug:slug>/', views.detalle_vacante, name='detalle_vacante'),
]
