from django.contrib import admin

from main.base import BaseAdmin

from .models import Company, Payable, Receivable, Transaction, TransactionCategory


@admin.register(Company)
class CompanyAdmin(BaseAdmin):
    list_display = ("name", "created", "updated")
    search_fields = ("name",)


@admin.register(TransactionCategory)
class TransactionCategoryAdmin(BaseAdmin):
    list_display = ("name", "transaction_type", "id")
    list_filter = ("transaction_type",)
    search_fields = ("name",)


@admin.register(Transaction)
class TransactionAdmin(BaseAdmin):
    list_display = ("title", "amount", "transaction_type", "category", "company", "date")
    list_filter = ("transaction_type", "category", "company", "date")
    search_fields = ("title", "description")
    autocomplete_fields = ("company", "category")


@admin.register(Payable)
class PayableAdmin(BaseAdmin):
    list_display = ("title", "amount", "date", "is_paid", "company", "created", "updated")
    list_filter = ("is_paid", "company", "date")
    search_fields = ("title", "description")
    autocomplete_fields = ("company",)


@admin.register(Receivable)
class ReceivableAdmin(BaseAdmin):
    list_display = ("title", "amount", "date", "is_received", "company", "created", "updated")
    list_filter = ("is_received", "company", "date")
    search_fields = ("title", "description")
    autocomplete_fields = ("company",)
