#!/usr/bin/env python
"""
Script para verificar los sectores de usuarios específicos
"""
import os
import sys
import django

# Configurar Django
sys.path.append('C:/Users/lalai/MAGBOOST/magboost')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'magboost.settings')
django.setup()

from core.models import PerfilUsuario

def verificar_usuario(user_id_or_username):
    """Verifica los datos del usuario"""
    try:
        # Intentar buscar por ID primero
        if str(user_id_or_username).isdigit():
            usuario = PerfilUsuario.objects.get(id=int(user_id_or_username))
        else:
            # Buscar por username
            usuario = PerfilUsuario.objects.get(username=user_id_or_username)
        
        print(f"\n👤 INFORMACIÓN DEL USUARIO:")
        print(f"   ID: {usuario.id}")
        print(f"   Username: {usuario.username}")
        print(f"   Nombre: {usuario.first_name} {usuario.last_name}")
        print(f"   Email: {usuario.email}")
        
        print(f"\n📊 CAMPOS RELACIONADOS CON SECTORES:")
        print(f"   sectors: {usuario.sectors} (tipo: {type(usuario.sectors)})")
        
        if hasattr(usuario, 'main_motivation'):
            print(f"   main_motivation: {usuario.main_motivation}")
        if hasattr(usuario, 'professional_stage'):
            print(f"   professional_stage: {usuario.professional_stage}")
        
        print(f"\n🔍 ANÁLISIS DEL CAMPO SECTORS (Many-to-Many):")
        try:
            # sectors es una relación Many-to-Many, usar .all() para obtener los sectores
            sectores_queryset = usuario.sectors.all()
            sectores_count = sectores_queryset.count()
            
            if sectores_count > 0:
                print(f"   ✓ Usuario tiene {sectores_count} sectores asignados:")
                for i, sector in enumerate(sectores_queryset):
                    sector_name = sector.name if hasattr(sector, 'name') else str(sector)
                    print(f"      [{i}] {sector_name}")
                
                # Mostrar cuál sería el sector seleccionado (el primero)
                primer_sector = sectores_queryset.first()
                primer_sector_name = primer_sector.name if hasattr(primer_sector, 'name') else str(primer_sector)
                print(f"   🎯 Sector que se usaría para preguntas: '{primer_sector_name}'")
            else:
                print(f"   ❌ Usuario no tiene sectores asignados")
                print(f"   🎯 Se usaría el sector por defecto: 'Tecnología'")
                
        except Exception as e:
            print(f"   ❌ Error al acceder a sectores: {e}")
            print(f"   Tipo del campo: {type(usuario.sectors)}")
            print(f"   Valor: {usuario.sectors}")
        
        return usuario
        
    except PerfilUsuario.DoesNotExist:
        print(f"❌ Usuario '{user_id_or_username}' no encontrado")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def listar_todos_los_usuarios():
    """Lista todos los usuarios con sus sectores"""
    usuarios = PerfilUsuario.objects.all()
    print(f"\n📋 LISTA DE TODOS LOS USUARIOS ({usuarios.count()} total):")
    print("-" * 80)
    
    for usuario in usuarios:
        try:
            # Obtener sectores usando la relación Many-to-Many
            sectores_queryset = usuario.sectors.all()
            if sectores_queryset.exists():
                sectores_names = [sector.name if hasattr(sector, 'name') else str(sector) for sector in sectores_queryset]
                sectores = ", ".join(sectores_names)
            else:
                sectores = "Sin sectores"
        except:
            sectores = "Error al obtener sectores"
        
        print(f"ID: {usuario.id:2d} | {usuario.username:20s} | {sectores}")

def main():
    print("🔍 VERIFICADOR DE SECTORES DE USUARIOS")
    print("=" * 50)
    
    # Listar todos los usuarios primero
    listar_todos_los_usuarios()
    
    # Verificar usuarios específicos
    usuarios_a_verificar = [
        "rosita",  # Username de Rosita
        1,         # ID 1 (usuario por defecto)
        2,         # ID 2 si existe
    ]
    
    for usuario in usuarios_a_verificar:
        print("\n" + "=" * 50)
        verificar_usuario(usuario)

if __name__ == "__main__":
    main()