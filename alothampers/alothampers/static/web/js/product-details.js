$(".cart-add-btn").click(function () {
    var product_Id = $(this).data("product-id");
    var quantity = $("input[name='quantity']").val();
    var quantity = parseInt(quantity);
    if (!quantity || "NaN") {
        quantity = 1;
    }
    console.log(product_Id, quantity);
    var url = "/shop/cart/add/?product_id=" + product_Id + "&quantity=" + quantity;
    $.ajax({
        type: "GET",
        url: url,

        success: function (data) {
            $(".header_cart_count").html(data.cart_count);
            Swal.fire({
                title: "Item Added to Cart",
                icon: "success",
                html: `<p class="mb-0">Your item has been added to the cart successfully!</p><p>What would you like to do next?</p>`,
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: `<i class="fa fa-shopping-cart"></i> View Cart`,
                confirmButtonAriaLabel: "View Cart",
                cancelButtonText: `<i class="fa fa-credit-card"></i> Checkout`,
                cancelButtonAriaLabel: "Checkout",
                timer: 5000,
                timerProgressBar: true,
            }).then((result) => {
                $("#productCount").html(data.cart_count);
                var cartItems = "";
                data.cart_items.forEach((item) => {
                    cartItems += `
                    <li>
                        <div class="cart-img">
                            <a href="${item.product_link}" class="product_link"><img src="${item.image}" alt="" class="cart_image"></a>
                        </div>
                        <div class="cart-title
                        ">
                            <h4><a href="${item.product_link}" class="cart_name">${item.name}</a></h4>
                            <span>
                                <span class="cart_price
                                ">${item.quantity}</span> ×
                                AED <span class="cart_price">${item.price}</span>
                            </span>
                        </div>
                    </li>
                    `;
                });
                $("#cartItems").html(cartItems);
                // update cart total
                $(".total").html(data.cart_total);

                if (result.isConfirmed) {
                    // Redirect to the view cart page
                    window.location.href = "/shop/cart/";
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // Redirect to the checkout page
                    window.location.href = "/checkout/";
                }
            });
        },
        error: function (data) {
            if (data.status == "401") {
                window.location.href = "/accounts/login/";
            } else {
                // Display error message with SweetAlert
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    text: data.responseJSON.message || "An error occurred while adding the item to the cart.",
                });
            }
        },
    });
});
