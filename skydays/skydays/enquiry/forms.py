from django import forms
from django.forms.models import inlineformset_factory

from .models import (
    CustomPackageEnquiry,
    FixedDepartureEnquiry,
    FixedDepartureTraveller,
    PackageEnquiry,
    PackageRoom,
    PackageTraveller,
)


class PackageEnquiryForm(forms.ModelForm):
    class Meta:
        model = PackageEnquiry
        fields = (
            "date",
            "hotel_category",
            "name",
            "whatsapp",
            "phone",
            "email",
            "additional_info",
        )
        widgets = {
            "date": forms.DateInput(
                attrs={
                    "class": "form-control datepicker",
                    "placeholder": "Select Travel Date",
                }
            ),
            "hotel_category": forms.Select(
                attrs={"class": "form-control", "placeholder": "Select Hotel Category"}
            ),
            "name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Enter Name"}
            ),
            "whatsapp": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Enter Whatsapp Number"}
            ),
            "phone": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Enter Phone Number"}
            ),
            "email": forms.EmailInput(
                attrs={"class": "form-control", "placeholder": "Enter Email"}
            ),
            "additional_info": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "placeholder": "",
                    "style": "height:100px",
                }
            ),
        }


class PackageTravellerForm(forms.ModelForm):
    class Meta:
        model = PackageTraveller
        fields = ("adult", "child_with_bed", "child_without_bed", "infant")
        widgets = {
            "adult": forms.NumberInput(
                attrs={"value": 1, "max": 3, "min": 1, "readonly": True, "class": ""}
            ),
            "child_with_bed": forms.NumberInput(
                attrs={"value": 0, "max": 3, "min": 0, "readonly": True, "class": ""}
            ),
            "child_without_bed": forms.NumberInput(
                attrs={"value": 0, "max": 3, "min": 0, "readonly": True, "class": ""}
            ),
            "infant": forms.NumberInput(
                attrs={"value": 0, "max": 3, "min": 0, "readonly": True, "class": ""}
            ),
        }


class FixedDepartureEnquiryForm(forms.ModelForm):
    class Meta:
        model = FixedDepartureEnquiry
        fields = ("name", "whatsapp", "phone", "email", "payment_method")
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Name"}
            ),
            "whatsapp": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Whatsapp"}
            ),
            "phone": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Phone"}
            ),
            "email": forms.EmailInput(
                attrs={"class": "form-control", "placeholder": "Email"}
            ),
        }


class PackageRoomForm(forms.ModelForm):
    class Meta:
        model = PackageRoom
        fields = ("adult", "child_with_bed", "child_without_bed", "infant")
        widgets = {
            "adult": forms.NumberInput(
                attrs={
                    "value": 1,
                    "max": 3,
                    "min": 1,
                    "readonly": True,
                    "class": "adult_count",
                }
            ),
            "child_with_bed": forms.NumberInput(
                attrs={
                    "value": 0,
                    "max": 3,
                    "min": 0,
                    "readonly": True,
                    "class": "child_bed_count",
                }
            ),
            "child_without_bed": forms.NumberInput(
                attrs={
                    "value": 0,
                    "max": 3,
                    "min": 0,
                    "readonly": True,
                    "class": "child_wo_count",
                }
            ),
            "infant": forms.NumberInput(
                attrs={
                    "value": 0,
                    "max": 3,
                    "min": 0,
                    "readonly": True,
                    "class": "infant_count",
                }
            ),
        }


class FixedDepartureTravellerForm(forms.ModelForm):
    class Meta:
        model = FixedDepartureTraveller
        fields = (
            "title",
            "first_name",
            "last_name",
            "date_of_birth",
            "passport_number",
            "passport_expiry",
            "meal_preference",
        )
        widgets = {
            "title": forms.Select(attrs={"class": "form-control"}),
            "first_name": forms.TextInput(attrs={"class": "form-control"}),
            "last_name": forms.TextInput(attrs={"class": "form-control"}),
            "date_of_birth": forms.DateInput(
                attrs={"class": "form-control datepicker dob"}
            ),
            "passport_number": forms.TextInput(attrs={"class": "form-control"}),
            "passport_expiry": forms.DateInput(
                attrs={"class": "form-control datepicker"}
            ),
            "meal_preference": forms.Select(attrs={"class": "form-control"}),
        }


PackageTravellerFormSet = inlineformset_factory(
    PackageEnquiry, PackageTraveller, form=PackageTravellerForm, extra=1
)
PackageRoomFormSet = inlineformset_factory(
    FixedDepartureEnquiry, PackageRoom, form=PackageRoomForm, extra=1
)
FixedDepartureTravellerFormSet = inlineformset_factory(
    FixedDepartureEnquiry,
    FixedDepartureTraveller,
    form=FixedDepartureTravellerForm,
    extra=1,
)


class CustomPackageEnquiryForm(forms.ModelForm):
    class Meta:
        model = CustomPackageEnquiry
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone",
            "whatsapp",
            "adult",
            "child",
            "infant",
            "travel_date",
            "destination",
            "days",
            "airport",
            "preference",
        )
        widgets = {
            "first_name": forms.TextInput(attrs={"class": "form-control"}),
            "last_name": forms.TextInput(attrs={"class": "form-control"}),
            "email": forms.EmailInput(attrs={"class": "form-control"}),
            "phone": forms.TextInput(attrs={"class": "form-control"}),
            "whatsapp": forms.TextInput(attrs={"class": "form-control"}),
            "adult": forms.NumberInput(attrs={"class": "form-control"}),
            "child": forms.NumberInput(attrs={"class": "form-control"}),
            "infant": forms.NumberInput(attrs={"class": "form-control"}),
            "travel_date": forms.DateInput(attrs={"class": "form-control datepicker"}),
            "destination": forms.TextInput(attrs={"class": "form-control"}),
            "days": forms.NumberInput(attrs={"class": "form-control"}),
            "airport": forms.Select(attrs={"class": "form-control"}),
            "preference": forms.Textarea(attrs={"class": "form-control"}),
        }
