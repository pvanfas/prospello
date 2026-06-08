from django.test import TestCase
from django.urls import reverse

class ProductsPageFeaturedProductsTests(TestCase):
    def test_products_page_includes_featured_products_in_context(self):
        response = self.client.get(reverse("web:products"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("featured_products", response.context)

    def test_products_page_shows_fallback_when_no_featured_products(self):
        response = self.client.get(reverse("web:products"))

        self.assertContains(response, "Featured products coming soon.")
