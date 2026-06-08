from django.urls import path

from . import views

app_name = "main"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    # sliders
    path("sliders/", views.SliderListView.as_view(), name="slider_list"),
    path("sliders/create/", views.SliderCreateView.as_view(), name="slider_create"),
    path("sliders/detail/<str:pk>/", views.SliderDetailView.as_view(), name="slider_detail"),
    path("sliders/update/<str:pk>/", views.SliderUpdateView.as_view(), name="slider_update"),
    path("sliders/delete/<str:pk>/", views.SliderDeleteView.as_view(), name="slider_delete"),
    # categories
    path("categories/", views.CategoryListView.as_view(), name="category_list"),
    path("categories/create/", views.CategoryCreateView.as_view(), name="category_create"),
    path("categories/detail/<str:pk>/", views.CategoryDetailView.as_view(), name="category_detail"),
    path("categories/update/<str:pk>/", views.CategoryUpdateView.as_view(), name="category_update"),
    path("categories/delete/<str:pk>/", views.CategoryDeleteView.as_view(), name="category_delete"),
    # recipients
    path("recipients/", views.RecipientListView.as_view(), name="recipient_list"),
    path("recipients/create/", views.RecipientCreateView.as_view(), name="recipient_create"),
    path("recipients/detail/<str:pk>/", views.RecipientDetailView.as_view(), name="recipient_detail"),
    path("recipients/update/<str:pk>/", views.RecipientUpdateView.as_view(), name="recipient_update"),
    path("recipients/delete/<str:pk>/", views.RecipientDeleteView.as_view(), name="recipient_delete"),
    # occasions
    path("occasions/", views.OccasionListView.as_view(), name="occasion_list"),
    path("occasions/create/", views.OccasionCreateView.as_view(), name="occasion_create"),
    path("occasions/detail/<str:pk>/", views.OccasionDetailView.as_view(), name="occasion_detail"),
    path("occasions/update/<str:pk>/", views.OccasionUpdateView.as_view(), name="occasion_update"),
    path("occasions/delete/<str:pk>/", views.OccasionDeleteView.as_view(), name="occasion_delete"),
    # emotions
    path("emotions/", views.EmotionListView.as_view(), name="emotion_list"),
    path("emotions/create/", views.EmotionCreateView.as_view(), name="emotion_create"),
    path("emotions/detail/<str:pk>/", views.EmotionDetailView.as_view(), name="emotion_detail"),
    path("emotions/update/<str:pk>/", views.EmotionUpdateView.as_view(), name="emotion_update"),
    path("emotions/delete/<str:pk>/", views.EmotionDeleteView.as_view(), name="emotion_delete"),
    # products
    path("products/", views.ProductListView.as_view(), name="product_list"),
    path("products/create/", views.ProductCreateView.as_view(), name="product_create"),
    path("products/detail/<str:pk>/", views.ProductDetailView.as_view(), name="product_detail"),
    path("products/update/<str:pk>/", views.ProductUpdateView.as_view(), name="product_update"),
    path("products/delete/<str:pk>/", views.ProductDeleteView.as_view(), name="product_delete"),
    # offers
    path("offers/", views.OfferListView.as_view(), name="offer_list"),
    path("offers/create/", views.OfferCreateView.as_view(), name="offer_create"),
    path("offers/detail/<str:pk>/", views.OfferDetailView.as_view(), name="offer_detail"),
    path("offers/update/<str:pk>/", views.OfferUpdateView.as_view(), name="offer_update"),
    path("offers/delete/<str:pk>/", views.OfferDeleteView.as_view(), name="offer_delete"),
    # testimonials
    path("testimonials/", views.TestimonialListView.as_view(), name="testimonial_list"),
    path("testimonials/create/", views.TestimonialCreateView.as_view(), name="testimonial_create"),
    path("testimonials/detail/<str:pk>/", views.TestimonialDetailView.as_view(), name="testimonial_detail"),
    path("testimonials/update/<str:pk>/", views.TestimonialUpdateView.as_view(), name="testimonial_update"),
    path("testimonials/delete/<str:pk>/", views.TestimonialDeleteView.as_view(), name="testimonial_delete"),
    # collections
    path("collections/", views.CollectionListView.as_view(), name="collection_list"),
    path("collections/create/", views.CollectionCreateView.as_view(), name="collection_create"),
    path("collections/detail/<str:pk>/", views.CollectionDetailView.as_view(), name="collection_detail"),
    path("collections/update/<str:pk>/", views.CollectionUpdateView.as_view(), name="collection_update"),
    path("collections/delete/<str:pk>/", views.CollectionDeleteView.as_view(), name="collection_delete"),
    # sections
    path("sections/", views.SectionListView.as_view(), name="section_list"),
    path("sections/create/", views.SectionCreateView.as_view(), name="section_create"),
    path("sections/detail/<str:pk>/", views.SectionDetailView.as_view(), name="section_detail"),
    path("sections/update/<str:pk>/", views.SectionUpdateView.as_view(), name="section_update"),
    path("sections/delete/<str:pk>/", views.SectionDeleteView.as_view(), name="section_delete"),
    # orders
    path("orders/", views.OrderListView.as_view(), name="order_list"),
    path("orders/create/", views.OrderCreateView.as_view(), name="order_create"),
    path("orders/detail/<str:pk>/", views.OrderDetailView.as_view(), name="order_detail"),
    path("orders/update/<str:pk>/", views.OrderUpdateView.as_view(), name="order_update"),
    path("orders/delete/<str:pk>/", views.OrderDeleteView.as_view(), name="order_delete"),
    # materials
    path("materials/", views.MaterialListView.as_view(), name="material_list"),
    path("materials/create/", views.MaterialCreateView.as_view(), name="material_create"),
    path("materials/detail/<str:pk>/", views.MaterialDetailView.as_view(), name="material_detail"),
    path("materials/update/<str:pk>/", views.MaterialUpdateView.as_view(), name="material_update"),
    path("materials/delete/<str:pk>/", views.MaterialDeleteView.as_view(), name="material_delete"),
    # custom orders
    path("custom-orders/", views.CustomOrderListView.as_view(), name="custom_order_list"),
    path("custom-orders/create/", views.CustomOrderCreateView.as_view(), name="custom_order_create"),
    path("custom-orders/detail/<str:pk>/", views.CustomOrderDetailView.as_view(), name="custom_order_detail"),
    path("custom-orders/update/<str:pk>/", views.CustomOrderUpdateView.as_view(), name="custom_order_update"),
    path("custom-orders/delete/<str:pk>/", views.CustomOrderDeleteView.as_view(), name="custom_order_delete"),
]
