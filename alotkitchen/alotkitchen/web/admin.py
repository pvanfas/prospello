# Register your models here.
from django.contrib import admin
from .models import Banner

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_active")
    list_filter = ("is_active", "category")
    search_fields = ("title",)
    autocomplete_fields = ("category",)
    
    # class Media:
    #     css = {"all": ("extra_admin/css/admin.css",)}