from django.db.models import Sum
from django.shortcuts import render

from main.mixins import HybridCreateView, HybridDeleteView, HybridDetailView, HybridListView, HybridUpdateView

from .forms import ReportForm
from .mixins import HybridTemplateView
from .models import Company, Payable, Receivable, Transaction, TransactionCategory
from .tables import CompanyTable, PayableTable, ReceivableTable, TransactionCategoryTable, TransactionTable


class DashboardView(HybridTemplateView):
    template_name = "app/main/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["january_count"] = 97
        context["february_count"] = 98
        context["march_count"] = 99
        context["april_count"] = 100
        return context


class CompanyListView(HybridListView):
    model = Company
    filterset_fields = ("name",)
    table_class = CompanyTable
    search_fields = ("name",)


class CompanyCreateView(HybridCreateView):
    model = Company


class CompanyDetailView(HybridDetailView):
    model = Company


class CompanyUpdateView(HybridUpdateView):
    model = Company


class CompanyDeleteView(HybridDeleteView):
    model = Company


class TransactionCategoryListView(HybridListView):
    model = TransactionCategory
    filterset_fields = ("name", "transaction_type")
    table_class = TransactionCategoryTable
    search_fields = ("name",)


class TransactionCategoryCreateView(HybridCreateView):
    model = TransactionCategory


class TransactionCategoryDetailView(HybridDetailView):
    model = TransactionCategory


class TransactionCategoryUpdateView(HybridUpdateView):
    model = TransactionCategory


class TransactionCategoryDeleteView(HybridDeleteView):
    model = TransactionCategory


class TransactionListView(HybridListView):
    model = Transaction
    filterset_fields = ("transaction_type", "category", "company", "date")
    table_class = TransactionTable
    search_fields = ("title", "description")


class TransactionCreateView(HybridCreateView):
    model = Transaction


class TransactionDetailView(HybridDetailView):
    model = Transaction


class TransactionUpdateView(HybridUpdateView):
    model = Transaction


class TransactionDeleteView(HybridDeleteView):
    model = Transaction


class PayableListView(HybridListView):
    model = Payable
    filterset_fields = ("is_paid", "company", "date")
    table_class = PayableTable
    search_fields = ("title", "description")


class PayableCreateView(HybridCreateView):
    model = Payable


class PayableDetailView(HybridDetailView):
    model = Payable


class PayableUpdateView(HybridUpdateView):
    model = Payable


class PayableDeleteView(HybridDeleteView):
    model = Payable


class ReceivableListView(HybridListView):
    model = Receivable
    filterset_fields = ("is_received", "company", "date")
    table_class = ReceivableTable
    search_fields = ("title", "description")


class ReceivableCreateView(HybridCreateView):
    model = Receivable


class ReceivableDetailView(HybridDetailView):
    model = Receivable


class ReceivableUpdateView(HybridUpdateView):
    model = Receivable


class ReceivableDeleteView(HybridDeleteView):
    model = Receivable


def generate_reports(request):
    template_name = "app/main/reports.html"
    title = "Generate Reports"
    form = ReportForm(request.GET or None)

    # Initialize context data
    context_data = {"title": title, "form": form}

    if form.is_valid():
        company = form.cleaned_data.get("company")
        month = form.cleaned_data.get("month")
        year = form.cleaned_data.get("year")
        filters = {}
        if year:
            filters["date__year"] = year
        if month:
            filters["date__month"] = month
        if company:
            filters["company"] = company

        # Fetch filtered data
        transactions = Transaction.objects.filter(**filters)
        income_transactions = transactions.filter(transaction_type="Income")
        expense_transactions = transactions.filter(transaction_type="Expense")
        payables = Payable.objects.filter(**filters)
        receivables = Receivable.objects.filter(**filters)

        # Calculate summaries
        income_total = transactions.filter(transaction_type="Income").aggregate(total=Sum("amount"))["total"] or 0
        expense_total = transactions.filter(transaction_type="Expense").aggregate(total=Sum("amount"))["total"] or 0
        payable_total = payables.aggregate(total=Sum("amount"))["total"] or 0
        receivable_total = receivables.aggregate(total=Sum("amount"))["total"] or 0

        # Add to context
        context_data.update(
            {
                "transactions": transactions,
                "payables": payables,
                "receivables": receivables,
                "income_total": income_total,
                "expense_total": expense_total,
                "payable_total": payable_total,
                "receivable_total": receivable_total,
                "income_transactions": income_transactions,
                "expense_transactions": expense_transactions,
            }
        )

    return render(request, template_name, context_data)
