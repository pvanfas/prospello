from django import forms

from .models import Enquiry


class EnquiryForm(forms.ModelForm):
    class Meta:
        model = Enquiry
        fields = ("name", "email", "service_type", "phone", "message")
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Enter your name"}),
            "email": forms.EmailInput(attrs={"placeholder": "Enter your email"}),
            "service_type": forms.Select(attrs={"placeholder": "Select service type"}),
            "phone": forms.TextInput(attrs={"placeholder": "Enter your phone"}),
            "message": forms.Textarea(attrs={"placeholder": "Enter your message"}),
        }
