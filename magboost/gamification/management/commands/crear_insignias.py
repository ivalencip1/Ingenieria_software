from django.core.management.base import BaseCommand
from gamification.models import Insignia


class Command(BaseCommand):
    help = 'Crear insignias de ejemplo para el sistema de gamificación'

    def handle(self, *args, **options):
        insignias_ejemplo = [
            # Insignias por misiones completadas
            {
                'nombre': 'Primer Paso',
                'descripcion': 'Completa tu primera misión',
                'icono_fallback': '🎯',
                'tipo': 'misiones_completadas',
                'criterio_valor': 1,
                'orden': 1
            },
            {
                'nombre': 'Guerrero Novato',
                'descripcion': 'Completa 5 misiones',
                'icono_fallback': '⚔️',
                'tipo': 'misiones_completadas',
                'criterio_valor': 5,
                'orden': 2
            },
            {
                'nombre': 'Héroe Magnético',
                'descripcion': 'Completa 10 misiones',
                'icono_fallback': '🦸',
                'tipo': 'misiones_completadas',
                'criterio_valor': 10,
                'orden': 3
            },
            {
                'nombre': 'Maestro de Misiones',
                'descripcion': 'Completa 25 misiones',
                'icono_fallback': '👑',
                'tipo': 'misiones_completadas',
                'criterio_valor': 25,
                'orden': 4
            },
            {
                'nombre': 'Leyenda del Magnetismo',
                'descripcion': 'Completa 50 misiones',
                'icono_fallback': '🏆',
                'tipo': 'misiones_completadas',
                'criterio_valor': 50,
                'orden': 5
            },

            # Insignias por progreso semanal
            {
                'nombre': 'Semana Completa',
                'descripcion': 'Completa tu meta semanal por primera vez',
                'icono_fallback': '📅',
                'tipo': 'progreso_semanal',
                'criterio_valor': 1,
                'orden': 6
            },
            {
                'nombre': 'Constancia Magnética',
                'descripcion': 'Completa tu meta semanal 3 veces',
                'icono_fallback': '🔥',
                'tipo': 'progreso_semanal',
                'criterio_valor': 3,
                'orden': 7
            },
            {
                'nombre': 'Disciplina de Acero',
                'descripcion': 'Completa tu meta semanal 5 veces',
                'icono_fallback': '💪',
                'tipo': 'progreso_semanal',
                'criterio_valor': 5,
                'orden': 8
            },

            # Insignias por puntos acumulados
            {
                'nombre': 'Recolector',
                'descripcion': 'Acumula 100 MagnetoPoints',
                'icono_fallback': '💎',
                'tipo': 'puntos_acumulados',
                'criterio_valor': 100,
                'orden': 9
            },
            {
                'nombre': 'Tesoro Magnético',
                'descripcion': 'Acumula 500 MagnetoPoints',
                'icono_fallback': '💰',
                'tipo': 'puntos_acumulados',
                'criterio_valor': 500,
                'orden': 10
            },
            {
                'nombre': 'Millonario Magnético',
                'descripcion': 'Acumula 1000 MagnetoPoints',
                'icono_fallback': '💸',
                'tipo': 'puntos_acumulados',
                'criterio_valor': 1000,
                'orden': 11
            },

            # Insignias por racha diaria
            {
                'nombre': 'Inicio de Racha',
                'descripcion': 'Completa misiones 3 días consecutivos',
                'icono_fallback': '🔗',
                'tipo': 'racha_diaria',
                'criterio_valor': 3,
                'orden': 12
            },
            {
                'nombre': 'Imparable',
                'descripcion': 'Completa misiones 7 días consecutivos',
                'icono_fallback': '🌟',
                'tipo': 'racha_diaria',
                'criterio_valor': 7,
                'orden': 13
            },
            {
                'nombre': 'Fuerza Magnética',
                'descripcion': 'Completa misiones 15 días consecutivos',
                'icono_fallback': '🧲',
                'tipo': 'racha_diaria',
                'criterio_valor': 15,
                'orden': 14
            },

            # Insignias por tipo de misión específica
            {
                'nombre': 'Diario Dedicado',
                'descripcion': 'Completa 10 retos diarios',
                'icono_fallback': '☀️',
                'tipo': 'tipo_mision',
                'criterio_valor': 10,
                'criterio_extra': 'diaria',
                'orden': 15
            },
            {
                'nombre': 'Semanal Supremo',
                'descripcion': 'Completa 5 retos semanales',
                'icono_fallback': '📊',
                'tipo': 'tipo_mision',
                'criterio_valor': 5,
                'criterio_extra': 'semanal',
                'orden': 16
            },
            {
                'nombre': 'Mensual Maestro',
                'descripcion': 'Completa 3 retos mensuales',
                'icono_fallback': '🗓️',
                'tipo': 'tipo_mision',
                'criterio_valor': 3,
                'criterio_extra': 'mensual',
                'orden': 17
            },

            # Insignias especiales
            {
                'nombre': 'Bienvenido a MagBoost',
                'descripcion': 'Insignia de bienvenida al sistema',
                'icono_fallback': '🎉',
                'tipo': 'especial',
                'criterio_valor': 0,
                'orden': 0
            },
        ]

        created_count = 0
        for insignia_data in insignias_ejemplo:
            insignia, created = Insignia.objects.get_or_create(
                nombre=insignia_data['nombre'],
                defaults=insignia_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Creada insignia: {insignia.nombre}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ Ya existe: {insignia.nombre}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎊 ¡Proceso completado! Se crearon {created_count} nuevas insignias.')
        )