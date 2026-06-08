from django.contrib import admin
from import_export.admin import ImportExportActionModelAdmin

from .models import FAQ, Career, Committee, Contact, Frame, Partner, Platform, PlatformService, Spotlight, SpotlightCategory, Team


class PlatformServiceInline(admin.StackedInline):
    model = PlatformService
    extra = 1


@admin.register(Platform)
class PlatformAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "tagline", "transparent_image")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "tagline")
    inlines = [PlatformServiceInline]


@admin.register(SpotlightCategory)
class SpotlightCategoryAdmin(ImportExportActionModelAdmin):
    pass


@admin.register(Spotlight)
class SpotlightAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "category", "date")
    search_fields = ("title", "category__name")
    list_filter = ("category", "date")
    date_hierarchy = "date"
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Career)
class CareerAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(FAQ)
class FAQAdmin(ImportExportActionModelAdmin):
    list_display = ("question",)
    search_fields = ("question",)


@admin.register(Frame)
class FrameAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "description", "subtitle", "order", "is_active")
    search_fields = ("title",)


@admin.register(Partner)
class PartnerAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Contact)
class ContactAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Team)
class TeamAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "designation")
    search_fields = ("name", "designation")


@admin.register(Committee)
class CommitteeAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "focus")
    search_fields = ("name", "focus")
