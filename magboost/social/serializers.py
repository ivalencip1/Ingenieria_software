from rest_framework import serializers
from .models import Vacante
from core.models import Sector


class VacanteSerializer(serializers.ModelSerializer):
	sector = serializers.SerializerMethodField()

	class Meta:
		model = Vacante
		fields = ('id', 'titulo', 'empresa', 'descripcion', 'sector', 'slug', 'external_url', 'fecha_publicacion')

	def get_sector(self, obj):
		if obj.sector:
			return {'id': obj.sector.id, 'name': obj.sector.name, 'slug': obj.sector.slug}
		return None
