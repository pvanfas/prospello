from django.db import models


SERVICE_CHOICES = (
    ("Property Management", "Property Management"),
    ("Mortgage Service", "Mortgage Service"),
    ("Consulting Service", "Consulting Service"),
    ("Home Buying", "Home Buying"),
    ("Home Selling", "Home Selling"),
    ("Escrow Services", "Escrow Services"),
    ("Other", "Other"),
)


class Enquiry(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    service_type = models.CharField(max_length=100, choices=SERVICE_CHOICES)
    phone = models.CharField(max_length=20)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Enquiries"

    def __str__(self):
        return self.name
