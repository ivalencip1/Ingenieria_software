from rest_framework import serializers
from .models import PerfilUsuario
from .models import Sector

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    sectors = serializers.SlugRelatedField(many=True, slug_field='name', queryset=Sector.objects.all())
    class Meta:
        model = PerfilUsuario
        fields = '__all__'  