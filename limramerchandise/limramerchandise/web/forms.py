from django import forms
from .models import Contact, Application


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ["name", "email", "phone", "subject", "message"]
        labels = {"name": "Name", "email": "Email", "phone": "Phone", "subject": "Subject", "message": "Message"}
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Name"}),
            "email": forms.EmailInput(attrs={"placeholder": "Email"}),
            "phone": forms.TextInput(attrs={"placeholder": "Phone"}),
            "subject": forms.TextInput(attrs={"placeholder": "Subject"}),
            "message": forms.Textarea(attrs={"placeholder": "Message"}),
        }


class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = "__all__"
        widgets = {
            "resume": forms.FileInput(attrs={"accept": ".pdf, .doc, .docx", "style": "height:unset;"}),
            "country_code": forms.HiddenInput(),
        }
