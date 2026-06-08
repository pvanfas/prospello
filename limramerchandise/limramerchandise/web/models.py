from django.db import models
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from tinymce.models import HTMLField


class Category(models.Model):
    business_line = models.CharField(_("Business Line"), max_length=100, choices=(("FMCG", "FMCG"),))
    title = models.CharField(_("Title"), max_length=100)
    image = models.ImageField(_("Image"), upload_to="category/")
    description = models.TextField(_("Description"))
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def __str__(self):
        return self.title


class Contact(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    email = models.EmailField(_("Email"), blank=True, null=True)
    phone = models.CharField(_("Phone"), max_length=15)
    subject = models.CharField(_("Subject"), max_length=100)
    message = models.TextField(_("Message"))

    class Meta:
        verbose_name = _("Contact")
        verbose_name_plural = _("Contacts")

    def __str__(self):
        return self.name


class News(models.Model):
    title = models.CharField(_("Title"), max_length=100)
    slug = models.SlugField(_("Slug"), max_length=100, unique=True)
    date = models.DateField(_("Date"))
    image = models.ImageField(_("Image"), upload_to="news/")
    content = HTMLField(_("Content"))

    class Meta:
        verbose_name = _("News")
        verbose_name_plural = _("News")

    def get_absolute_url(self):
        return reverse("web:news_detail", kwargs={"slug": self.slug})

    def __str__(self):
        return self.title


class Career(models.Model):
    title = models.CharField(_("Title"), max_length=100)

    class Meta:
        verbose_name = _("Career")
        verbose_name_plural = _("Careers")

    def __str__(self):
        return self.title


class Application(models.Model):
    # Personal Information
    fullname = models.CharField(_("Name"), max_length=180)
    email = models.EmailField(_("Email"), blank=True, null=True)
    phone = models.CharField(_("Mobile"), max_length=20)
    nationality = models.CharField(_("Nationality"), max_length=180)
    country_code = models.CharField(_("Country Code"), max_length=5)
    # Professional Information
    position = models.CharField(_("Job Title"), max_length=180)
    qualification = models.CharField(_("Qualification"), max_length=180)
    experience = models.CharField(_("Work Experience"), max_length=180)
    resume = models.FileField(_("Resume"), upload_to="application/")

    class Meta:
        verbose_name = _("Career Application")
        verbose_name_plural = _("Career Applications")

    def __str__(self):
        return self.fullname


class Slider(models.Model):
    title = models.CharField(_("Title"), max_length=100)
    image = models.ImageField(_("Image"), upload_to="slider/")
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = _("Slider")
        verbose_name_plural = _("Sliders")

    def __str__(self):
        return self.title


class Team(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    designation = models.CharField(_("Designation"), max_length=100)
    image = models.ImageField(_("Image"), upload_to="team/")

    class Meta:
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=120)
    image = models.ImageField(upload_to="brand")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'

    def __str__(self):
        return self.name
