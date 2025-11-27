from collections import defaultdict
from datetime import datetime, timedelta

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.generic import ListView
from django_tables2 import RequestConfig
from rest_framework.response import Response

from main.choices import LANGUAGE_CHOICES
from main.mixins import HybridDetailView, HybridListView, HybridUpdateView
from users.models import CustomUser as User
from users.tables import UserTable

from .forms import PreferenceApprovalForm
from .mixins import HybridTemplateView, HybridView
from .models import DeliveryAddress, ItemMaster, MealOrder, MealPlan, Preference, Subscription
from .tables import CustomerMealOrderTable, DeliveryMealOrderTable, ItemMasterTable, MealOrderDataTable, MealOrderTable, PreferenceTable, StandardMealOrderTable, StandardSubscriptionTable, SubscriptionTable
from .utils import bulk_create_orders_with_fallback

from rest_framework.views import APIView

# permissions = ("Administrator","Manager", "Manager", "KitchenManager", "Delivery", "Customer", "Accountant")


def get_week_of_month():
    today = timezone.localdate()
    day_of_month = today.day
    week_number = (day_of_month - 1) // 7 + 1
    return week_number


def get_day_name():
    today = timezone.localdate()
    day_name = today.strftime("%A")
    return day_name


def get_week_value(n):
    return 2 if n % 2 == 0 else 1


class DashboardView(HybridListView):
    template_name = "app/main/home.html"
    permissions = ("Administrator", "Manager", "KitchenManager", "Delivery", "Customer", "Accountant")
    model = MealOrder
    context_object_name = "orders"

    def get_table_class(self):
        if self.request.user.usertype == "KitchenManager":
            return StandardMealOrderTable
        elif self.request.user.usertype == "Delivery":
            return DeliveryMealOrderTable
        elif self.request.user.usertype == "Customer":
            return CustomerMealOrderTable
        return MealOrderTable

    def get_queryset(self):
        if self.request.user.usertype == "Customer":
            return MealOrder.objects.filter(date=datetime.today(), user=self.request.user, is_active=True)
        elif self.request.user.usertype == "Delivery":
            return MealOrder.objects.filter(date=datetime.today(), is_active=True)
        else:
            return MealOrder.objects.filter(date=datetime.today(), is_active=True)

    def get_context_data(self, **kwargs):
        from users.models import CustomUser  # Import your user model

        context = super().get_context_data(**kwargs)

        # Existing meal order data
        qs = self.get_queryset().values("item__mealtype", "item__name").annotate(total_quantity=Sum("quantity"))
        data = defaultdict(list)
        for entry in qs:
            mealtype = entry["item__mealtype"]
            item_name = entry["item__name"]
            total_quantity = entry["total_quantity"]
            data[mealtype].append((item_name, total_quantity))
        context["datas"] = dict(data)

        # Add preference data
        preferences = Preference.objects.filter(session_id=self.request.session.session_key).values("id", "first_name", "last_name", "start_date", "status", "mobile")
        context["preferences"] = preferences
        # Add data for the approval modal
        # context["areas"] = Area.objects.filter(is_active=True).order_by('name')
        context["delivery_staff"] = CustomUser.objects.filter(usertype="Delivery", is_active=True).order_by("first_name", "last_name")
        return context


