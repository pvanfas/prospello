from django.contrib import admin
from web.actions import mark_active
from web.actions import mark_inactive
from web.models import About
from web.models import Banner
from web.models import CareerApplication
from web.models import CareerPost
from web.models import Client
from web.models import Contact
from web.models import Enquiry
from web.models import News
from web.models import Social
from web.models import Testimonial


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    prepopulated_fields = {"slug": ("title",)}
    list_display = ("title", "timestamp", "is_active")
    list_filter = ("timestamp", "is_active")
    ordering = ("timestamp",)
    search_fields = ("title",)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("title", "is_active")


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("name", "logo", "is_active")


@admin.register(CareerPost)
class CareerPostAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("title",)}
    list_display = ("title", "timestamp", "is_active")
    actions = [mark_active, mark_inactive]


@admin.register(CareerApplication)
class CareerApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "place", "email", "timestamp")


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]


@admin.register(Social)
class SocialAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("name", "is_active")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "place", "email", "timestamp")
    search_fields = ("name", "phone", "place", "email", "message")


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "place", "product", "timestamp")
