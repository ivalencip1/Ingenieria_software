from django.db import models
from django.conf import settings

class CategoriaRecompensa(models.Model):
    nombre = models.CharField(max_length=100)
    icono = models.CharField(max_length=50, default='🎁')
    descripcion = models.TextField(blank=True)
    
    def __str__(self):
        return self.nombre

class Recompensa(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    costo_puntos = models.IntegerField()
    categoria = models.ForeignKey(CategoriaRecompensa, on_delete=models.CASCADE, null=True, blank=True)
    icono = models.CharField(max_length=50, default='🎁')
    
    disponible = models.BooleanField(default=True)
   
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['categoria', 'costo_puntos']
    
    def __str__(self):
        return f"{self.nombre} ({self.costo_puntos} puntos)"

class CompraRecompensa(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    recompensa = models.ForeignKey(Recompensa, on_delete=models.CASCADE)
    puntos_gastados = models.IntegerField()
    fecha_compra = models.DateTimeField(auto_now_add=True)
    canjeado = models.BooleanField(default=False)  # Si ya utilizó la recompensa
    
    class Meta:
        ordering = ['-fecha_compra']
    
    def __str__(self):
        return f"{self.usuario.username} compró {self.recompensa.nombre}"

class RuletaDiaria(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_ultimo_giro = models.DateField()
    puntos_ganados = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['usuario', 'fecha_ultimo_giro']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.fecha_ultimo_giro} - {self.puntos_ganados} puntos"
