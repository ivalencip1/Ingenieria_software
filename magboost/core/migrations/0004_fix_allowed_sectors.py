from django.db import migrations


def create_allowed_sectors(apps, schema_editor):
    Sector = apps.get_model('core', 'Sector')
    # Define allowed sectors (stored as displayed names)
    allowed = [
        'Tecnología',
        'Salud',
        'Educación',
        'Finanzas',
        'Retail',
    ]
    # Delete sectors not in allowed
    Sector.objects.exclude(name__in=allowed).delete()
    # Ensure allowed sectors exist (create if missing)
    for name in allowed:
        Sector.objects.get_or_create(name=name)


def reverse_func(apps, schema_editor):
    # On reverse migration we won't recreate deleted sectors; keep it idempotent
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_sector_perfilusuario_sectors'),
    ]

    operations = [
        migrations.RunPython(create_allowed_sectors, reverse_func),
    ]
