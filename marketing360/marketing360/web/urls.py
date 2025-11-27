from django.urls import path

from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("courses/", views.courses, name="courses"),
    path(
        "courses/digital-marketing/",
        views.digital_marketing_courses,
        name="digital_marketing_courses",
    ),
    path("mentors/", views.mentors, name="mentors"),
    path("centers/", views.centers, name="centers"),
    path("webinars/", views.webinars, name="webinars"),
    path("faq/", views.faq, name="faq"),
    path("communities/", views.communities, name="communities"),
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
    path("refer/", views.refer, name="refer"),
    path("case_studies/", views.index, name="case_studies"),
    path("blog/", views.blog, name="blog"),
    path(
        "terms-and-conditions/", views.terms_and_conditions, name="terms_and_conditions"
    ),
    path("privacy-policy/", views.privacy_policy, name="privacy_policy"),
    path("refund-policy/", views.refund_policy, name="refund_policy"),
    path("cookie-policy/", views.cookie_policy, name="cookie_policy"),
]
