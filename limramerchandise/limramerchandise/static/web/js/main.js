/***************************************************
==================== JS INDEX ======================
****************************************************
01. Preloader
02. Go top Top
03. Offcanvas Menu Control
04. Header Search
05. Header | Home One
06. Header | Home Two
07. Counter Activation
08. Testimonial Slider | Home 1
09. Testimonial Slider | Home 2
10. Team Slider
11. MixitUp activation
12. WOW JS Activation
13. Mobile Menu Activation
14. ProgressBar activation
15. Banner Slider



****************************************************/

(function ($) {
  "use strict";

  /////////////////////////////////////////////////////
  // 01. Preloader
  var preloader = document.querySelector("#preloader");
  var get_body = document.querySelector("body");

  get_body.onload = function () {
    preloader.style.display = "none";
  };
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 02. Go top Top
  let scroll_top = document.getElementById("scroll_top");

  if (scroll_top) {
    window.onscroll = function () { scrollTopFunc() };

    function scrollTopFunc() {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scroll_top.classList.add('showed');
      } else {
        scroll_top.classList.remove('showed');
      }
    }

    scroll_top.addEventListener('click', function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 03. Offcanvas Menu Control
  $('.menu_icon').on('click', function () {
    $('.offcanvas__area').addClass('showed');
  });

  $('#offcanvas_close').on('click', function () {
    $('.offcanvas__area').removeClass('showed');
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 04. Header Search
  $('.search-icon').on('click', function () {
    $(this).hide();
    $('.search-close').show();
    $('.search__form').addClass('showed');
  });

  $('.search-close').on('click', function () {
    $(this).hide();
    $('.search-icon').show();
    $('.search__form').removeClass('showed');
  });

  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 06. 
  var share_btn = document.querySelectorAll('.share-btn');
  var social_share = document.querySelectorAll('.social-share');

  for (let i = 0; i < share_btn.length; i++) {
    share_btn[i].addEventListener('click', function () {
      social_share[i].classList.toggle('active');
    });

  }
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 06. Magnific Popup Activate
  $('.popup-link').magnificPopup({ type: 'iframe' });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 07. Counter Activation
  const counter_1 = window.counterUp.default
  const counter_cb = entries => {

    entries.forEach(entry => {
      const el = entry.target
      if (entry.isIntersecting && !el.classList.contains('is-visible')) {
        counter_1(el, {
          duration: 1500,
          delay: 16,
        })
        el.classList.add('is-visible')
      }
    })
  }

  const counter_1_io = new IntersectionObserver(counter_cb, {
    threshold: 1
  })

  const counter_1_els = document.querySelectorAll('.counter_fast');
  counter_1_els.forEach((el) => {
    counter_1_io.observe(el)
  });

  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 07. Counter Activation
  const counter_2 = window.counterUp.default
  const counter_cb_2 = entries => {

    entries.forEach(entry => {
      const el = entry.target
      if (entry.isIntersecting && !el.classList.contains('is-visible')) {
        counter_2(el, {
          duration: 3000,
          delay: 16,
        })
        el.classList.add('is-visible')
      }
    })
  }

  const counter_2_io = new IntersectionObserver(counter_cb_2, {
    threshold: 1
  })

  const counter_2_els = document.querySelectorAll('.counter_medium');
  counter_2_els.forEach((el) => {
    counter_2_io.observe(el)
  });

  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 07. Counter Activation
  const counter_3 = window.counterUp.default
  const counter_cb_3 = entries => {

    entries.forEach(entry => {
      const el = entry.target
      if (entry.isIntersecting && !el.classList.contains('is-visible')) {
        counter_3(el, {
          duration: 5000,
          delay: 16,
        })
        el.classList.add('is-visible')
      }
    })
  }

  const counter_3_io = new IntersectionObserver(counter_cb_3, {
    threshold: 1
  })

  const counter_3_els = document.querySelectorAll('.counter_slow');
  counter_3_els.forEach((el) => {
    counter_3_io.observe(el)
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // Progress Bar Activate
  $('.skill_active').progressBar({
    height: "10",
    animation: true,
    barColor: "#44B032",
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  AOS.init({
    once: true,
    offset: 200,
    duration: 1000,
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 10. Text Slider
  var text_slider = new Swiper(".textslider__active", {
    loop: true,
    speed: 2000,
    spaceBetween: 0,
    simulateTouch:false,
    items: 3,
    autoplay: {
      delay: 0,
    },
    breakpoints: {
      100: {
        slidesPerView: 2,
      },
      480: {
        slidesPerView: 3,
      },
      640: {
        slidesPerView: 4,
      },
      768: {
        slidesPerView: 6,
      },
      1024: {
        slidesPerView: 8,
      },
    },
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 15. Text Slider
  var text_slider_2 = new Swiper(".textslider__active-2", {
    loop: true,
    speed: 3000,
    spaceBetween: 30,
    slidesPerView: 'auto',
    autoplay: {
      delay: 1,
    },
  });
  /////////////////////////////////////////////////////

  /////////////////////////////////////////////////////
  // 10. Text Slider
  var text_slider = new Swiper(".textslider__active-3", {
    spaceBetween: 0,
    centeredSlides: true,
    speed: 7000,
    autoplay: {
      delay: 1,
      reverseDirection: true
    },
    loop: true,
    loopedSlides: 4,
    slidesPerView: 'auto',
    allowTouchMove: false,
    disableOnInteraction: true,
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 4,
      },
    },
  });
  /////////////////////////////////////////////////////

  /////////////////////////////////////////////////////
  // 15. Text Slider down
  var text_slider_2 = new Swiper(".textslider__down-2", {
    loop: true,
    speed: 3000,
    spaceBetween: 30,
    autoplay: {
      delay: 1,
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 2,
      },
    },
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 11. 
  var brand_slider = new Swiper(".brand__slider", {
    loop: true,
    speed: 3000,
    spaceBetween: 50,
    autoplay: {
      delay: 1,
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 4,
      },
      1400: {
        slidesPerView: 6,
      },
    },
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 12. 
  var testimonial_slider_3 = new Swiper(".testimonial__slider-3", {
    loop: true,
    speed: 3000,
    spaceBetween: 50,
    slidesPerView: 1,
    autoplay: {
      delay: 1500,
    },
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 13. Mobile Menu Activation
  $('.offcanvas-menu').meanmenu({
    meanScreenWidth: "1365",
    meanMenuContainer: '.offcanvas__menu',
    meanMenuCloseSize: '24px',
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 14. 
  var team_slider_3 = new Swiper(".team__slider-3", {
    loop: true,
    speed: 3000,
    spaceBetween: 30,
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1000: {
        slidesPerView: 3,
      },
      1300: {
        slidesPerView: 4,
      },
    },
  });
  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////////
  // 14. 
  var portfolio_slider_4 = new Swiper(".portfolio__slider-4", {
    loop: true,
    speed: 3000,
    spaceBetween: 30,
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1000: {
        slidesPerView: 3,
      },
      1300: {
        slidesPerView: 3,
      },
    },
  });
  /////////////////////////////////////////////////////

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TweenMax);

  let device_width = window.innerWidth;

  let skewSetter = gsap.quickTo(".portfolio__item-5 img", "skewY"),
    clamp = gsap.utils.clamp(-15, 15);
  const smoother = ScrollSmoother.create({
    smooth: 1.35,
    effects: device_width < 1025 ? false : true,
    smoothTouch: false,
    normalizeScroll: false,
    ignoreMobileResize: true,
    onUpdate: self => skewSetter(clamp(self.getVelocity() / -80)),
    onStop: () => skewSetter(0)
  });


  // P Animation
  let pAnimationLines = gsap.utils.toArray(".p-animation p");

  pAnimationLines.forEach(pAnimationLine => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pAnimationLine,
        start: 'top 90%',
        duration: 2,
        end: 'bottom 60%',
        scrub: false,
        markers: false,
        toggleActions: 'play none none none'
      }
    });

    const pSplitLine = new SplitText(pAnimationLine, { type: "lines" });
    gsap.set(pAnimationLine, { perspective: 400 });
    pSplitLine.split({ type: "lines" })
    tl.from(pSplitLine.lines, {
      duration: 1,
      delay: 0.3,
      opacity: 0,
      x: 50,
      force3D: true,
      transformOrigin: "top center -50",
      stagger: 0.1
    });
  });


  // 25. Title Animation
  let headingAnimationLines = gsap.utils.toArray(".heading-animation");

  headingAnimationLines.forEach(headingAnimationLine => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingAnimationLine,
        start: 'top 90%',
        end: 'bottom 60%',
        scrub: false,
        markers: false,
        toggleActions: 'play none none none'
      }
    });

    const headingSplitLine = new SplitText(headingAnimationLine, { type: "words" });
    gsap.set(headingAnimationLine, { perspective: 400 });
    headingSplitLine.split({ type: "words" })
    tl.from(headingSplitLine.words, {
      duration: 1,
      delay: 0.3,
      opacity: 0,
      rotationX: -50,
      force3D: true,
      transformOrigin: "top center -50",
      stagger: 0.1,
    });
  });


  // Home 3 Hero shape animaton

  let home3HeroShape = gsap.timeline();

  home3HeroShape.from(".hero__title-3-wrap .line", {
    xPercent: -100,
    duration: 1,
  }, '+=1');

  if ($('#hero_video').length) {
    // Hero Video
    var hero_video = document.querySelector('.hero__video');
    var hero_video_icon = document.querySelector('#hero_video');

    hero_video_icon.addEventListener('click', function (e) {
      e.preventDefault();

      hero_video.classList.toggle('show');
    });
  }

  $(document).ready(function () {
    $('.owl-carousel').owlCarousel({
      loop: true,
      margin: 0,
      nav: false,
      autoplay: true,
      autoplayTimeout: 3000,
      items: 1,
      dots: true,
      autoplaySpeed: 1000,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
    });
  });

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
          if (status) {
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


})(jQuery);