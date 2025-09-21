from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, F
from datetime import date
import random
from .models import Recompensa, RuletaDiaria
from core.models import PerfilUsuario
import json

@csrf_exempt
@login_required
def api_ruleta_diaria(request):
    if request.method == 'POST':
        hoy = date.today()
        
        # Verificar si ya giro hoy
        ya_giro = RuletaDiaria.objects.filter(
            usuario=request.user, 
            fecha_ultimo_giro=hoy
        ).exists()
        
        if ya_giro:
            return JsonResponse({
                'error': 'Ya giraste la ruleta hoy',
                'ya_giro': True
            }, status=400)
        
        # Generar puntos aleatorios (5, 10, 15, 20, 25, 50)
        puntos_posibles = [5, 10, 15, 20, 25, 50]
        puntos_ganados = random.choice(puntos_posibles)
        
        # Crear registro de giro
        RuletaDiaria.objects.create(
            usuario=request.user,
            fecha_ultimo_giro=hoy,
            puntos_ganados=puntos_ganados
        )
        
        # Actualizar puntos del usuario
        perfil = request.user
        perfil.puntos += puntos_ganados
        perfil.save()
        
        return JsonResponse({
            'puntos_ganados': puntos_ganados,
            'total_puntos': perfil.puntos,
            'ya_giro': True
        })
    
    elif request.method == 'GET':
        hoy = date.today()
        ya_giro = RuletaDiaria.objects.filter(
            usuario=request.user,
            fecha_ultimo_giro=hoy
        ).exists()
        
        return JsonResponse({
            'ya_giro': ya_giro,
            'puntos_usuario': request.user.puntos
        })

@login_required
def api_ranking(request):
    # Top 10 usuarios por puntos
    top_usuarios = PerfilUsuario.objects.order_by('-puntos')[:10]
    
    ranking = []
    for i, usuario in enumerate(top_usuarios, 1):
        ranking.append({
            'posicion': i,
            'username': usuario.username,
            'nombre': usuario.first_name or usuario.username,
            'puntos': usuario.puntos,
            'es_usuario_actual': usuario.id == request.user.id
        })
    
    return JsonResponse({
        'ranking': ranking,
        'usuario_actual_posicion': next(
            (item['posicion'] for item in ranking if item['es_usuario_actual']), 
            None
        )
    })

@login_required
def api_recompensas(request):
    recompensas = Recompensa.objects.filter(disponible=True)
    
    recompensas_data = []
    for recompensa in recompensas:
        recompensas_data.append({
            'id': recompensa.id,
            'nombre': recompensa.nombre,
            'descripcion': recompensa.descripcion,
            'costo_puntos': recompensa.costo_puntos,
            'puede_canjear': request.user.puntos >= recompensa.costo_puntos
        })
    
    return JsonResponse({
        'recompensas': recompensas_data,
        'puntos_usuario': request.user.puntos
    })
