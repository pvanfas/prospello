from django.contrib import admin
from django.contrib.auth.models import Group as AuthGroup
from registration.models import RegistrationProfile

from main.base import BaseAdmin

from .helper import preference_form_fields
from .models import Area, Brand, DeliveryAddress, Group, ItemCategory, ItemMaster, MealCategory, MealOrder, MealPlan, Preference, Subscription, SubscriptionPlan, SubscriptionSubPlan

admin.site.unregister(AuthGroup)
admin.site.unregister(RegistrationProfile)


class SubscriptionSubPlanInline(admin.TabularInline):
    model = SubscriptionSubPlan
    extra = 0
    exclude = ("is_active",)
    template = "admin/edit_inline/tabular.html"  # Force native Django template


# admin.site.register(Brand)
# admin.site.register(DeliveryStaff)


@admin.register(Group)
class GroupAdmin(BaseAdmin):
    list_display = ("name", "slug", "order", "is_active", "created")
    search_fields = ("name",)
    list_filter = ("is_active",)
    list_display_links = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")


admin.site.register(Brand)




@admin.register(MealCategory)
class MealCategoryAdmin(BaseAdmin):
    list_display = ("name", "group", "order", "slug", "description", "is_active")
    search_fields = ("name",)
    list_filter = ("group", "is_active")
    list_display_links = ("name", "order", "description")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("group",)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(BaseAdmin):
    list_display = ("__str__", "validity", "order", "subplans_count", "is_active")
    list_filter = ("validity", "meal_category")
    autocomplete_fields = ("meal_category",)
    inlines = (SubscriptionSubPlanInline,)


@admin.register(Subscription)
class SubscriptionAdmin(BaseAdmin):
    list_display = ("plan", "start_date", "end_date", "is_active", "request")
    list_filter = ("is_active",)
    autocomplete_fields = ("plan", "request")


@admin.register(ItemCategory)
class ItemCategoryAdmin(BaseAdmin):
    list_display = ("name", "is_active", "created")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(ItemMaster)
class ItemMasterAdmin(BaseAdmin):
    list_display = ("item_code", "name", "meal_category", "mealtype", "category", "is_veg", "price")
    search_fields = ("name", "item_code")
    list_filter = ("price", "is_veg", "meal_category", "category", "mealtype", "is_fallback")


@admin.register(MealPlan)
class MealPlanAdmin(BaseAdmin):
    list_display = ("meal_category", "day", "menu_item")
    list_filter = ("is_active", "meal_category", "day", "is_fallback")
    autocomplete_fields = ("meal_category", "menu_item")
    search_fields = ("menu_item__name", "menu_item__item_code")


@admin.register(MealOrder)
class MealOrderAdmin(BaseAdmin):
    list_display = ("item", "quantity", "status", "date", "mealtype", "subscription_plan")
    search_fields = ("item__name",)
    list_filter = ("status", "subscription_plan", "date")
    autocomplete_fields = ("item", "subscription", "subscription_plan")


@admin.register(Area)
class AreaAdmin(BaseAdmin):
    list_display = ("name", "slug", "is_active", "created")
    search_fields = ("name",)
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("delivery_staffs",)


@admin.register(Preference)
class PreferenceAdmin(BaseAdmin):
    list_display = ("pk", "session_id", "status", "first_name", "last_name", "is_active")
    list_filter = ("is_active",)
    autocomplete_fields = ("user", "subscription_subplan") + tuple(preference_form_fields)
    fieldsets = (
        ("Main", {"fields": ("user", "subscription_subplan", "is_active", "session_id")}),
        ("Monday", {"fields": ("monday_breakfast", "monday_desi_tiffin", "monday_tiffin_lunch", "monday_lunch", "monday_dinner")}),
        ("Tuesday", {"fields": ("tuesday_breakfast", "tuesday_desi_tiffin", "tuesday_tiffin_lunch", "tuesday_lunch", "tuesday_dinner")}),
        ("Wednesday", {"fields": ("wednesday_breakfast", "wednesday_desi_tiffin", "wednesday_tiffin_lunch", "wednesday_lunch", "wednesday_dinner")}),
        ("Thursday", {"fields": ("thursday_breakfast", "thursday_desi_tiffin", "thursday_tiffin_lunch", "thursday_lunch", "thursday_dinner")}),
        ("Friday", {"fields": ("friday_breakfast", "friday_desi_tiffin", "friday_tiffin_lunch", "friday_lunch", "friday_dinner")}),
        ("Saturday", {"fields": ("saturday_breakfast", "saturday_desi_tiffin", "saturday_tiffin_lunch", "saturday_lunch", "saturday_dinner")}),
        ("Sunday", {"fields": ("sunday_breakfast", "sunday_desi_tiffin", "sunday_tiffin_lunch", "sunday_lunch", "sunday_dinner")}),
        ("Profile", {"fields": ("first_name", "last_name", "email", "preferred_language", "mobile", "alternate_mobile", "whatsapp_number")}),
        ("Delivery Address", {"fields": ("breakfast_address", "desi_tiffin_address", "tiffin_lunch_address", "lunch_address", "dinner_address")}),
        ("Extra", {"fields": ("notes", "remarks", "status", "completed_at", "approved_at", "delivery_staff", "meal_fee", "no_of_meals", "brand")}),
    )


@admin.register(DeliveryAddress)
class DeliveryAddressAdmin(BaseAdmin):
    list_display = ("preference", "area", "is_active")
    list_filter = ("is_active",)
    autocomplete_fields = ("preference", "area")


@admin.register(SubscriptionSubPlan)
class SubscriptionSubPlanAdmin(BaseAdmin):
    list_display = ("plan", "__str__", "plan_price", "order")
    autocomplete_fields = ("plan",)
