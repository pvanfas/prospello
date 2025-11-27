import django_filters as filters
from django import forms
from products.models import Category
from products.models import Product


class ProductFilter(filters.FilterSet):
    category = filters.ModelChoiceFilter(
        queryset=Category.objects.filter(is_active=True),
        empty_label=("All Category"),
        widget=forms.Select(attrs={"class": "form-control custom-select", "onchange": "this.form.submit()"}),
    )

    name = filters.CharFilter(
        lookup_expr="icontains", widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Search ..."})
    )

    class Meta:
        model = Product
        fields = ["category", "name"]
