from django.core.exceptions import ValidationError
from django.db import models
from versatileimagefield.fields import VersatileImageField


# Create your models here.
class About(models.Model):
    title = models.CharField(max_length=128, default="About Fadhil Mohammed")
    content = models.TextField()
    mission = models.TextField()
    vision = models.TextField()
    dreams = models.TextField()
    email = models.EmailField(default="hello@fadhilmohammed.com")

    class Meta:
        verbose_name = "About"
        verbose_name_plural = "About"

    def clean(self):
        if About.objects.count() >= 1 and self.pk is None:
            raise ValidationError(
                "You can only create one About. Try editing/removing one of the existing about."
            )

    def __str__(self):
        return str(self.title)


class Company(models.Model):
    title = models.CharField(max_length=128)
    content = models.TextField()
    logo = VersatileImageField(upload_to="images/clients")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"

    def __str__(self):
        return str(self.title)


class News(models.Model):
    title = models.CharField(max_length=128)
    image = VersatileImageField(upload_to="images/news")
    date = models.DateField(blank=True, null=True)
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "Newses"

    def __str__(self):
        return str(self.title)
