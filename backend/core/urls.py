from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('divisi.urls')),
    path('api/homepage/', include('homepage.urls')),
    path('api/chatbot/', include('chatbot_app.urls')),
    # Dipakai admin dashboard nanti buat login & dapat token akses API.
    path('api/auth/token/', obtain_auth_token, name='api-token-auth'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
