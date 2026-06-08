from django.contrib import admin
from .models import Category, Contact, News, Slider, Career, Team, Application, Brand
from import_export.admin import ImportExportActionModelAdmin


@admin.register(Category)
class CategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "business_line", "order")
    search_fields = ("business_line", "title")


@admin.register(Contact)
class ContactAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "email", "phone", "subject")
    search_fields = ("name", "email", "phone", "subject")


@admin.register(News)
class NewsAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Slider)
class SliderAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(Career)
class CareerAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(Team)
class TeamAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Application)
class ApplicationAdmin(ImportExportActionModelAdmin):
    list_display = ("fullname", "email", "phone")
    search_fields = ("fullname", "email", "phone")


@admin.register(Brand)
class BrandAdmin(ImportExportActionModelAdmin):
    list_display = ("name","order", "image")
