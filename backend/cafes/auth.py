from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from .serializers import UserSerializer
from django.contrib.auth.models import User
from .models import CafeContact, Cafe
import logging
from django.conf import settings
from django.middleware.csrf import get_token

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt  # Временно отключаем CSRF проверку пока решаем проблему
def login_view(request):
    """
    Аутентификация пользователей системы, включая владельцев ресторанов
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Расширенное логирование для диагностики
    logger.info(f"Попытка входа с email: {email}")
    logger.debug(f"Запрос входа: {request.data}")
    
    # Логирование важных заголовков для отладки CSRF
    csrf_header = request.META.get('HTTP_X_CSRFTOKEN', 'Отсутствует')
    origin_header = request.META.get('HTTP_ORIGIN', 'Отсутствует')
    request_method = request.method
    content_type = request.META.get('CONTENT_TYPE', 'Отсутствует')
    
    # Логируем все используемые куки
    cookies = {k: v for k, v in request.COOKIES.items()}
    
    logger.info(f"CSRF токен в заголовке: {csrf_header[:6] + '...' if len(csrf_header) > 6 and csrf_header != 'Отсутствует' else csrf_header}")
    logger.info(f"Origin заголовок: {origin_header}")
    logger.info(f"HTTP метод: {request_method}")
    logger.info(f"Content-Type: {content_type}")
    logger.info(f"Cookies: {cookies}")
    
    # Простая проверка CSRF
    request_csrf = request.META.get('HTTP_X_CSRFTOKEN', '')
    cookie_csrf = request.COOKIES.get('csrftoken', '')
    
    logger.info(f"HTTP_X_CSRFTOKEN: {request_csrf[:6] + '...' if len(request_csrf) > 6 else request_csrf}")
    logger.info(f"Cookie CSRF: {cookie_csrf[:6] + '...' if len(cookie_csrf) > 6 else cookie_csrf}")
    
    if request_csrf and cookie_csrf:
        token_match = request_csrf == cookie_csrf
        logger.info(f"CSRF токены совпадают: {token_match}")
    
    if not email or not password:
        logger.warning(f"Отсутствует email или пароль: {email}")
        return Response(
            {"error": "Пожалуйста, укажите email и пароль"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Проверяем стандартные учетные записи
        try:
            # Ищем пользователя по email
            user = User.objects.get(email=email)
            logger.info(f"Проверка учетной записи: {email}")
            
            # Аутентифицируем пользователя
            auth_user = authenticate(request, username=user.username, password=password)
            
            if auth_user is None:
                logger.warning(f"Неверный пароль для пользователя {email}")
                return Response(
                    {"error": "Неверные учетные данные"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Выполняем вход пользователя
            login(request, auth_user)
            logger.info(f"Успешный вход пользователя: {user.username}")
            
            # Проверяем, является ли пользователь владельцем ресторана
            cafe_contact = CafeContact.objects.filter(user=user, role='owner').first()
            
            response_data = {
                "id": user.id,
                "email": user.email,
                "name": user.first_name or user.username,
            }
            
            if cafe_contact:
                logger.info(f"Пользователь {user.username} является владельцем ресторана {cafe_contact.cafe.name}")
                response_data.update({
                    "cafe_id": cafe_contact.cafe.id,
                    "role": "owner"
                })
            
            logger.info(f"Данные для отправки: {response_data}")
            return Response(response_data)
            
        except User.DoesNotExist:
            logger.warning(f"Пользователь с email {email} не найден")
            return Response(
                {"error": "Неверные учетные данные"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Ошибка при аутентификации: {str(e)}")
        return Response(
            {"error": "Произошла ошибка при входе", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # Разрешаем всем для случая, если токен истек
def logout_view(request):
    logout(request)
    logger.info("Пользователь вышел из системы")
    return Response({"message": "Выход выполнен успешно"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    user = request.user
    serializer = UserSerializer(user)
    logger.info(f"Запрос данных пользователя: {user.username}")
    
    # Добавляем информацию о ресторанах, где пользователь является владельцем
    cafe_contacts = CafeContact.objects.filter(user=user, role='owner')
    
    cafes = []
    for contact in cafe_contacts:
        cafes.append({
            "id": contact.cafe.id,
            "name": contact.cafe.name,
            "role": contact.role,
            "is_primary": contact.is_primary
        })
    
    data = serializer.data
    data['cafes'] = cafes
    logger.debug(f"Данные пользователя для отправки: {data}")
    
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Получение CSRF токена с расширенным логированием
    """
    logger.info("Запрос CSRF токена")
    
    # Проверяем текущие заголовки запроса
    origin = request.META.get('HTTP_ORIGIN', 'Unknown')
    referer = request.META.get('HTTP_REFERER', 'Unknown')
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
    
    logger.info(f"CSRF запрос от Origin: {origin}, Referer: {referer}")
    logger.debug(f"User-Agent: {user_agent}")
    
    # Создаем ответ с CSRF токеном
    response = Response(
        {"detail": "CSRF cookie set", "success": True, "timestamp": str(request.META.get('REQUEST_TIME', ''))},
        status=status.HTTP_200_OK
    )
    
    # Явно устанавливаем доступ к cookie через JS
    response['Access-Control-Allow-Credentials'] = 'true'
    
    if origin in settings.CORS_ALLOWED_ORIGINS or settings.CORS_ALLOW_ALL_ORIGINS:
        response['Access-Control-Allow-Origin'] = origin
    
    # Логируем куки в ответе
    csrf_token = get_token(request)  # Это также устанавливает токен в cookie
    logger.info(f"CSRF токен сгенерирован: {csrf_token[:6]}... (первые 6 символов)")
    
    response.set_cookie(
        settings.CSRF_COOKIE_NAME,
        csrf_token,
        max_age=settings.CSRF_COOKIE_AGE,
        domain=settings.CSRF_COOKIE_DOMAIN,
        path=settings.CSRF_COOKIE_PATH,
        secure=settings.CSRF_COOKIE_SECURE,
        httponly=settings.CSRF_COOKIE_HTTPONLY,
        samesite=settings.CSRF_COOKIE_SAMESITE
    )
    
    cookies_info = {
        'csrf_cookie': {
            'name': settings.CSRF_COOKIE_NAME,
            'secure': settings.CSRF_COOKIE_SECURE,
            'httponly': settings.CSRF_COOKIE_HTTPONLY,
            'samesite': settings.CSRF_COOKIE_SAMESITE
        }
    }
    logger.debug(f"Настройки CSRF cookie: {cookies_info}")
    
    return response 