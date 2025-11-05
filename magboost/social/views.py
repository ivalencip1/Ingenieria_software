from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import PerfilUsuario
from .models import Vacante
from .serializers import VacanteSerializer
from core.models import Sector
from django.shortcuts import get_object_or_404
from django.db.models import Q


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


@api_view(['GET'])
def listar_vacantes(request):
    """Listar vacantes. Opcional query param: sectors=tech,health (coma-separado por name o slug)"""
    sectors_param = request.GET.get('sectors')
    qs = Vacante.objects.all()
    if sectors_param:
        requested = [s.strip() for s in sectors_param.split(',') if s.strip()]
        # Buscar sectores por slug o por nombre
        sectores = Sector.objects.filter(Q(slug__in=requested) | Q(name__in=requested))
        if sectores.exists():
            qs = qs.filter(sector__in=sectores)
        else:
            # intentar buscar por nombre sin coincidencias exactas
            qs = qs.filter(sector__name__in=requested)

    serializer = VacanteSerializer(qs, many=True)
    return Response({'count': qs.count(), 'results': serializer.data})


@api_view(['GET'])
def detalle_vacante(request, slug):
    vac = get_object_or_404(Vacante, slug=slug)
    serializer = VacanteSerializer(vac)
    return Response(serializer.data)

