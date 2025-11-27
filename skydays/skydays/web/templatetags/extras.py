from django import template
from djmoney.contrib.exchange.models import convert_money


register = template.Library()


@register.filter(name="times")
def times(number):
    return range(number)


@register.filter
def subtract(value, arg):
    return value - arg


@register.filter
def change_currency(value, currency_code):
    return convert_money(value, currency_code)
