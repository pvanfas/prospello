from django.contrib import admin

from .models import FAQ
from .models import Blog
from .models import Slider
from .models import Testimonial


@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "image")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "image")


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "date")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("title",)
