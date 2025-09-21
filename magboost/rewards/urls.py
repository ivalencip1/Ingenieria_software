from django.urls import path
from . import views

urlpatterns = [
    path('ruleta/', views.api_ruleta_diaria, name='api_ruleta_diaria'),
    path('ranking/', views.api_ranking, name='api_ranking'),
    path('recompensas/', views.api_recompensas, name='api_recompensas'),
]