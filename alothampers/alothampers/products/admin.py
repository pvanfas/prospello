from django.contrib import admin
from import_export.admin import ExportActionModelAdmin

from .models import CustomOrder, CustomOrderItem, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    extra = 0
    model = OrderItem


@admin.register(Order)
class OrderAdmin(ExportActionModelAdmin):
    list_display = (
        "order_id",
        "user",
        "payable",
        "status",
        "created",
    )
    readonly_fields = (
        "order_id",
        "first_name",
        "last_name",
        "city",
        "completed_at",
        "payable",
        "created",
        "updated",
        "address_line_1",
        "address_line_2",
        "mobile",
        "alternate_mobile",
        "email",
    )
    search_fields = ("order_id", "first_name", "last_name", "city")
    list_filter = ("status",)
    inlines = (OrderItemInline,)

    def has_add_permission(self, request):
        return False


class CustomOrderItemInline(admin.TabularInline):
    extra = 0
    model = CustomOrderItem


@admin.register(CustomOrder)
class CustomOrderAdmin(ExportActionModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "city",
        "mobile",
    )
    search_fields = ("first_name", "last_name", "city")
    inlines = (CustomOrderItemInline,)

    def has_add_permission(self, request):
        return False
