from django.contrib import admin
from .models import CategoriaRecompensa, Recompensa, CompraRecompensa, RuletaDiaria

@admin.register(CategoriaRecompensa)
class CategoriaRecompensaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'icono']
    search_fields = ['nombre']

@admin.register(Recompensa)
class RecompensaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'costo_puntos', 'disponible']
    list_filter = ['categoria', 'disponible', 'costo_puntos']
    search_fields = ['nombre', 'descripcion']

@admin.register(CompraRecompensa)
class CompraRecompensaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'recompensa', 'puntos_gastados', 'fecha_compra', 'canjeado']
    list_filter = ['fecha_compra', 'canjeado', 'recompensa__categoria']
    search_fields = ['usuario__username', 'recompensa__nombre']
    list_editable = ['canjeado']
    readonly_fields = ['fecha_compra']

@admin.register(RuletaDiaria)
class RuletaDiariaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'fecha_ultimo_giro', 'puntos_ganados']
    list_filter = ['fecha_ultimo_giro', 'puntos_ganados']
    search_fields = ['usuario__username']