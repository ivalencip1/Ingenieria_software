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


class Insignia(models.Model):
    """Modelo para las insignias del sistema"""
    TIPO_CHOICES = [
        ('misiones_completadas', 'Por número de misiones completadas'),
        ('progreso_semanal', 'Por completar progreso semanal'),
        ('racha_diaria', 'Por racha de días consecutivos'),
        ('puntos_acumulados', 'Por acumular puntos'),
        ('tipo_mision', 'Por completar tipos específicos de misiones'),
        ('especial', 'Insignia especial'),
    ]
    
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='insignias/', blank=True, null=True, help_text="Imagen de la insignia")
    icono_fallback = models.CharField(max_length=50, default='🏅', help_text="Emoji como fallback si no hay imagen")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    
    # Criterios para obtener la insignia
    criterio_valor = models.IntegerField(help_text="Valor necesario para obtener la insignia (ej: 10 misiones)")
    criterio_extra = models.CharField(max_length=100, blank=True, null=True, help_text="Criterio adicional si es necesario")
    
    # Configuración
    activa = models.BooleanField(default=True)
    orden = models.IntegerField(default=0, help_text="Orden de dificultad (menor = más fácil)")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['orden', 'criterio_valor']
        
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"
    
    def get_icono_url(self):
        """Retorna la URL completa de la imagen o None si no hay imagen"""
        if self.imagen and hasattr(self.imagen, 'url'):
            # Si ya empieza con http, devolverla tal como está
            if self.imagen.url.startswith('http'):
                return self.imagen.url
            # Construir URL completa para desarrollo
            return f"http://localhost:8000{self.imagen.url}"
        return None
    
    def get_icono_display(self):
        """Retorna el emoji de fallback, no la URL de la imagen"""
        return self.icono_fallback


class InsigniaUsuario(models.Model):
    """Relación entre usuarios e insignias obtenidas"""
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    insignia = models.ForeignKey(Insignia, on_delete=models.CASCADE)
    fecha_obtenida = models.DateTimeField(auto_now_add=True)
    progreso_actual = models.IntegerField(default=0, help_text="Progreso actual hacia la insignia")
    
    class Meta:
        unique_together = ['usuario', 'insignia']
        ordering = ['-fecha_obtenida']
        
    def __str__(self):
        return f"{self.usuario.username} - {self.insignia.nombre}"