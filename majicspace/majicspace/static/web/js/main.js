/*=== Javascript function indexing hear===========

01.swiperActivation();
02.counterUp();
03.featureJumpanimation();
04.rtsRevealImage();
05.progressAvtivation();
06.wowActive();
07.portfolioimgChangeHover();
08.serviceimgChangeHover();
09.scrollingTextGsap();
10.fonklsAnimation();
11.afterBefore();
12.bannerFourGsapAnimation();
13.preloaderWithBannerActivation();
14.portfolioimgChangeHover_bg();
15.sideMenu();
16.stickyHeader();
17.backToTopInit();
18.textTitleAnimation__1();
19.searchOpton();
20.vedioActivation();
21.footerParallex();
22.slideUp();
23.videoActive();
24.portfoliobounceAnimation();
25.OnePagesmoothScroll();
26.preloader();

==================================================*/




(function ($) {
    'use strict';
    let device_width = window.innerWidth;
    gsap.registerPlugin(ScrollTrigger, TweenMax, ScrollToPlugin);

    var rtsJs = {
        m: function (e) {
            rtsJs.d();
            rtsJs.methods();
        },
        d: function (e) {
            this._window = $(window),
                this._document = $(document),
                this._body = $('body'),
                this._html = $('html')
        },
        methods: function (e) {
            rtsJs.swiperActivation();
            rtsJs.counterUp();
            rtsJs.featureJumpanimation();
            rtsJs.rtsRevealImage();
            rtsJs.progressAvtivation();
            rtsJs.wowActive();
            rtsJs.portfolioimgChangeHover();
            rtsJs.serviceimgChangeHover();
            rtsJs.scrollingTextGsap();
            rtsJs.fonklsAnimation();
            rtsJs.afterBefore();
            rtsJs.bannerFourGsapAnimation();
            rtsJs.preloaderWithBannerActivation();
            rtsJs.portfolioimgChangeHover_bg();
            rtsJs.sideMenu();
            rtsJs.stickyHeader();
            rtsJs.backToTopInit();
            rtsJs.textTitleAnimation__1();
            rtsJs.searchOpton();
            rtsJs.vedioActivation();
            rtsJs.footerParallex();
            rtsJs.slideUp();
            rtsJs.videoActive();
            rtsJs.portfoliobounceAnimation();
            rtsJs.OnePagesmoothScroll();
            rtsJs.preloader();
        },
        swiperActivation: function () {
            $(document).ready(function () {
                var swiper = new Swiper(".swiper-product-one", {
                    slidesPerView: 4,
                    spaceBetween: 0,
                    loop: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    breakpoints: {
                        1700: {
                          slidesPerView: 4,
                        },
                        1500: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 3,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });
            $(document).ready(function () {
                var sliderboxPortfolio = new Swiper(".swiper-product-one-box-page", {
                    slidesPerView: 4,
                    spaceBetween: 0,
                    loop: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    pagination: {
                        el: ".swiper-paginations",
                        clickable: true,
                        type: 'progressbar',
                    },
                    keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                    },
                    autoplay: {
                      delay: 1500,
                    },
                    mousewheel: {
                        invert: true,
                    },
                    speed:1000,
                    breakpoints: {
                        1700: {
                          slidesPerView: 4,
                        },
                        1500: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 3,
                        },
                        768: {
                          slidesPerView: 3,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        },
                        0: {
                          slidesPerView: 1,
                        }
                    }
                });
                sliderboxPortfolio.on('slideChange', function () {
                    console.log('slider moved');
                    var activeslide = sliderboxPortfolio.realIndex;
                    var totalslide = sliderboxPortfolio.slides.length;
                    console.log(activeslide);
                    $(".activeslide").html('0' + (activeslide + 1));
                    $(".totalslide").html('0' + (totalslide-8));
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".swiper-testimonails-one", {
                    slidesPerView: 2,
                    spaceBetween: 80,
                    loop: true,
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,
                    },
                    breakpoints: {
                        1700: {
                          slidesPerView: 2,
                        },
                        1500: {
                          slidesPerView: 2,
                        },
                        1024: {
                          slidesPerView: 2,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });

            $(document).ready(function () {
                var sliderThree = new Swiper(".mySwiper-product-two", {
                    loop: true,
                    effect:"fade",
                    speed: 1500,
                    // autoplay: {
                    //     delay: 3000,
                    // },
                });
                var sliderFour = new Swiper(".mySwiper-product-OuterText", {
                    loop: true,
                    slidesPerView: 1,
                    speed: 1500,
                    autoplay: {
                        delay: 3000,
                    },
                    pagination: {
                        el: ".swiper-paginations",
                        clickable: true,
                        type: 'progressbar',
                    },
                });

                sliderThree.on('slideChange', function () {
                    console.log('slider moved');
                    var activeslide = sliderThree.realIndex;
                    var totalslide = sliderThree.slides.length;
                    console.log(activeslide);
                    $(".activeslide").html('0' + (activeslide + 1));
                    $(".totalslide").html('0' + (totalslide-2));
                });

                sliderThree.controller.control = sliderFour;
                sliderFour.controller.control = sliderThree;
            });

            $(document).ready(function () {
                var sliderOne = new Swiper(".mySwiper-product-two-showcase", {
                    loop: true,
                    slidesPerView: 1,
                    // effect:"fade",
                    speed: 1500,
                    mousewheel: true,
                    autoplay: {
                        delay: 3000,
                    },
                });
                var sliderTwo = new Swiper(".mySwiper-product-OuterText-2", {
                    loop: true,
                    slidesPerView: 1,
                    speed: 1500,
                    mousewheel: true,
                    autoplay: {
                        delay: 3000,
                    },
                    pagination: {
                        el: ".swiper-paginations",
                        clickable: true,
                        type: 'progressbar',
                    },
                });

                sliderTwo.on('slideChange', function () {
                    console.log('slider moved');
                    var activeslide = sliderTwo.realIndex;
                    var totalslide = sliderTwo.slides.length;
                    console.log(activeslide);
                    $(".activeslide").html('0' + (activeslide + 1));
                    $(".totalslide").html('0' + (totalslide-2));
                });

                sliderOne.controller.control = sliderTwo;
                sliderTwo.controller.control = sliderOne;
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-banner-three", {
                    slidesPerView: 1,
                    spaceBetween: 70,
                    effect: 'fade',
                    centeredSlides: true,
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true
                    },
                    loop: true,
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-three-testimonials", {
                    slidesPerView: 1,
                    spaceBetween: 70,
                    centeredSlides: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    loop: true,
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-project-5", {
                    slidesPerView: 4,
                    spaceBetween: 30,
                    loop: true,
                    autoplay: {
                        delay: 2000,
                    },
                    breakpoints: {
                        1700: {
                          slidesPerView: 4,
                        },
                        1500: {
                          slidesPerView: 4,
                        },
                        1024: {
                          slidesPerView: 3,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 2,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });
            $(document).ready(function () {
                var sliderThumbnail = new Swiper(".swiper-banner-thumb-5", {
                    slidesPerView: 3,
                    speed: 1000,
                    autoplay: 
                    {
                      delay: 2000,
                    },
                });
                var swiper = new Swiper(".mySwiper-banner-five", {
                    thumbs: {
                        swiper: sliderThumbnail,
                        watchSlidesProgress: false,
                        mousewheelControl: true,
                        keyboardControl: true,
                    },
                    
                    // effect:"fade",
                    speed: 500,
                    autoplay: 
                    {
                      delay: 2000,
                    },
                });
            });
            $(document).ready(function () {
                var sliderThumbnail = new Swiper(".swiper-banner-thumb-2", {
                    slidesPerView: 3,
                    clickable: true,
                });
                var sliderOne = new Swiper(".mySwiper-banner-two", {
                    spaceBetween: 0,
                    clickable: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                        speed: 1000,
                    },
                    autoplay: {
                        delay: 4000,
                    },
                    loop: true,
                    // speed: 3000,
                    thumbs: {
                        swiper: sliderThumbnail,
                        watchSlidesProgress: false,
                        mousewheelControl: true,
                        keyboardControl: true,
                    },
                    effect: 'fade',
                });
            });

            $(document).ready(function () {
                var sliderThumbnail = new Swiper(".swiper-banner-thumb-2", {
                    slidesPerView: 3,
                    clickable: true,
                });
                var sliderOne = new Swiper(".mySwiper-banner-two-showcase", {
                    spaceBetween: 0,
                    clickable: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                        speed: 1000,
                    },
                    mousewheel: true,
                    autoplay: {
                        delay: 4000,
                    },
                    speed: 2000,
                    loop: true,
                    thumbs: {
                        swiper: sliderThumbnail,
                        watchSlidesProgress: false,
                        mousewheelControl: true,
                        keyboardControl: true,
                        speed: 2000,
                    },
                    effect: "cube",
                    grabCursor: true,
                    cubeEffect: {
                      shadow: true,
                      slideShadows: true,
                      shadowOffset: 20,
                      shadowScale: 0.94,
                    },
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-testimonials-6", {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    loop: true,
                    speed: 1500,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    breakpoints: {
                        1700: {
                          slidesPerView: 3,
                        },
                        1500: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 2,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-product-team", {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    pagination: {
                      el: ".swiper-pagination",
                      clickable: true,
                    },
                    autoplay: 
                    {
                      delay: 2000,
                    },
                    loop: true,
                    breakpoints: {
                        1700: {
                          slidesPerView: 3,
                        },
                        1500: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 2,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 2,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-pd-t", {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    pagination: {
                      el: ".swiper-pagination",
                      clickable: true,
                    },
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    autoplay: 
                    {
                      delay: 1500,
                    },
                    loop: true,
                });
            });
            $(document).ready(function () {
                var swiper = new Swiper(".mySwiper-varticle-portfolio", {
                    slidesPerView: 4,
                    spaceBetween: 20,
                    autoplay: 
                    {
                      delay: 2500,
                    },
                    loop: true,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    breakpoints: {
                        1700: {
                          slidesPerView: 4,
                        },
                        1500: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 2,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        }
                    }
                });
            });
            $(document).ready(function () {
                var sliderOne = new Swiper(".mySwiper-banner-six", {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    pagination: {
                      el: ".swiper-paginations",
                      clickable: true,
                      type: 'progressbar',
                    },
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                });
                sliderOne.on('slideChange', function () {
                    console.log('slider moved');
                    var activeslide = sliderOne.realIndex;
                    var totalslide = sliderOne.slides.length;
                    console.log(activeslide);
                    $(".activeslide").html('0' + (activeslide + 1));
                    $(".totalslide").html('0' + (totalslide-2));
                });
            });

            $(document).ready(function () {
                var sliderOne = new Swiper(".mySwiper-banner-one-1", {
                    spaceBetween: 0,
                    pagination: {
                      el: ".swiper-pagination",
                      clickable: true,
                    },
                    effect: 'flip',
                    autoplay: {
                        delay: 3000,
                    },
                    keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                        speed: 1000,
                    },
                    mousewheel: true,
                    speed: 1000,
                    loop: true,
                    effect: 'fade',
                    effect: 'coverflow',
                    coverflowEffect: {
                      rotate: 90,
                      slideShadows: false,
                    },
                });
                var sliderTwo = new Swiper(".mySwiper-banner-oneleft", {
                    spaceBetween: 0,
                    clickable: true,
                    effect: 'fade',
                    mousewheelControl: true,
                    pagination: {
                      el: ".swiper-paginations",
                      clickable: true,
                      type: 'progressbar',
                    },
                    keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                      },
                    loop: true,
                });

                // progress slider
                sliderTwo.on('slideChange', function () {
                    console.log('slider moved');
                    var activeslide = sliderTwo.realIndex;
                    var totalslide = sliderTwo.slides.length;
                    console.log(activeslide);
                    $(".activeslide").html(activeslide + 1);
                    $(".totalslide").html(totalslide - 2);
                });

                sliderOne.controller.control = sliderTwo;
                sliderTwo.controller.control = sliderOne;
            });
            $(document).ready(function(){
                var swiper = new Swiper(".mySwiper-banner-one-in-two", {
                    pagination: {
                      el: ".swiper-pagination",
                    },
                    spaceBetween: 0,
                    mousewheelControl: true,
                    pagination: {
                      el: ".swiper-pagination",
                      clickable: true,
                    },
                    effect: 'fade',
                    autoplay: {
                        delay: 4000,
                    },
                    keyboard: {
                        enabled: true,
                    },
                    speed: 1000,
                    loop: true,
                  });
            });

        },

        counterUp: function () {
            $('.counter').counterUp({
                delay: 10,
                time: 2000
            });
            $('.counter').addClass('animated fadeInDownBig');
            $('h3').addClass('animated fadeIn');
        },
        featureJumpanimation: function () {
            // counter jump animation
            $(document).ready(function () {
                let rts_jump_counter_animation = document.getElementsByClassName('rts_jump_counter__animation');
                if (rts_jump_counter_animation.length) {
                    gsap.set(".counter_animation .counter__anim", {
                        y: -100,
                        opacity: 0,
                    })
                    if (device_width < 1023) {
                        const counterArray = gsap.utils.toArray(".counter_animation .counter__anim")
                        counterArray.forEach((item, i) => {
                            let counterTl = gsap.timeline({
                                scrollTrigger: {
                                    trigger: item,
                                    start: "top center+=200",
                                }
                            })
                            counterTl.to(item, {
                                y: 0,
                                opacity: 1,
                                ease: "bounce",
                                duration: 1.5,
                            })
                        })
                    } else {
                        gsap.to(".counter_animation .counter__anim", {
                            scrollTrigger: {
                                trigger: ".counter_animation",
                                start: "top center+=300",
                            },
                            y: 0,
                            opacity: 1,
                            ease: "bounce",
                            duration: 1.5,
                            stagger: {
                                each: 0.3,
                            }
                        })
                    }
                }
            });
            $(document).ready(function () {
                let rts_jump_counter_animation = document.getElementsByClassName('social-jumpanimation');
                if (rts_jump_counter_animation.length) {
                    gsap.set(".social-anim .counter__anim", {
                        y: 50,
                        opacity: 0,
                    })
                    if (device_width < 1023) {
                        const counterArray = gsap.utils.toArray(".social-anim .counter__anim")
                        counterArray.forEach((item, i) => {
                            let counterTl = gsap.timeline({
                                scrollTrigger: {
                                    trigger: item,
                                    start: "top center+=200",
                                }
                            })
                            counterTl.to(item, {
                                y: 0,
                                opacity: 1,
                                ease: "bounce",
                                duration: .5,
                            })
                        })
                    } else {
                        gsap.to(".social-anim .counter__anim", {
                            scrollTrigger: {
                                trigger: ".social-anim",
                                start: "top center+=300",
                            },
                            y: 0,
                            opacity: 1,
                            ease: "bounce",
                            duration: .5,
                            stagger: {
                                each: 0.1,
                            }
                        })
                    }
                }
            });
        },
        rtsRevealImage: function () {

            window.addEventListener("load", function() {
                $(document).ready(function () {
                    gsap.registerPlugin(ScrollTrigger);
    
                    let revealContainers = document.querySelectorAll(".rts-reveal-one");
    
                    revealContainers.forEach((container) => {
                        let image = container.querySelector(".rts-reveal-image-one");
                        let rts = gsap.timeline({
                            scrollTrigger: {
                                trigger: container,
                                toggleActions: "restart none none reset",
                                start: "top 90%",
                                end: "top 0%",
                            }
                        });
    
                        rts.set(container, {
                            autoAlpha: 1
                        });
                        rts.from(container, 1.5, {
                            xPercent: 100,
                            ease: Power2.out
                        });
                        rts.from(image, 1.5, {
                            xPercent: -100,
                            scale: 1.3,
                            delay: -1.5,
                            ease: Power2.out
                        });
                    });
                });
            });


        },
        progressAvtivation: function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 250) {
                    var bars = document.querySelectorAll('.meter > span');
                    console.clear();
                    setInterval(function () {
                        bars.forEach(function (bar) {
                            var getWidth = parseFloat(bar.dataset.progress);
                            for (var i = 0; i < getWidth; i++) {
                                bar.style.width = i + '%';
                            }
                        });
                    }, 100);
                }
            })
        },
        wowActive: function () {
            new WOW().init();
        },
        portfolioimgChangeHover: function () {
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-btn-bg.one');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.one');

                if (hover_portfolio.length) {
                    $(".single-btn-bg.one").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-btn-bg.two');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.two');

                if (hover_portfolio.length) {
                    $(".single-btn-bg.two").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-btn-bg.three');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.three');

                if (hover_portfolio.length) {
                    $(".single-btn-bg.three").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-btn-bg.four');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.four');

                if (hover_portfolio.length) {
                    $(".single-btn-bg.four").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });

        },
        serviceimgChangeHover: function () {
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.signle-service-list.one');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.one');

                if (hover_portfolio.length) {
                    $(".signle-service-list.one").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.signle-service-list.two');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.two');

                if (hover_portfolio.length) {
                    $(".signle-service-list.two").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.signle-service-list.three');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.three');

                if (hover_portfolio.length) {
                    $(".signle-service-list.three").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.signle-service-list.four');
                let hover_portfolioHover = document.querySelectorAll('.rts-img-hover.four');

                if (hover_portfolio.length) {
                    $(".signle-service-list.four").on("mouseenter", function () {
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                    });
                }
            });

        },
        scrollingTextGsap: function () {
            $(document).ready(function () {
                let scrollingTextTwo = document.getElementsByClassName('scrollingText-two');
                if (scrollingTextTwo.length) {
                    gsap.registerPlugin(ScrollTrigger);
                    let tl2 = gsap.timeline();
                    tl2.to(".scrollingText-two", {
                        x: 1000,
                        duration: 50,
                        repeat: -1,
                        ease: 'linear'
                    })
                    let tl = gsap.timeline();
                    tl.to('.scrollingText-two', {
                        xPercent: 5,
                        scrollTrigger: {
                            trigger: ".scrollingText-two",
                            scrub: 1
                        }
                    })
                }

            });
            $(document).ready(function () {
                let scrollingTextFour = document.getElementsByClassName('scrollingText-four');
                if (scrollingTextFour.length) {
                    gsap.registerPlugin(ScrollTrigger);
                    let tl2 = gsap.timeline();
                    tl2.to(".scrollingText-four", {
                        x: -1000,
                        duration: 50,
                        repeat: 1,
                        ease: 'linear'
                    })
                    let tl = gsap.timeline();
                    tl.to('.scrollingText-four', {
                        xPercent: -5,
                        scrollTrigger: {
                            trigger: ".scrollingText-four",
                            scrub: 1
                        }
                    })
                }

            });

        },
        fonklsAnimation: function () {
            let endTl = gsap.timeline({
                repeat: -1,
                delay: 0.2,
                scrollTrigger: {
                    trigger: '.end',
                    start: 'bottom 100%-=50px'
                }
            });
            gsap.set('.end', {
                opacity: 0
            });
            gsap.to('.end', {
                opacity: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.end',
                    start: 'bottom 100%-=50px',
                    once: true
                }
            });
            let mySplitText = new SplitText(".end", {
                type: "words,chars"
            });
            let chars = mySplitText.chars;
            endTl.to(chars, {
                duration: 0.5,
                scaleY: 0.9,
                ease: "power3.out",
                stagger: 0.04,
                transformOrigin: 'center bottom'
            });
            endTl.to(chars, {
                yPercent: -10,
                ease: "elastic",
                stagger: 0.03,
                duration: 0.8
            }, 0.5);
            endTl.to(chars, {
                scaleY: 1,
                ease: "elastic.out(2.5, 0.2)",
                stagger: 0.03,
                duration: 1.5
            }, 0.5);
            endTl.to(chars, {

                ease: "power2.out",
                stagger: 0.03,
                duration: 0.3
            }, 0.5);
            endTl.to(chars, {
                yPercent: 0,
                ease: "back",
                stagger: 0.03,
                duration: 0.8
            }, 0.7);
            endTl.to(chars, {
                // color: '#b19777',
                duration: 1.4,
                stagger: 0.05
            });
        },
        afterBefore: function(){
            jQuery(document).ready(function($){
                var dragging = false,
                    scrolling = false,
                    resizing = false;
                //cache jQuery objects
                var imageComparisonContainers = $('.cd-image-container');
                //check if the .cd-image-container is in the viewport 
                //if yes, animate it
                checkPosition(imageComparisonContainers);
                $(window).on('scroll', function(){
                    if( !scrolling) {
                        scrolling =  true;
                        ( !window.requestAnimationFrame )
                            ? setTimeout(function(){checkPosition(imageComparisonContainers);}, 100)
                            : requestAnimationFrame(function(){checkPosition(imageComparisonContainers);});
                    }
                });
                
                //make the .cd-handle element draggable and modify .cd-resize-img width according to its position
                imageComparisonContainers.each(function(){
                    var actual = $(this);
                    drags(actual.find('.cd-handle'), actual.find('.cd-resize-img'), actual, actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-image-label[data-type="modified"]'));
                });
            
                //upadate images label visibility
                $(window).on('resize', function(){
                    if( !resizing) {
                        resizing =  true;
                        ( !window.requestAnimationFrame )
                            ? setTimeout(function(){checkLabel(imageComparisonContainers);}, 100)
                            : requestAnimationFrame(function(){checkLabel(imageComparisonContainers);});
                    }
                });
            
                function checkPosition(container) {
                    container.each(function(){
                        var actualContainer = $(this);
                        if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
                            actualContainer.addClass('is-visible');
                        }
                    });
            
                    scrolling = false;
                }
            
                function checkLabel(container) {
                    container.each(function(){
                        var actual = $(this);
                        updateLabel(actual.find('.cd-image-label[data-type="modified"]'), actual.find('.cd-resize-img'), 'left');
                        updateLabel(actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-resize-img'), 'right');
                    });
            
                    resizing = false;
                }
        
                function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
                    dragElement.on("mousedown vmousedown", function(e) {
                        dragElement.addClass('draggable');
                        resizeElement.addClass('resizable');
            
                        var dragWidth = dragElement.outerWidth(),
                            xPosition = dragElement.offset().left + dragWidth - e.pageX,
                            containerOffset = container.offset().left,
                            containerWidth = container.outerWidth(),
                            minLeft = containerOffset + 10,
                            maxLeft = containerOffset + containerWidth - dragWidth - 10;
                        
                        dragElement.parents().on("mousemove vmousemove", function(e) {
                            if( !dragging) {
                                dragging =  true;
                                ( !window.requestAnimationFrame )
                                    ? setTimeout(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);}, 100)
                                    : requestAnimationFrame(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);});
                            }
                        }).on("mouseup vmouseup", function(e){
                            dragElement.removeClass('draggable');
                            resizeElement.removeClass('resizable');
                        });
                        e.preventDefault();
                    }).on("mouseup vmouseup", function(e) {
                        dragElement.removeClass('draggable');
                        resizeElement.removeClass('resizable');
                    });
                }
            
                function animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement) {
                    var leftValue = e.pageX + xPosition - dragWidth;   
                    //constrain the draggable element to move inside his container
                    if(leftValue < minLeft ) {
                        leftValue = minLeft;
                    } else if ( leftValue > maxLeft) {
                        leftValue = maxLeft;
                    }
            
                    var widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
                    
                    $('.draggable').css('left', widthValue).on("mouseup vmouseup", function() {
                        $(this).removeClass('draggable');
                        resizeElement.removeClass('resizable');
                    });
            
                    $('.resizable').css('width', widthValue); 
            
                    updateLabel(labelResizeElement, resizeElement, 'left');
                    updateLabel(labelContainer, resizeElement, 'right');
                    dragging =  false;
                }
            
                function updateLabel(label, resizeElement, position) {
                    if(position == 'left') {
                        ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
                    } else {
                        ( label.offset().left > resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
                    }
                }
            });
        },
        bannerFourGsapAnimation: function(){
            let rtsHero = gsap.timeline()

            let heading_title = new SplitText(".banner-title-3", { type: "chars" })
            let heading_char = heading_title.chars
          
            rtsHero.from(heading_char, {
              rotate: 20,
              ease: "back.out",
              opacity: 0,
              duration: 2,
              stagger: 0.1
            })

        },
        
        preloaderWithBannerActivation: function () {
            function checkAndStartAnimation() {
                // Check if the class you're looking for exists on the body
                if (document.body.classList.contains('loaded')) {
                  // Your animation code here
                  let homeAgency = gsap.timeline();
                  // Character Come along Animation
                  let hero__title = document.querySelector(".rts_hero__title");
                  let hero__subtitle = document.querySelector(".hero__sub-title");
                  let split_hero__title = new SplitText(hero__title, {
                    type: "chars"
                  });
                  let split_hero__subtitle = new SplitText(hero__subtitle, {
                    type: "chars words"
                  });
                  homeAgency.from(split_hero__title.chars, {
                    duration: 1,
                    x: 70,
                    autoAlpha: 0,
                    stagger: 0.03,
                  });
                  homeAgency.from(
                    split_hero__subtitle.words, {
                      duration: 1,
                      x: 50,
                      autoAlpha: 0,
                      stagger: 0.01
                    },
                    "-=1"
                  );
                } else {
                  // If the class is not found, check again after a short delay
                  setTimeout(checkAndStartAnimation, 500);
                }
              }
              
              // Call the function to start checking for the class
              checkAndStartAnimation();
      
        },

        portfolioimgChangeHover_bg: function () {
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title-1.one');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.one');

                if (hover_portfolio.length) {
                    $(".single-projects-title-1.one").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title-1.two');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.two');

                if (hover_portfolio.length) {
                    $(".single-projects-title-1.two").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title-1.three');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.three');

                if (hover_portfolio.length) {
                    $(".single-projects-title-1.three").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title-1.four');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.four');
                if (hover_portfolio.length) {
                    $(".single-projects-title-1.four").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });



            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title.one');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.one');

                if (hover_portfolio.length) {
                    $(".single-projects-title.one").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title.two');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.two');

                if (hover_portfolio.length) {
                    $(".single-projects-title.two").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title.three');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.three');

                if (hover_portfolio.length) {
                    $(".single-projects-title.three").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });
            $(document).ready(function () {
                let hover_portfolio = document.querySelectorAll('.single-projects-title.four');
                let hover_portfolioHover = document.querySelectorAll('.bg-image.four');
                if (hover_portfolio.length) {
                    $(".single-projects-title.four").on("mouseenter", function () {
                        $(hover_portfolio).addClass("active").siblings().removeClass("active");
                        $(hover_portfolioHover).addClass("active").siblings().removeClass("active");
                    });
                }
            });

        },

        sideMenu:function(){
            $('#mobile-menu-active').metisMenu();
            $(document).on('click', '#menu-btn', function () {
              $("#side-bar").addClass("show");
              $("#anywhere-home").addClass("bgshow");
            });
            $(document).on('click', '.close-icon-menu', function () {
              $("#side-bar").removeClass("show");
              $("#anywhere-home").removeClass("bgshow");
            });
            $(document).on('click', '#anywhere-home', function () {
              $("#side-bar").removeClass("show");
              $("#anywhere-home").removeClass("bgshow");
            });
            $(document).on('click', '.onepage .mainmenu li a', function () {
              $("#side-bar").removeClass("show");
              $("#anywhere-home").removeClass("bgshow");
            });
        },
        stickyHeader: function (e) {
            $(window).scroll(function () {
            if ($(this).scrollTop() > 150) {
                $('.header--sticky').addClass('sticky-150')
            } else {
                $('.header--sticky').removeClass('sticky-150')
            }
            if ($(this).scrollTop() > 350) {
                $('.header--sticky').addClass('sticky')
            } else {
                $('.header--sticky').removeClass('sticky')
            }
            })
        },
        backToTopInit: function () {
            $(document).ready(function () {
              "use strict";
      
              var progressPath = document.querySelector('.progress-wrap path');
              var pathLength = progressPath.getTotalLength();
              progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
              progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
              progressPath.style.strokeDashoffset = pathLength;
              progressPath.getBoundingClientRect();
              progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
              var updateProgress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength / height);
                progressPath.style.strokeDashoffset = progress;
              }
              updateProgress();
              $(window).scroll(updateProgress);
              var offset = 50;
              var duration = 550;
              jQuery(window).on('scroll', function () {
                if (jQuery(this).scrollTop() > offset) {
                  jQuery('.progress-wrap').addClass('active-progress');
                } else {
                  jQuery('.progress-wrap').removeClass('active-progress');
                }
              });
              jQuery('.progress-wrap').on('click', function (event) {
                event.preventDefault();
                jQuery('html, body').animate({
                  scrollTop: 0
                }, duration);
                return false;
              })
      
      
            });
      
        },
        textTitleAnimation__1: function () {
            if (window.innerWidth > 550) {
      
              const quotes = document.querySelectorAll(".quote");
              const quotes2 = document.querySelectorAll(".quote-2");
      
              function setupSplits() {
                $(document).ready(function () {
                  $(".split-line").wrap('<div class="split-parent"></div>');
                });
      
      
                quotes.forEach(quote => {
      
                  quote.split = new SplitText(quote, {
                    type: "lines,words,chars",
                    linesClass: "split-line"
                  });
      
                  // Set up the anim
                  quote.anim = gsap.from(quote.split.lines, {
                    scrollTrigger: {
                      trigger: quote,
                      toggleActions: "restart pause resume reverse",
                      start: "bottom 100%",
                      markers: true,
                    },
                    duration: 0.6,
                    ease: "circ.out",
                    yPercent: 100,
                    stagger: 0.2,
                  });
                });
      
      
      
                quotes2.forEach(quote2 => {
      
                  quote2.split = new SplitText(quote2, {
                    type: "lines"
                  });
      
                  // Set up the anim
                  quote2.anim = gsap.from(quote2.split.lines, {
                    scrollTrigger: {
                      trigger: quote2,
                      toggleActions: "restart pause resume reverse",
                      start: "50% 60%",
                      markers: true,
                    },
                    duration: 0.6,
                    autoAlpha: 0,
                    ease: "circ.out",
                    yPercent: 100,
                    stagger: 0.2,
                  });
                });
              }
      
              // ScrollTrigger.addEventListener("refresh", setupSplits);
              setupSplits();
            }
      
      
      
        },
        searchOpton:function(){
            $(document).on('click', '#search', function () {
              $(".search-input-area").addClass("show");
              $("#anywhere-home").addClass("bgshow");
            });
            $(document).on('click', '#close', function () {
              $(".search-input-area").removeClass("show");
              $("#anywhere-home").removeClass("bgshow");
            });
            $(document).on('click', '#anywhere-home', function () {
              $(".search-input-area").removeClass("show");
              $("#anywhere-home").removeClass("bgshow");
            });
        },
        vedioActivation: function (e) {
            $(document).ready(function(){
              $('.popup-youtube, .popup-vimeo').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
              });
            });
        },
        footerParallex: function(){
            gsap.from(".rts-contact-anim", {
                y: -500,
                scrollTrigger: {
                    trigger: ".rts-parallex-top",
                    start: "bottom bottom",
                    scrub: true,
                }
            })
            
            gsap.from(".rts-copyright-anim", {
                y: -500,
                scrollTrigger: {
                    trigger: ".rts-parallex-top",
                    start: "bottom bottom",
                    scrub: true,
                }
            })
        },
        slideUp: function () {
            $(document).ready(function () {
              $(".rts-slide-up").each(function () {
                let rts_SkewInUp = gsap.timeline({
                  scrollTrigger: {
                    trigger: this,
                    start: "top bottom",
                    markers: false
                  }
                });
      
                rts_SkewInUp.from(this, {
                  duration: 2,
                  skewY: 2,
                  transformOrigin: "left top",
                  autoAlpha: 0,
                  y: 100,
                  ease: Expo.easeOut,
                  toggleActions: "restart pause resume reverse",
                  clearProps: "all"
                }, "+=0.2");
              });
            });
        },

        videoActive: function(){
            $(document).on('click', '#myBtn', function () {
                $("#myVideo").toggleClass("show");
            });
        },

        portfoliobounceAnimation: function(){
            if (device_width > 991) {
                gsap.set(".rts_portfolio_animation-wrapper .rts-portfolio__item", { opacity: 0, scale: 1.15, rotation: 0 })
                gsap.to(".rts_portfolio_animation-wrapper .rts-portfolio__item", {
                    scrollTrigger: {
                        trigger: ".rts_portfolio_animation-wrapper .rts-portfolio__item",
                        start: "top center+=200"
                    },
                    opacity: 1,
                    scale: 1,
                    duration: 1.5,
                    ease: "bounce",
                    stagger: 0.5,
                    rotation: 0
                })
            }
            if (device_width > 991) {
                gsap.set(".rts_portfolio_animation-wrapper-2 .rts-portfolio__item-2", { opacity: 0, scale: 1.15, rotation: 0 })
                gsap.to(".rts_portfolio_animation-wrapper-2 .rts-portfolio__item-2", {
                    scrollTrigger: {
                        trigger: ".rts_portfolio_animation-wrapper-2 .rts-portfolio__item-2",
                        start: "top center+=200"
                    },
                    opacity: 1,
                    scale: 1,
                    duration: 1.5,
                    ease: "bounce",
                    stagger: 0.9,
                    rotation: 0
                })
            }
        },

        // pne page scroll top
        OnePagesmoothScroll: function (e) {
            $(document).on('click', '.onepage a[href^="#"]', function (event) {
                event.preventDefault();
            
                $('html, body').animate({
                    scrollTop: $($.attr(this, 'href')).offset().top
                }, 2000);
            });
            $(document).on('click', 'a.scroll-down', function (event) {
                event.preventDefault();
            
                $('html, body').animate({
                    scrollTop: $($.attr(this, 'href')).offset().top
                }, 2000);
            });
        },

        preloader:function(){
            window.addEventListener('load',function(){
              document.querySelector('body').classList.add("loaded")  
            });          
        },




    }

    rtsJs.m();



    var isLoading = false;
    $(document).on("submit", "form.ajax", function (e) {
        e.preventDefault();
        var $this = $(this),
            data = new FormData(this),
            action_url = $this.attr("action"),
            reset = $this.hasClass("reset"),
            reload = $this.hasClass("reload"),
            redirect = $this.hasClass("redirect"),
            redirect_url = $this.attr("data-redirect");

        if (!isLoading) {
            isLoading = true;
            $.ajax({
                url: action_url,
                type: "POST",
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "json",
                success: function (data) {
                    var status = data.status;
                    var title = data.title;
                    var message = data.message;
                    var pk = data.pk;
                    if (status == "true") {
                        title ? (title = title) : (title = "Success");
                        Swal.fire({
                            title: title,
                            html: message,
                            icon: "success",
                        }).then(function () {
                            redirect && (window.location.href = redirect_url), reload && window.location.reload(), reset && window.location.reset();
                        });
                    } else {
                        title ? (title = title) : (title = "An Error Occurred");
                        Swal.fire({
                            title: title,
                            html: message,
                            icon: "error",
                        });
                    }
                },
                error: function (data) {
                    var title = "An error occurred",
                        message = "something went wrong";
                    Swal.fire({
                        title: title,
                        html: message,
                        icon: "error",
                    });
                },
            }).then(function (response) {
                isLoading = false;
            });
        }
    });


})(jQuery, window)