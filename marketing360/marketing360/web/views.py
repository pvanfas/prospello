from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.contrib import messages

from .models import (
    Audience,
    BlogCategory,
    BlogPost,
    Community,
    CommunityBenefit,
    CommunityTestimonial,
    Course,
    Feature,
    HiringPartner,
    Mentor,
    Newsletter,
    ReferralBenefit,
    ReferralStep,
    ReferralTerm,
    Page,
    PolicyPage,
    StudentSuccessStory,
    Tool,
    Webinar,
    WhyUs,
    FAQCategory)
from .forms import ContactForm, NewsletterForm


def index(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you for contacting us! We'll get back to you soon.")
            return redirect("web:index")
    else:
        form = ContactForm()
    
    courses = Course.objects.all()
    mentors = Mentor.objects.all()
    hiring_partners = HiringPartner.objects.all()
    blogs = BlogPost.objects.all()
    success_stories = StudentSuccessStory.objects.filter(is_active=True)
    context = {
        "is_index": True,
        "courses": courses,
        "mentors": mentors,
        "hiring_partners": hiring_partners,
        "blogs": blogs[:3],
        "success_stories": success_stories,
        "form": form,
    }
    return render(request, "web/index.html", context)


def courses(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you for your interest! We'll contact you soon.")
            return redirect("web:courses")
    else:
        form = ContactForm()
    
    courses = Course.objects.all()  # Get the main course
    tools = Tool.objects.all()
    mentors = Mentor.objects.all()
    hiring_partners = HiringPartner.objects.all()
    webinars = Webinar.objects.all()[:3]  # Get first 3 webinars
    context = {
        "is_courses": True,
        "is_dark_navbar": True,
        "courses": courses,
        "tools": tools,
        "mentors": mentors,
        "hiring_partners": hiring_partners,
        "webinars": webinars,
        "form": form,
    }
    return render(request, "web/courses.html", context)


def mentors(request):
    mentors = Mentor.objects.all()
    hiring_partners = HiringPartner.objects.all()
    context = {
        "is_mentors": True,
        "is_dark_navbar": True,
        "mentors": mentors,
        "hiring_partners": hiring_partners,
    }
    return render(request, "web/mentors.html", context)


def centers(request):
    context = {"is_centers": True, "is_dark_navbar": True}
    return render(request, "web/centers.html", context)


def webinars(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you for registering! We'll send you the webinar details soon.")
            return redirect("web:webinars")
    else:
        form = ContactForm()
    
    webinars_list = Webinar.objects.all()
    page = Page.objects.filter(key="webinars").first()
    context = {
        "is_webinars": True,
        "is_dark_navbar": True,
        "webinars": webinars_list,
        "form": form,
        "page": page,
    }
    return render(request, "web/webinars.html", context)


def communities(request):
    communities_list = Community.objects.all()
    testimonials = CommunityTestimonial.objects.filter(is_active=True)
    benefits = CommunityBenefit.objects.filter(is_active=True)
    page = Page.objects.filter(key="communities").first()
    context = {
        "is_communities": True,
        "is_dark_navbar": True,
        "communities": communities_list,
        "testimonials": testimonials,
        "benefits": benefits,
        "page": page,
    }
    return render(request, "web/communities.html", context)


def about(request):
    features = Feature.objects.all()
    audiences = Audience.objects.all()
    whyus_items = WhyUs.objects.all()
    page = Page.objects.filter(key="about").first()
    context = {
        "is_about": True,
        "is_dark_navbar": True,
        "features": features,
        "audiences": audiences,
        "whyus_items": whyus_items,
        "page": page,
    }
    return render(request, "web/about.html", context)


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you for contacting us! We'll get back to you soon.")
            return redirect("web:contact")
    else:
        form = ContactForm()
    
    page = Page.objects.filter(key="contact").first()
    context = {
        "is_contact": True,
        "is_dark_navbar": True,
        "form": form,
        "page": page,
    }
    return render(request, "web/contact.html", context)


def newsletter_subscribe(request):
    if request.method == "POST":
        form = NewsletterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            newsletter, created = Newsletter.objects.get_or_create(email=email)
            if created:
                messages.success(request, "Thank you for subscribing to our newsletter!")
            else:
                if newsletter.is_active:
                    messages.info(request, "You are already subscribed to our newsletter.")
                else:
                    newsletter.is_active = True
                    newsletter.save()
                    messages.success(request, "Welcome back! Your subscription has been reactivated.")
        else:
            messages.error(request, "Please enter a valid email address.")
    
    # Redirect to the referring page or index
    return redirect(request.META.get('HTTP_REFERER', 'web:index'))


def refer(request):
    steps = ReferralStep.objects.all()
    benefits = ReferralBenefit.objects.filter(is_active=True)
    terms = ReferralTerm.objects.filter(is_active=True)
    page = Page.objects.filter(key="refer").first()
    context = {
        "is_refer": True,
        "is_dark_navbar": True,
        "referral_steps": steps,
        "referral_benefits": benefits,
        "referral_terms": terms,
        "page": page,
    }
    return render(request, "web/refer.html", context)


def case_studies(request):
    page = Page.objects.filter(key="case_studies").first()
    context = {"is_case_studies": True, "is_dark_navbar": True, "page": page}
    return render(request, "web/case_studies.html", context)


def blog(request):
    # Get all categories
    categories = BlogCategory.objects.all()

    # Get all blog posts or filter by search
    blog_posts = BlogPost.objects.select_related("category").all()
    search_query = request.GET.get("search", "")

    if search_query:
        blog_posts = blog_posts.filter(
            title__icontains=search_query
        ) | blog_posts.filter(summary__icontains=search_query)

    # Pagination
    paginator = Paginator(blog_posts, 9)  # 9 posts per page
    page_number = request.GET.get("page", 1)
    page_obj = paginator.get_page(page_number)

    page = Page.objects.filter(key="blog").first()
    context = {
        "is_blog": True,
        "is_dark_navbar": True,
        "categories": categories,
        "page_obj": page_obj,
        "search_query": search_query,
        "page": page,
    }
    return render(request, "web/blog.html", context)


def blog_category(request, slug):
    # Get category
    category = get_object_or_404(BlogCategory, slug=slug)
    categories = BlogCategory.objects.all()

    # Get posts in this category
    blog_posts = BlogPost.objects.filter(category=category)

    # Pagination
    paginator = Paginator(blog_posts, 9)
    page_number = request.GET.get("page", 1)
    page_obj = paginator.get_page(page_number)

    page = Page.objects.filter(key="blog").first()
    context = {
        "is_blog": True,
        "is_dark_navbar": True,
        "category": category,
        "categories": categories,
        "page_obj": page_obj,
        "page": page,
    }
    return render(request, "web/blog.html", context)


def blog_detail(request, slug):
    blog_post = get_object_or_404(BlogPost, slug=slug)
    categories = BlogCategory.objects.all()
    related_posts = BlogPost.objects.filter(category=blog_post.category).exclude(
        pk=blog_post.pk
    )[:3]

    page = Page.objects.filter(slug="blog").first()
    context = {
        "is_blog": True,
        "is_dark_navbar": True,
        "blog_post": blog_post,
        "categories": categories,
        "related_posts": related_posts,
        "page": page,
    }
    return render(request, "web/blog_detail.html", context)


def faq(request):
    categories = FAQCategory.objects.prefetch_related('faqs').all()
    page = Page.objects.filter(key="faq").first()
    context = {
        "is_faq": True,
        "is_dark_navbar": True,
        "categories": categories,
        "page": page,
    }
    return render(request, "web/faq.html", context)


def digital_marketing_courses(request):
    partners = Partner.objects.all()
    page = Page.objects.filter(key="digital_marketing_courses").first()
    context = {
        "is_digital_marketing_courses": True,
        "is_dark_navbar": True,
        "partners": partners,
        "page": page,
    }
    return render(request, "web/courses/digital_marketing_courses.html", context)


def terms_and_conditions(request):
    page = Page.objects.filter(key="terms_and_conditions").first()
    policy = PolicyPage.objects.filter(key="terms_and_conditions", is_active=True).first()
    context = {"is_terms_and_conditions": True, "is_dark_navbar": True, "page": page, "policy": policy}
    return render(request, "web/terms_and_conditions.html", context)


def privacy_policy(request):
    page = Page.objects.filter(key="privacy_policy").first()
    policy = PolicyPage.objects.filter(key="privacy_policy", is_active=True).first()
    context = {"is_terms_and_conditions": True, "is_dark_navbar": True, "page": page, "policy": policy}
    return render(request, "web/privacy_policy.html", context)


def refund_policy(request):
    page = Page.objects.filter(key="refund_policy").first()
    policy = PolicyPage.objects.filter(key="refund_policy", is_active=True).first()
    context = {"is_terms_and_conditions": True, "is_dark_navbar": True, "page": page, "policy": policy}
    return render(request, "web/refund_policy.html", context)


def cookie_policy(request):
    page = Page.objects.filter(key="cookie_policy").first()
    policy = PolicyPage.objects.filter(key="cookie_policy", is_active=True).first()
    context = {"is_terms_and_conditions": True, "is_dark_navbar": True, "page": page, "policy": policy}
    return render(request, "web/cookie_policy.html", context)
