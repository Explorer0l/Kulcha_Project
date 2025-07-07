import logging
import re
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.middleware.csrf import CsrfViewMiddleware
from django.http import FileResponse, HttpResponse
import os

logger = logging.getLogger(__name__)

class ContentTypeMiddleware:
    """
    Middleware to ensure proper UTF-8 content-type headers for all API responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Only modify JSON responses
        content_type = response.get('Content-Type', '')
        if 'application/json' in content_type and 'charset' not in content_type:
            response['Content-Type'] = 'application/json; charset=utf-8'
            
        return response 

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Используем настройки из settings.py
        self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [
            'http://localhost', 'http://localhost:3000', 'http://localhost:80',
            'http://127.0.0.1', 'http://127.0.0.1:3000', 'http://127.0.0.1:80',
            'http://frontend'
        ])
        logger.info(f"CORS Middleware initialized with allowed origins: {self.allowed_origins}")

    def __call__(self, request):
        origin = request.headers.get('Origin', '')
        logger.debug(f"Request from origin: {origin}")
        
        # Для OPTIONS запросов отвечаем сразу с нужными заголовками
        if request.method == "OPTIONS":
            response = self.handle_options_request(request, origin)
            return response
        
        response = self.get_response(request)
        self.add_cors_headers(response, origin)
        return response
    
    def handle_options_request(self, request, origin):
        from django.http import HttpResponse
        response = HttpResponse()
        self.add_cors_headers(response, origin)
        return response
    
    def add_cors_headers(self, response, origin):
        """Добавление всех необходимых CORS заголовков"""
        # Set proper origin for CORS
        if origin in self.allowed_origins or '*' in self.allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
        else:
            # Если origin не в списке разрешенных, используем первый разрешенный или *
            response["Access-Control-Allow-Origin"] = self.allowed_origins[0] if self.allowed_origins else "*"
        
        # Set other CORS headers
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, X-CSRFToken"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"  # 24 часа


class CustomCsrfMiddleware(CsrfViewMiddleware):
    """
    Кастомный CSRF middleware с дополнительным логированием и исключениями
    """
    def __init__(self, get_response):
        super().__init__(get_response)
        self.exempt_paths = getattr(settings, 'CSRF_EXEMPT_PATHS', [])
        logger.info(f"Custom CSRF Middleware initialized with exempt paths: {self.exempt_paths}")
    
    def process_view(self, request, callback, callback_args, callback_kwargs):
        path = request.path_info.lstrip('/')
        
        # Логирование для диагностики CSRF
        if 'auth' in path:
            logger.debug(f"CSRF Processing path: {path}, Method: {request.method}")
            logger.debug(f"CSRF token in cookie: {'csrftoken' in request.COOKIES}")
            logger.debug(f"CSRF token in header: {'HTTP_X_CSRFTOKEN' in request.META}")
            
            if 'csrftoken' in request.COOKIES:
                token = request.COOKIES['csrftoken']
                logger.debug(f"CSRF cookie token (first 6): {token[:6]}...")
            
            if 'HTTP_X_CSRFTOKEN' in request.META:
                token = request.META['HTTP_X_CSRFTOKEN']
                logger.debug(f"CSRF header token (first 6): {token[:6]}...")
        
        # Проверяем, есть ли путь в списке исключений
        for exempt_path in self.exempt_paths:
            if exempt_path in path:
                logger.debug(f"CSRF exempt path: {path}")
                return None
        
        return super().process_view(request, callback, callback_args, callback_kwargs) 

class MediaFileCacheMiddleware:
    """
    Middleware that adds Cache-Control headers to media file responses.
    This improves performance by allowing browsers to cache media files like images.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Compile regex pattern for media URLs
        self.media_url_pattern = re.compile(f'^/{settings.MEDIA_URL.strip("/")}/')
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Check if this is a media file request
        path = request.path_info.lstrip('/')
        if path.startswith(settings.MEDIA_URL.strip('/')):
            # Add cache control header for media files
            if hasattr(settings, 'MEDIA_CACHE_CONTROL') and settings.MEDIA_CACHE_CONTROL:
                response['Cache-Control'] = settings.MEDIA_CACHE_CONTROL
                
        return response

