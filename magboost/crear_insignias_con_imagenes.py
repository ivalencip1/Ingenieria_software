#!/usr/bin/env python
import os
import django
from django.core.files import File

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'magboost.settings')
django.setup()

from gamification.models import Insignia

def crear_insignias_con_imagenes():
    """Script para crear insignias con imágenes PNG"""
    
    insignias = [
        {
            'nombre': 'Primera Misión',
            'descripcion': 'Completa tu primera misión',
            'tipo': 'misiones_completadas',
            'criterio_valor': 1,
            'icono_fallback': '🏆',
            'imagen_archivo': 'insignia1.png'  # Debe existir en media/insignias/
        },
        {
            'nombre': 'Explorador',
            'descripcion': 'Completa 5 misiones',
            'tipo': 'misiones_completadas',
            'criterio_valor': 5,
            'icono_fallback': '🎯',
            'imagen_archivo': 'insignia2.png'
        },
        {
            'nombre': 'Veterano',
            'descripcion': 'Completa 10 misiones',
            'tipo': 'misiones_completadas',
            'criterio_valor': 10,
            'icono_fallback': '⭐',
            'imagen_archivo': 'insignia3.png'
        },
        {
            'nombre': 'Maestro',
            'descripcion': 'Completa 25 misiones',
            'tipo': 'misiones_completadas',
            'criterio_valor': 25,
            'icono_fallback': '👑',
            'imagen_archivo': 'insignia4.png'
        }
    ]
    
    for insignia_data in insignias:
        imagen_path = f"media/insignias/{insignia_data['imagen_archivo']}"
        
        # Crear la insignia
        insignia, created = Insignia.objects.get_or_create(
            nombre=insignia_data['nombre'],
            defaults={
                'descripcion': insignia_data['descripcion'],
                'tipo': insignia_data['tipo'],
                'criterio_valor': insignia_data['criterio_valor'],
                'icono_fallback': insignia_data['icono_fallback'],
                'activa': True,
                'orden': insignia_data['criterio_valor']
            }
        )
        
        # Si existe la imagen, asignarla
        if os.path.exists(imagen_path):
            with open(imagen_path, 'rb') as f:
                insignia.imagen.save(
                    insignia_data['imagen_archivo'],
                    File(f),
                    save=True
                )
            print(f"✅ Insignia '{insignia.nombre}' creada con imagen")
        else:
            print(f"⚠️  Insignia '{insignia.nombre}' creada sin imagen (archivo no encontrado: {imagen_path})")

if __name__ == '__main__':
    crear_insignias_con_imagenes()