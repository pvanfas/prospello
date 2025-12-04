from django.contrib import admin
from django.utils.safestring import mark_safe
from import_export.admin import ImportExportActionModelAdmin

from .models import (
    Audience,
    BlogCategory,
    BlogPost,
    CaseStudy,
    Center,
    Community,
    CommunityTestimonial,
    Contact,
    CommunityBenefit,
    ReferralBenefit,
    Page,
    Course,
    FAQ,
    FAQCategory,
    Feature,
    HiringPartner,
    Mentor,
    Newsletter,
    ReferralStep,
    ReferralTerm,
    PolicyPage,
    StudentSuccessStory,
    SiteText,
    SiteImage,
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

@admin.register(ReferralBenefit)
class ReferralBenefitAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title", "description")

@admin.register(ReferralTerm)
class ReferralTermAdmin(ImportExportActionModelAdmin):
    list_display = ("question", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("question", "answer")


@admin.register(CaseStudy)
class CaseStudyAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order")
    search_fields = ("title", "problem", "strategy")


@admin.register(BlogCategory)
class BlogCategoryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "slug", "order")
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
    search_fields = ("title", "description")


@admin.register(Newsletter)
class NewsletterAdmin(ImportExportActionModelAdmin):
    list_display = ("email", "subscribed_at", "is_active")
    list_filter = ("is_active", "subscribed_at")
    search_fields = ("email",)
    date_hierarchy = "subscribed_at"


@admin.register(StudentSuccessStory)
class StudentSuccessStoryAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "job_role", "company_name", "package", "order", "is_active")
    list_filter = ("is_active", "company_name")
    search_fields = ("name", "job_role", "company_name")


@admin.register(CommunityTestimonial)
class CommunityTestimonialAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "role", "community", "order", "is_active")
    list_filter = ("is_active", "community")
    search_fields = ("name", "role", "testimonial")


@admin.register(CommunityBenefit)
class CommunityBenefitAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title", "description")


@admin.register(SiteText)
class SiteTextAdmin(ImportExportActionModelAdmin):
    list_display = ("key", "label", "is_active")
    list_filter = ("is_active",)
    search_fields = ("key", "label", "value")


@admin.register(SiteImage)
class SiteImageAdmin(ImportExportActionModelAdmin):
    list_display = ("key", "label", "alt_text", "is_active", "preview")
    list_filter = ("is_active",)
    search_fields = ("key", "label", "alt_text")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" width="150" height="auto" style="max-height:150px; object-fit:contain;" />'
            )
        return "No Image"
    preview.short_description = "Preview"


@admin.register(Page)
class PageAdmin(ImportExportActionModelAdmin):
    list_display = ("name", "key", "banner_label", "banner_title", "order", "is_active")
    search_fields = ("name", "key", "banner_label", "banner_title")


@admin.register(PolicyPage)
class PolicyPageAdmin(ImportExportActionModelAdmin):
    list_display = ("title", "key", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title", "key")
