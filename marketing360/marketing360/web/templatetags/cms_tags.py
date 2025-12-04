from django import template
from django.utils.safestring import mark_safe

from web.models import SiteText, SiteImage

register = template.Library()

@register.simple_tag
def cms_text(key: str, default: str = ""):
    """
    Usage: {% cms_text "homepage.hero_title" "Welcome to our site" %}
    Returns the stored SiteText.value for `key` if active; otherwise returns `default`.
    Value is marked safe (assumes trusted admin input). For plain text, store without HTML.
    """
    try:
        obj = SiteText.objects.get(key=key, is_active=True)
        return mark_safe(obj.value)
    except SiteText.DoesNotExist:
        return mark_safe(default)


@register.simple_tag
def cms_image(key: str, default: str = ""):
    """
    Usage: {% cms_image "logo.main" "/static/images/logo.png" %}
    Returns the URL of the SiteImage with the given `key` if active; otherwise returns `default`.
    Useful for replacing hardcoded image paths with admin-editable images.
    """
    try:
        obj = SiteImage.objects.get(key=key, is_active=True)
        return obj.image.url
    except SiteImage.DoesNotExist:
        return default


@register.simple_tag
def cms_image_tag(key: str, default: str = "", css_classes: str = ""):
    """
    Usage: {% cms_image_tag "hero.banner" "/static/images/hero.jpg" "img-fluid" %}
    Returns a full <img> tag with the SiteImage URL, alt text, and optional CSS classes.
    """
    try:
        obj = SiteImage.objects.get(key=key, is_active=True)
        alt = obj.alt_text or obj.label or obj.key
        class_attr = f' class="{css_classes}"' if css_classes else ""
        return mark_safe(f'<img src="{obj.image.url}" alt="{alt}"{class_attr} />')
    except SiteImage.DoesNotExist:
        if default:
            alt_text = key
            class_attr = f' class="{css_classes}"' if css_classes else ""
            return mark_safe(f'<img src="{default}" alt="{alt_text}"{class_attr} />')
        return ""
