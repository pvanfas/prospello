from django import forms
from .models import Contact, Enquiry


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'phone', 'email', 'message']
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your name*',
                    'required': True,
                }
            ),
            'phone': forms.TextInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your phone number*',
                    'required': True,
                }
            ),
            'email': forms.EmailInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your email address*',
                    'required': True,
                }
            ),
            'message': forms.Textarea(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control',
                    'placeholder': 'Your message',
                    'rows': 3,
                    'required': True,
                }
            ),
        }


class EnquiryForm(forms.ModelForm):
    class Meta:
        model = Enquiry
        fields = ['name', 'phone', 'email', 'message']
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your Company/Name*',
                    'required': True,
                }
            ),
            'phone': forms.TextInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your Phone Number*',
                    'required': True,
                }
            ),
            'email': forms.EmailInput(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control required',
                    'placeholder': 'Your email address*',
                    'required': True,
                }
            ),
            'message': forms.Textarea(
                attrs={
                    'class': 'ps-0 border-radius-0px bg-transparent border-color-transparent-dark-very-light form-control',
                    'placeholder': 'Your message',
                    'rows': 3,
                    'required': True,
                }
            ),
        }
