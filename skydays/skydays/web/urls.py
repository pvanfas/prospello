from django.urls import path

from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("contact/", views.contact, name="contact"),
    path("about/", views.about, name="about"),
    path("blog/<str:slug>/", views.blog_details, name="blog_details"),
    path("gallery/", views.gallery, name="gallery"),
    path("gallery/<str:slug>/", views.gallery_view, name="gallery_view"),
    path("packages/", views.packages, name="packages"),
    path("blogs/", views.blogs, name="blogs"),
    path("customize/", views.customize, name="customize"),
    path("fixed_departures/", views.fixed_departures, name="fixed_departures"),
    path("privacy_policy/", views.privacy_policy, name="privacy_policy"),
    path("terms_and_conditions/", views.terms_and_conditions, name="terms_and_conditions"),
    path("shipping_policy/", views.shipping_policy, name="shipping_policy"),
    path("set-currency/", views.set_currency, name="set_currency"),
    # admin views
    path("administrator/view/contact/<str:pk>/", views.contact_view, name="contact_view"),
    path("administrator/view/custom_pkg_eqry/<str:pk>/", views.custom_package_enquiry, name="custom_package_enquiry",),
    # thank you pages
    path("thanks/", views.thanks, name="thanks"),
    # package enquiry
    path("package/<str:slug>/", views.package_detail, name="package_detail"),
    path("thanks/return/pkg_enqy/<str:pk>/", views.package_enquiry_thanks, name="package_enquiry_thanks",),
    path("thanks/pdf/pkg_enqy/<str:pk>/", views.PackageEnquiryPDF.as_view(), name="package_enquiry_pdf",),
    path("administrator/view/pkg_enqy/<str:pk>/", views.package_enquiry, name="package_enquiry",),
    # fixed departure enquiry
    path("fixed_departure/<str:slug>/", views.fixed_departure_detail, name="fixed_departure_detail",),
    path("return/fd_enqy/<str:pk>/", views.fixed_departure_return, name="fixed_departure_return",),
    path("payment/fd_enqy/<str:pk>/", views.fixed_departure_payment, name="fixed_departure_payment",),
    path("thanks/fd_enqy/<str:pk>/", views.fixed_departure_thanks, name="fixed_departure_thanks",),
    path("thanks/pdf/fd_enqy/<str:pk>/", views.FixedDepartureEnquiryPDF.as_view(), name="fixed_departure_pdf",),
    path("administrator/view/fd_enqy/<str:pk>/", views.fixed_departure_enquiry, name="fixed_departure",),
    # fixed departure booking
    path("fixed/complete_order/", views.complete_order, name="complete_order"),
    path("fixed/paypal_success/", views.paypal_success, name="paypal_success"),
    path("fixed/paypal_cancel/", views.paypal_cancel, name="paypal_cancel"),
    path("thanks/", views.thanks, name="thanks",),
]