class TomorrowOrdersView(HybridListView):
    template_name = "app/main/home.html"
    permissions = ("Administrator", "Manager", "KitchenManager", "Delivery", "Customer", "Accountant")
    model = MealOrder
    table_class = MealOrderTable
    context_object_name = "orders"
    title = "Tomorrow's Orders"

    def get_queryset(self):
        if self.request.user.usertype == "Customer":
            return MealOrder.objects.filter(date=datetime.today() + timezone.timedelta(days=1), user=self.request.user, is_active=True)
        else:
            return MealOrder.objects.filter(date=datetime.today() + timezone.timedelta(days=1), is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset().values("item__mealtype", "item__name").annotate(total_quantity=Sum("quantity"))
        data = defaultdict(list)
        for entry in qs:
            mealtype = entry["item__mealtype"]
            item_name = entry["item__name"]
            total_quantity = entry["total_quantity"]
            data[mealtype].append((item_name, total_quantity))
        context["datas"] = dict(data)
        return context


class MealOrderListView(HybridListView):
    permissions = ("Administrator", "Manager", "Accountant")
    model = MealOrder
    title = "Order Master"
    table_class = MealOrderTable
    filterset_fields = ("item", "subscription_plan", "date", "status")

    def get_queryset(self):
        return MealOrder.objects.filter(is_active=True)


class MealOrderDetailView(HybridDetailView):
    model = MealOrder
    permissions = ("Administrator", "Manager", "Accountant")


class MealOrderListData(HybridListView):
    model = MealOrder
    permissions = ("Administrator", "Manager", "Accountant")
    title = "Order Master Excel"
    table_class = MealOrderDataTable
    template_name = "app/main/mealorder_list_data.html"

    def get_queryset(self):
        return MealOrder.objects.filter(is_active=True)


class ItemMasterListView(HybridListView):
    filterset_fields = ("mealtype", "is_veg")
    search_fields = ("name",)
    permissions = ("Administrator", "Manager", "Accountant", "KitchenManager")
    model = ItemMaster
    title = "Item Master"
    table_class = ItemMasterTable


class ItemMasterDetailView(HybridDetailView):
    model = ItemMaster
    permissions = ("Administrator", "Manager", "Accountant", "KitchenManager")


class CustomerListView(HybridListView):
    filterset_fields = ("username", "email")
    search_fields = ("username", "email", "mobile")
    permissions = ("Administrator", "Manager")
    model = User
    title = "Customers"
    table_class = UserTable

    def get_queryset(self):
        return User.objects.filter(usertype="Customer", is_active=True)


class CustomerDetailView(HybridDetailView):
    model = User
    permissions = ("Administrator", "Manager")


class PreferenceRequestListView(HybridListView):
    metadata = {"expand": "newpage"}
    model = Preference
    permissions = ("Administrator", "Manager")
    title = "Subscription Requests"
    table_class = PreferenceTable
    filterset_fields = ("first_name", "start_date", "status")
    template_name = "app/main/subscriptionrequest_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["all_requests_count"] = self.get_queryset().count()
        context["pending_requests_count"] = self.get_queryset().filter(status="PENDING").count()
        context["approved_requests_count"] = self.get_queryset().filter(status="APPROVED").count()
        context["rejected_requests_count"] = self.get_queryset().filter(status="REJECTED").count()
        context["delivery_staff"] = User.objects.filter(usertype="Delivery", is_active=True).order_by("first_name", "last_name")
        return context

    def get_queryset(self):
        return super().get_queryset().filter(completed_at__isnull=False, is_active=True)


class PreferenceRequestDetailView(HybridDetailView):
    model = Preference
    permissions = ("Administrator", "Manager")
    template_name = "app/main/request_detail.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = PreferenceApprovalForm(self.request.POST or None, instance=self.object)
        return context

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        form = PreferenceApprovalForm(request.POST, instance=instance)
        subscription, _ = Subscription.objects.get_or_create(
            request=instance,
            user=instance.user,
            plan=instance.plan,
            start_date=instance.start_date,
            end_date=instance.start_date + timezone.timedelta(days=instance.plan.validity),
        )
        instance.status = "APPROVED"
        instance.save()
        if form.is_valid():
            form.save()
            return redirect("main:subscriptionrequest_list")
        return self.get(request, *args, **kwargs)


class PreferenceRequestUpdateView(HybridUpdateView):
    model = Preference
    permissions = ("Administrator", "Manager", "Customer")
    exclude = ("status", "is_active", "user")

    # def get_form_class(self):
    #     if self.request.user.usertype == "Customer":
    #         return PreferenceAddressForm
    #     return super().get_form_class()

    def get_template_names(self):
        if self.request.user.usertype == "Customer":
            return "web/select_address.html"
        return super().get_template_names()

    def get_success_url(self):
        if self.request.user.usertype == "Customer":
            return reverse("main:subscription_list")
        return reverse("main:subscriptionrequest_list")


class PreferenceApproveView(HybridDetailView):
    model = Preference
    permissions = ("Administrator", "Manager")

    # def get(self, request, *args, **kwargs):
    #     data = self.get_object()
    #     subscription, _ = Subscription.objects.get_or_create(
    #         request=data,
    #         user=data.user,
    #         plan=data.plan,
    #         start_date=data.start_date,
    #         end_date=data.start_date + timezone.timedelta(days=data.plan.validity),
    #     )
    #     data.status = "APPROVED"
    #     data.save()
    #     return redirect("main:subscription_detail", pk=subscription.pk)


class PreferenceRejectView(HybridDetailView):
    model = Preference
    permissions = ("Administrator", "Manager")

    def get(self, request, *args, **kwargs):
        data = self.get_object()
        data.status = "REJECTED"
        data.save()
        return redirect("main:subscriptionrequest_detail", pk=data.pk)


class PreferencePrintView(HybridDetailView):
    model = Preference
    permissions = ("Administrator", "Manager")
    template_name = "app/main/request_print.html"


class SubscriptionListView(HybridListView):
    model = Subscription
    filterset_fields = ("user", "plan", "start_date", "end_date")
    search_fields = ("user",)
    permissions = ("Administrator", "Manager", "Customer")
    table_class = SubscriptionTable

    def get_queryset(self):
        if self.request.user.usertype == "Customer":
            return Subscription.objects.filter(user=self.request.user)
        return Subscription.objects.filter(is_active=True)

    def get_table_class(self):
        if self.request.user.usertype == "Customer":
            return StandardSubscriptionTable
        return SubscriptionTable


class SubscriptionDetailView(HybridDetailView):
    model = Subscription
    permissions = ("Administrator", "Manager", "Customer")


class HelpView(HybridTemplateView):
    template_name = "app/main/help.html"
    permissions = ("Administrator", "Manager", "KitchenManager", "Delivery", "Customer")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class HistoryDetailView(HybridDetailView):
    model = MealOrder
    permissions = ("Customer",)


class HistoryView(HybridListView):
    template_name = "app/main/history.html"
    model = MealOrder
    filterset_fields = ()
    table_class = MealOrderTable
    search_fields = ("item__name",)
    permissions = ("Customer",)

    def get_queryset(self):
        return MealOrder.objects.filter(user=self.request.user, is_active=True, date__lt=datetime.today())


class DonateMealOrderView(HybridView):
    model = MealOrder
    permissions = ("Customer",)

    def get_object(self):
        return self.model.objects.get(pk=self.kwargs["pk"])

    def get(self, request, *args, **kwargs):
        order = self.get_object()
        order.is_donated = True
        order.save()
        return redirect("main:dashboard_view")


class UpdateMealOrderStatusView(HybridView):
    model = MealOrder
    permissions = ("Delivery",)

    def get_object(self):
        return self.model.objects.get(pk=self.kwargs["pk"])

    def post(self, request, *args, **kwargs):
        order = self.get_object()
        delivery_status = request.POST.get("delivery_status")
        order.status = delivery_status
        order.save()
        return redirect("main:dashboard_view")


class ChangeMenuView(HybridListView):
    model = MealOrder
    permissions = ("Administrator", "Manager", "KitchenManager")
    table_class = MealOrderTable

    def get_queryset(self):
        return MealOrder.objects.filter(date=datetime.today(), is_active=True)


def edit_preference(request, pk):
    # Optimize: Use select_related to reduce database queries
    preference = get_object_or_404(
        Preference.objects.select_related(
            'subscription_subplan__plan',
            'breakfast_address',
            'tiffin_lunch_address', 
            'lunch_address',
            'dinner_address'
        ), 
        pk=pk
    )

    if request.method == "POST":
        try:
            # Update basic fields
            preference.first_name = request.POST.get("first_name", "")
            preference.last_name = request.POST.get("last_name", "")
            preference.email = request.POST.get("email", "")
            preference.preferred_language = request.POST.get("preferred_language", "")
            preference.mobile = request.POST.get("mobile", "")
            preference.alternate_mobile = request.POST.get("alternate_mobile", "")
            preference.whatsapp_number = request.POST.get("whatsapp_number", "")
            preference.notes = request.POST.get("notes", "")
            preference.remarks = request.POST.get("remarks", "")

            # Handle start_date
            start_date = request.POST.get("start_date")
            if start_date:
                try:
                    preference.start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                except ValueError:
                    messages.error(request, "Invalid date format. Please use YYYY-MM-DD format.")
                    return redirect("main:edit-preference", pk=preference.pk)

            # Optimize: Batch address validation and update
            if preference.subscription_subplan:
                available_mealtypes = preference.subscription_subplan.available_mealtypes
                
                # Get all delivery addresses for this preference in one query
                delivery_addresses = {
                    addr.id: addr for addr in 
                    DeliveryAddress.objects.filter(preference=preference)
                }
                
                # Define meal type to address field mapping
                mealtype_to_field = {
                    "BREAKFAST": "breakfast_address",
                    "TIFFIN_LUNCH": "tiffin_lunch_address", 
                    "LUNCH": "lunch_address",
                    "DINNER": "dinner_address"
                }
                
                # Process each available meal type
                for mealtype in available_mealtypes:
                    if mealtype in mealtype_to_field:
                        field_name = mealtype_to_field[mealtype]
                        address_id = request.POST.get(f"{mealtype.lower()}_address")
                        
                        if address_id:
                            try:
                                address_id = int(address_id)
                                if address_id in delivery_addresses:
                                    setattr(preference, field_name, delivery_addresses[address_id])
                                else:
                                    messages.error(request, f"Invalid {mealtype.lower()} address selected.")
                                    return redirect("main:edit-preference", pk=preference.pk)
                            except (ValueError, TypeError):
                                messages.error(request, f"Invalid {mealtype.lower()} address selected.")
                                return redirect("main:edit-preference", pk=preference.pk)
                        else:
                            setattr(preference, field_name, None)

            preference.save()

            # Add success message
            messages.success(request, "Preference updated successfully!")

            # Redirect after successful update
            return redirect("main:subscriptionrequest_detail", pk=preference.pk)

        except Exception as e:
            messages.error(request, f"An error occurred while updating the preference: {str(e)}")
            return redirect("main:edit-preference", pk=preference.pk)

    # Optimize: Get all required data in fewer queries
    available_mealtypes = []
    subscription_subplan = preference.subscription_subplan
    subscription_start_date = preference.start_date
    subscription_end_date = None
    subscription_plan_price = 0
    preference_end_date = preference.end_date

    if subscription_subplan:
        available_mealtypes = subscription_subplan.available_mealtypes
        subscription_end_date = subscription_start_date + timezone.timedelta(days=subscription_subplan.plan.validity-1)
        subscription_plan_price = subscription_subplan.plan_price

    # Optimize: Calculate meal data more efficiently
    def calculate_meal_data():
        """Calculate meal-related data efficiently"""
        if not available_mealtypes or not subscription_start_date or not subscription_end_date:
            return {
                "meals_per_day": {},
                "total_meals_for_subscription": 0,
                "no_meals_user_selected": 0,
                "meal_per_rate": 0,
                "meal_details": []
            }
        
        # Pre-calculate meal fields for each day and meal type
        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        available_mealtypes_list = list(available_mealtypes)
        meals_per_day = {day: 0 for day in day_names}
        meal_counts = {}
        
        # Single pass to calculate meals per day and meal counts
        for day in day_names:
            for mealtype in available_mealtypes_list:
                mealtype_field = mealtype.lower().replace(' ', '_')
                meal_field = getattr(preference, f"{day}_{mealtype_field}", None)
                
                if meal_field:
                    meals_per_day[day] += 1
                    
                    # Track meal details for user's selected period
                    if preference_end_date and preference.start_date:
                        current_date = preference.start_date
                        while current_date <= preference_end_date:
                            day_of_week = current_date.weekday()
                            if day_names[day_of_week] == day:
                                meal_key = f"{day}_{mealtype_field}"
                                meal_name = str(meal_field.menu_item) if meal_field.menu_item else ""
                                
                                if meal_key not in meal_counts:
                                    meal_counts[meal_key] = {
                                        'meal_name': meal_name,
                                        'day': day.title(),
                                        'meal_type': mealtype,
                                        'count': 0
                                    }
                                meal_counts[meal_key]['count'] += 1
                            current_date += timezone.timedelta(days=1)
        
        # Calculate totals efficiently
        total_meals_for_subscription = 0
        current_date = subscription_start_date
        while current_date <= subscription_end_date:
            day_of_week = current_date.weekday()
            day_name = day_names[day_of_week]
            total_meals_for_subscription += meals_per_day[day_name]
            current_date += timezone.timedelta(days=1)
        
        # Calculate user selected meals
        no_meals_user_selected = 0
        if preference_end_date:
            current_date = subscription_start_date
            while current_date <= preference_end_date:
                day_of_week = current_date.weekday()
                day_name = day_names[day_of_week]
                no_meals_user_selected += meals_per_day[day_name]
                current_date += timezone.timedelta(days=1)
        
        meal_per_rate = subscription_plan_price / total_meals_for_subscription if total_meals_for_subscription > 0 else 0
        
        return {
            "meals_per_day": meals_per_day,
            "total_meals_for_subscription": total_meals_for_subscription,
            "no_meals_user_selected": no_meals_user_selected,
            "meal_per_rate": meal_per_rate,
            "meal_details": list(meal_counts.values())
        }
    
    # Calculate meal data
    meal_data = calculate_meal_data()
    
    # Calculate pricing
    total_price_user_selected = meal_data["no_meals_user_selected"] * meal_data["meal_per_rate"]
    savings = subscription_plan_price - total_price_user_selected
    
    price_data = {
        "plan_price": subscription_plan_price,
        "no_of_meals_in_subscription": meal_data["total_meals_for_subscription"],
        "meal_price": meal_data["meal_per_rate"],
        "meal_total": meal_data["no_meals_user_selected"],
        "total_price": total_price_user_selected,
        "savings": savings,
        "meal_details": meal_data["meal_details"],
    }
    
    # Optimize: Use select_related for delivery addresses and meal plans
    context = {
        "preference": preference,
        "languages": LANGUAGE_CHOICES,
        "delivery_addresses": DeliveryAddress.objects.filter(preference=preference),
        "meal_plans": MealPlan.objects.filter(is_active=True).select_related("meal_category", "menu_item"),
        "available_mealtypes": available_mealtypes,
        "price_data": price_data,
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }

    return render(request, "app/main/edit_preference.html", context)


def approve_preference(request, pk):
    """
    Approves a preference, updates it with modal data, creates the corresponding
    Subscription, and bulk-creates all meal orders for the subscription period.
    """
    preference = get_object_or_404(Preference, pk=pk)
    User = get_user_model()

    # 1. Basic validation before processing
    if preference.status == "APPROVED":
        messages.warning(request, "This preference has already been approved.")
        return redirect("main:dashboard_view")

    if not preference.start_date or not preference.subscription_subplan:
        messages.error(request, "Cannot approve: Start Date and Sub-Plan are required.")
        return redirect("main:dashboard_view")

    # 2. Extract and validate data from the modal form submission
    try:
        delivery_staff_id = request.POST.get("delivery_staff")
        meal_fee = request.POST.get("meal_fee", "0.00")
        no_of_meals = request.POST.get("no_of_meals", "0")

        if not delivery_staff_id:
            messages.error(request, "Delivery staff is a required field.")
            return redirect("main:dashboard_view")

        # Ensure the delivery staff user exists and is valid
        delivery_staff = User.objects.get(id=delivery_staff_id, usertype="Delivery")

    except User.DoesNotExist:
        messages.error(request, "The selected delivery staff is not valid.")
        return redirect("main:dashboard_view")
    except (ValueError, TypeError) as e:
        messages.error(request, f"Invalid data submitted in the form: {e}")
        return redirect("main.dashboard_view")

    # 3. Perform all database operations in a single transaction
    try:
        with transaction.atomic():
            # Step A: Update the existing Preference object with approval details
            preference.status = "APPROVED"
            preference.approved_at = timezone.now()
            preference.completed_at = timezone.now()  # or handle completion separately
            preference.delivery_staff = delivery_staff
            preference.meal_fee = meal_fee
            preference.no_of_meals = no_of_meals
            preference.save()

            # Step B: Create the official Subscription, linking it to the approved preference
            subscription = Subscription.objects.create(request=preference, plan=preference.subscription_subplan.plan, start_date=preference.start_date)

            # Step C: Use your existing helper to create all meal orders
            orders_created = bulk_create_orders_with_fallback(preference, subscription)

        messages.success(request, f"Preference approved! {orders_created} meal orders have been successfully created.")

    except Exception as e:
        # If anything goes wrong, the transaction will be rolled back.
        print(e)
        messages.error(request, f"An unexpected error occurred during approval: {e}")

    return redirect("main:dashboard_view")


class MealOrderByPreferenceView(ListView):
    model = MealOrder
    template_name = "app/main/mealorder_list_data.html"
    context_object_name = "meal_orders"

    def get_queryset(self):
        preference = get_object_or_404(Preference, pk=self.kwargs["preference_id"])
        return MealOrder.objects.filter(
            subscription__request=preference,
            is_active=True,
        ).order_by("id")

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        # build the table without pagination
        table = MealOrderDataTable(self.get_queryset(), request=self.request)
        RequestConfig(self.request, paginate=False).configure(table)
        ctx["table"] = table
        return ctx
    

class ApproveModalRequestView(APIView):

    def get(self, request, pref_id):
        preference = get_object_or_404(
            Preference.objects.select_related(
                'subscription_subplan__plan',
                'breakfast_address',
                'tiffin_lunch_address', 
                'lunch_address',
                'dinner_address'
            ), 
            pk=pref_id
        )
        
        # Calculate meal data and payment information
        payment_data, selected_meals = self.calculate_preference_data(preference)
        
        response_data = {
            'preference_id': preference.pk,
            
            'subscription_info': {
                'plan_name': preference.subscription_subplan.plan.meal_category.name if preference.subscription_subplan and preference.subscription_subplan.plan.meal_category else None,
                'start_date': preference.start_date,
                'end_date': preference.end_date,
                'subscription_end_date': payment_data.get('subscription_end_date'),
                'meal_types': preference.subscription_subplan.available_mealtypes if preference.subscription_subplan else None,
            },
            'payment_data': payment_data,
            'selected_meals': selected_meals
        }
        
        return Response(response_data)
    
    def calculate_preference_data(self, preference):
        """Calculate payment data and selected meals for the preference"""
        
        # Initialize default values
        payment_data = {
            'plan_price': 0,
            'total_meals_in_subscription': 0,
            'meal_per_rate': 0,
            'user_selected_meals_count': 0,
            'total_price_user_selected': 0,
            'savings': 0,
            'subscription_end_date': None
        }
        
        selected_meals = []
        
        # Get subscription details
        subscription_subplan = preference.subscription_subplan
        subscription_start_date = preference.start_date
        preference_end_date = preference.end_date
        
        if not (subscription_subplan and subscription_start_date):
            return payment_data, selected_meals
        
        # Calculate subscription end date and plan price
        subscription_end_date = subscription_start_date + timedelta(days=subscription_subplan.plan.validity-1)
        subscription_plan_price = subscription_subplan.plan_price
        available_mealtypes = subscription_subplan.available_mealtypes
        
        payment_data.update({
            'plan_price': subscription_plan_price,
            'subscription_end_date': subscription_end_date
        })
        
        if not available_mealtypes:
            return payment_data, selected_meals
        
        # Calculate meal data
        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        available_mealtypes_list = list(available_mealtypes)
        meals_per_day = {day: 0 for day in day_names}
        meal_details = {}
        
        # Calculate meals per day and collect selected meals
        for day in day_names:
            for mealtype in available_mealtypes_list:
                mealtype_field = mealtype.lower().replace(' ', '_')
                meal_field = getattr(preference, f"{day}_{mealtype_field}", None)
                
                if meal_field:
                    meals_per_day[day] += 1
                    
                    # Collect selected meals for user's selected period
                    if preference_end_date:
                        current_date = subscription_start_date
                        while current_date <= preference_end_date:
                            day_of_week = current_date.weekday()
                            if day_names[day_of_week] == day:
                                meal_key = f"{day}_{mealtype_field}"
                                
                                if meal_key not in meal_details:
                                    meal_details[meal_key] = {
                                        'meal_name': str(meal_field.menu_item) if meal_field.menu_item else "",
                                        'day': day.title(),
                                        'meal_type': mealtype,
                                        'count': 0,
                                        'dates': []
                                    }
                                
                                meal_details[meal_key]['count'] += 1
                                meal_details[meal_key]['dates'].append(current_date.strftime('%Y-%m-%d'))
                            
                            current_date += timedelta(days=1)
        
        # Calculate total meals for entire subscription
        total_meals_for_subscription = 0
        current_date = subscription_start_date
        while current_date <= subscription_end_date:
            day_of_week = current_date.weekday()
            day_name = day_names[day_of_week]
            total_meals_for_subscription += meals_per_day[day_name]
            current_date += timedelta(days=1)
        
        # Calculate user selected meals count
        user_selected_meals_count = 0
        if preference_end_date:
            current_date = subscription_start_date
            while current_date <= preference_end_date:
                day_of_week = current_date.weekday()
                day_name = day_names[day_of_week]
                user_selected_meals_count += meals_per_day[day_name]
                current_date += timedelta(days=1)
        
        # Calculate pricing
        meal_per_rate = subscription_plan_price / total_meals_for_subscription if total_meals_for_subscription > 0 else 0
        total_price_user_selected = user_selected_meals_count * meal_per_rate
        savings = subscription_plan_price - total_price_user_selected
        
        # Update payment data
        payment_data.update({
            'total_meals_in_subscription': total_meals_for_subscription,
            'meal_per_rate': round(meal_per_rate, 2),
            'user_selected_meals_count': user_selected_meals_count,
            'total_price_user_selected': round(total_price_user_selected, 2),
            'savings': round(savings, 2)
        })
        
        # Format selected meals
        selected_meals = [
            {
                'meal_name': details['meal_name'],
                'day': details['day'],
                'meal_type': details['meal_type'],
                'count': details['count'],
                'delivery_dates': details['dates']
            }
            for details in meal_details.values()
        ]
        
        return payment_data, selected_meals
