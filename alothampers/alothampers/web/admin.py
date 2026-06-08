from django.contrib import admin
from django.db import models
from django.forms import CheckboxSelectMultiple
from import_export.admin import ImportExportActionModelAdmin

from .models import Category, Collection, Emotion, GeneralSetting, Information, Occasion, Offer, Product, ProductImage, Recipient, Review, Section, Slider, Testimonial


@admin.register(Slider)
class SliderAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "topline", "order", "is_active")
    search_fields = ("title", "topline")


@admin.register(Category)
class CategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "show_in_nav", "is_active")
    list_filter = ("show_in_nav",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Recipient)
class RecipientAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Occasion)
class OccasionAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Emotion)
class EmotionAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Testimonial)
class Testimonial(ImportExportActionModelAdmin):
    list_display = ("name", "is_active")
    search_fields = ("name",)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    exclude = ("is_active",)
    extra = 1


class OfferInline(admin.TabularInline):
    model = Offer
    exclude = ("is_active",)
    extra = 1


class InformationInline(admin.TabularInline):
    model = Information
    exclude = ("is_active",)
    extra = 1


class ReviewInline(admin.StackedInline):
    model = Review
    exclude = ("is_active",)
    extra = 1


@admin.register(Product)
class ProductAdmin(ImportExportActionModelAdmin):
    inlines = (ProductImageInline, OfferInline, InformationInline, ReviewInline)
    list_display = ("name", "product_type", "category", "sale_price", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("category", "recipient", "occasion", "is_active", "product_type")
    autocomplete_fields = ("category", "recipient", "occasion", "emotion")


@admin.register(Offer)
class OfferAdmin(ImportExportActionModelAdmin):
    list_display = (
        "product",
        "discount",
        "offer_start",
        "offer_end",
        "max_sales",
        "sold_count",
        "is_active",
    )
    search_fields = ("product__name",)
    readonly_fields = ("sold_count",)


@admin.register(Collection)
class CollectionAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "link", "is_active")
    search_fields = ("title",)
    list_filter = ("is_active",)
    formfield_overrides = {
        models.ManyToManyField: {"widget": CheckboxSelectMultiple},
    }

    class Media:
        css = {
            "all": ("admin/css/admin.css",),
        }


@admin.register(Section)
class SectionAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "button_link", "is_active")
    search_fields = ("title",)
    list_filter = ("is_active",)


@admin.register(Review)
class ReviewAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "product", "rating", "is_active")
    search_fields = ("name", "product__name")
    list_filter = ("is_active",)
    list_editable = ("is_active",)
    list_display_links = ("name",)


@admin.register(GeneralSetting)
class GeneralSettingAdmin(admin.ModelAdmin):
    pass
