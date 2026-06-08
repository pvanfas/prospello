from django.urls import path

from . import views

app_name = "main"

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard_view"),
    # Company
    path("companies/", views.CompanyListView.as_view(), name="company_list"),
    path("companies/create/", views.CompanyCreateView.as_view(), name="company_create"),
    path("companies/detail/<str:pk>/", views.CompanyDetailView.as_view(), name="company_detail"),
    path("companies/update/<str:pk>/", views.CompanyUpdateView.as_view(), name="company_update"),
    path("companies/delete/<str:pk>/", views.CompanyDeleteView.as_view(), name="company_delete"),
    # Transaction Category
    path("categories/", views.TransactionCategoryListView.as_view(), name="category_list"),
    path("categories/create/", views.TransactionCategoryCreateView.as_view(), name="category_create"),
    path("categories/detail/<str:pk>/", views.TransactionCategoryDetailView.as_view(), name="category_detail"),
    path("categories/update/<str:pk>/", views.TransactionCategoryUpdateView.as_view(), name="category_update"),
    path("categories/delete/<str:pk>/", views.TransactionCategoryDeleteView.as_view(), name="category_delete"),
    # Transaction
    path("transactions/", views.TransactionListView.as_view(), name="transaction_list"),
    path("transactions/create/", views.TransactionCreateView.as_view(), name="transaction_create"),
    path("transactions/detail/<str:pk>/", views.TransactionDetailView.as_view(), name="transaction_detail"),
    path("transactions/update/<str:pk>/", views.TransactionUpdateView.as_view(), name="transaction_update"),
    path("transactions/delete/<str:pk>/", views.TransactionDeleteView.as_view(), name="transaction_delete"),
    # Payable
    path("payables/", views.PayableListView.as_view(), name="payable_list"),
    path("payables/create/", views.PayableCreateView.as_view(), name="payable_create"),
    path("payables/detail/<str:pk>/", views.PayableDetailView.as_view(), name="payable_detail"),
    path("payables/update/<str:pk>/", views.PayableUpdateView.as_view(), name="payable_update"),
    path("payables/delete/<str:pk>/", views.PayableDeleteView.as_view(), name="payable_delete"),
    # Receivable
    path("receivables/", views.ReceivableListView.as_view(), name="receivable_list"),
    path("receivables/create/", views.ReceivableCreateView.as_view(), name="receivable_create"),
    path("receivables/detail/<str:pk>/", views.ReceivableDetailView.as_view(), name="receivable_detail"),
    path("receivables/update/<str:pk>/", views.ReceivableUpdateView.as_view(), name="receivable_update"),
    path("receivables/delete/<str:pk>/", views.ReceivableDeleteView.as_view(), name="receivable_delete"),
    # Reports
    path("generate_reports/", views.generate_reports, name="generate_reports"),
]
