from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import PerfilUsuario


#----->Metodos de esta app

# enviar_notificacion()
# aceptar_invitacion()
# compartir_logro()


@api_view(['GET'])
def ranking_usuarios(request):
    """
    Retorna el ranking de usuarios ordenado por puntos totales
    """
    usuarios = PerfilUsuario.objects.all().order_by('-puntos_totales')[:100]
    
    ranking_data = []
    for index, usuario in enumerate(usuarios, start=1):
        # Determinar categoría según puntos
        if usuario.puntos_totales >= 550:
            categoria = 'Lider activo'
        elif usuario.puntos_totales >= 500:
            categoria = 'Lider activo'
        elif usuario.puntos_totales >= 150:
            categoria = 'en el top 3'
        else:
            categoria = 'En el top 10  '
        
        ranking_data.append({
            'posicion': index,
            'id': usuario.id,
            'nombre': f"{usuario.first_name}{usuario.last_name[0] if usuario.last_name else ''}",
            'username': usuario.username,
            'puntos': usuario.puntos_totales,
            'categoria': categoria,
            'avatar_inicial': usuario.first_name[0].upper() if usuario.first_name else usuario.username[0].upper()
        })
    
    return Response({
        'ranking': ranking_data,
        'total_usuarios': len(ranking_data)
    })

