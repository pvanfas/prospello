import datetime

from web.forms import ContactForm


def main_context(request):
    datetime.date.today()
    contact_form = ContactForm()
    return {"domain": request.META["HTTP_HOST"], "contact_form": contact_form}
