from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0004_premioruleta_ruletadiariausuario_delete_ruletadiaria'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CompraRecompensa',
        ),
    ]
