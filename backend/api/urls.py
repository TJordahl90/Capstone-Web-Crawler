from django.urls import path
from .views import CreateUserView, UserProfileView, CreateVerificationView, LoginView, CsrfTokenView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="create_user"),
    path('login/', LoginView.as_view(), name='login_account'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path("verification/", CreateVerificationView.as_view(), name="verification"),
    path('csrf/', CsrfTokenView, name='csrf')
]