from django.urls import path
from . import views

urlpatterns = [
    path('ranking/', views.ranking_usuarios, name='ranking_usuarios'),
]
