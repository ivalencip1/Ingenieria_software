from django.contrib import admin
from .models import Vacante


@admin.register(Vacante)
class VacanteAdmin(admin.ModelAdmin):
	list_display = ('titulo', 'empresa', 'sector', 'fecha_publicacion')
	search_fields = ('titulo', 'empresa', 'descripcion')
	list_filter = ('sector',)
