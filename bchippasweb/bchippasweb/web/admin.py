from django.contrib import admin
from .models import Contact, Enquiry, Category, Product, ProductImage, Testimonial, FeaturedProduct, Recipe
from import_export.admin import ImportExportModelAdmin


@admin.register(Contact)
class ContactAdmin(ImportExportModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')


@admin.register(Enquiry)
class EnquiryAdmin(ImportExportModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    list_display = ('name', 'icon_class', 'order')
    ordering = ('order',)


class RecipeInline(admin.TabularInline):
    model = Recipe
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    list_display = ('name', 'category', 'weight', 'slug')
    list_filter = ('category',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, RecipeInline]


@admin.register(Recipe)
class RecipeAdmin(ImportExportModelAdmin):
    list_display = ('title', 'product', 'prep_time', 'cook_time')
    list_filter = ('product',)
    search_fields = ('title', 'description')


@admin.register(FeaturedProduct)
class FeaturedProductAdmin(ImportExportModelAdmin):
    list_display = ('product_name', 'order')
    list_editable = ('order',)


@admin.register(Testimonial)
class TestimonialAdmin(ImportExportModelAdmin):
    list_display = ('name', 'role', 'rating')
    list_filter = ('rating',)
    search_fields = ('name',)
