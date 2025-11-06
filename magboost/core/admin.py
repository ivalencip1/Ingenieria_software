from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import PerfilUsuario
from .models import Sector


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(UserAdmin):
    # Campos que se muestran en la lista de usuarios
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'puntos_totales', 'sectors_list')
    
    # Campos por los que se puede buscar
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Filtros en la barra lateral
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'sectors')
    
    # Campos adicionales en el formulario de edición
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {
            'fields': ('bio', 'avatar', 'puntos_totales', 'sectors'),
        }),
    )
    
    # Campos adicionales al crear un nuevo usuario
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {
            'fields': ('bio', 'avatar', 'puntos_totales', 'sectors'),
        }),
    )

    # Muestra un widget más cómodo para ManyToMany
    filter_horizontal = ('sectors',)

    def sectors_list(self, obj):
        """Muestra los sectores seleccionados en la lista de usuarios."""
        return ", ".join([s.name for s in obj.sectors.all()])
    sectors_list.short_description = 'Sectores'


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
