from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import Notificacion


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
	exists = Notificacion.objects.filter(usuario=user, tipo="mision_pendiente", fecha_creacion__gte=cutoff).exists()
	if not exists:
		Notificacion.objects.create(
			usuario=user,
			titulo="Tienes misiones pendientes",
			mensaje="Completa tus misiones de hoy para ganar puntos e insignias.",
			tipo="mision_pendiente",
			icono="",
		)
	return JsonResponse({"ok": True})

