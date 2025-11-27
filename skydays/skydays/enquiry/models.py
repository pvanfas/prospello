import uuid
from datetime import date

from django.db import models
from django.urls import reverse

from web.models import FixedDeparture, Package


class Airport(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = "Airport"
        verbose_name_plural = "Airports"


def generate_order_id():
    code = "SKD"
    qs = FixedDepartureEnquiry.objects.all()
    if qs:
        max_code = max([int(x.order_id[4:]) for x in qs])
        return code + str(max_code + 1).zfill(4)
    return code + "0001"


class PackageEnquiry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    date = models.DateField()
    hotel_category = models.CharField(
        max_length=100,
        choices=(
            ("", "-- Select Hotel Category --"),
            ("3STAR", "3 Star"),
            ("4STAR", "4 Star"),
            ("5STAR", "5 Star"),
        ),
    )
    name = models.CharField(max_length=100)
    whatsapp = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField()
    additional_info = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self):
        return reverse("web:package_enquiry", kwargs={"pk": self.pk})

    def get_thanks_url(self):
        return reverse("web:package_enquiry_thanks", kwargs={"pk": self.pk})

    def get_pdf_url(self):
        return reverse("web:package_enquiry_pdf", kwargs={"pk": self.pk})

    def get_admin_url(self):
        return reverse("web:package_enquiry", kwargs={"pk": self.pk})

    def get_travellers(self):
        return PackageTraveller.objects.filter(enquiry=self)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Package Enquiry"
        verbose_name_plural = "Package Enquiries"


class PackageTraveller(models.Model):
    enquiry = models.ForeignKey(PackageEnquiry, on_delete=models.CASCADE)
    adult = models.IntegerField()
    child_with_bed = models.IntegerField()
    child_without_bed = models.IntegerField()
    infant = models.IntegerField()

    def __str__(self):
        return f"{self.enquiry} - {self.adult} Adult, {self.child_with_bed} Child with bed, {self.child_without_bed} Child without bed, {self.infant} Infant"

    class Meta:
        verbose_name = "Package Enquiry Traveller"
        verbose_name_plural = "Package Enquiry Travellers"


class FixedDepartureEnquiry(models.Model):
    order_id = models.CharField(max_length=128, unique=True, default=generate_order_id)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    departure = models.ForeignKey(FixedDeparture, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    whatsapp = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField()
    payment_method = models.CharField(
        max_length=100,
        choices=(
            ("ADVANCE", "Pay Advance & book seats"),
            ("FULL", "Pay Full Amount"),
            ("TALK", "Talk with Counselor"),
        ),
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(blank=True, null=True)
    paid_amount = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self):
        return reverse("web:fixed_departure", kwargs={"pk": self.pk})

    def get_rooms(self):
        return PackageRoom.objects.filter(enquiry=self)

    def get_rooms_count(self):
        return PackageRoom.objects.filter(enquiry=self).count()

    def get_travellers(self):
        return FixedDepartureTraveller.objects.filter(enquiry=self)

    def get_count(self):
        return sum([room.get_count() for room in self.get_rooms()])

    def total_guests(self):
        return self.get_count()

    def get_price(self):
        return sum([room.get_price() for room in self.get_rooms()])

    def get_advance(self):
        return self.get_price() * 0.25

    def get_pdf_url(self):
        return reverse("web:fixed_departure_pdf", kwargs={"pk": self.pk})

    class Meta:
        verbose_name = "Fixed Departure Enquiry"
        verbose_name_plural = "Fixed Departure Enquiries"


class PackageRoom(models.Model):
    enquiry = models.ForeignKey(FixedDepartureEnquiry, on_delete=models.CASCADE)
    adult = models.IntegerField()
    child_with_bed = models.IntegerField()
    child_without_bed = models.IntegerField()
    infant = models.IntegerField()

    def __str__(self):
        return f"{self.enquiry} - {self.adult} Adult, {self.child_with_bed} Child with bed, {self.child_without_bed} Child without bed, {self.infant} Infant"

    def get_count(self):
        return self.adult + self.child_with_bed + self.child_without_bed + self.infant

    def get_price(self):
        adult_clac_price = (
            self.enquiry.departure.single_occupancy_costing
            if self.adult == 1
            else self.enquiry.departure.adult_costing
        )
        adult_price = adult_clac_price * self.adult
        child_with_bed_costing_price = (
            self.enquiry.departure.child_with_bed_costing * self.child_with_bed
        )
        child_without_bed_costing_price = (
            self.enquiry.departure.child_without_bed_costing * self.child_without_bed
        )
        infant_costing_price = self.enquiry.departure.infant_costing * self.infant
        return (
            adult_price
            + child_with_bed_costing_price
            + child_without_bed_costing_price
            + infant_costing_price
        )

    class Meta:
        verbose_name = "Package Enquiry Room"
        verbose_name_plural = "Package Enquiry Rooms"

    def save(self, *args, **kwargs):
        if self.get_count() == 0:
            PackageRoom.objects.filter(pk=self.pk).delete()
        else:
            super().save(*args, **kwargs)


class FixedDepartureTraveller(models.Model):
    title = models.CharField(
        max_length=100,
        choices=(("MR", "Mr"), ("MRS", "Mrs"), ("MS", "Ms"), ("MISS", "Miss")),
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    passport_number = models.CharField(max_length=100)
    passport_expiry = models.DateField()
    meal_preference = models.CharField(
        max_length=100,
        choices=(("VEG", "Veg"), ("NONVEG", "Non-Veg"), ("BOTH", "Both")),
    )
    enquiry = models.ForeignKey(FixedDepartureEnquiry, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.enquiry)

    def age(self):
        if self.date_of_birth:
            today = date.today()
            age = (
                today.year - self.date_of_birth.year - 1
                if (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
                else today.year - self.date_of_birth.year
            )
            return f"{age}Y {today.month - self.date_of_birth.month}M"
        return "0Y 0M"

    class Meta:
        verbose_name = "Fixed Departure Traveller"
        verbose_name_plural = "Fixed Departure Travellers"


class CustomPackageEnquiry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=100)
    whatsapp = models.CharField(max_length=100, blank=True, null=True)
    adult = models.IntegerField(default=1, help_text="12+ Yrs")
    child = models.IntegerField(default=0, help_text="Below 12 Yrs")
    infant = models.IntegerField(default=0, help_text="0-2 Yrs")
    travel_date = models.DateField(help_text="Which date you want to travel")
    destination = models.CharField(
        max_length=100, help_text="Which holiday destination you would like to visit?"
    )
    days = models.IntegerField(help_text="For how many days", default=1)
    airport = models.ForeignKey(
        Airport,
        on_delete=models.CASCADE,
        help_text="Which airport you would like to depart from?",
        limit_choices_to={"is_active": True},
    )
    preference = models.TextField(
        blank=True, null=True, help_text="Mention any other preferances (if any)"
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.first_name)

    def get_absolute_url(self):
        return reverse("web:custom_package_enquiry", kwargs={"pk": self.pk})

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Custom Package Enquiry"
        verbose_name_plural = "Custom Package Enquiries"
