import json

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.utils import timezone

from enquiry.forms import (
    CustomPackageEnquiryForm,
    FixedDepartureEnquiryForm,
    FixedDepartureTravellerForm,
    PackageEnquiryForm,
    PackageRoomFormSet,
    PackageTravellerFormSet,
)
from enquiry.models import CustomPackageEnquiry, FixedDepartureEnquiry, PackageEnquiry
from web.forms import ContactForm

from .functions import calculate_usd_amount
from .models import (
    Blog,
    Branch,
    Contact,
    Destination,
    FixedDeparture,
    Gallery,
    Package,
    Review,
    TeamMember,
    Video,
)
from .pdfview import PDFView


def send_email(template, instance, data):
    subject = data.get("subject")
    email_html = render_to_string(template, {"instance": instance})
    email = EmailMessage(
        subject=subject,
        body=email_html,
        from_email="secure.skydays@gmail.com",
        to=settings.EMAIL_RECEIVERS,
    )
    email.content_subtype = "html"
    email.send()
    print("Email Sent")


def index(request):
    fixed_departures = FixedDeparture.objects.filter(is_active=True)[:8]
    videos = Video.objects.all()
    reviews = Review.objects.all()
    packages = Package.objects.filter(is_active=True, is_bestplace=True)
    context = {
        "is_index": True,
        "reviews": reviews,
        "fixed_departures": fixed_departures,
        "packages": packages,
        "videos": videos,
    }
    return render(request, "web/index.html", context)


def packages(request):
    special_packages = Package.objects.filter(is_active=True, is_special=True)
    packages = Package.objects.filter(is_active=True)
    context = {
        "is_packages": True,
        "special_packages": special_packages,
        "packages": packages,
    }
    return render(request, "web/packages.html", context)


def fixed_departures(request):
    fixed_departures = FixedDeparture.objects.all()
    context = {"is_fixed_departures": True, "fixed_departures": fixed_departures}
    return render(request, "web/fixed_departures.html", context)


def about(request):
    teams = TeamMember.objects.all()
    reviews = Review.objects.all()
    context = {"is_about": True, "teams": teams, "reviews": reviews}
    return render(request, "web/about.html", context)


def gallery(request):
    destinations = Destination.objects.all()
    galleries = Gallery.objects.all()
    context = {"is_gallery": True, "destinations": destinations, "galleries": galleries}
    return render(request, "web/gallery.html", context)


def blogs(request):
    blogs = Blog.objects.filter(is_active=True)
    popular_blogs = Blog.objects.filter(is_active=True, is_popular=True)
    context = {"is_blogs": True, "blogs": blogs, "popular_blogs": popular_blogs}
    return render(request, "web/blogs.html", context)


def customize(request):
    form = CustomPackageEnquiryForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            instance = form.save()
            send_email(
                "email/custom_package.html",
                instance,
                data={"subject": "Custom Package Enquiry"},
            )
            return redirect("web:thanks")
    context = {"is_customize": True, "form": form}
    return render(request, "web/customize.html", context)


def contact(request):
    branches = Branch.objects.all()
    form = ContactForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            instance = form.save()
            send_email(
                "email/contact_form_submission.html",
                instance,
                data={"subject": "Contact Form Submission"},
            )
            return redirect("web:thanks")
    context = {"is_contact": True, "form": form, "branches": branches}
    return render(request, "web/contact.html", context)


def privacy_policy(request):
    context = {"is_privacy_policy": True}
    return render(request, "web/privacy_policy.html", context)


def terms_and_conditions(request):
    context = {"is_terms_and_conditions": True}
    return render(request, "web/terms_and_conditions.html", context)


def shipping_policy(request):
    context = {"is_shipping_policy": True}
    return render(request, "web/shipping_policy.html", context)


def fixed_departure_detail(request, slug):
    form = FixedDepartureEnquiryForm(request.POST or None)
    formset = PackageRoomFormSet(request.POST or None, prefix="traveller")
    departure = get_object_or_404(FixedDeparture, slug=slug)

    if request.method == "POST":
        total_guests = 0
        for traveller_form in formset.forms:
            if (
                traveller_form.is_valid()
            ):  # Ensure the form is valid before accessing cleaned_data
                adult = traveller_form.cleaned_data.get("adult")
                child_with_bed = traveller_form.cleaned_data.get("child_with_bed")
                child_without_bed = traveller_form.cleaned_data.get("child_without_bed")
                infant = traveller_form.cleaned_data.get("infant")
                total_guests += adult + child_with_bed + child_without_bed + infant

        if total_guests > departure.total_seats:
            messages.error(
                request,
                "Total Guests cannot be more than {}".format(departure.total_seats),
            )
            return redirect("web:fixed_departure_detail", slug=slug)

        if form.is_valid() and formset.is_valid():
            instance = form.save(commit=False)
            instance.departure = departure
            instance.save()
            for traveller_form in formset.forms:
                traveller = traveller_form.save(commit=False)
                traveller.enquiry = instance
                traveller.save()
        send_email(
            "email/fixed_departure.html",
            instance,
            data={"subject": "Fixed Departure Enquiry"},
        )
        return redirect("web:fixed_departure_return", pk=instance.pk)
    context = {
        "is_fixed_departure_detail": True,
        "departure": departure,
        "form": form,
        "formset": formset,
    }
    return render(request, "web/fixed_departure_detail.html", context)


