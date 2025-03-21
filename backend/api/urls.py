from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CreateUserView, UserProfileView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="create_user"),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]

#to try to register a new user http://127.0.0.1:8000/api/register/
