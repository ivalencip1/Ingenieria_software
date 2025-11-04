from django.db import models
from django.conf import settings


class Notificacion(models.Model):
	TIPO_CHOICES = (
		("sistema", "Sistema"),
		("bienvenida", "Bienvenida"),
		("mision_pendiente", "Misión pendiente"),
		("recordatorio", "Recordatorio"),
	)

	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notificaciones")
	titulo = models.CharField(max_length=120)
	mensaje = models.TextField()
	tipo = models.CharField(max_length=32, choices=TIPO_CHOICES, default="sistema")
	icono = models.CharField(max_length=8, blank=True, null=True)
	leida = models.BooleanField(default=False)
	fecha_creacion = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-fecha_creacion"]

	def __str__(self):
		return f"{self.usuario_id} - {self.titulo} ({self.tipo})"


