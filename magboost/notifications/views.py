from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import Notificacion
from core.models import PerfilUsuario
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
	qs = list(Notificacion.objects.filter(usuario=user).order_by("-fecha_creacion")[:100])

	# Deduplicar por (tipo, titulo): mantener la más reciente y marcar otras como leídas para limpiar
	seen = set()
	dedup = []
	to_mark_read = []
	for n in qs:
		key = (n.tipo, n.titulo)
		if key in seen:
			if not n.leida:
				to_mark_read.append(n.id)
			continue
		seen.add(key)
		dedup.append(n)

	if to_mark_read:
		Notificacion.objects.filter(id__in=to_mark_read, leida=False).update(leida=True)

	no_leidas = sum(1 for n in dedup if not n.leida)

	return JsonResponse({
		"ok": True,
		"notificaciones": [_serialize(n) for n in dedup[:50]],
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
	# Evita duplicados concurrentes: solo 1 bienvenida sin leer a la vez
	Notificacion.objects.get_or_create(
		usuario=user,
		tipo="bienvenida",
		leida=False,
		defaults={
			"titulo": "¡Bienvenido a MagBoost!",
			"mensaje": "Nos alegra verte por aquí.",
			"icono": "",
		}
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

		Notificacion.objects.get_or_create(
			usuario=user,
			tipo="mision_pendiente",
			leida=False,
			defaults={
				"titulo": "Tienes misiones pendientes",
				"mensaje": "Completa tus misiones activas para ganar puntos e insignias.",
				"icono": "",
			}
		)
	else:
		Notificacion.objects.get_or_create(
			usuario=user,
			tipo="misiones_completadas",
			leida=False,
			defaults={
				"titulo": "¡Misiones completadas!",
				"mensaje": "Has completado todas tus misiones activas. ¡Excelente trabajo!",
				"icono": "",
			}
		)

	return JsonResponse({"ok": True, "pendientes": hay_pendientes})


@csrf_exempt
def tips_perfil(request, usuario_id: int):
	if request.method != "POST":
		return JsonResponse({"ok": False, "error": "POST required"}, status=405)

	user = get_object_or_404(get_user_model(), pk=usuario_id)
	# Candidatos de tips personalizados en base a su perfil
	# Algunos tips dependen del contexto (trigger). Por ejemplo,
	# el tip de BIO solo debe mostrarse cuando el usuario vuelve del Perfil a Home.
	trigger = request.GET.get("trigger") or (request.POST.dict().get("trigger") if hasattr(request, "POST") else None)
	allow_bio_tip = (trigger == "profile_return")
	tips = []
	try:
		perfil: PerfilUsuario = get_object_or_404(get_user_model(), pk=usuario_id)
	except Exception:
		perfil = user  # Fallback: el user es PerfilUsuario


	if allow_bio_tip and (not getattr(perfil, 'bio', None) or len(getattr(perfil, 'bio', '') or '') < 30):
		tips.append({
			"titulo": "Mejora tu biografía en Magneto",
			"mensaje": "Una biografía clara y concreta aumenta tus oportunidades. Añade logros, habilidades clave y tu objetivo profesional.",
		})

	stage = getattr(perfil, 'professional_stage', None)
	if stage in ("seeking", "learning"):
		tips.append({
			"titulo": "Explora cursos para impulsar tu perfil",
			"mensaje": "Revisa cursos relevantes y añade certificaciones para destacar en las búsquedas.",
		})

	if stage == "seeking":
		tips.append({
			"titulo": "Ajusta tu enfoque de búsqueda",
			"mensaje": "Define con claridad el tipo de rol y sector que buscas para mejorar la coincidencia con vacantes.",
		})

	
	if not tips:
		tips.append({
			"titulo": "Consejo rápido para tu perfil",
			"mensaje": "Actualiza tu perfil con tus últimos logros y habilidades para mejorar tu visibilidad.",
		})

	# Evitar duplicados concurrentes: solo una notificación 'tip_perfil' por título sin leer
	creadas = 0
	for tip in tips:
		_, created = Notificacion.objects.get_or_create(
			usuario=user,
			tipo="tip_perfil",
			titulo=tip["titulo"],
			leida=False,
			defaults={
				"mensaje": tip["mensaje"],
				"icono": "",
			}
		)
		if created:
			creadas += 1

	return JsonResponse({"ok": True, "creadas": creadas})

