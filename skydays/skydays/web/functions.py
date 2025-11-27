from djmoney.contrib.exchange.models import convert_money


def calculate_usd_amount(inr_amount):
    conversion_rate = convert_money(inr_amount, "USD")
    usd_amount = float(conversion_rate.amount)
    paypal_fee_percentage = 2.9  # PayPal fee percentage
    paypal_fixed_fee = 0.3  # PayPal fixed fee in USD
    deducted_amount = (
        usd_amount + (usd_amount * paypal_fee_percentage / 100) + paypal_fixed_fee
    )
    return round(deducted_amount, 2)
