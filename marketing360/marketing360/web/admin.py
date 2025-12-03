from django.contrib import admin
from import_export.admin import ImportExportActionModelAdmin

from .models import (
    Audience,
    BlogCategory,
    BlogPost,
    CaseStudy,
    Center,
    Community,
    Contact,
    Course,
    FAQ,
    FAQCategory,
    Feature,
    HiringPartner,
    Mentor,
    ReferralStep,
    Tool,
    Webinar,
    WhyUs,
)


@admin.register(Course)
class CourseAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "mode", "duration", "order")
    search_fields = ("title", "description")


@admin.register(Webinar)
class WebinarAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "date", "time", "location", "registration_count", "order")
    search_fields = ("title", "location")
    list_filter = ("date",)


@admin.register(Center)
class CenterAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "city", "order")
    search_fields = ("name", "city", "address")


@admin.register(FAQCategory)
class FAQCategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "order")
    search_fields = ("name",)


@admin.register(FAQ)
class FAQAdmin(ImportExportActionModelAdmin):
    list_display = ("question", "category", "order")
    search_fields = ("question", "answer")
    list_filter = ("category",)


@admin.register(Community)
class CommunityAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "type", "order")
    search_fields = ("name", "description")
    list_filter = ("type",)


@admin.register(ReferralStep)
class ReferralStepAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order")
    search_fields = ("title", "description")


@admin.register(CaseStudy)
class CaseStudyAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order")
    search_fields = ("title", "problem", "strategy")


@admin.register(BlogCategory)
class BlogCategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "order")
    list_editable = ("order",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Audience)
class AudienceAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order")
    search_fields = ("title", "description")


@admin.register(Feature)
class FeatureAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "description", "order")
    search_fields = ("title", "description")


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
    list_display = ("title", "category", "author", "is_featured", "date")
    list_filter = ("category", "is_featured", "date")
    search_fields = ("title", "summary", "author")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "date"


@admin.register(Contact)
class ContactAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "phone", "subject")
    search_fields = ("name",)


@admin.register(Tool)
class ToolAdmin(ImportExportActionModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(WhyUs)
class WhyUsAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "number", "order")
    list_editable = ("order",)
    search_fields = ("title", "description")
