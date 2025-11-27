from django.contrib import messages
from django.utils.translation import ngettext


def mark_active(self, request, queryset):
    updated = queryset.update(is_active=True)
    self.message_user(
        request,
        ngettext(
            "%d object was successfully marked as active.", "%d objects were successfully marked as active.", updated
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


def mark_featured(self, request, queryset):
    updated = queryset.update(is_featured=True)
    self.message_user(
        request,
        ngettext(
            "%d object was successfully marked as featured.",
            "%d objects were successfully marked as featured.",
            updated,
        )
        % updated,
        messages.SUCCESS,
    )


def mark_not_featured(self, request, queryset):
    updated = queryset.update(is_featured=False)
    self.message_user(
        request,
        ngettext(
            "%d object was successfully marked as not featured.",
            "%d objects were successfully marked as not featured.",
            updated,
        )
        % updated,
        messages.SUCCESS,
    )
