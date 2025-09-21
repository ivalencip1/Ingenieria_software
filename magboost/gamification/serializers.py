from rest_framework import serializers
from .models import Mision, MisionUsuario

class MisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mision
        fields = '__all__'

class MisionUsuarioSerializer(serializers.ModelSerializer):
    mision = MisionSerializer(read_only=True)
    
    class Meta:
        model = MisionUsuario
        fields = '__all__'