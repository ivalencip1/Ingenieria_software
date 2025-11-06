from django.db import migrations, models


def create_cv_recompensa(apps, schema_editor):
    Recompensa = apps.get_model('rewards', 'Recompensa')
    CategoriaRecompensa = apps.get_model('rewards', 'CategoriaRecompensa')

    # Ensure a category exists for 'Servicios' or use any existing
    categoria, _ = CategoriaRecompensa.objects.get_or_create(nombre='Servicios', defaults={'icono': '🔧', 'descripcion': 'Servicios especiales'})

    # Create or update the CV recommendation reward
    Recompensa.objects.update_or_create(
        nombre='Recomendaciones para Hoja de Vida',
        defaults={
            'descripcion': 'Sube tu CV en PDF y nuestro asesor generará recomendaciones para mejorarlo.',
            'costo_puntos': 25,
            'categoria_id': categoria.id,
            'icono': '📄',
            'disponible': True
        }
    )


class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0007_alter_comprarecompensa_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='comparerecompensa' if False else 'comprarecompensa',
            name='cv_file',
            field=models.FileField(upload_to='compras_cv/', null=True, blank=True),
        ),
        migrations.RunPython(create_cv_recompensa, reverse_code=migrations.RunPython.noop),
    ]
