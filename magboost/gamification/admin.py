from django.contrib import admin
from .models import Mision, MisionUsuario, Insignia, InsigniaUsuario

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

@admin.register(Insignia)
class InsigniaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'criterio_valor', 'activa', 'orden', 'tiene_imagen']
    list_filter = ['tipo', 'activa']
    search_fields = ['nombre', 'descripcion']
    ordering = ['orden', 'criterio_valor']
    readonly_fields = ['preview_imagen']
    
    def tiene_imagen(self, obj):
        return "✅" if obj.imagen else "❌"
    tiene_imagen.short_description = "Imagen"
    
    def preview_imagen(self, obj):
        if obj.imagen:
            return f'<img src="{obj.imagen.url}" style="max-height: 100px; max-width: 100px;" />'
        return "No hay imagen"
    preview_imagen.short_description = "Vista previa"
    preview_imagen.allow_tags = True

@admin.register(InsigniaUsuario)
class InsigniaUsuarioAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'insignia', 'fecha_obtenida', 'progreso_actual']
    list_filter = ['insignia__tipo', 'fecha_obtenida']
    search_fields = ['usuario__username', 'insignia__nombre']
    readonly_fields = ['fecha_obtenida']