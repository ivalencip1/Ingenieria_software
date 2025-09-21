from django.contrib import admin
from .models import Mision, MisionUsuario

@admin.register(Mision)
class MisionAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'puntos_recompensa', 'activa']
    list_filter = ['activa', 'puntos_recompensa']
    search_fields = ['titulo', 'descripcion']

@admin.register(MisionUsuario)
class MisionUsuarioAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'mision', 'completada', 'fecha_completada']
    list_filter = ['completada', 'fecha_completada']
    search_fields = ['usuario__username', 'mision__titulo']