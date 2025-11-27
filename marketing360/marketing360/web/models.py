from django.db import models
from django.utils.safestring import mark_safe


class Mentor(models.Model):
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    bio = models.TextField()
    expertise = models.TextField()
    profile_picture = models.ImageField(upload_to="mentors/", blank=True, null=True)
    company_logo = models.ImageField(upload_to="mentors/logos/", blank=True, null=True)

    class Meta:
        ordering = ["-name"]
        verbose_name = "Mentor"
        verbose_name_plural = "Mentors"

    def preview(self):
        if self.profile_picture:
            return mark_safe(
                f'<img src="{self.profile_picture.url}" width="100" height="100" style="object-fit:contain;" />'
            )
        return "No Image"

    def __str__(self):
        return self.name


class HiringPartner(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="partners/")

    class Meta:
        ordering = ["-name"]
        verbose_name = "Hiring Partner"
        verbose_name_plural = "Hiring Partners"

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField()
    featured_image = models.ImageField(upload_to="blog/")
    date = models.DateField()

    class Meta:
        ordering = ["-date"]
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def get_absolute_url(self):
        return "#"

    def __str__(self):
        return self.title


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    message = models.TextField()

    class Meta:
        ordering = ["-name"]
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"

    def __str__(self):
        return self.name


class Tool(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="tools/")

    class Meta:
        ordering = ["-name"]
        verbose_name = "Tool"
        verbose_name_plural = "Tools"

    def __str__(self):
        return self.name
