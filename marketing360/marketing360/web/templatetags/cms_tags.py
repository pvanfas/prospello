from django import template

from web.models import SiteText

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
        return str(obj.value)
    except SiteText.DoesNotExist:
        return str(default)
