from rest_framework import serializers
from .models import PremioRuleta, RuletaDiariaUsuario

class PremioRuletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PremioRuleta
        fields = ['id', 'nombre', 'descripcion', 'tipo', 'valor', 'icono', 'probabilidad']

class RuletaDiariaUsuarioSerializer(serializers.ModelSerializer):
    premio_obtenido = PremioRuletaSerializer(read_only=True)
    
    class Meta:
        model = RuletaDiariaUsuario
        fields = ['id', 'fecha_giro', 'premio_obtenido', 'fecha_creacion', 'usado']