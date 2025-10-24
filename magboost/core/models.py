from django.contrib.auth.models import AbstractUser
from django.db import models


class PerfilUsuario(AbstractUser):
    # Información básica
    bio = models.TextField(blank=True, null=True, help_text="Biografía del usuario")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    puntos_totales = models.IntegerField(default=0)
    
    # Encuesta de onboarding
    connection_level = models.CharField(
        max_length=20,
        choices=[
            ('starting', 'Estoy empezando'),
            ('occasional', 'Lo uso ocasionalmente'),
            ('frequent', 'Soy usuario frecuente')
        ],
        blank=True,
        null=True,
        help_text="Nivel de conexión con Magneto"
    )
    
    professional_stage = models.CharField(
        max_length=20,
        choices=[
            ('seeking', 'Buscando oportunidades'),
            ('learning', 'Aprendiendo nuevas habilidades'),
            ('growing', 'Creciendo en mi puesto actual')
        ],
        blank=True,
        null=True,
        help_text="Etapa profesional del usuario"
    )
    
    challenge_types = models.JSONField(
        default=list,
        blank=True,
        help_text="Tipos de retos que le interesan"
    )
    
    motivating_topics = models.JSONField(
        default=list,
        blank=True,
        help_text="Temas que motivan al usuario"
    )
    
    main_motivation = models.CharField(
        max_length=20,
        choices=[
            ('rewards', 'Ganar puntos e insignias'),
            ('progress', 'Ver mi progreso'),
            ('sharing', 'Compartir logros con otros'),
            ('challenge', 'Desafiarme a mí mismo')
        ],
        blank=True,
        null=True,
        help_text="Motivación principal"
    )
    
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Diario'),
            ('weekly', 'Semanal'),
            ('monthly', 'Mensual')
        ],
        blank=True,
        null=True,
        help_text="Frecuencia de retos deseada"
    )
    
    notification_method = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Correo electrónico'),
            ('whatsapp', 'WhatsApp'),
            ('app', 'Dentro de la app')
        ],
        blank=True,
        null=True,
        help_text="Método de notificaciones preferido"
    )
    
    survey_completed = models.BooleanField(
        default=False,
        help_text="Indica si el usuario completó la encuesta de onboarding"
    )

    def __str__(self):
        return self.username
