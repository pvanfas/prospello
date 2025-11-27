from django.contrib import admin

from .models import Banner
from .models import Blog
from .models import Contact
from .models import Portfolio
from .models import PortfolioImage
from .models import Service
from .models import Team
from .models import Testimonial


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title",)
    prepopulated_fields = {"slug": ("title",)}


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 1


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ("title", "service")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [PortfolioImageInline]
    list_filter = ("service",)


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "position")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "designation")
