from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CityViewSet, CafeViewSet, CafeContactViewSet,
    MenuItemViewSet, OrderViewSet, OrderItemViewSet,
    UserAddressViewSet, api_health_check,
    RestaurantOwnerViewSet
)
from .auth import login_view, logout_view, user_view, get_csrf_token

router = DefaultRouter()
router.register(r'cities', CityViewSet)
router.register(r'cafes', CafeViewSet)
router.register(r'cafe-contacts', CafeContactViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'addresses', UserAddressViewSet)
router.register(r'owners', RestaurantOwnerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', api_health_check, name='api-health-check'),
    
    # Аутентификация и управление пользователями
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/user/', user_view, name='user'),
    path('auth/csrf/', get_csrf_token, name='csrf'),
]
