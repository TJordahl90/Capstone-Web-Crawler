from django.urls import path
from .views import CreateUserView, UserProfileView, CreateVerificationView, LoginView, CsrfTokenView, AccountView, JobMatchingView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="create_user"),
    path('login/', LoginView.as_view(), name='login_account'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path("verification/", CreateVerificationView.as_view(), name="verification"),
    path('csrf/', CsrfTokenView, name='csrf'),
    path('account/', AccountView.as_view(), name='account'),
    path('job_matching/', JobMatchingView, name="job_matching"),
]