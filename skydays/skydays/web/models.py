from django.db import models
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext_lazy as _
from djmoney.models.fields import MoneyField
from djmoney.money import Money
from tinymce.models import HTMLField
from versatileimagefield.fields import VersatileImageField

from . import default


class Destination(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    slug = models.SlugField(max_length=255, verbose_name=_("Slug"), unique=True)
    image = VersatileImageField(upload_to="destinations", verbose_name=_("Image"))
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = _("Destination")
        verbose_name_plural = _("Destinations")


class Gallery(models.Model):
    destination = models.ForeignKey(
        Destination,
        on_delete=models.CASCADE,
        related_name="gallery",
        blank=True,
        null=True,
    )
    image = VersatileImageField(upload_to="gallery", verbose_name=_("Image"))

    def __str__(self):
        return str(self.image.name)

    class Meta:
        verbose_name = _("Gallery Image")
        verbose_name_plural = _("Gallery Images")


class FixedDeparture(models.Model):
    destination = models.CharField(max_length=255, verbose_name=_("Destination"))
    slug = models.SlugField(max_length=255, verbose_name=_("Slug"), unique=True)
    departure_from = models.CharField(max_length=255, verbose_name=_("Departure From"))
    image = VersatileImageField(upload_to="fixed_departures", verbose_name=_("Image"))
    duration = models.CharField(max_length=255, verbose_name=_("Duration"))
    date = models.DateField(verbose_name=_("Date"))
    total_seats = models.PositiveIntegerField(verbose_name=_("Total Seats"))
    available_seats = models.PositiveIntegerField(verbose_name=_("Available Seats"))
    price = MoneyField(max_digits=14, decimal_places=2, default_currency="INR")
    available_until = models.DateField(verbose_name=_("Available Until"))
    rating = models.SmallIntegerField(verbose_name=_("Rating"), default=5)
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    adult_costing = MoneyField(max_digits=14, decimal_places=2, default=Money(0, "INR"))
    child_with_bed_costing = MoneyField(
        max_digits=14, decimal_places=2, default=Money(0, "INR")
    )
    child_without_bed_costing = MoneyField(
        max_digits=14, decimal_places=2, default=Money(0, "INR")
    )
    infant_costing = MoneyField(
        max_digits=14, decimal_places=2, default=Money(0, "INR")
    )
    single_occupancy_costing = MoneyField(
        max_digits=14, decimal_places=2, default=Money(0, "INR")
    )

    payment_terms = HTMLField(
        verbose_name=_("Payment Terms"), default=default.payment_terms_default
    )
    cancellation_policy = HTMLField(
        verbose_name=_("Cancellation Policy"),
        default=default.cancellation_policy_default,
    )
    terms_and_conditions = HTMLField(
        verbose_name=_("Terms and Conditions"),
        default=default.terms_and_conditions_default,
    )
    brochure = models.FileField(
        upload_to="fixed_departures",
        verbose_name=_("Brochure"),
        blank=True,
        null=True,
    )
    overview = HTMLField(verbose_name=_("Overview"), default=default.overview_default)
    attachment = models.FileField(
        upload_to="fixed_departures",
        verbose_name=_("Attachment"),
        blank=True,
        null=True,
    )
    is_sold_out = models.BooleanField(_("Marked as Sold Out"), default=False)

    def __str__(self):
        return f"{self.destination} - {self.date}"

    def get_absolute_url(self):
        return reverse_lazy("web:fixed_departure_detail", kwargs={"slug": self.slug})

    class Meta:
        ordering = ("date",)
        verbose_name = _("Fixed Departure")
        verbose_name_plural = _("Fixed Departures")


class TeamMember(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    image = VersatileImageField(upload_to="team", verbose_name=_("Image"))
    designation = models.CharField(max_length=255, verbose_name=_("Designation"))

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = _("Team Member")
        verbose_name_plural = _("Team Members")


class Review(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    image = VersatileImageField(upload_to="reviews", verbose_name=_("Image"))
    review = models.TextField(verbose_name=_("Review"))
    rating = models.SmallIntegerField(verbose_name=_("Rating"), default=5)

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")


class Package(models.Model):
    destination = models.CharField(max_length=255, verbose_name=_("Destination"))
    slug = models.SlugField(max_length=255, verbose_name=_("Slug"), unique=True)
    departure_from = models.CharField(max_length=255, verbose_name=_("Departure From"))
    image = VersatileImageField(upload_to="fixed_departures", verbose_name=_("Image"))
    duration = models.CharField(max_length=255, verbose_name=_("Duration"))
    price = MoneyField(max_digits=14, decimal_places=2, default_currency="INR")
    available_until = models.DateField(verbose_name=_("Available Until"))
    rating = models.SmallIntegerField(verbose_name=_("Rating"), default=5)
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    is_bestplace = models.BooleanField(
        default=True, verbose_name=_("Mark as Best Place")
    )
    is_special = models.BooleanField("Mark as Special Deal", default=False)
    payment_terms = HTMLField(
        verbose_name=_("Payment Terms"), default=default.payment_terms_default
    )
    cancellation_policy = HTMLField(
        verbose_name=_("Cancellation Policy"),
        default=default.cancellation_policy_default,
    )
    terms_and_conditions = HTMLField(
        verbose_name=_("Terms and Conditions"),
        default=default.terms_and_conditions_default,
    )
    brochure = models.FileField(
        upload_to="fixed_departures",
        verbose_name=_("Brochure"),
        blank=True,
        null=True,
    )
    overview = HTMLField(verbose_name=_("Overview"), default=default.overview_default)
    attachment = models.FileField(
        upload_to="fixed_departures",
        verbose_name=_("Attachment"),
        blank=True,
        null=True,
    )

    def __str__(self):
        return str(self.destination)

    def get_absolute_url(self):
        return reverse_lazy("web:package_detail", kwargs={"slug": self.slug})

    class Meta:
        verbose_name = _("Package")
        verbose_name_plural = _("Packages")


class BlogAuthor(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    image = VersatileImageField(upload_to="blog_authors", verbose_name=_("Image"))
    designation = models.CharField(max_length=255, verbose_name=_("Designation"))

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = _("Blog Author")
        verbose_name_plural = _("Blog Authors")


class Blog(models.Model):
    title = models.CharField(max_length=255, verbose_name=_("Title"))
    slug = models.SlugField(max_length=255, verbose_name=_("Slug"), unique=True)
    author = models.ForeignKey(
        BlogAuthor,
        on_delete=models.CASCADE,
        related_name="blogs",
        verbose_name=_("Author"),
    )
    image = VersatileImageField(upload_to="blogs", verbose_name=_("Image"))
    summary = models.TextField(verbose_name=_("Summary"))
    date = models.DateField(verbose_name=_("Date"))
    tag = models.CharField(max_length=255, verbose_name=_("Tag"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    is_popular = models.BooleanField(default=True, verbose_name=_("Mark as Popular"))
    content = HTMLField(verbose_name=_("Content"))
    views = models.PositiveIntegerField(default=0, verbose_name=_("Views"))

    def __str__(self):
        return str(self.title)

    def get_absolute_url(self):
        return reverse_lazy("web:blog_details", kwargs={"slug": self.slug})

    class Meta:
        ordering = ("date",)
        verbose_name = _("Blog")
        verbose_name_plural = _("Blogs")


class Contact(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    email = models.EmailField(verbose_name=_("Email"), blank=True, null=True)
    phone = models.CharField(max_length=255, verbose_name=_("Phone"))
    message = models.TextField(verbose_name=_("Message"))
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_("Timestamp"))

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self):
        return reverse("web:contact_view", kwargs={"pk": self.pk})

    class Meta:
        ordering = ("name",)
        verbose_name = _("Contact")
        verbose_name_plural = _("Contacts")


class Branch(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    address = models.TextField(verbose_name=_("Address"))
    phone = models.CharField(max_length=255, verbose_name=_("Phone"))
    email = models.EmailField(verbose_name=_("Email"))
    priority = models.SmallIntegerField(default=1)

    def __str__(self):
        return str(self.name)

    class Meta:
        ordering = ("-priority",)
        verbose_name = _("Branch")
        verbose_name_plural = _("Branches")


class Video(models.Model):
    title = models.CharField(max_length=255, verbose_name=_("Title"))
    video_id = models.CharField(max_length=255, verbose_name=_("Video ID"))
    thumbnail = VersatileImageField(upload_to="videos", verbose_name=_("Thumbnail"))

    def __str__(self):
        return str(self.title)

    class Meta:
        verbose_name = _("Video")
        verbose_name_plural = _("Videos")
