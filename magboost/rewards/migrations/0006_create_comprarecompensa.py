from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0005_delete_comprarecompensa'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompraRecompensa',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('puntos_gastados', models.IntegerField()),
                ('fecha_compra', models.DateTimeField(auto_now_add=True)),
                ('canjeado', models.BooleanField(default=False)),
                ('recompensa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='rewards.recompensa')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-fecha_compra'],
            },
        ),
    ]
