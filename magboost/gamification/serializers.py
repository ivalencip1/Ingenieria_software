from rest_framework import serializers
from .models import Mision, MisionUsuario, PremioRuleta, RuletaDiariaUsuario

class MisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mision
        fields = '__all__'

class MisionUsuarioSerializer(serializers.ModelSerializer):
    mision = MisionSerializer(read_only=True)
    
    class Meta:
        model = MisionUsuario
        fields = '__all__'

class PremioRuletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PremioRuleta
        fields = '__all__'

class RuletaDiariaUsuarioSerializer(serializers.ModelSerializer):
    premio_obtenido = PremioRuletaSerializer(read_only=True)
    
    class Meta:
        model = RuletaDiariaUsuario
        fields = '__all__'