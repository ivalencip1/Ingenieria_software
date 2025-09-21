from django.db import models
from django.conf import settings

# Create your models here.
class Mision(models.Model):
    TIPO_CHOICES = [
        ('diaria', 'Reto diario'),
        ('semanal', 'Reto semanal'),
        ('mensual', 'Reto mensual'),
    ]
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    puntos_recompensa = models.IntegerField(default=10)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='diaria')
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    icono = models.CharField(max_length=50, default='🏆') 
    
    def __str__(self):
        return f"{self.titulo} ({self.tipo})"

class MisionUsuario(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mision = models.ForeignKey(Mision, on_delete=models.CASCADE)
    completada = models.BooleanField(default=False)
    fecha_completada = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['usuario', 'mision']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.mision.titulo}"