(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        if (all) {
            select(el, all).forEach(e => e.addEventListener(type, listener))
        } else {
            select(el, all).addEventListener(type, listener)
        }
    }

    /**
     * Easy on scroll event listener
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true)
    const navbarlinksActive = () => {
        let position = window.scrollY + 200
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return
            let section = select(navbarlink.hash)
            if (!section) return
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active')
            } else {
                navbarlink.classList.remove('active')
            }
        })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
     * Scrolls to an element with header offset
     */
    const scrollto = (el) => {
        let header = select('#header')
        let offset = header.offsetHeight

        if (!header.classList.contains('header-scrolled')) {
            offset -= 10
        }

        let elementPos = select(el).offsetTop
        window.scrollTo({
            top: elementPos - offset,
            behavior: 'smooth'
        })
    }

    /**
     * Toggle .header-scrolled class to #header when page is scrolled
     */
    let selectHeader = select('#header')
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add('header-scrolled')
            } else {
                selectHeader.classList.remove('header-scrolled')
            }
        }
        window.addEventListener('load', headerScrolled)
        onscroll(document, headerScrolled)
    }

    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
    }

    /**
     * Mobile nav toggle
     */
    on('click', '.mobile-nav-toggle', function(e) {
        select('#navbar').classList.toggle('navbar-mobile')
        $('#navbar ul').toggle()
        this.classList.toggle('bi-list')
        this.classList.toggle('bi-x')
    })

    /**
     * Mobile nav dropdowns activate
     */
    on('click', '.navbar .dropdown > a', function(e) {
        if (select('#navbar').classList.contains('navbar-mobile')) {
            e.preventDefault()
            this.nextElementSibling.classList.toggle('dropdown-active')
        }
    }, true)


    new Swiper('.hero-slider', {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1200: {
                slidesPerView: 1,
            }
        }
    });

    /**
     * Clients Slider
     */
    new Swiper('.clients-slider', {
        speed: 400,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            320: {
                slidesPerView: 2,
                spaceBetween: 40
            },
            480: {
                slidesPerView: 3,
                spaceBetween: 60
            },
            640: {
                slidesPerView: 4,
                spaceBetween: 80
            },
            992: {
                slidesPerView: 6,
                spaceBetween: 120
            }
        }
    });

    /**
     * Testimonials slider
     */
    new Swiper('.testimonials-slider', {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 40
            },

            1200: {
                slidesPerView: 1,
            }
        }
    });

    $("select.form-control").change(function(e){
         $("select span").html($("select.form-control").val());
    });

    $(document).on('submit', 'form.ajax', function(e) {
        e.preventDefault();
        var $this = $(this);
        var data = new FormData(this);
        var action_url = $this.attr('action');
        var reset = $this.hasClass('reset');
        var reload = $this.hasClass('reload');
        var redirect = $this.hasClass('redirect');
        var redirect_url = $this.attr('data-redirect');

        $.ajax({
            url: action_url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",

            success: function(data) {

                var status = data.status;
                var title = data.title;
                var message = data.message;
                var pk = data.pk;

                if (status == "true") {
                    if (title) {
                        title = title;
                    } else {
                        title = "Success";
                    }

                    Swal.fire({
                        title: title,
                        html: message,
                        icon: 'success',
                    }).then(function() {
                        if (redirect) {
                            window.location.href = redirect_url;
                        }
                        if (reload) {
                            window.location.reload();
                        }
                        if (reset) {
                            window.location.reset();
                        }
                    });

                } else {
                    if (title) {
                        title = title;
                    } else {
                        title = "An Error Occurred";
                    }
                    Swal.fire({
                        title: title,
                        html: message,
                        icon: "error"
                    });

                }
            },
            error: function(data) {
                var title = "An error occurred";
                var message = "something went wrong";
                Swal.fire({
                    title: title,
                    html: message,
                    icon: "error"
                });
            }
        });
    });



})();
