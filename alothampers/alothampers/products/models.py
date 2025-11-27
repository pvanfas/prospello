import uuid

from django.contrib.auth.models import User
from django.db import models
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone

from main.functions import generate_fields


class Cart(models.Model):
    session_id = models.CharField(max_length=220, blank=True, null=True)
    product = models.ForeignKey("web.Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_product_name(self):
        return self.product

    def subtotal(self):
        return float(round(float(self.quantity) * float(self.product.get_price()), 2))

    def __str__(self):
        return f"{self.product} - {self.quantity}"


def generate_order_id():
    timestamp = timezone.now().strftime("%y%m%d")
    unique_id = uuid.uuid4().hex[:6]
    return f"{timestamp}{unique_id.upper()}"


class Order(models.Model):
    created = models.DateTimeField(db_index=True, auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    order_id = models.CharField(max_length=220, default=generate_order_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    payable = models.DecimalField(max_digits=10, decimal_places=2)
    completed_at = models.DateTimeField(blank=True, null=True)

    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    address_line_1 = models.CharField("Address", max_length=100, blank=True, null=True)
    address_line_2 = models.CharField("Address Line 2", max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    alternate_mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=100,
        default="Pending",
        choices=(
            ("Pending", "Pending"),
            ("Shipped", "Order Shipped"),
            ("Delivered", "Order Delivered"),
            ("Cancelled", "Order Cancelled"),
        ),
    )

    def get_fields(self):
        return generate_fields(self)

    def delete(self, *args, **kwargs):
        self.is_active = False
        self.save()
        return HttpResponseRedirect(self.get_list_url())

    def get_absolute_url(self):
        return reverse("web:order_detail", kwargs={"order_id": self.order_id})

    def get_list_url(self):
        return reverse("main:order_list")

    def get_update_url(self):
        return reverse("main:order_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse("main:order_delete", kwargs={"pk": self.pk})

    def get_items(self):
        return OrderItem.objects.filter(order=self)

    def get_items_count(self):
        return self.get_items().count()

    def total(self):
        return sum([item.subtotal() for item in self.get_items()])

    class Meta:
        ordering = ("-id",)

    def __str__(self):
        return f"{self.order_id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_option = models.ForeignKey("web.Product", related_name="order_items", on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    file_input = models.FileField(upload_to="uploads/", blank=True, null=True)

    def __str__(self):
        return f"{self.product_option} - {self.quantity}"

    def subtotal(self):
        return self.price * self.quantity


class CustomOrder(models.Model):
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    address_line_1 = models.CharField("Address", max_length=100, blank=True, null=True)
    address_line_2 = models.CharField("Address Line 2", max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    alternate_mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def get_fields(self):
        return generate_fields(self)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_absolute_url(self):
        return reverse("main:custom_order_detail", kwargs={"pk": self.pk})

    def get_list_url(self):
        return reverse("main:custom_order_list")

    def get_update_url(self):
        return reverse("main:custom_order_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse("main:custom_order_delete", kwargs={"pk": self.pk})

    def get_items(self):
        return CustomOrderItem.objects.filter(order=self)

    def get_items_count(self):
        return self.get_items().count()


class CustomOrderItem(models.Model):
    order = models.ForeignKey(CustomOrder, on_delete=models.CASCADE)
    product_option = models.ForeignKey("web.Product", related_name="custom_order_items", on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.product_option} - {self.quantity}"

    def subtotal(self):
        return self.price * self.quantity
