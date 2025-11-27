from django import forms
from django.forms.widgets import EmailInput
from django.forms.widgets import FileInput
from django.forms.widgets import Select
from django.forms.widgets import Textarea
from django.forms.widgets import TextInput

from .models import Application
from .models import Appointment
from .models import Contact


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        exclude = ("timestamp",)
        widgets = {
            "name": TextInput(
                attrs={"class": "medium-input bg-white margin-25px-bottom required", "placeholder": "Name"}
            ),
            "email": EmailInput(
                attrs={"class": "medium-input bg-white margin-25px-bottom required", "placeholder": "Email Address"}
            ),
            "phone": TextInput(attrs={"class": "medium-input bg-white mb-0", "placeholder": "Phone"}),
            "message": Textarea(attrs={"class": "medium-textarea h-200px bg-white", "placeholder": "Message"}),
        }


class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        exclude = ("timestamp",)
        widgets = {
            "name": TextInput(
                attrs={"class": "medium-input bg-white margin-25px-bottom required", "placeholder": "Name"}
            ),
            "career": Select(
                attrs={"class": "medium-input bg-white margin-25px-bottom required", "placeholder": "Email Address"}
            ),
            "resume": FileInput(
                attrs={"class": "medium-input bg-white margin-25px-bottom required", "placeholder": "Email Address"}
            ),
        }


class AppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        exclude = ("timestamp",)
        widgets = {
            "name": TextInput(attrs={"class": "medium-input bg-white required", "placeholder": "Name"}),
            "email": EmailInput(attrs={"class": "medium-input bg-white required", "placeholder": "Email Address"}),
            "phone": TextInput(attrs={"class": "medium-input bg-white", "placeholder": "Phone"}),
            "team": Select(attrs={"class": "medium-input bg-white", "placeholder": "Phone"}),
            "message": Textarea(
                attrs={"class": "medium-textarea h-200px bg-white", "placeholder": "Reason for Appointment"}
            ),
        }
