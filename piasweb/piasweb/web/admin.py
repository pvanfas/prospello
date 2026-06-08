from django.contrib import admin
from import_export.admin import ImportExportActionModelAdmin

from .models import FAQ, Application, ChatRequest, Course, Event, IndustryExpert, PhoneRequest, SkillCategory, Speaker, Testimonial, CourseEnquiry


@admin.register(IndustryExpert)
class IndustryExpertAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "priority", "logo")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(SkillCategory)
class SkillCategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(Course)
class CourseAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "skill_category")
    search_fields = ("title",)
    ordering = ("title",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Testimonial)
class TestimonialAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "designation")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(FAQ)
class FAQAdmin(ImportExportActionModelAdmin):
    list_display = ("question",)
    search_fields = ("question",)
    ordering = ("question",)


@admin.register(Speaker)
class SpeakerAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "designation")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Event)
class EventAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "date", "time")
    search_fields = ("title",)
    ordering = ("title",)


@admin.register(PhoneRequest)
class PhoneRequestAdmin(ImportExportActionModelAdmin):
    list_display = ("phone", "created_at")
    search_fields = ("phone",)
    ordering = ("-created_at",)


@admin.register(Application)
class ApplicationAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "email", "phone", "created_at")
    search_fields = ("name", "email", "phone")
    ordering = ("-created_at",)


@admin.register(ChatRequest)
class ChatRequestAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "email", "phone", "created_at")
    search_fields = ("name", "email", "phone")
    ordering = ("-created_at",)


@admin.register(CourseEnquiry)
class CourseEnquiryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "email", "course")
    search_fields = ("name", "email", "phone", "course")
    ordering = ("-created_at",)
