from django.db import models
from django.urls import reverse_lazy


class Category(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Cource Category"
        verbose_name_plural = "Cource Categories"

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self):
        return reverse_lazy("web:category_view", kwargs={"pk": self.pk})

    def get_courses(self):
        return Course.objects.filter(is_active=True)


class University(models.Model):
    name = models.CharField(max_length=128)
    logo = models.ImageField(upload_to="images/universities")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "University"
        verbose_name_plural = "Universities"

    def __str__(self):
        return str(self.name)


class Course(models.Model):
    name = models.CharField(max_length=128)
    type = models.CharField(max_length=128)
    duration = models.CharField(max_length=128)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    university = models.ForeignKey(University, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return str(self.name)


class Testimonial(models.Model):
    name = models.CharField(max_length=128)
    photo = models.ImageField(upload_to="images/testimonials")
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return str(self.name)


class Partner(models.Model):
    name = models.CharField(max_length=128)
    logo_bw = models.ImageField(upload_to="images/partners")
    logo_color = models.ImageField(upload_to="images/partners")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return str(self.name)


class Registration(models.Model):
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=120)
    course = models.CharField(max_length=120)
    phone = models.CharField(max_length=120)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return str(self.name)


class Contact(models.Model):
    name = models.CharField(max_length=120)
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=120, blank=True, null=True)
    place = models.CharField(max_length=120, blank=True, null=True)
    message = models.TextField()

    def __str__(self):
        return str(self.name)
