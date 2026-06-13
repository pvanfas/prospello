from django.template import Library


register = Library()


@register.filter(name="times")
def times(number):
    return range(number)


@register.filter(name="title_normal")
def title_normal(value):
    if not value:
        return ""
    # Convert all uppercase string to titlecase nicely
    words = value.lower().split()
    if not words:
        return ""
    
    minor_words = {'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'vs', 'with'}
    
    result = []
    for i, word in enumerate(words):
        if i == 0 or word not in minor_words:
            result.append(word.capitalize())
        else:
            result.append(word)
    return " ".join(result)
