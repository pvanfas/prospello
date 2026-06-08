from django import forms
from django.forms.widgets import EmailInput
from django.forms.widgets import FileInput
from django.forms.widgets import Textarea
from django.forms.widgets import TextInput

from .models import CareerApplication
from .models import Contact
from .models import Enquiry


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        exclude = ("timestamp",)
        widgets = {
            "name": TextInput(attrs={"class": "required form-control", "placeholder": "Name"}),
            "phone": TextInput(attrs={"class": "required form-control", "placeholder": "Phone"}),
            "place": TextInput(attrs={"class": "required form-control", "placeholder": "Location"}),
            "email": EmailInput(attrs={"class": "required form-control", "placeholder": "Email Address"}),
            "message": Textarea(attrs={"class": "required form-control", "placeholder": "Message", "rows": "6"}),
        }


class EnquiryForm(forms.ModelForm):
    class Meta:
        model = Enquiry
        exclude = ("timestamp", "product")
        widgets = {
            "name": TextInput(attrs={"class": "required form-control", "placeholder": "Name"}),
            "phone": TextInput(attrs={"class": "required form-control", "placeholder": "Phone"}),
            "place": TextInput(attrs={"class": "required form-control", "placeholder": "Location"}),
        }


class ApplicationForm(forms.ModelForm):
    class Meta:
        model = CareerApplication
        exclude = ("timestamp", "career")
        widgets = {
            "name": TextInput(attrs={"class": "required form-control", "placeholder": "Name"}),
            "phone": TextInput(attrs={"class": "required form-control", "placeholder": "Phone"}),
            "place": TextInput(attrs={"class": "required form-control", "placeholder": "Location"}),
            "email": EmailInput(attrs={"class": "required form-control", "placeholder": "Email Address"}),
            "resume": FileInput(attrs={"class": "required form-control"}),
        }
