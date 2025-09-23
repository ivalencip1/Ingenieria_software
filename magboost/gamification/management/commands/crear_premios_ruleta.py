from django.core.management.base import BaseCommand
from gamification.models import PremioRuleta

class Command(BaseCommand):
    help = 'Crea los premios iniciales para la ruleta diaria'

    def handle(self, *args, **options):
        premios = [
            {
                'nombre': 'Tip Laboral Extra',
                'descripcion': 'Recibe un consejo exclusivo para mejorar tu carrera profesional',
                'tipo': 'tip_laboral',
                'valor': 0,
                'icono': '💡',
                'probabilidad': 20.0,
                'orden': 1
            },
            {
                'nombre': 'Acceso a Curso Corto',
                'descripcion': 'Acceso gratuito a un curso corto especializado',
                'tipo': 'acceso_curso',
                'valor': 0,
                'icono': '📚',
                'probabilidad': 15.0,
                'orden': 2
            },
            {
                'nombre': '+50 Magneto Points',
                'descripcion': 'Obtén 50 puntos Magneto adicionales',
                'tipo': 'magneto_50',
                'valor': 50,
                'icono': '⚡',
                'probabilidad': 25.0,
                'orden': 3
            },
            {
                'nombre': '+80 Magneto Points',
                'descripcion': 'Obtén 80 puntos Magneto adicionales',
                'tipo': 'magneto_80',
                'valor': 80,
                'icono': '🔥',
                'probabilidad': 15.0,
                'orden': 4
            },
            {
                'nombre': 'Invita y Gana Más',
                'descripcion': 'Doble puntos si invitas a un amigo en este día',
                'tipo': 'invita_gana',
                'valor': 0,
                'icono': '👥',
                'probabilidad': 25.0,
                'orden': 5
            }
        ]

        for premio_data in premios:
            premio, created = PremioRuleta.objects.get_or_create(
                tipo=premio_data['tipo'],
                defaults=premio_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Premio creado: {premio.nombre}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Premio ya existe: {premio.nombre}')
                )

        self.stdout.write(
            self.style.SUCCESS('Premios de ruleta creados exitosamente!')
        )