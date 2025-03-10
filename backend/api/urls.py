from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.CreateUserView.as_view(), name="create_user"),
]