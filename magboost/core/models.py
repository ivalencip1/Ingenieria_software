from django.contrib.auth.models import AbstractUser
from django.db import models


class PerfilUsuario(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    puntos_totales=models.IntegerField(default=0)

    def __str__(self):
        return self.username