class MediaServeMiddleware:
    """
    Middleware для обслуживания медиа-файлов напрямую из запроса.
    Это решает проблему с 404 ошибками для медиа-файлов.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.media_url = settings.MEDIA_URL.strip('/')
        self.media_root = str(settings.MEDIA_ROOT)
        logger.info(f"MediaServeMiddleware initialized with media_url: {self.media_url}, media_root: {self.media_root}")
        
    def __call__(self, request):
        # Проверяем, запрашивается ли медиа-файл
        path = request.path_info.strip('/')
        
        # Более гибкая проверка пути - проверяем как с media/ так и просто имя файла в базовом пути
        if path.startswith(self.media_url) or path.startswith('media_items/') or path.startswith('cafe_covers/'):
            # Извлекаем относительный путь файла
            if path.startswith(self.media_url):
                rel_path = path[len(self.media_url):].strip('/')
            else:
                rel_path = path  # Используем полный путь если он не начинается с media_url
            
            logger.info(f"Trying to serve media file, path: {path}, rel_path: {rel_path}")
            
            # Проверяем файл напрямую в media_root
            file_path = os.path.join(self.media_root, rel_path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                logger.info(f"Serving media file: {file_path}")
                try:
                    response = FileResponse(open(file_path, 'rb'))
                    if hasattr(settings, 'MEDIA_CACHE_CONTROL') and settings.MEDIA_CACHE_CONTROL:
                        response['Cache-Control'] = settings.MEDIA_CACHE_CONTROL
                    return response
                except Exception as e:
                    logger.error(f"Error serving media file {file_path}: {str(e)}")
            
            # Если не нашли напрямую, проверяем альтернативные пути
            if 'menu_items/' in path or 'menu_item_' in path:
                # Проверяем в подкаталоге menu_items
                alt_path = os.path.join(self.media_root, 'menu_items', os.path.basename(path))
                if os.path.exists(alt_path) and os.path.isfile(alt_path):
                    logger.info(f"Serving media file from alternative path: {alt_path}")
                    try:
                        response = FileResponse(open(alt_path, 'rb'))
                        if hasattr(settings, 'MEDIA_CACHE_CONTROL') and settings.MEDIA_CACHE_CONTROL:
                            response['Cache-Control'] = settings.MEDIA_CACHE_CONTROL
                        return response
                    except Exception as e:
                        logger.error(f"Error serving media file {alt_path}: {str(e)}")
            
            if 'cafe_covers/' in path:
                # Проверяем в подкаталоге cafe_covers
                alt_path = os.path.join(self.media_root, 'cafe_covers', os.path.basename(path))
                if os.path.exists(alt_path) and os.path.isfile(alt_path):
                    logger.info(f"Serving media file from alternative path: {alt_path}")
                    try:
                        response = FileResponse(open(alt_path, 'rb'))
                        if hasattr(settings, 'MEDIA_CACHE_CONTROL') and settings.MEDIA_CACHE_CONTROL:
                            response['Cache-Control'] = settings.MEDIA_CACHE_CONTROL
                        return response
                    except Exception as e:
                        logger.error(f"Error serving media file {alt_path}: {str(e)}")
            
            logger.warning(f"Media file not found: {path}, tried file_path: {file_path}")
        
        # Если путь не соответствует медиа-файлу, передаем запрос дальше
        return self.get_response(request)

class StaticFileServeMiddleware:
    """
    Middleware для обслуживания статических файлов напрямую из запроса.
    Это решает проблему с 404 ошибками для статических файлов.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.static_url = settings.STATIC_URL.strip('/')
        self.static_root = str(settings.STATIC_ROOT)
        self.staticfiles_dirs = getattr(settings, 'STATICFILES_DIRS', [])
        
        # Преобразуем пути в строки
        self.staticfiles_dirs = [str(path) for path in self.staticfiles_dirs]
        
        logger.info(f"StaticFileServeMiddleware initialized with static_url: {self.static_url}, static_root: {self.static_root}")
        logger.info(f"StaticFileServeMiddleware staticfiles_dirs: {self.staticfiles_dirs}")
        
    def __call__(self, request):
        # Проверяем, запрашивается ли статический файл
        path = request.path_info.strip('/')
        
        if path.startswith(self.static_url):
            # Извлекаем относительный путь файла
            rel_path = path[len(self.static_url):].strip('/')
            
            # Проверяем сначала в STATIC_ROOT
            file_path = os.path.join(self.static_root, rel_path)
            
            if os.path.exists(file_path) and os.path.isfile(file_path):
                logger.info(f"Serving static file from STATIC_ROOT: {file_path}")
                try:
                    return FileResponse(open(file_path, 'rb'))
                except Exception as e:
                    logger.error(f"Error serving static file {file_path}: {str(e)}")
            
            # Если файл не найден в STATIC_ROOT, ищем в STATICFILES_DIRS
            for static_dir in self.staticfiles_dirs:
                file_path = os.path.join(static_dir, rel_path)
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    logger.info(f"Serving static file from STATICFILES_DIRS: {file_path}")
                    try:
                        return FileResponse(open(file_path, 'rb'))
                    except Exception as e:
                        logger.error(f"Error serving static file {file_path}: {str(e)}")
            
            # Специальная обработка для admin/ файлов (они могут быть в django пакете)
            if rel_path.startswith('admin/'):
                try:
                    from django.contrib.admin.views.decorators import staff_member_required
                    # Получаем путь к Django admin static файлам
                    import django
                    django_base_path = os.path.dirname(django.__file__)
                    admin_static_path = os.path.join(django_base_path, 'contrib', 'admin', 'static')
                    
                    # Строим путь к файлу
                    file_path = os.path.join(admin_static_path, rel_path)
                    if os.path.exists(file_path) and os.path.isfile(file_path):
                        logger.info(f"Serving admin static file: {file_path}")
                        return FileResponse(open(file_path, 'rb'))
                except Exception as e:
                    logger.error(f"Error serving admin static file: {str(e)}")
            
            logger.warning(f"Static file not found: {rel_path}")
        
        # Если путь не соответствует статическому файлу, передаем запрос дальше
        return self.get_response(request) 