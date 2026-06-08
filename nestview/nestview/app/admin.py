from django.contrib import admin

from .models import Amenity
from .models import Property
from .models import PropertyFeature
from .models import PropertyImage
from .models import Realtor


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


class PropertyFeatureInline(admin.TabularInline):
    model = PropertyFeature
    extra = 1


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)
    list_per_page = 25


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    inlines = [PropertyImageInline, PropertyFeatureInline]
    list_display = ("title", "location", "property_id", "property_type", "property_status", "property_price")
    list_filter = (
        "property_type",
        "property_status",
        "property_bedrooms",
        "property_bathrooms",
        "property_garages",
        "property_year_built",
        "property_floor",
    )
    search_fields = (
        "title",
        "location",
        "property_id",
        "property_type",
        "property_status",
        "property_price",
        "property_area",
        "property_bedrooms",
        "property_bathrooms",
        "property_garages",
        "property_year_built",
        "property_floor",
    )
    autocomplete_fields = ("amenities",)


@admin.register(Realtor)
class RealtorAdmin(admin.ModelAdmin):
    pass
