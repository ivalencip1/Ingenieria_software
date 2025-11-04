from django.urls import path
from . import views

urlpatterns = [
    path('usuario/<int:usuario_id>/', views.listar_notificaciones, name='notifications-listar'),
    path('usuario/<int:usuario_id>/marcar-todas-leidas/', views.marcar_todas_leidas, name='notifications-marcar-todas'),
    path('usuario/<int:usuario_id>/bienvenida/', views.bienvenida, name='notifications-bienvenida'),
    path('usuario/<int:usuario_id>/verificar-misiones/', views.verificar_misiones, name='notifications-verificar-misiones'),
    path('notificacion/<int:notificacion_id>/marcar-leida/', views.marcar_leida, name='notifications-marcar-leida'),
]
