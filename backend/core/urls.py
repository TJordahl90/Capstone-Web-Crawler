from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def home_view(request):
    return JsonResponse({"message": "Welcome to the Capstone API"}, status=200)

urlpatterns = [
    path('', home_view, name='home'),  # the root URL
    path('api/', include('api.urls')),  # the API routes
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
