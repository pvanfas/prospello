$(document).ready(function() {
    $('.owl-carousel').owlCarousel({
        loop: true,
        nav: false,
        autoplay:true,
        autoplayTimeout:800,
        autoplayHoverPause:true,
        margin: 0,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            600: {
                items: 3,
            },
            1000: {
                items: 5,
            }
        }
    })
});
