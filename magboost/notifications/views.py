from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import Notificacion
from gamification.models import Mision, MisionUsuario


def _serialize(n: Notificacion):
	return {
		"id": n.id,
		"titulo": n.titulo,
		"mensaje": n.mensaje,
		"tipo": n.tipo,
		"icono": n.icono,
		"leida": n.leida,
		"fecha_creacion": n.fecha_creacion.isoformat(),
	}


def listar_notificaciones(request, usuario_id: int):
	user = get_object_or_404(get_user_model(), pk=usuario_id)
	qs = Notificacion.objects.filter(usuario=user).order_by("-fecha_creacion")[:50]
	no_leidas = Notificacion.objects.filter(usuario=user, leida=False).count()
	return JsonResponse({
		"ok": True,
		"notificaciones": [_serialize(n) for n in qs],
		"no_leidas": no_leidas,
	})


@csrf_exempt
def marcar_leida(request, notificacion_id: int):
	if request.method != "POST":
		return JsonResponse({"ok": False, "error": "POST required"}, status=405)
	n = get_object_or_404(Notificacion, pk=notificacion_id)
	if not n.leida:
		n.leida = True
		n.save(update_fields=["leida"])
	return JsonResponse({"ok": True})


@csrf_exempt
def marcar_todas_leidas(request, usuario_id: int):
	if request.method != "POST":
		return JsonResponse({"ok": False, "error": "POST required"}, status=405)
	user = get_object_or_404(get_user_model(), pk=usuario_id)
	Notificacion.objects.filter(usuario=user, leida=False).update(leida=True)
	return JsonResponse({"ok": True})


@csrf_exempt
def bienvenida(request, usuario_id: int):
	if request.method != "POST":
		return JsonResponse({"ok": False, "error": "POST required"}, status=405)
	user = get_object_or_404(get_user_model(), pk=usuario_id)
	cutoff = timezone.now() - timedelta(hours=6)
	exists = Notificacion.objects.filter(usuario=user, tipo="bienvenida", fecha_creacion__gte=cutoff).exists()
	if not exists:
		Notificacion.objects.create(
			usuario=user,
			titulo="¡Bienvenido a MagBoost!",
			mensaje="Nos alegra verte por aquí.",
			tipo="bienvenida",
			icono="",
		)
	return JsonResponse({"ok": True})


@csrf_exempt
def verificar_misiones(request, usuario_id: int):
	if request.method != "POST":
		return JsonResponse({"ok": False, "error": "POST required"}, status=405)
	user = get_object_or_404(get_user_model(), pk=usuario_id)
	cutoff = timezone.now() - timedelta(hours=2)

	# Calcular si el usuario tiene misiones activas pendientes (no completadas para él)
	total_activas = Mision.objects.filter(activa=True).count()
	if total_activas == 0:
		# No hay misiones activas, no generamos nada
		return JsonResponse({"ok": True, "detalle": "sin_misiones_activas"})

	# Una misión está pendiente para el usuario si NO tiene un registro completado para esa misión
	pendientes = Mision.objects.filter(activa=True).exclude(
		misionusuario__usuario=user,
		misionusuario__completada=True,
	)
	hay_pendientes = pendientes.exists()

	if hay_pendientes:
		# Generar recordatorio de pendientes si no existe uno reciente sin leer
		existe_recordatorio = Notificacion.objects.filter(
			usuario=user,
			tipo="mision_pendiente",
			leida=False,
			fecha_creacion__gte=cutoff,
		).exists()
		if not existe_recordatorio:
			Notificacion.objects.create(
				usuario=user,
				titulo="Tienes misiones pendientes",
				mensaje="Completa tus misiones activas para ganar puntos e insignias.",
				tipo="mision_pendiente",
				icono="",
			)
	else:
		# Todas completadas: notificación positiva si no existe una reciente sin leer
		existe_completadas = Notificacion.objects.filter(
			usuario=user,
			tipo="misiones_completadas",
			leida=False,
			fecha_creacion__gte=cutoff,
		).exists()
		if not existe_completadas:
			Notificacion.objects.create(
				usuario=user,
				titulo="¡Misiones completadas!",
				mensaje="Has completado todas tus misiones activas. ¡Excelente trabajo!",
				tipo="misiones_completadas",
				icono="",
			)

	return JsonResponse({"ok": True, "pendientes": hay_pendientes})

