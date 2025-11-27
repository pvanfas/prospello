from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(ImportExportModelAdmin):
    list_display = ("name", "email", "service_type", "phone", "message", "timestamp")
    list_filter = ("service_type", "timestamp")
    search_fields = ("name", "email", "phone", "message")
