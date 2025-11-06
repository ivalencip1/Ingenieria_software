from django.urls import path
from . import views

urlpatterns = [
    path('ruleta/premios/', views.obtener_premios_ruleta, name='obtener_premios_ruleta'),
    path('ruleta/puede-girar/', views.puede_girar_ruleta, name='puede_girar_ruleta'),
    path('ruleta/girar/', views.girar_ruleta, name='girar_ruleta'),
    path('ruleta/historial/', views.historial_ruleta, name='historial_ruleta'),
    
    # URLs existentes
    path('ranking/', views.api_ranking, name='api_ranking'),
    path('recompensas/', views.api_recompensas, name='api_recompensas'),
    path('tienda/categorias/', views.api_categorias_recompensas, name='api_categorias_recompensas'),
    path('tienda/comprar/', views.api_comprar_recompensa, name='api_comprar_recompensa'),
    path('tienda/upload-cv/', views.api_upload_cv, name='api_upload_cv'),
    path('tienda/historial/', views.api_historial_compras, name='api_historial_compras'),
    path('tienda/canjear/', views.api_marcar_canjeado, name='api_marcar_canjeado'),
]