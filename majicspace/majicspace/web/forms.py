from django import forms
from django.forms import widgets

from .models import Contact


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        exclude = ("timestamp",)
        widgets = {
            "name": widgets.TextInput(attrs={"placeholder": "Your Name", "required": True}),
            "phone": widgets.TextInput(attrs={"placeholder": "Your Phone", "required": True}),
            "message": widgets.Textarea(attrs={"placeholder": "Type Your Message", "required": True}),
        }
