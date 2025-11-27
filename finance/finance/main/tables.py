from main.base import BaseTable

from .models import Company, Payable, Receivable, Transaction, TransactionCategory


class CompanyTable(BaseTable):
    class Meta:
        model = Company
        fields = ("name",)
        attrs = {"class": "table key-buttons border-bottom table-hover"}  # noqa: RUF012


class TransactionCategoryTable(BaseTable):
    class Meta:
        model = TransactionCategory
        fields = ("name", "transaction_type")
        attrs = {"class": "table key-buttons border-bottom table-hover"}  # noqa: RUF012


class TransactionTable(BaseTable):
    class Meta:
        model = Transaction
        fields = ("date", "title", "amount", "transaction_type", "category")
        attrs = {"class": "table key-buttons border-bottom table-hover"}  # noqa: RUF012


class PayableTable(BaseTable):
    class Meta:
        model = Payable
        fields = ("title", "amount", "date", "is_paid", "company")
        attrs = {"class": "table key-buttons border-bottom table-hover"}  # noqa: RUF012


class ReceivableTable(BaseTable):
    class Meta:
        model = Receivable
        fields = ("title", "amount", "date", "is_received", "company")
        attrs = {"class": "table key-buttons border-bottom table-hover"}  # noqa: RUF012
