from django.contrib import admin
from .models import Recompensa, RuletaDiaria

@admin.register(Recompensa)
class RecompensaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'costo_puntos', 'disponible']
    list_filter = ['disponible', 'costo_puntos']
    search_fields = ['nombre', 'descripcion']

@admin.register(RuletaDiaria)
class RuletaDiariaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'fecha_ultimo_giro', 'puntos_ganados']
    list_filter = ['fecha_ultimo_giro', 'puntos_ganados']
    search_fields = ['usuario__username']