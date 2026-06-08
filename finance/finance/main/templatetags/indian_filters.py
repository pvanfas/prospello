from django import template

register = template.Library()


@register.filter
def intcomma_indian(value):
    """
    Format a number in Indian style with commas and preserve decimals.
    Example: 12345678.90 -> 1,23,45,678.90
    """
    try:
        # Convert to float first to handle decimals
        num = float(value)
    except (ValueError, TypeError):
        return value

    # Split integer and decimal parts
    integer_part, dot, decimal_part = str(f"{num:.2f}").partition(".")  # Always 2 decimal places

    # Handle Indian-style commas for integer part
    if len(integer_part) > 3:
        r = integer_part[-3:]
        s = integer_part[:-3]
        while len(s) > 0:
            r = s[-2:] + "," + r
            s = s[:-2]
    else:
        r = integer_part

    return r + (dot + decimal_part if decimal_part else "")
