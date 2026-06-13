import django_filters as filters
from django import forms
from products.models import Category
from products.models import Product


class ProductFilter(filters.FilterSet):
    category = filters.ModelChoiceFilter(
        queryset=Category.objects.filter(is_active=True),
        empty_label=("View All"),
        blank=True,
        widget=forms.RadioSelect(
            attrs={
                "onchange": "this.form.submit()",
            }
        ),
    )

    class Meta:
        model = Product
        fields = ["category"]
