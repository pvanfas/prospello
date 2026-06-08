from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import Category
from .models import Contact
from .models import Course
from .models import Partner
from .models import Registration
from .models import Testimonial
from .models import University


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    pass


@admin.register(University)
class UniversityAdmin(ImportExportModelAdmin):
    list_display = ["name", "id", "is_active"]


@admin.register(Course)
class CourseAdmin(ImportExportModelAdmin):
    list_display = ["name", "type", "duration", "category", "university", "is_active"]
    list_filter = ["category", "university", "is_active"]


@admin.register(Testimonial)
class TestimonialAdmin(ImportExportModelAdmin):
    pass


@admin.register(Partner)
class PartnerAdmin(ImportExportModelAdmin):
    pass


@admin.register(Registration)
class RegistrationAdmin(ImportExportModelAdmin):
    pass


@admin.register(Contact)
class ContactAdmin(ImportExportModelAdmin):
    pass
