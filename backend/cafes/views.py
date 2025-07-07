from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count, Avg, F
from django.db import connection
from .models import City, Cafe, CafeContact, MenuItem, Order, OrderItem, UserAddress
from .serializers import (
    CitySerializer, CafeSerializer, CafeContactSerializer,
    MenuItemSerializer, OrderSerializer, OrderItemSerializer,
    UserAddressSerializer, CafeOwnerSerializer, UserSerializer
)
import logging
import json
import time
import socket
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.db import models

# Настраиваем логирование
logger = logging.getLogger(__name__)

@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def api_health_check(request):
    """
    Проверка здоровья API сервера.
    Возвращает базовую информацию о работоспособности API и связке с БД.
    """
    try:
        start_time = time.time()
        
        # Skip database checks for HEAD requests to be lightweight
        if request.method == 'HEAD':
            data = {
                "status": "ok",
                "timestamp": time.time(),
                "uptime": time.time() - start_time,
                "method": "HEAD"
            }
            return Response(data)
            
        # Проверяем соединение с БД
        db_ok = False
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_ok = True
        except Exception as e:
            db_error = str(e)
        
        # Проверяем доступность модели City
        cities_count = -1
        cities_ok = False
        cities_error = None
        
        try:
            cities_count = City.objects.count()
            cities_ok = True
        except Exception as e:
            cities_error = str(e)
        
        # Подготавливаем ответ
        hostname = socket.gethostname()
        
        data = {
            "status": "ok" if db_ok and cities_ok else "error",
            "timestamp": time.time(),
            "uptime": time.time() - start_time,
            "hostname": hostname,
            "ip": socket.gethostbyname(hostname),
            "client_ip": request.META.get('REMOTE_ADDR', 'unknown'),
            "database": {
                "status": "connected" if db_ok else "error",
                "error": db_error
            },
            "cities_api": {
                "status": "ok" if cities_ok else "error",
                "count": cities_count,
                "error": cities_error
            }
        }
        
        logger.info(f"Health check запрос от {request.META.get('REMOTE_ADDR')}: {data['status']}")
        
        return Response(data)
    except Exception as e:
        # Always return a response even if there's an error
        logger.error(f"Error in health check: {str(e)}")
        return Response({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        })


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Изменено - только аутент. пользователи могут изменять
    
    def list(self, request, *args, **kwargs):
        try:
            # Применяем пагинацию
            paginator = PageNumberPagination()
            paginated_queryset = paginator.paginate_queryset(self.get_queryset(), request)
            serializer = self.get_serializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Ошибка при получении списка городов: {str(e)}")
            return Response(
                {"error": "Ошибка при получении списка городов", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CafeViewSet(viewsets.ModelViewSet):
    queryset = Cafe.objects.all()
    serializer_class = CafeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Изменено - требуется авторизация для изменения
    
    def get_queryset(self):
        queryset = self.queryset
        city_id = self.request.query_params.get('city', None)
        
        if city_id is not None:
            try:
                city_id = int(city_id)
                queryset = queryset.filter(city=city_id)
            except (ValueError, TypeError):
                return Cafe.objects.none()
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            paginator = PageNumberPagination()
            paginated_queryset = paginator.paginate_queryset(self.get_queryset(), request)
            serializer = self.get_serializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Ошибка при получении списка кафе: {str(e)}")
            return Response(
                {"error": "Ошибка при получении списка кафе", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_owner(self, request, pk=None):
        cafe = self.get_object()
        
        # Проверяем данные запроса
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone = request.data.get('phone', '')
        
        if not all([username, email, password]):
            return Response(
                {"error": "Необходимо указать имя пользователя, email и пароль"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем существует ли пользователь
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": f"Пользователь с именем {username} уже существует"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": f"Пользователь с email {email} уже существует"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Создаем нового пользователя
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            first_name=first_name,
            last_name=last_name
        )
        
        # Создаем связь с рестораном
        contact = CafeContact.objects.create(
            cafe=cafe,
            user=user,
            email=email,
            phone=phone,
            role='owner',
            is_primary=True
        )
        
        serializer = CafeOwnerSerializer(contact)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def owners(self, request, pk=None):
        cafe = self.get_object()
        owners = CafeContact.objects.filter(cafe=cafe, role='owner')
        serializer = CafeOwnerSerializer(owners, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        cafe = self.get_object()
        
        # Общее количество заказов
        total_orders = Order.objects.filter(cafe=cafe).count()
        
        # Общая выручка
        total_revenue = Order.objects.filter(cafe=cafe).aggregate(
            revenue=Sum('total_price')
        )['revenue'] or 0
        
        # Средний чек
        average_order_value = Order.objects.filter(cafe=cafe).aggregate(
            avg_value=Avg('total_price')
        )['avg_value'] or 0
        
        # Самые популярные товары
        popular_items = OrderItem.objects.filter(
            order__cafe=cafe
        ).values(
            'menu_item'
        ).annotate(
            total=Count('menu_item')
        ).order_by('-total')[:5]
        
        # Получаем полную информацию о популярных товарах
        popular_items_data = []
        for item in popular_items:
            menu_item = MenuItem.objects.get(id=item['menu_item'])
            serializer = MenuItemSerializer(menu_item)
            popular_items_data.append(serializer.data)
        
        data = {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'average_order_value': average_order_value,
            'popular_items': popular_items_data
        }
        
        return Response(data)


class CafeContactViewSet(viewsets.ModelViewSet):
    queryset = CafeContact.objects.all()
    serializer_class = CafeContactSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Изменено - требуется авторизация для изменения


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Изменено - требуется авторизация для изменения
    
    def get_queryset(self):
        queryset = self.queryset
        cafe_id = self.request.query_params.get('cafe', None)
        if cafe_id is not None:
            try:
                cafe_id = int(cafe_id)
                queryset = queryset.filter(cafe=cafe_id)
            except (ValueError, TypeError):
                return MenuItem.objects.none()
        
        # Добавляем фильтрацию по доступности, если параметр передан
        available = self.request.query_params.get('available', None)
        if available is not None:
            queryset = queryset.filter(available=(available.lower() == 'true'))
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        logger.info("=== CREATE MENU ITEM ===")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        
        # Check if we have an image file
        if 'image' in request.FILES:
            logger.info(f"Image file found in request.FILES: {request.FILES['image']}")
            logger.info(f"Image file size: {request.FILES['image'].size} bytes")
            logger.info(f"Image file content type: {request.FILES['image'].content_type}")
        else:
            logger.info("No image file in request.FILES")
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        logger.info("=== UPDATE MENU ITEM ===")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        
        # Check if we have an image file
        if 'image' in request.FILES:
            logger.info(f"Image file found in request.FILES: {request.FILES['image']}")
            logger.info(f"Image file size: {request.FILES['image'].size} bytes")
            logger.info(f"Image file content type: {request.FILES['image'].content_type}")
        else:
            logger.info("No image file in request.FILES")
        
        return super().update(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        try:
            paginator = PageNumberPagination()
            paginated_queryset = paginator.paginate_queryset(self.get_queryset(), request)
            # Передаем request в контекст сериализатора
            serializer = self.get_serializer(paginated_queryset, many=True, context={'request': request})
            
            # Логируем данные о возвращаемых изображениях
            for item in serializer.data:
                # Используем repr() для отображения невидимых символов и избежания их вставки в строку
                name = item.get('name', '')
                image = repr(item.get('image', ''))
                image_full_url = repr(item.get('image_full_url', ''))
                logger.debug(f"Menu item: {name}, image: {image}, image_full_url: {image_full_url}")
            
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Ошибка при получении элементов меню: {str(e)}")
            return Response(
                {"error": "Ошибка при получении элементов меню", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]  # Разрешаем создание заказов без аутентификации
    
    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        
        # Если пользователь не администратор, возвращаем только его заказы
        if not user.is_staff and user.is_authenticated:
            queryset = queryset.filter(user=user)
            
        cafe_id = self.request.query_params.get('cafe', None)
        if cafe_id is not None and cafe_id != 'undefined':
            try:
                cafe_id = int(cafe_id)
                queryset = queryset.filter(cafe=cafe_id)
            except (ValueError, TypeError):
                return Order.objects.none()
        
        # Фильтрация по client_order_id, если параметр передан
        client_order_id = self.request.query_params.get('client_order_id', None)
        if client_order_id is not None:
            logger.info(f"Filtering orders by client_order_id: '{client_order_id}'")
            queryset = queryset.filter(client_order_id=client_order_id)
            logger.info(f"Found {queryset.count()} orders with client_order_id '{client_order_id}'")
        
        # Удаляем дубликаты по client_order_id (оставляем только самый последний заказ с таким ID)
        # Сначала получаем список всех client_order_id
        duplicate_ids = queryset.exclude(client_order_id__isnull=True).exclude(client_order_id='') \
                                .values('client_order_id') \
                                .annotate(count=models.Count('id')) \
                                .filter(count__gt=1) \
                                .values_list('client_order_id', flat=True)
        
        # Для каждого дублирующегося client_order_id, оставляем только самый последний заказ
        for duplicate_id in duplicate_ids:
            latest_order = queryset.filter(client_order_id=duplicate_id).latest('created_at')
            queryset = queryset.exclude(client_order_id=duplicate_id).exclude(id=latest_order.id) | queryset.filter(id=latest_order.id)
                
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Создание нового заказа с проверкой на дубликаты по client_order_id
        """
        client_order_id = request.data.get('client_order_id')
        
        # Проверяем, существует ли заказ с таким client_order_id
        if client_order_id:
            logger.info(f"Checking if order with client_order_id '{client_order_id}' already exists")
            existing_order = Order.objects.filter(client_order_id=client_order_id).first()
            
            if existing_order:
                logger.info(f"Found existing order with client_order_id '{client_order_id}' (Order #{existing_order.id})")
                serializer = self.get_serializer(existing_order)
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Если заказ не существует, создаем новый
        return super().create(request, *args, **kwargs)
        
    def perform_create(self, serializer):
        # Получаем имя клиента из запроса
        customer_name = self.request.data.get('customer_name', '')
        client_order_id = self.request.data.get('client_order_id', '')
        order_type = self.request.data.get('order_type', 'delivery')
        
        logger.info(f"Creating order with customer_name: '{customer_name}', client_order_id: '{client_order_id}', order_type: '{order_type}'")
        logger.info(f"Request data: {self.request.data}")
        
        # Валидируем order_type
        valid_order_types = [choice[0] for choice in Order.ORDER_TYPES]
        if order_type not in valid_order_types:
            logger.warning(f"Invalid order_type '{order_type}', defaulting to 'delivery'")
            order_type = 'delivery'
        
        # Если пользователь аутентифицирован, устанавливаем его
        if self.request.user.is_authenticated:
            logger.info(f"User is authenticated: {self.request.user.username}")
            serializer.save(
                user=self.request.user, 
                customer_name=customer_name,
                client_order_id=client_order_id,
                order_type=order_type
            )
        else:
            # Если нет, используем админа или первого пользователя, но сохраняем имя клиента
            logger.info("User is not authenticated, using admin or first user")
            admin_user = User.objects.filter(is_staff=True).first() or User.objects.first()
            if admin_user:
                logger.info(f"Using user: {admin_user.username}")
                serializer.save(
                    user=admin_user, 
                    customer_name=customer_name,
                    client_order_id=client_order_id,
                    order_type=order_type
                )
            else:
                # Если в системе нет пользователей, возвращаем ошибку
                logger.error("No users in the system to assign to the order")
                raise serializers.ValidationError("Невозможно создать заказ: нет пользователей в системе")
        
        logger.info(f"Order created successfully with ID: {serializer.instance.id}, order_type: {serializer.instance.order_type}, client_order_id: {serializer.instance.client_order_id}")

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        try:
            order = self.get_object()
            status_value = request.data.get('status')
            
            if status_value not in dict(Order.ORDER_STATUS).keys():
                return Response(
                    {"error": f"Неправильный статус: {status_value}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            order.status = status_value
            order.save()
            
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Ошибка при обновлении статуса заказа: {str(e)}")
            return Response(
                {"error": "Ошибка при обновлении статуса заказа", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]  # Только авторизованные пользователи
    
    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        
        # Если пользователь не администратор, показываем позиции только из его заказов
        if not user.is_staff:
            queryset = queryset.filter(order__user=user)
            
        order_id = self.request.query_params.get('order', None)
        if order_id is not None:
            queryset = queryset.filter(order=order_id)
            
        return queryset


class UserAddressViewSet(viewsets.ModelViewSet):
    queryset = UserAddress.objects.all()
    serializer_class = UserAddressSerializer
    permission_classes = [IsAuthenticated]  # Только авторизованные пользователи
    
    def get_queryset(self):
        # Пользователь может видеть только свои адреса
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Устанавливаем текущего пользователя при создании адреса
        serializer.save(user=self.request.user)


# Новый ViewSet для управления владельцами ресторанов
class RestaurantOwnerViewSet(viewsets.ModelViewSet):
    queryset = CafeContact.objects.filter(role='owner')
    serializer_class = CafeOwnerSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить информацию о текущем владельце"""
        user = request.user
        try:
            owner_contact = CafeContact.objects.get(user=user, role='owner')
            serializer = self.get_serializer(owner_contact)
            return Response(serializer.data)
        except CafeContact.DoesNotExist:
            return Response(
                {"error": "Пользователь не является владельцем ресторана"},
                status=status.HTTP_404_NOT_FOUND
            )
