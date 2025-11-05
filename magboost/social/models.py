from django.db import models
from django.utils.text import slugify
from core.models import Sector


class Vacante(models.Model):
	titulo = models.CharField(max_length=200)
	empresa = models.CharField(max_length=200, blank=True)
	descripcion = models.TextField(blank=True)
	sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name='vacantes')
	slug = models.SlugField(max_length=250, unique=True, blank=True)
	external_url = models.URLField(blank=True, null=True)
	fecha_publicacion = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-fecha_publicacion']

	def __str__(self):
		return f"{self.titulo} @ {self.empresa}"

	def save(self, *args, **kwargs):
		if not self.slug:
			base = f"{self.titulo}-{self.empresa or ''}"
			candidate = slugify(base)[:200]
			# Ensure uniqueness
			suffix = 0
			slug = candidate
			while Vacante.objects.filter(slug=slug).exists():
				suffix += 1
				slug = f"{candidate}-{suffix}"
			self.slug = slug
		super().save(*args, **kwargs)

# Create your models here.
