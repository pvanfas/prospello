from django.shortcuts import render, get_object_or_404
from django.db.models import Prefetch
from .forms import ContactForm, EnquiryForm
from .models import Category, Product, Testimonial, FeaturedProduct, Recipe


def index(request):
    featured_products = FeaturedProduct.objects.all()
    categories = Category.objects.all()
    testimonials = Testimonial.objects.all()
    context = {
        "is_index": True, 
        "categories": categories,
        "featured_products": featured_products,
        "testimonials": testimonials,
    }
    return render(request, "web/index.html", context)


def contact(request):
    context = {"is_contact": True}
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            contact_instance = form.save()
            context["success"] = True
            context["form"] = ContactForm()
        else:
            context["form"] = form
    else:
        context["form"] = ContactForm()

    return render(request, "web/contact.html", context)


def products(request):
    categories = Category.objects.all()
    featured_products = FeaturedProduct.objects.all()
    context = {"is_products": True, "categories": categories, "featured_products": featured_products}
    return render(request, "web/products.html", context)


def story(request):
    context = {"is_story": True}
    return render(request, "web/story.html", context)


def enquiries(request):
    context = {"is_enquiries": True}
    if request.method == "POST":
        form = EnquiryForm(request.POST)
        if form.is_valid():
            enquiry_instance = form.save()
            context["success"] = True
            context["form"] = EnquiryForm()
        else:
            context["form"] = form
    else:
        context["form"] = EnquiryForm()

    return render(request, "web/enquiries.html", context)


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    recipes = product.recipes.all()
    product_images = product.images.all().order_by('order')
    
    # Get related products in the same category
    related_products = Product.objects.filter(
        category=product.category
    ).exclude(id=product.id)[:4]
    
    # Process features (one per line)
    features = [f.strip() for f in (product.features or "").split('\n') if f.strip()]

    context = {
        "product": product,
        "recipes": recipes,
        "product_images": product_images,
        "related_products": related_products,
        "features": features,
    }
    return render(request, "web/product_detail.html", context)
