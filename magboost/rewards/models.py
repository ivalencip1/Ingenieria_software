from django.db import models
from django.conf import settings

class Recompensa(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    costo_puntos = models.IntegerField()
    disponible = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre

class RuletaDiaria(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_ultimo_giro = models.DateField()
    puntos_ganados = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['usuario', 'fecha_ultimo_giro']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.fecha_ultimo_giro} - {self.puntos_ganados} puntos"
