from django.contrib import admin
from import_export.admin import ImportExportActionModelAdmin

from .models import BlogPost, Contact, HiringPartner, Mentor, Tool


@admin.register(Mentor)
class MentorAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "designation")
    search_fields = ("name", "designation")
    readonly_fields = ("preview",)


@admin.register(HiringPartner)
class HiringPartnerAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(BlogPost)
class BlogPostAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(Contact)
class ContactAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "phone", "subject")
    search_fields = ("name",)


@admin.register(Tool)
class ToolAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
