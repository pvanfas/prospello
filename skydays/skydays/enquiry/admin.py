from django.contrib import admin
from django.utils.safestring import mark_safe
from import_export.admin import ImportExportActionModelAdmin

from .models import (
    Airport,
    CustomPackageEnquiry,
    FixedDepartureEnquiry,
    FixedDepartureTraveller,
    PackageEnquiry,
    PackageRoom,
    PackageTraveller,
)


@admin.register(Airport)
class AirportAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "city", "code", "is_active")
    list_display_links = ("name", "city", "code")
    list_filter = ("name", "city", "code", "is_active")
    search_fields = ("name", "city", "code")
    ordering = ("name", "city", "code")
    list_editable = ("is_active",)


class PackageTravellerInline(admin.TabularInline):
    model = PackageTraveller
    extra = 0


class FixedDepartureTravellerInline(admin.TabularInline):
    model = FixedDepartureTraveller
    extra = 0


class PackageRoomInline(admin.TabularInline):
    model = PackageRoom
    extra = 0


@admin.register(PackageEnquiry)
class PackageEnquiryAdmin(admin.ModelAdmin):
    def link(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>VIEW</strong></a>'
            % self.get_absolute_url()
        )

    def download(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>DOWNLOAD</strong></a>'
            % self.get_pdf_url()
        )

    list_display = (
        "package",
        "date",
        "hotel_category",
        "name",
        "whatsapp",
        "phone",
        "email",
        "additional_info",
        link,
        download,
        "timestamp",
    )
    list_filter = ("package", "date", "hotel_category")
    search_fields = (
        "package",
        "date",
        "hotel_category",
        "name",
        "whatsapp",
        "phone",
        "email",
        "additional_info",
    )
    ordering = ("-timestamp", "package", "date")
    inlines = [PackageTravellerInline]


@admin.register(FixedDepartureEnquiry)
class FixedDepartureEnquiryAdmin(admin.ModelAdmin):
    def link(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>VIEW</strong></a>'
            % self.get_absolute_url()
        )

    def download(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>DOWNLOAD</strong></a>'
            % self.get_pdf_url()
        )

    list_display = (
        "name",
        "order_id",
        "whatsapp",
        "phone",
        "email",
        link,
        download,
        "get_price",
        "total_guests",
        "timestamp",
    )
    list_filter = ("name", "whatsapp", "phone", "email")
    search_fields = ("name", "whatsapp", "phone", "email")
    ordering = ("-timestamp", "name", "whatsapp", "phone", "email")
    inlines = [FixedDepartureTravellerInline, PackageRoomInline]


@admin.register(CustomPackageEnquiry)
class CustomPackageEnquiryAdmin(admin.ModelAdmin):
    def link(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>VIEW</strong></a>'
            % self.get_absolute_url()
        )

    list_display = (
        "first_name",
        "last_name",
        "email",
        "phone",
        "whatsapp",
        "destination",
        "preference",
        link,
        "timestamp",
    )
    list_filter = (
        "first_name",
        "last_name",
        "email",
        "phone",
        "whatsapp",
        "destination",
        "preference",
    )
    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone",
        "whatsapp",
        "destination",
        "preference",
    )
    autocomplete_fields = ("airport",)
