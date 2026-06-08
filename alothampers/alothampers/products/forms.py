from django import forms

from .models import CustomOrder, Order, OrderItem


class OrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ("product_option", "quantity", "message", "file_input")
        widgets = {
            "product_option": forms.RadioSelect(attrs={"class": "form-control", "required": "required"}),
            "quantity": forms.Select(attrs={"class": "form-control", "required": "required"}),
            "message": forms.Textarea(attrs={"class": "form-control"}),
            "file_input": forms.FileInput(attrs={"class": "form-control"}),
        }


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ("first_name", "last_name", "address_line_1", "address_line_2", "city", "mobile", "alternate_mobile", "email", "notes")
        widgets = {
            "first_name": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Your First Name"}),
            "last_name": forms.TextInput(attrs={"placeholder": "Your Last Name"}),
            "address_line_1": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Street Address"}),
            "address_line_2": forms.TextInput(attrs={"placeholder": "Apartment, suite, unit, etc. (optional) *"}),
            "city": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Town / City"}),
            "mobile": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Your Mobile", "type": "number"}),
            "alternate_mobile": forms.TextInput(attrs={"placeholder": "Your Alternate Mobile", "type": "number"}),
            "email": forms.EmailInput(attrs={"placeholder": "Your Email Address"}),
            "notes": forms.Textarea(attrs={"placeholder": "Order Notes (optional)", "rows": "4"}),
        }


class CustomOrderForm(forms.ModelForm):
    class Meta:
        model = CustomOrder
        fields = ("first_name", "last_name", "address_line_1", "address_line_2", "city", "mobile", "alternate_mobile", "email", "notes")
        widgets = {
            "first_name": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Your First Name"}),
            "last_name": forms.TextInput(attrs={"placeholder": "Your Last Name"}),
            "address_line_1": forms.TextInput(attrs={"class": "requiredField", "placeholder": "Street Address"}),
            "address_line_2": forms.TextInput(attrs={"placeholder": "Apartment, suite, unit, etc. (optional) *"}),
            "city": forms.TextInput(attrs={"class": "required", "placeholder": "Town / City"}),
            "mobile": forms.TextInput(attrs={"class": "required", "placeholder": "Your Mobile", "type": "number"}),
            "alternate_mobile": forms.TextInput(attrs={"placeholder": "Your Alternate Mobile", "type": "number"}),
            "email": forms.EmailInput(attrs={"placeholder": "Your Email Address"}),
            "notes": forms.Textarea(attrs={"placeholder": "Order Notes (optional)", "rows": "4"}),
        }
