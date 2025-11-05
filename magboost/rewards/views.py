from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from datetime import date
import random
from .models import Recompensa, CategoriaRecompensa, CompraRecompensa, PremioRuleta, RuletaDiariaUsuario
from core.models import PerfilUsuario
from django.db import transaction
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .serializers import PremioRuletaSerializer, RuletaDiariaUsuarioSerializer
import logging

User = get_user_model()
#-----------------------Nuevas vistas para la ruleta mejorada---------------------
@api_view(['GET'])
def obtener_premios_ruleta(request):
    premios = PremioRuleta.objects.filter(activo=True).order_by('orden')
    serializer = PremioRuletaSerializer(premios, many=True)
    
    return Response({
        'premios': serializer.data,
        'total_premios': premios.count()
    })


@api_view(['GET'])
def puede_girar_ruleta(request):
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    hoy = timezone.now().date()
    ya_giro_hoy = RuletaDiariaUsuario.objects.filter(usuario=usuario, fecha_giro=hoy).exists()
    if ya_giro_hoy:
        return Response({
            'puede_girar': False,
            'mensaje': 'Ya giraste hoy. Vuelve mañana para intentarlo de nuevo.'
        })
    return Response({
        'puede_girar': True,
        'mensaje': '¡Puedes girar la ruleta!'
    })

@api_view(['POST'])
def girar_ruleta(request):
    usuario_id = request.data.get('usuario_id') if hasattr(request, 'data') else None
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    premios = PremioRuleta.objects.filter(activo=True)
    
    if not premios.exists():
        return Response({'error': 'No hay premios disponibles'}, status=404)
    # Validar que no haya girado hoy
    hoy = timezone.now().date()
    if RuletaDiariaUsuario.objects.filter(usuario=usuario, fecha_giro=hoy).exists():
        return Response({
            'error': 'YA_GIRO_HOY',
            'mensaje': 'Ya giraste hoy. Debes esperar hasta mañana para volver a girar.'
        }, status=400)
    premio_ganado = seleccionar_premio_aleatorio(premios)
    
    giro = RuletaDiariaUsuario.objects.create(
        usuario=usuario,
        premio_obtenido=premio_ganado
    )
    
    aplicar_premio(usuario, premio_ganado)
    
    serializer = RuletaDiariaUsuarioSerializer(giro)
    
    return Response({
        'giro': serializer.data,
        'premio': PremioRuletaSerializer(premio_ganado).data,
    })


@api_view(['GET'])
def historial_ruleta(request):
    usuario = request.user if request.user.is_authenticated else User.objects.first()
    if not usuario:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    
    historial = RuletaDiariaUsuario.objects.filter(usuario=usuario).order_by('-fecha_creacion')[:10]
    serializer = RuletaDiariaUsuarioSerializer(historial, many=True)
    
    return Response({
        'historial': serializer.data,
        'total_giros': RuletaDiariaUsuario.objects.filter(usuario=usuario).count()
    })

def seleccionar_premio_aleatorio(premios):
    opciones = []
    for premio in premios:
        entradas = int(premio.probabilidad * 100 / len(premios))
        opciones.extend([premio] * max(1, entradas))
    
    if not opciones:
        opciones = list(premios)
    
    return random.choice(opciones)

def aplicar_premio(usuario, premio):
    """Aplicar el premio ganado al usuario"""
    try:
        if premio.tipo == 'magneto_50':
            usuario.puntos_totales += 50
            usuario.save()
        elif premio.tipo == 'magneto_80':
            usuario.puntos_totales += 80
            usuario.save()
    except Exception as e:
        print(f"Error aplicando premio: {e}")

#-----------------------metodos para el ranking y recompensas---------------------

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
    # Allow callers to request data for a specific user via ?usuario_id=<id>
    usuario_id = request.GET.get('usuario_id')
    if usuario_id:
        try:
            usuario = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    else:
        usuario = request.user if request.user.is_authenticated else User.objects.first()
    if not usuario:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    
    categorias = CategoriaRecompensa.objects.all()  
    categorias_data = []
    for categoria in categorias:
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
        # Soporte robusto: aceptar JSON en request.body o form-encoded en request.POST.
        data = {}
        try:
            if request.content_type and 'application/json' in request.content_type:
                body = request.body.decode('utf-8') if hasattr(request, 'body') else ''
                data = json.loads(body) if body else {}
            else:
                # Intentar obtener desde request.POST (form-data) o fallback a JSON
                data = request.POST.dict() if hasattr(request, 'POST') else {}
                if not data:
                    body = request.body.decode('utf-8') if hasattr(request, 'body') else ''
                    data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)

        # Aceptar varias variantes del nombre del campo por compatibilidad
        recompensa_id = data.get('recompensa_id') or data.get('recompensaId') or data.get('id')
        usuario_id_body = data.get('usuario_id') or data.get('usuarioId') or data.get('user_id')

        if not recompensa_id:
            return JsonResponse({'error': 'ID de recompensa requerido'}, status=400)
        # Debug logging: mostrar qué usuario está haciendo la petición y los puntos actuales
        try:
            logger = logging.getLogger('magboost.rewards')
        except Exception:
            logger = None
        try:
            # determinar usuario objetivo: preferir usuario_id pasado en el body, luego request.user, luego first
            usuario_log = None
            if usuario_id_body:
                try:
                    usuario_log = User.objects.get(id=usuario_id_body)
                except User.DoesNotExist:
                    usuario_log = None
            if not usuario_log and getattr(request, 'user', None) and request.user.is_authenticated:
                usuario_log = request.user
            if not usuario_log:
                usuario_log = User.objects.first()
            log_msg = f"Compra request: recompensa_id={recompensa_id}, content_type={request.content_type}, usuario_id={(usuario_log.id if usuario_log else 'None')}, usuario_username={(usuario_log.username if usuario_log else 'None')}, puntos_actuales={(usuario_log.puntos_totales if usuario_log else 'None')}"
            if logger:
                logger.info(log_msg)
            else:
                print(log_msg)
        except Exception as e:
            print('Error al loggear compra:', e)
        with transaction.atomic():
            try:
                recompensa = Recompensa.objects.get(id=recompensa_id, disponible=True)
            except Recompensa.DoesNotExist:
                return JsonResponse({'error': 'Recompensa no encontrada'}, status=404)
            usuario = request.user if request.user.is_authenticated else User.objects.first()
            
            if not usuario:
                return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
                
            if usuario.puntos_totales < recompensa.costo_puntos:
                return JsonResponse({
                    'error': 'No tienes suficientes puntos',
                    'puntos_necesarios': recompensa.costo_puntos,
                    'puntos_actuales': usuario.puntos_totales
                }, status=400)
            usuario.puntos_totales -= recompensa.costo_puntos
            usuario.save()
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
