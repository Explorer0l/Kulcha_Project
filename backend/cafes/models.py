from django.db import models
from django.contrib.auth.models import User


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class City(TimestampMixin):
    name = models.CharField(max_length=100, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Cities'


class Cafe(TimestampMixin):
    name = models.CharField(max_length=100, db_index=True)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    menu_link = models.URLField(max_length=300, blank=True, null=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='cafes', db_index=True)
    cover_image = models.ImageField(upload_to='cafe_covers/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-rating', 'name']


class CafeContact(TimestampMixin):
    ROLE_CHOICES = [
        ('owner', 'Владелец'),
        ('manager', 'Менеджер'),
        ('staff', 'Сотрудник')
    ]
    
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='contacts')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='cafe_contacts')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    is_primary = models.BooleanField(default=False, help_text='Основной контакт для ресторана')

    def __str__(self):
        return f"{self.cafe.name} - {self.user.username if self.user else 'No user'} ({self.get_role_display()})"

    class Meta:
        # Один пользователь может быть связан с рестораном только в одной роли
        unique_together = [['cafe', 'user']]

    def save(self, *args, **kwargs):
        # Если это основной контакт, отмечаем другие как не основные
        if self.is_primary:
            CafeContact.objects.filter(cafe=self.cafe).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class MenuItem(TimestampMixin):
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='menu_items', db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=50, db_index=True)
    image_url = models.URLField(max_length=300, blank=True, null=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    available = models.BooleanField(default=True, db_index=True)

    def __str__(self):
        return f"{self.name} - {self.cafe.name}"

    class Meta:
        ordering = ['category', 'name']
        
    def save(self, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        # Log initial state
        logger.info(f"Saving MenuItem {self.name}")
        logger.info(f"- Image field: {self.image}")
        logger.info(f"- Image URL field: {self.image_url}")
        
        # Save the object
        super().save(*args, **kwargs)
        
        # Log state after save
        logger.info(f"MenuItem {self.name} saved")
        logger.info(f"- Image field after save: {self.image}")
        logger.info(f"- Image URL field after save: {self.image_url}")
        
        # Check if image file exists on disk
        if self.image:
            import os
            from django.conf import settings
            
            file_path = os.path.join(settings.MEDIA_ROOT, str(self.image))
            logger.info(f"Checking if image file exists at: {file_path}")
            
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                logger.info(f"File exists! Size: {file_size} bytes")
            else:
                logger.warning(f"File does not exist: {file_path}")
                
                # Check if the directory exists
                directory = os.path.dirname(file_path)
                if not os.path.exists(directory):
                    logger.warning(f"Directory does not exist: {directory}")
                    try:
                        os.makedirs(directory, exist_ok=True)
                        logger.info(f"Created directory: {directory}")
                    except Exception as e:
                        logger.error(f"Error creating directory: {str(e)}")
                else:
                    logger.info(f"Directory exists: {directory}")
                    # List files in directory for debugging
                    try:
                        files = os.listdir(directory)
                        logger.info(f"Files in directory: {files}")
                    except Exception as e:
                        logger.error(f"Error listing directory: {str(e)}")
        else:
            logger.warning("No image field set after save")


class UserAddress(TimestampMixin):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', db_index=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.ForeignKey(City, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} - {self.address}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'User addresses'


class Order(TimestampMixin):
    ORDER_TYPES = [
        ('in_place', 'В ресторане'),
        ('delivery', 'Доставка'),
        ('pickup', 'Самовывоз')
    ]

    ORDER_STATUS = [
        ('new', 'Новый'),
        ('confirmed', 'Подтверждён'),
        ('rejected', 'Отклонён'),
        ('preparing', 'Готовится'),
        ('ready', 'Готов'),
        ('delivered', 'Доставлено')
    ]

    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='orders', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', db_index=True, null=True, blank=True)
    customer_name = models.CharField(max_length=100, blank=True, null=True, help_text="Имя клиента для неавторизованных заказов")
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='new', db_index=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_address = models.ForeignKey(UserAddress, on_delete=models.SET_NULL, null=True, blank=True)
    client_order_id = models.CharField(max_length=100, blank=True, null=True, help_text="Уникальный ID заказа на стороне клиента")

    def calculate_total_price(self):
        """ Пересчитывает стоимость заказа """
        try:
            total = sum(item.menu_item.price * item.quantity for item in self.order_items.all())
            self.total_price = total
        except Exception as e:
            # В случае ошибки (например, если элементы заказа еще не созданы или удалены)
            print(f"Error calculating total price: {e}")

    def save(self, *args, **kwargs):
        # Проверяем, изменились ли позиции заказа и нужно ли пересчитать цену
        recalculate = kwargs.pop('recalculate', False)
        
        if recalculate and self.pk:  # Если это существующий заказ
            self.calculate_total_price()
            
        super().save(*args, **kwargs)

    def __str__(self):
        username = self.user.username if self.user else (self.customer_name or "Гость")
        return f"Order #{self.id} - {self.cafe.name} - {username}"

    class Meta:
        ordering = ['-created_at']


class OrderItem(TimestampMixin):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items', db_index=True)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Сначала сохраняем элемент заказа
        super().save(*args, **kwargs)
        
        # Затем пересчитываем общую стоимость заказа, но только если запись уже существовала
        # это позволит избежать рекурсивных вызовов при первом сохранении объекта
        if not is_new:
            self.order.save(recalculate=True)

    def delete(self, *args, **kwargs):
        order = self.order  # Запоминаем заказ до удаления позиции
        super().delete(*args, **kwargs)
        
        # Пересчитываем стоимость после удаления, если заказ все еще существует
        if Order.objects.filter(id=order.id).exists():
            order.save(recalculate=True)

    def __str__(self):
        return f"{self.menu_item.name} ({self.quantity})"

    class Meta:
        ordering = ['order', 'id']
