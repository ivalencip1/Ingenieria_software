from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
	list_display = ("id", "usuario", "titulo", "tipo", "leida", "fecha_creacion")
	list_filter = ("tipo", "leida", "fecha_creacion")
	search_fields = ("titulo", "mensaje", "usuario__username", "usuario__email")
	date_hierarchy = "fecha_creacion"
	ordering = ("-fecha_creacion",)
	list_select_related = ("usuario",)

	actions = ("marcar_como_leidas", "marcar_como_no_leidas",)

	def marcar_como_leidas(self, request, queryset):
		updated = queryset.update(leida=True)
		self.message_user(request, f"{updated} notificaciones marcadas como leídas.")

	marcar_como_leidas.short_description = "Marcar como leídas"

	def marcar_como_no_leidas(self, request, queryset):
		updated = queryset.update(leida=False)
		self.message_user(request, f"{updated} notificaciones marcadas como no leídas.")

	marcar_como_no_leidas.short_description = "Marcar como no leídas"

