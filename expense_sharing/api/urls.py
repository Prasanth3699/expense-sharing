from django.urls import path
from . import views

from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # User Endpoints
    path('users/register/', views.register_user, name='register_user'),
    path('users/<int:user_id>/', views.get_user_details, name='get_user_details'),
    path('users/by-username/', views.get_user_by_username, name='get_user_by_username'),

    # Expense Endpoints
    path('expenses/add/', views.add_expense, name='add_expense'),
    path('expenses/user/<int:user_id>/', views.get_user_expenses, name='get_user_expenses'),
    path('expenses/user/<int:user_id>/latest/', views.get_latest_expense, name='latest_expense'),
    path('expenses/', views.get_overall_expenses, name='get_overall_expenses'),
    path('expenses/balance-sheet/', views.download_balance_sheet, name='download_balance_sheet'),
    path('expenses/user/<int:user_id>/latest/download/', views.download_latest_expense, name='download_latest_expense'),
    
    # auth token 
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
