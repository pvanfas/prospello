# create a form with company and month fields (year and month from 2025 january to current month and year)
from django import forms
from django.utils import timezone

from .models import Company


class ReportForm(forms.Form):
    company = forms.ModelChoiceField(queryset=Company.objects.all(), required=False, label="Company")
    month = forms.ChoiceField(choices=[], required=False, label="Month")
    year = forms.ChoiceField(choices=[], required=False, label="Year")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        current_year = timezone.now().year
        current_month = timezone.now().month
        years = [(year, year) for year in range(2025, current_year + 1)]
        months = [
            (1, "January"),
            (2, "February"),
            (3, "March"),
            (4, "April"),
            (5, "May"),
            (6, "June"),
            (7, "July"),
            (8, "August"),
            (9, "September"),
            (10, "October"),
            (11, "November"),
            (12, "December"),
        ]
        self.fields["year"].choices = years
        self.fields["month"].choices = months
        self.fields["year"].initial = current_year
        self.fields["month"].initial = current_month
        self.fields["company"].empty_label = "All Companies"
        self.fields["company"].widget.attrs.update({"class": "form-control"})
        self.fields["month"].widget.attrs.update({"class": "form-control"})
        self.fields["year"].widget.attrs.update({"class": "form-control"})
