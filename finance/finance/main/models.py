from django.db import models
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

from main.base import BaseModel


class Company(BaseModel):
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Company")
        verbose_name_plural = _("Companies")

    def get_absolute_url(self):
        return reverse_lazy("main:company_detail", kwargs={"pk": self.pk})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:company_list")

    @staticmethod
    def get_create_url():
        return reverse_lazy("main:company_create")

    def get_update_url(self):
        return reverse_lazy("main:company_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:company_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return str(self.name)


class TransactionCategory(BaseModel):
    name = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=50, choices=(("Income", "Income"), ("Expense", "Expense")))

    class Meta:
        ordering = ("name",)
        verbose_name = _("Transaction Category")
        verbose_name_plural = _("Transaction Categories")

    def get_absolute_url(self):
        return reverse_lazy("main:category_detail", kwargs={"pk": self.pk})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:category_list")

    @staticmethod
    def get_create_url():
        return reverse_lazy("main:category_create")

    def get_update_url(self):
        return reverse_lazy("main:category_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:category_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return str(self.name)


class Transaction(BaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="transactions")
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    title = models.CharField(max_length=200)
    category = models.ForeignKey(TransactionCategory, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=50, choices=(("Income", "Income"), ("Expense", "Expense")))
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")

    def get_absolute_url(self):
        return reverse_lazy("main:transaction_detail", kwargs={"pk": self.pk})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:transaction_list")

    @staticmethod
    def get_create_url():
        return reverse_lazy("main:transaction_create")

    def get_update_url(self):
        return reverse_lazy("main:transaction_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:transaction_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return str(self.title)


class Payable(BaseModel):
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    title = models.CharField(max_length=200)
    remarks = models.TextField(blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="payables")
    date = models.DateField("Due Date")
    is_paid = models.BooleanField(default=False)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Payable")
        verbose_name_plural = _("Payables")

    def get_absolute_url(self):
        return reverse_lazy("main:payable_detail", kwargs={"pk": self.pk})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:payable_list")

    @staticmethod
    def get_create_url():
        return reverse_lazy("main:payable_create")

    def get_update_url(self):
        return reverse_lazy("main:payable_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:payable_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return str(self.title)


class Receivable(BaseModel):
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    title = models.CharField(max_length=200)
    party = models.CharField(max_length=200)
    remarks = models.TextField(blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="receivables")
    date = models.DateField("Due Date")
    is_received = models.BooleanField(default=False)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Receivable")
        verbose_name_plural = _("Receivables")

    def get_absolute_url(self):
        return reverse_lazy("main:receivable_detail", kwargs={"pk": self.pk})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:receivable_list")

    @staticmethod
    def get_create_url():
        return reverse_lazy("main:receivable_create")

    def get_update_url(self):
        return reverse_lazy("main:receivable_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:receivable_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return str(self.title)
