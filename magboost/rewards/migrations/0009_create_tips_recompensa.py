from django.db import migrations


def create_tips_recompensa(apps, schema_editor):
    Recompensa = apps.get_model('rewards', 'Recompensa')
    CategoriaRecompensa = apps.get_model('rewards', 'CategoriaRecompensa')

    categoria, _ = CategoriaRecompensa.objects.get_or_create(nombre='Servicios', defaults={'icono': '🔧', 'descripcion': 'Servicios especiales'})

    Recompensa.objects.update_or_create(
        nombre='Acceder a tips de empleo según sector de interés',
        defaults={
            'descripcion': 'Accede a tips y recomendaciones de empleo personalizadas por sector según tus intereses.',
            'costo_puntos': 120,
            'categoria_id': categoria.id,
            'icono': '💡',
            'disponible': True
        }
    )


class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0008_add_cvfile_and_create_cv_recompensa'),
    ]

    operations = [
        migrations.RunPython(create_tips_recompensa, reverse_code=migrations.RunPython.noop),
    ]
