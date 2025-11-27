from email.policy import default
from django.db import models
from users.models import CustomUser as User
from main.choices import BOOL_CHOICES

# Create your models here.


class BaseModel(models.Model):
    created = models.DateTimeField("Created at", db_index=True, auto_now_add=True)
    updated = models.DateTimeField("Updated at", auto_now=True)
    # creator = models.ForeignKey(User, editable=False, blank=True, null=True, related_name="%(app_label)s_%(class)s_creator", on_delete=models.PROTECT)
    is_active = models.BooleanField("Mark as Active", default=True, choices=BOOL_CHOICES)

    class Meta:
        abstract = True
        ordering = ("-created",)
        
        
class Banner(BaseModel):
    main_title = models.CharField(max_length=200,default="DINECORE")
    title = models.CharField(max_length=200,default="MEAL SERVICE SOLUTION")
    image = models.ImageField(upload_to="banners/")
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey("main.MealCategory", on_delete=models.CASCADE, related_name="banners")

    # link = models.URLField(max_length=200, blank=True, null=True)
    class Meta:
        ordering = ("-created",)
        verbose_name = "Banner"
        verbose_name_plural = "Banners"

    def __str__(self):
        return self.title