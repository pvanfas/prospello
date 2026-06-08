from django import forms
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator
from registration.forms import RegistrationForm


class RegistrationForm(RegistrationForm):
    username = forms.CharField(
        max_length=150,
        validators=[MinLengthValidator(6)],
        help_text="6-150 characters that contains Letters, digits and @/./+/-/_ only.",
    )

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