def package_detail(request, slug):
    form = PackageEnquiryForm(request.POST or None)
    formset = PackageTravellerFormSet(request.POST or None, prefix="traveller")
    package = get_object_or_404(Package, slug=slug)

    if request.method == "POST":
        if form.is_valid() and formset.is_valid():
            instance = form.save(commit=False)
            instance.package = package
            instance.save()
            for traveller_form in formset.forms:
                if traveller_form.has_changed():
                    traveller = traveller_form.save(commit=False)
                    traveller.enquiry = instance
                    traveller.save()
        send_email(
            "email/package_enquiry.html", instance, data={"subject": "Package Enquiry"}
        )
        return redirect("web:package_enquiry_thanks", pk=instance.pk)
    context = {
        "is_package_detail": True,
        "package": package,
        "form": form,
        "formset": formset,
    }
    return render(request, "web/package_detail.html", context)


def blog_details(request, slug):
    blog = get_object_or_404(Blog, slug=slug)
    popular_blogs = Blog.objects.filter(is_active=True, is_popular=True)
    blog.views += 1
    blog.save()
    context = {"is_blog_details": True, "blog": blog, "popular_blogs": popular_blogs}
    return render(request, "web/blog-details.html", context)


def gallery_view(request, slug):
    destinations = Destination.objects.all()
    destination = get_object_or_404(Destination, slug=slug)
    galleries = Gallery.objects.filter(destination=destination)
    context = {
        "is_gallery": True,
        "galleries": galleries,
        "destinations": destinations,
        "destination": destination,
    }
    return render(request, "web/gallery_view.html", context)


def set_currency(request):
    currency = request.GET.get("currency", "SAR")
    request.session["currency"] = currency
    return redirect(request.META.get("HTTP_REFERER", "/"))


def thanks(request):
    context = {"is_thankyou": True}
    return render(request, "web/thankyou.html", context)


def package_enquiry_thanks(request, pk):
    context = {"is_thankyou": True, "instance": PackageEnquiry.objects.get(pk=pk)}
    return render(request, "thanks/package_enquiry.html", context)


class PackageEnquiryPDF(PDFView):
    template_name = "pdf/package_enquiry.html"
    filename = "package_enquiry.pdf"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["instance"] = PackageEnquiry.objects.get(pk=self.kwargs.get("pk"))
        return context


def fixed_departure_return(request, pk):
    instance = FixedDepartureEnquiry.objects.get(pk=pk)
    count = instance.get_count()
    forms = [
        FixedDepartureTravellerForm(request.POST, prefix=str(f"{i}-traveller"))
        for i in range(count)
    ]
    context = {"is_thankyou": True, "instance": instance, "forms": forms}
    if request.method == "POST":
        forms_valid = all([form.is_valid() for form in forms])
        forms_errors = [form.errors for form in forms]
        if forms_valid:
            for form in forms:
                data = form.save(commit=False)
                data.enquiry = instance
                data.save()
            return redirect("web:fixed_departure_payment", pk=instance.pk)
        else:
            context["forms_errors"] = forms_errors
            return render(request, "web/fixed_departure_return.html", context)
    return render(request, "web/fixed_departure_return.html", context)


def fixed_departure_thanks(request, pk):
    instance = FixedDepartureEnquiry.objects.get(pk=pk)
    context = {"is_thankyou": True, "instance": instance}
    return render(request, "thanks/fixed_departure.html", context)


class FixedDepartureEnquiryPDF(PDFView):
    template_name = "pdf/fixed_departure.html"
    filename = "fixed_departure_enquiry.pdf"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["instance"] = FixedDepartureEnquiry.objects.get(
            pk=self.kwargs.get("pk")
        )
        return context


# Admin Views
@login_required
def contact_view(request, pk):
    context = {"instance": Contact.objects.get(pk=pk)}
    return render(request, "view/contact_form_submission.html", context)


@login_required
def fixed_departure_enquiry(request, pk):
    context = {"instance": FixedDepartureEnquiry.objects.get(pk=pk)}
    return render(request, "view/fixed_departure.html", context)


@login_required
def package_enquiry(request, pk):
    context = {"instance": PackageEnquiry.objects.get(pk=pk)}
    return render(request, "view/package_enquiry.html", context)


@login_required
def custom_package_enquiry(request, pk):
    context = {"instance": CustomPackageEnquiry.objects.get(pk=pk)}
    return render(request, "view/custom_package.html", context)


def fixed_departure_payment(request, pk):
    instance = FixedDepartureEnquiry.objects.get(pk=pk)
    full_amount = calculate_usd_amount(instance.get_price())
    advance_amount = round(full_amount * 0.25, 2)

    if instance.payment_method == "FULL":
        payable_inr = instance.get_price()
        payable_amount = full_amount
    elif instance.payment_method == "ADVANCE":
        payable_inr = instance.get_price() * 0.25
        payable_amount = advance_amount
    else:
        payable_inr = 0
        payable_amount = 0

    context = {
        "is_thankyou": True,
        "instance": instance,
        "payable_amount": payable_amount,
        "payable_inr": payable_inr,
    }
    return render(request, "web/fixed_departure_payment.html", context)


def complete_order(request):
    body_unicode = request.body.decode("utf-8")
    print(body_unicode)
    if body_unicode:
        body = json.loads(body_unicode)
        order_id = body["order_id"]
        total = body["total"]
        print(order_id)
        instance = get_object_or_404(FixedDepartureEnquiry, id=order_id)
        instance.is_paid = True
        instance.paid_at = timezone.now()
        instance.paid_amount = total
        instance.save()
        return JsonResponse({"status": True, "message": "Payment successful"})
    return JsonResponse({"status": False, "message": "Invalid Request"})


def paypal_success(request):
    return render(request, "web/paypal_success.html")


def paypal_cancel(request):
    return render(request, "web/paypal_cancel.html")


def thanks(request):
    return render(request, "thanks/thanks.html")
