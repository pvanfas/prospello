from django.contrib import admin
from import_export.admin import ImportExportActionModelAdmin
from web.actions import mark_active
from web.actions import mark_featured
from web.actions import mark_inactive
from web.actions import mark_not_featured

from .models import Category
from .models import Product


@admin.register(Category)
class CategoryAdmin(ImportExportActionModelAdmin):
    actions = [mark_active, mark_inactive]
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "get_product_count", "id")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(ImportExportActionModelAdmin):
    actions = [mark_active, mark_inactive, mark_featured, mark_not_featured]
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "rank", "category", "is_active", "is_featured")
    list_filter = ("is_active", "category")
    list_editable = ("is_active",)
    search_fields = ("name",)
    autocomplete_fields = ("category",)
