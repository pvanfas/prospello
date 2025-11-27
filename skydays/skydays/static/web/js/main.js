(function ($) {
    "use strict";
    jQuery(window).on("load", function () {
        // $(".preloader").delay(1600).fadeOut("slow");
    });
    new WOW({ boxClass: "wow", animateClass: "animated", offset: 0, mobile: true, live: true }).init();
    $(".check-in").datepicker({ dateFormat: "d MM yy", duration: "medium" });
    $(".check-out").datepicker({ dateFormat: "d MM yy", duration: "medium" });
    $(".ticket-book").datepicker({ dateFormat: "d MM yy", duration: "medium" });
    $(".main-gallary").magnificPopup({ type: "image", gallery: { enabled: true } });
    $(".video-icon").magnificPopup({
        type: "iframe",
        iframe: {
            markup: '<div class="mfp-iframe-scaler">' + '<div class="mfp-close"></div>' + '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' + "</div>",
            patterns: {
                youtube: { index: "youtube.com/", id: "v=", src: "//www.youtube.com/embed/%id%?autoplay=1" },
                vimeo: { index: "vimeo.com/", id: "/", src: "//player.vimeo.com/video/%id%?autoplay=1" },
                gmaps: { index: "//maps.google.", src: "%id%&output=embed" },
            },
            srcAction: "iframe_src",
        },
    });
    var x, i, j, l, ll, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function (e) {
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
    function closeAllSelect(elmnt) {
        var x,
            y,
            i,
            xl,
            yl,
            arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i);
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    document.addEventListener("click", closeAllSelect);
    $(".hamburger").on("click", function (event) {
        $(this).toggleClass("h-active");
        $(".main-nav").toggleClass("slidenav");
    });
    $(".header-home .main-nav ul li  a").on("click", function (event) {
        $(".hamburger").removeClass("h-active");
        $(".main-nav").removeClass("slidenav");
    });

    var accountCard = document.querySelectorAll(".account-dropdown");
    var userIcon = document.querySelectorAll(".user-dropdown-icon i");
    userIcon.forEach((el) => {
        el.addEventListener("click", () => {
            accountCard.forEach((element) => {
                element.classList.toggle("activeCard");
            });
        });
    });
    var searchOpen = document.querySelectorAll(".searchbar-open i");
    var searchCard = document.querySelectorAll(".main-searchbar");
    var searchClose = document.querySelectorAll(".searchbar-close i");
    searchOpen.forEach((el) => {
        el.addEventListener("click", () => {
            searchCard.forEach((el) => {
                el.classList.add("activeSearch");
            });
        });
    });
    searchClose.forEach((el) => {
        el.addEventListener("click", () => {
            searchCard.forEach((el) => {
                el.classList.remove("activeSearch");
            });
        });
    });
    window.onclick = function (event) {
        searchCard.forEach((el) => {
            if (event.target == el) {
                el.classList.remove("activeSearch");
            }
        });
        if (!event.target.matches(".user-dropdown-icon i")) {
            accountCard.forEach((element) => {
                if (element.classList.contains("activeCard")) {
                    element.classList.remove("activeCard");
                }
            });
        }
    };
    $(window).on("scroll", function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 10) {
            $(".header-area").addClass("sticky");
        } else {
            $(".header-area").removeClass("sticky");
        }
    });

    $(".banner-slider").owlCarousel({
        items: 1,
        loop: true,
        margin: 0,
        smartSpeed: 700,
        dots: false,
        nav: true,
        autoplay: 4000,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        animateIn: "fadeIn",
        animateOut: "fadeOut",
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 600: { items: 1 }, 1000: { items: 1, nav: true, loop: true } },
    });

    $(".destination_slider").owlCarousel({
        stagePadding: 1,
        items: 4,
        loop: true,
        margin: 20,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: false,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 2, nav: false, dots: false }, 800: { items: 3 }, 1000: { items: 4, nav: true, loop: true } },
    });
    $(".gallery_slider").owlCarousel({
        stagePadding: 1,
        items: 6,
        loop: true,
        margin: 20,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: false,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 2, nav: false, dots: false }, 800: { items: 3 }, 1000: { items: 4, nav: true, loop: true }, 1200: { items: 6, nav: true, loop: true } },

    });

    $(".video_slider").owlCarousel({
        stagePadding: 1,
        items: 3,
        loop: true,
        center: true,
        margin: 20,
        smartSpeed: 1500,
        autoplay: true,
        dots: false,
        nav: false,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 600: { items: 2 }, 1000: { items: 3, nav: true, loop: true } },
    });

    $(".review-slider").owlCarousel({
        stagePadding: 10,
        items: 3,
        loop: true,
        margin: 15,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: true,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 800: { items: 3, nav: false, dots: false }, 1000: { items: 3, dots: true, nav: false, loop: true } },
    });

    $(".feature-slider").owlCarousel({
        items: 2,
        loop: true,
        margin: 30,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: true,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 600: { items: 1, nav: false, dots: false }, 1000: { items: 2, dots: false, nav: false, loop: true } },
    });

    $(".offer-slider").owlCarousel({
        stagePadding: 1,
        items: 3,
        loop: true,
        margin: 25,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: true,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 600: { items: 2, nav: false, dots: false }, 1000: { items: 3, dots: false, nav: false, loop: true } },
    });

    $(".feature-slider-2").owlCarousel({
        items: 3,
        loop: true,
        margin: 25,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: true,
        animateOut: "slideOutUp",
        animateIn: "slideInUp",
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 800: { items: 2, nav: false, dots: false }, 1000: { items: 3, dots: false, nav: true, loop: true } },
    });

    $(".guide-slider").owlCarousel({
        items: 3,
        loop: true,
        margin: 25,
        smartSpeed: 1500,
        autoplay: false,
        dots: false,
        nav: true,
        navText: ["<i class='icon-leftx' ></i>", "<i class='icon-rightx'></i>"],
        responsive: { 0: { items: 1, nav: false, dots: false }, 600: { items: 2, nav: false, dots: false }, 1000: { items: 3, dots: false, nav: true, loop: true } },
    });

    var element = $(".element");
    $(function () {
        element.typed({ strings: ["Hampshire", "Indonesia", "Madagascar "], typeSpeed: 190, loop: true });
    });



    // if page has input type="number", append `<span class="minus">-</span>` and `<span class="plus">+</span>` before and after input
    $('input[type="number"]').each(function () {
        var $input = $(this);
        $input.before('<span class="minus"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-minus"><path d="M5 12h14"/></svg></span>');
        $input.after('<span class="plus"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-plus"><path d="M12 5v14M5 12h14"/></svg></span>');
    });

    $('.minus').click(function () {
        var $input = $(this).parent().find('input');
        var min = parseInt($input.attr('min')); // Minimum value constraint
        var count = parseInt($input.val()) - 1;
        count = count < min ? min : count; // Ensure count doesn't go below min
        $input.val(count);
        return false;
    });
    
    $('.plus').click(function () {
        var $input = $(this).parent().find('input');
        var max = parseInt($input.attr('max')); // Maximum value constraint
        $input.val(parseInt($input.val()) + 1);
        var count = parseInt($input.val());
        count = count > max ? max : count; // Ensure count doesn't exceed max
        $input.val(count);
        return false;
    });
    

    $(function () {
        $('.datepicker').not('.dob').datepicker({
            startDate: '2d',
            format: 'dd/mm/yyyy',
            autoclose: true,
        });
        $('.datepicker.dob').datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
        });
    });
    


})(jQuery);
