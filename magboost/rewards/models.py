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

class PremioRuleta(models.Model):
    TIPO_PREMIO_CHOICES = [
        ('tip_laboral', 'Tip Laboral Extra'),
        ('acceso_curso', 'Acceso a Curso Corto'),
        ('magneto_50', '+50 Magneto Points'),
        ('magneto_80', '+80 Magneto Points'),
        ('invita_gana', 'Doble puntos si invitas amigo'),
    ]
    
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_PREMIO_CHOICES)
    valor = models.IntegerField(default=0, help_text="Valor del premio (puntos, etc.)")
    icono = models.CharField(max_length=50, default='🎁')
    probabilidad = models.FloatField(default=16.67, help_text="Probabilidad de obtener este premio (porcentaje)")
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0, help_text="Orden en la ruleta")
    
    class Meta:
        ordering = ['orden']
        
    def __str__(self):
        return f"{self.nombre} ({self.probabilidad}%)"

class RuletaDiariaUsuario(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_giro = models.DateField(auto_now_add=True)
    premio_obtenido = models.ForeignKey(PremioRuleta, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usado = models.BooleanField(default=False, help_text="Si el premio ya fue usado/aplicado")
    
    class Meta:
        unique_together = ['usuario', 'fecha_giro']
        ordering = ['-fecha_creacion']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.premio_obtenido.nombre} ({self.fecha_giro})"
