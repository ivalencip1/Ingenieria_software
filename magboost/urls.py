from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/magnetosimulator/', include('magnetosimulator.urls')),
    path('api/minigame/', include('minigame.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/rewards/', include('rewards.urls')),
    path('api/social/', include('social.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)