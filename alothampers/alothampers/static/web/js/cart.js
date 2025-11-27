
$(document).ready(function () {
    // add cart ajax
    $(".quantity-plusing").click(function () {
        var product_Id = $(this).data("product-id");
        var product_price = $("#product-price" + product_Id);
        var product_qty = $("#product-qty" + product_Id);
        var url = "/shop/cart/add/?product_id=" + product_Id;
        var total = $(".cart_total");

        $.ajax({
            type: "GET",
            url: url,

            success: function (data) {
                product_qty.val(data.quantity);
                product_price.html(data.total_price.toFixed(2));
                total.html(data.cart_total.toFixed(2));
            },
            error: function (data) {
                // Display error message
                alert("Error")
            }
        });
    });
    $(".quantity-minusing").click(function () {
        var cartId = $(this).data("cart-id");
        var product_id = $(this).data("product-id");
        var product_price = $("#product-price" + product_id);
        var product_qty = $("#product-qty" + product_id);
        var url = "/shop/cart/minus/?cart_id=" + cartId;
        var total = $(".cart_total");

        $.ajax({
            type: "GET",
            url: url,

            success: function (data) {
                product_qty.val(data.quantity);
                product_price.html(data.total_price);
                total.html(data.cart_total);
                if (data.quantity == '1') { window.location.reload() }
            },
            error: function (data) {
                // Display error message
                console.log("Error")
            }
        });
    });

});