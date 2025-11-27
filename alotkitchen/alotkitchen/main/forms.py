from datetime import datetime

from django import forms

from .choices import VALIDITY_CHOICES
from .helper import preference_form_fields
from .models import Brand, DeliveryAddress, Preference

VALIDITY_CHOICES = (("", "-- Select Days --"),) + VALIDITY_CHOICES


class PreferenceForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = preference_form_fields + [
            "monday_selected",
            "tuesday_selected",
            "wednesday_selected",
            "thursday_selected",
            "friday_selected",
            "saturday_selected",
            "sunday_selected",
        ]


class ProfileForm(forms.ModelForm):
    mobile_country_code = forms.CharField(max_length=5, required=False)
    alternate_mobile_country_code = forms.CharField(max_length=5, required=False)
    whatsapp_number_country_code = forms.CharField(max_length=5, required=False)
    # brand = forms.ModelChoiceField(queryset=Brand.objects.all(), required=False, label="Brand", empty_label="Select Brand", widget=forms.Select(attrs={"class": "form-control"}))

    class Meta:
        model = Preference
        fields = ("first_name", "last_name", "email", "preferred_language", "mobile", "alternate_mobile", "whatsapp_number", "start_date", "end_date")

        widgets = {
            "first_name": forms.TextInput(attrs={"placeholder": "First Name", "required": "required"}),
            "last_name": forms.TextInput(attrs={"placeholder": "Last Name", "required": "required"}),
            "email": forms.EmailInput(attrs={"placeholder": "Email", "required": "required"}),
            "preferred_language": forms.Select(attrs={"required": "required"}),
            "mobile": forms.TextInput(attrs={"placeholder": "Mobile", "required": "required"}),
            "alternate_mobile": forms.TextInput(attrs={"placeholder": "Alternate Mobile", "required": "required"}),
            "whatsapp_number": forms.TextInput(attrs={"placeholder": "Whatsapp Number", "required": "required"}),
            "start_date": forms.DateInput(attrs={"type": "date", "required": "required", }),
            # Added end_date field with date input widget
            "end_date": forms.DateInput(attrs={"type": "date", "required": "required", }),
        }
        


class DeliveryAddressForm(forms.ModelForm):
    class Meta:
        model = DeliveryAddress
        fields = ("room_no", "floor", "building_name", "street_name", "area", "location", "contact_number", "address_type", "is_default")


class SetDeliveryAddressForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = (
            "breakfast_address",
            "breakfast_delivery_time",
            "desi_tiffin_address",
            "desi_tiffin_delivery_time",
            "tiffin_lunch_address",
            "tiffin_lunch_delivery_time",
            "lunch_address",
            "lunch_delivery_time",
            "dinner_address",
            "dinner_delivery_time",
        )

    def __init__(self, *args, **kwargs):
        preference = kwargs.pop("preference", None)  # Get preference from kwargs
        super().__init__(*args, **kwargs)

        # Filter querysets to show only addresses associated with this preference
        if preference:
            preference_addresses = DeliveryAddress.objects.filter(preference=preference)

            # Set up address fields
            address_fields = ["breakfast_address", "desi_tiffin_address", "tiffin_lunch_address", "lunch_address", "dinner_address"]

            for field_name in address_fields:
                if field_name in self.fields:
                    self.fields[field_name].queryset = preference_addresses

            # Set default address if addresses are not already set
            if preference_addresses.exists() and not any(
                [self.instance.breakfast_address, self.instance.desi_tiffin_address, self.instance.tiffin_lunch_address, self.instance.lunch_address, self.instance.dinner_address]
            ):
                # Try to get the default address first, otherwise get the first one
                default_address = preference_addresses.filter(is_default=True).first() or preference_addresses.first()

                if default_address:
                    # Set the same default address for all meal times
                    for field_name in address_fields:
                        if field_name in self.fields:
                            self.fields[field_name].initial = default_address.pk
                            self.fields[field_name].empty_label = None

        # Set up delivery time fields with helpful labels and styling
        delivery_time_fields = {
            "breakfast_delivery_time": "Breakfast Time",
            "desi_tiffin_delivery_time": "Desi Tiffin Time",
            "tiffin_lunch_delivery_time": "Tiffin Lunch Time",
            "lunch_delivery_time": "Lunch Time",
            "dinner_delivery_time": "Dinner Time",
        }

        for field_name, label in delivery_time_fields.items():
            if field_name in self.fields:
                self.fields[field_name].label = label
                self.fields[field_name].widget.attrs.update({"class": "form-control", "placeholder": f"Select {label.lower()}"})


class PreferenceNoteForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = ("notes",)
        labels = {"notes": "Special Instructions (Allergies, etc.)"}
        widgets = {"notes": forms.Textarea(attrs={"rows": 4})}


class SubscriptionAddressForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = ()


class PreferenceApprovalForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = ("delivery_staff", "meal_fee", "no_of_meals")
        labels = {
            "delivery_staff": "Delivery Staff",
            "meal_fee": "Meal Fee",
            "no_of_meals": "No of Meals",
        }


class MealOrderUpdateStatusForm(forms.ModelForm):
    class Meta:
        model = Preference
        fields = ("status",)
        labels = {"status": "Status"}
        widgets = {"status": forms.Select(attrs={"class": "form-control"})}
