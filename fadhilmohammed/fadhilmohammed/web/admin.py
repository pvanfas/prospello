from __future__ import unicode_literals

# For custom admin actions
from django.contrib import admin, messages
from django.utils.translation import ngettext

from .models import About, Company, News

# admin.site.unregister(User)


admin.site.site_header = "Fadhil Mohammed Administration"
admin.site.site_title = "Fadhil Mohammed Admin Portal"
admin.site.index_title = "Welcome to Fadhil Mohammed Admin Portal"


def mark_active(self, request, queryset):
    updated = queryset.update(is_active=True)
    self.message_user(
        request,
        ngettext(
            "%d object was successfully marked as active.",
            "%d objects were successfully marked as active.",
            updated,
        )
        % updated,
        messages.SUCCESS,
    )


def mark_inactive(self, request, queryset):
    updated = queryset.update(is_active=False)
    self.message_user(
        request,
        ngettext(
            "%d object was successfully marked as inactive.",
            "%d objects were successfully marked as inactive.",
            updated,
        )
        % updated,
        messages.SUCCESS,
    )


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("title",)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("title", "is_active")


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    actions = [mark_active, mark_inactive]
    list_display = ("title", "is_active")
