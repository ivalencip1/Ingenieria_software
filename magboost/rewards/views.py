from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, F
from django.contrib.auth import get_user_model
from datetime import date
import random
from .models import Recompensa, RuletaDiaria, CategoriaRecompensa, CompraRecompensa
from core.models import PerfilUsuario
from django.db import transaction
import json

User = get_user_model()
#-----------------------metodos para conectar con el frontend---------------------
@csrf_exempt
@login_required
def api_ruleta_diaria(request):
    if request.method == 'POST':
        hoy = date.today()

        ya_giro = RuletaDiaria.objects.filter(
            usuario=request.user, 
            fecha_ultimo_giro=hoy
        ).exists()
        
        if ya_giro:
            return JsonResponse({
                'error': 'Ya giraste la ruleta hoy',
                'ya_giro': True
            }, status=400)
        
        puntos_posibles = [5, 10, 15, 20, 25, 50]
        puntos_ganados = random.choice(puntos_posibles)
        RuletaDiaria.objects.create(
            usuario=request.user,
            fecha_ultimo_giro=hoy,
            puntos_ganados=puntos_ganados
        )
        
        perfil = request.user
        perfil.puntos_totales += puntos_ganados
        perfil.save()
        
        return JsonResponse({
            'puntos_ganados': puntos_ganados,
            'total_puntos': perfil.puntos_totales,
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
            'puntos_usuario': request.user.puntos_totales
        })

@login_required
def api_ranking(request):
    
    top_usuarios = PerfilUsuario.objects.order_by('-puntos_totales')[:10]
    
    ranking = []
    for i, usuario in enumerate(top_usuarios, 1):
        ranking.append({
            'posicion': i,
            'username': usuario.username,
            'nombre': usuario.first_name or usuario.username,
            'puntos': usuario.puntos_totales,
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
            'puede_canjear': request.user.puntos_totales >= recompensa.costo_puntos
        })
    
    return JsonResponse({
        'recompensas': recompensas_data,
        'puntos_usuario': request.user.puntos_totales
    })

def api_categorias_recompensas(request):
    """Obtener todas las categorías de recompensas"""
    # Usuario actual o primero para testing
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    
    categorias = CategoriaRecompensa.objects.all()
    
    categorias_data = []
    for categoria in categorias:
        # Obtener recompensas de esta categoría
        recompensas = Recompensa.objects.filter(categoria=categoria, disponible=True)
        
        recompensas_data = []
        for recompensa in recompensas:
            recompensas_data.append({
                'id': recompensa.id,
                'nombre': recompensa.nombre,
                'descripcion': recompensa.descripcion,
                'costo_puntos': recompensa.costo_puntos,
                'icono': recompensa.icono,
                'puede_canjear': usuario.puntos_totales >= recompensa.costo_puntos
            })
        
        categorias_data.append({
            'id': categoria.id,
            'nombre': categoria.nombre,
            'icono': categoria.icono,
            'descripcion': categoria.descripcion,
            'recompensas': recompensas_data
        })
    
    return JsonResponse({
        'categorias': categorias_data,
        'puntos_usuario': usuario.puntos_totales
    })

@csrf_exempt
def api_comprar_recompensa(request):
    """Comprar una recompensa con puntos"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        recompensa_id = data.get('recompensa_id')
        
        if not recompensa_id:
            return JsonResponse({'error': 'ID de recompensa requerido'}, status=400)
        
        # Usar transacción para asegurar consistencia
        with transaction.atomic():
            # Obtener la recompensa
            try:
                recompensa = Recompensa.objects.get(id=recompensa_id, disponible=True)
            except Recompensa.DoesNotExist:
                return JsonResponse({'error': 'Recompensa no encontrada'}, status=404)
            
            # Verificar que el usuario tiene suficientes puntos
            usuario = request.user if request.user.is_authenticated else User.objects.first()
            
            if not usuario:
                return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
                
            if usuario.puntos_totales < recompensa.costo_puntos:
                return JsonResponse({
                    'error': 'No tienes suficientes puntos',
                    'puntos_necesarios': recompensa.costo_puntos,
                    'puntos_actuales': usuario.puntos_totales
                }, status=400)
            
            # Descontar puntos del usuario
            usuario.puntos_totales -= recompensa.costo_puntos
            usuario.save()
            
            # Crear registro de compra
            compra = CompraRecompensa.objects.create(
                usuario=usuario,
                recompensa=recompensa,
                puntos_gastados=recompensa.costo_puntos
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': f'¡Has canjeado {recompensa.nombre}!',
                'compra_id': compra.id,
                'puntos_restantes': usuario.puntos_totales,
                'recompensa': {
                    'nombre': recompensa.nombre,
                    'descripcion': recompensa.descripcion,
                    'costo_puntos': recompensa.costo_puntos
                }
            })
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)

def api_historial_compras(request):
    """Obtener historial de compras del usuario"""
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    
    compras = CompraRecompensa.objects.filter(usuario=usuario).select_related('recompensa')
    
    historial = []
    for compra in compras:
        historial.append({
            'id': compra.id,
            'recompensa': {
                'nombre': compra.recompensa.nombre,
                'descripcion': compra.recompensa.descripcion,
                'icono': compra.recompensa.icono
            },
            'puntos_gastados': compra.puntos_gastados,
            'fecha_compra': compra.fecha_compra.isoformat(),
            'canjeado': compra.canjeado
        })
    
    return JsonResponse({
        'historial': historial,
        'total_compras': len(historial),
        'puntos_gastados_total': sum(compra.puntos_gastados for compra in compras)
    })

@csrf_exempt
def api_marcar_canjeado(request):
    """Marcar una recompensa como canjeada/utilizada"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        compra_id = data.get('compra_id')
        
        if not compra_id:
            return JsonResponse({'error': 'ID de compra requerido'}, status=400)
        
        try:
            usuario = request.user if request.user.is_authenticated else User.objects.first()
            
            if not usuario:
                return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
                
            compra = CompraRecompensa.objects.get(id=compra_id, usuario=usuario)
            compra.canjeado = True
            compra.save()
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Recompensa marcada como utilizada'
            })
            
        except CompraRecompensa.DoesNotExist:
            return JsonResponse({'error': 'Compra no encontrada'}, status=404)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)
