"""
URL configuration for magboost project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

# Importa los ViewSets de cada app
from core.views import PerfilUsuarioViewSet, perfil_usuario

# from gamification.views import PuntoViewSet, InsigniaViewSet, MisionViewSet, RankingViewSet
# from rewards.views import RecompensaViewSet, TiendaViewSet, MentoriaViewSet, RuletaViewSet
# from social.views import InvitacionViewSet, CompartirOfertaViewSet
# from notifications.views import NotificacionViewSet, TipViewSet, RecordatorioViewSet
# from magnetosimulator.views import TareaMagnetoViewSet, MockRespuestaViewSet

router = DefaultRouter()

def api_root(request):
    return JsonResponse({
        'message': 'Bienvenido a MAGBOOST API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'usuarios': '/api/usuarios/',
            'perfil': '/api/core/perfil/',
            'misiones': '/api/gamification/misiones/',
            'progreso': '/api/gamification/progreso/',
            'ruleta': '/api/rewards/ruleta/',
            'ranking': '/api/rewards/ranking/',
        }
    })

# Core
router = DefaultRouter()
router.register(r'usuarios', PerfilUsuarioViewSet)




# Gamification
# router.register(r'puntos', PuntoViewSet)
# router.register(r'insignias', InsigniaViewSet)
# router.register(r'misiones', MisionViewSet)
# router.register(r'ranking', RankingViewSet)

# Rewards
# router.register(r'recompensas', RecompensaViewSet)
# router.register(r'tienda', TiendaViewSet)
# router.register(r'mentorias', MentoriaViewSet)
# router.register(r'ruleta', RuletaViewSet)

# Social
# router.register(r'invitaciones', InvitacionViewSet)
# router.register(r'ofertas', CompartirOfertaViewSet)

# Notifications
# router.register(r'notificaciones', NotificacionViewSet)
# router.register(r'tips', TipViewSet)
# router.register(r'recordatorios', RecordatorioViewSet)

# Magnetosim
# router.register(r'tareas-magneto', TareaMagnetoViewSet)
# router.register(r'mocks', MockRespuestaViewSet)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/core/', include('core.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/rewards/', include('rewards.urls')),
]
