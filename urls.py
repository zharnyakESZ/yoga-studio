from django.urls import path
import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
]