from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django import forms
from django.contrib.auth.hashers import make_password
from django.utils.translation import gettext_lazy as _
from django.contrib import messages
from .models import City, Cafe, CafeContact, MenuItem, Order, OrderItem, UserAddress

# Расширение стандартной админки пользователей, но БЕЗ CafeContactInline
class ExtendedUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_restaurants')
    
    def get_restaurants(self, obj):
        cafe_contacts = CafeContact.objects.filter(user=obj)
        if cafe_contacts:
            return ", ".join([f"{cc.cafe.name} ({cc.get_role_display()})" for cc in cafe_contacts])
        return "-"
    
    get_restaurants.short_description = "Рестораны"

# Перерегистрация стандартной модели пользователя
admin.site.unregister(User)
admin.site.register(User, ExtendedUserAdmin)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Cafe)
class CafeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'address', 'city', 'created_at')
    search_fields = ('name', 'address')
    list_filter = ('city',)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'cafe', 'price', 'category', 'available')
    list_filter = ('cafe', 'category', 'available')
    search_fields = ('name', 'description')

# Улучшенная форма для управления CafeContact с поддержкой создания нового пользователя
class CafeContactAdminForm(forms.ModelForm):
    # Данные для создания нового пользователя
    create_new_user = forms.BooleanField(
        label='Создать нового пользователя',
        required=False,
        initial=False,
        help_text='Отметьте, чтобы создать нового пользователя вместо выбора существующего.'
    )
    
    username = forms.CharField(
        label='Логин пользователя',
        required=False,
        help_text='Обязательно при создании нового пользователя.'
    )
    
    first_name = forms.CharField(
        label='Имя',
        required=False
    )
    
    last_name = forms.CharField(
        label='Фамилия',
        required=False
    )
    
    # Поля для пароля
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput,
        required=False,
        help_text='Обязательно при создании нового пользователя.'
    )
    
    password_confirm = forms.CharField(
        label='Подтверждение пароля',
        widget=forms.PasswordInput,
        required=False
    )
    
    class Meta:
        model = CafeContact
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        create_new_user = cleaned_data.get('create_new_user')
        user = cleaned_data.get('user')
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        
        if create_new_user:
            # Проверки для создания нового пользователя
            if not username:
                self.add_error('username', 'Логин обязателен при создании нового пользователя')
            
            if not email:
                self.add_error('email', 'Email обязателен при создании нового пользователя')
            
            if not password:
                self.add_error('password', 'Пароль обязателен при создании нового пользователя')
                
            # Проверка уникальности имени пользователя
            if username and User.objects.filter(username=username).exists():
                self.add_error('username', 'Пользователь с таким логином уже существует')
                
            # Проверка уникальности email
            if email and User.objects.filter(email=email).exists():
                self.add_error('email', 'Пользователь с таким email уже существует')
        elif not user:
            self.add_error('user', 'Необходимо выбрать существующего пользователя или создать нового')
        
        # Проверка совпадения паролей
        if password and password != password_confirm:
            self.add_error('password_confirm', 'Пароли не совпадают')
        
        return cleaned_data

@admin.register(CafeContact)
class CafeContactAdmin(admin.ModelAdmin):
    form = CafeContactAdminForm
    list_display = ('cafe', 'user', 'role', 'is_primary', 'email', 'phone', 'user_exists')
    list_filter = ('role', 'is_primary', 'cafe')
    search_fields = ('user__username', 'user__email', 'email', 'cafe__name')
    raw_id_fields = ('cafe',)  # user убран из raw_id_fields для поддержки создания
    
    fieldsets = (
        (None, {
            'fields': ('cafe', 'role', 'is_primary')
        }),
        ('Данные пользователя', {
            'fields': ('create_new_user', 'user', 'username', 'first_name', 'last_name'),
            'description': 'Выберите существующего пользователя или создайте нового'
        }),
        ('Контактная информация', {
            'fields': ('email', 'phone')
        }),
        ('Пароль', {
            'fields': ('password', 'password_confirm'),
            'description': 'Установите пароль для нового пользователя или обновите у существующего'
        }),
    )
    
    def user_exists(self, obj):
        """Показывает, существует ли пользователь в базе данных"""
        if obj.user:
            return True
        return False
    
    user_exists.boolean = True
    user_exists.short_description = "Пользователь создан"
    
    def get_fieldsets(self, request, obj=None):
        """Изменяем отображение полей в зависимости от создания/редактирования"""
        fieldsets = super().get_fieldsets(request, obj)
        
        if obj is None:  # Создание нового объекта
            # Делаем поле с выбором user скрытым при создании нового объекта
            pass
        else:  # Редактирование существующего объекта
            # Скрываем поля для нового пользователя при редактировании
            # Но сохраняем возможность сбросить пароль
            pass
            
        return fieldsets
    
    def save_model(self, request, obj, form, change):
        create_new_user = form.cleaned_data.get('create_new_user')
        password = form.cleaned_data.get('password')
        
        if create_new_user:
            # Создаем нового пользователя
            username = form.cleaned_data.get('username')
            first_name = form.cleaned_data.get('first_name', '')
            last_name = form.cleaned_data.get('last_name', '')
            email = form.cleaned_data.get('email', '')
            
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )
            
            if password:
                user.set_password(password)
                user.save()
                
            obj.user = user
            messages.success(request, f'Создан новый пользователь: {username}')
        elif password and obj.user:
            # Обновляем пароль существующего пользователя
            obj.user.set_password(password)
            obj.user.save()
            messages.success(request, f'Пароль пользователя {obj.user.username} успешно обновлен')
            
        # Синхронизируем email пользователя с контактным email
        if obj.user and obj.email:
            if obj.user.email != obj.email:
                obj.user.email = obj.email
                obj.user.save()
        
        super().save_model(request, obj, form, change)
    
    class Media:
        js = ('js/cafe_contact_admin.js',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'cafe', 'user', 'order_type', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'order_type', 'cafe')
    search_fields = ('user__username', 'cafe__name')
    inlines = [OrderItemInline]

@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'address', 'city')
    list_filter = ('city',)
    search_fields = ('user__username', 'address', 'name')
