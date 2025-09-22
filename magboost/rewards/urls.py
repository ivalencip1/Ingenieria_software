from django.urls import path
from . import views

urlpatterns = [
    path('ruleta/', views.api_ruleta_diaria, name='api_ruleta_diaria'),
    path('ranking/', views.api_ranking, name='api_ranking'),
    path('recompensas/', views.api_recompensas, name='api_recompensas'),
    # Nuevas rutas para la tienda
    path('tienda/categorias/', views.api_categorias_recompensas, name='api_categorias_recompensas'),
    path('tienda/comprar/', views.api_comprar_recompensa, name='api_comprar_recompensa'),
    path('tienda/historial/', views.api_historial_compras, name='api_historial_compras'),
    path('tienda/canjear/', views.api_marcar_canjeado, name='api_marcar_canjeado'),
]