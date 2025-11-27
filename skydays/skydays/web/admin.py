from django.contrib import admin
from django.utils.safestring import mark_safe
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import (
    Blog,
    BlogAuthor,
    Branch,
    Contact,
    Destination,
    FixedDeparture,
    Gallery,
    Package,
    Review,
    TeamMember,
    Video,
)


class FixedDepartureResource(resources.ModelResource):
    class Meta:
        model = FixedDeparture
        exclude = (
            "payment_terms",
            "cancellation_policy",
            "terms_and_conditions",
            "overview",
            "itinerary",
        )


class GalleryInline(admin.TabularInline):
    model = Gallery
    extra = 0


@admin.register(Destination)
class DestinationAdmin(ImportExportModelAdmin):
    list_display = ("name", "description", "image")
    list_filter = ("name", "description", "image")
    search_fields = ("name", "description", "image")
    ordering = ("name", "description", "image")
    inlines = [GalleryInline]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(FixedDeparture)
class FixedDepartureAdmin(ImportExportModelAdmin):
    prepopulated_fields = {"slug": ("destination",)}
    list_display = (
        "destination",
        "departure_from",
        "duration",
        "date",
        "total_seats",
        "price",
        "adult_costing",
        "child_with_bed_costing",
        "child_without_bed_costing",
        "infant_costing",
        "single_occupancy_costing",
        "is_active",
        "available_until",
        "rating",
    )
    list_filter = (
        "departure_from",
        "destination",
        "duration",
        "date",
        "total_seats",
        "price",
        "is_active",
        "available_until",
        "rating",
    )
    ordering = ("destination", "departure_from")
    resource_class = FixedDepartureResource


@admin.register(Gallery)
class GalleryAdmin(ImportExportModelAdmin):
    list_display = ("__str__", "destination", "image")
    list_filter = ("destination",)
    search_fields = ("destination",)
    ordering = ("destination",)


@admin.register(TeamMember)
class TeamMemberAdmin(ImportExportModelAdmin):
    list_display = ("name", "image", "designation")
    list_filter = ("name", "image", "designation")
    search_fields = ("name", "image", "designation")
    ordering = ("name", "image", "designation")


@admin.register(Review)
class ReviewAdmin(ImportExportModelAdmin):
    list_display = ("__str__", "rating", "review")
    list_filter = ("rating", "review")
    search_fields = ("rating", "review")
    ordering = ("rating", "review")


@admin.register(Package)
class PackageAdmin(ImportExportModelAdmin):
    prepopulated_fields = {"slug": ("destination",)}
    list_display = (
        "destination",
        "departure_from",
        "duration",
        "available_until",
        "rating",
        "is_active",
        "is_bestplace",
        "is_special",
    )
    list_filter = (
        "departure_from",
        "destination",
        "duration",
        "is_active",
        "available_until",
        "rating",
    )
    ordering = ("destination", "departure_from")


@admin.register(Blog)
class BlogAdmin(ImportExportModelAdmin):
    list_display = ("title", "author", "date")
    list_filter = ("title", "author", "date")
    search_fields = ("title", "author", "date")
    ordering = ("title", "author", "date")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(BlogAuthor)
class BlogAuthorAdmin(ImportExportModelAdmin):
    list_display = ("name", "designation")
    list_filter = ("name", "designation")
    search_fields = ("name", "designation")
    ordering = ("name", "designation")


@admin.register(Contact)
class ContactAdmin(ImportExportModelAdmin):
    def link(self):
        return mark_safe(
            '<a href="%s" target="_blank"><strong>View</strong></a>'
            % self.get_absolute_url()
        )

    list_display = ("name", "email", "phone", "message", link)
    list_filter = ("name", "email", "phone", "message")
    search_fields = ("name", "email", "phone", "message")
    ordering = ("name", "email", "phone", "message")


@admin.register(Branch)
class BranchAdmin(ImportExportModelAdmin):
    list_display = ("name", "address", "phone", "email")
    list_filter = ("name", "address", "phone", "email")
    search_fields = ("name", "address", "phone", "email")
    ordering = ("name", "address", "phone", "email")


@admin.register(Video)
class VideoAdmin(ImportExportModelAdmin):
    list_display = ("title", "video_id")
    list_filter = ("title", "video_id")
    search_fields = ("title", "video_id")
    ordering = ("title", "video_id")
