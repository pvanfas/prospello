from django.contrib import admin

from .models import Application
from .models import Appointment
from .models import Career
from .models import Category
from .models import Client
from .models import Contact
from .models import Leadership
from .models import News
from .models import NewsImage
from .models import Project
from .models import ProjectCategory
from .models import Team


class NewsImageAdmin(admin.TabularInline):
    model = NewsImage


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    inlines = [NewsImageAdmin]
    list_display = ("title", "category", "date", "show_in_homepage")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title",)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("title",)


@admin.register(Leadership)
class LeadershipAdmin(admin.ModelAdmin):
    list_display = ("name", "designation", "photo", "is_active")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "designation", "is_active")


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ("title",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "is_active")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "timestamp", "email", "phone")


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ("department", "title", "description", "is_active")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "career", "name", "resume")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "name", "email", "phone")
