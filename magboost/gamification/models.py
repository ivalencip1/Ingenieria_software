from django.db import models
from django.conf import settings

# Create your models here.
class Mision(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    puntos_recompensa = models.IntegerField(default=10)
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo

class MisionUsuario(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mision = models.ForeignKey(Mision, on_delete=models.CASCADE)
    completada = models.BooleanField(default=False)
    fecha_completada = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['usuario', 'mision']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.mision.titulo}"