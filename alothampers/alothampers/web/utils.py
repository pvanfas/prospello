from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_mailnote(data):
    subject = f"Alot Hampers: Order {data.order_id} has been received"
    html_message = render_to_string("email.html", {"order": data, "order_items": data.get_items()})
    plain_message = strip_tags(html_message)
    from_email = settings.EMAIL_FROM_USER
    to = "anfasperingavu@gmail.com"
    send_mail(subject, plain_message, from_email, [to], html_message=html_message)
    print("Email sent")
    return True
