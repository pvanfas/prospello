/***************************************************
==================== JS INDEX ======================
****************************************************
01. PreLoader Js
02. Nice Select Js
03. mobile menu Js
04. Sticky Header Js
05. Sidebar Js
06. Search Js
07. Common Js
08. Smooth Scroll Js
09. back-to-top
10. magnificPopup img view
11. Counter Js
12. reveal-text
13. hover reveal start
14. award anim
15. portfolio panel
16. light-dark-active
17. Portfolio Animation
18. tp-vimeo-video-perspective
36 .bf-portfolio-vp-rotate-wrap
****************************************************/

(function ($) {
	"use strict";

	var windowOn = $(window);

	// Get Device width
	let device_width = window.innerWidth;

	////////////////////////////////////////////////////
	// 01. PreLoader Js
	windowOn.on('load', function () {
		$(".preloader").delay(800).fadeOut("slow");
	});
	
	// 02. Nice Select Js
	$('.tp-select').niceSelect();

	////////////////////////////////////////////////////
	// 03. mobile menu Js
	var tpMenuWrap = $('.tp-mobile-menu-active > ul').clone();
	var tpSideMenu = $('.tp-offcanvas-menu nav');
	tpSideMenu.append(tpMenuWrap);
	if ($(tpSideMenu).find('.tp-submenu, .mega-menu').length != 0) {
		$(tpSideMenu).find('.tp-submenu, .mega-menu').parent().append('<button class="tp-menu-close"><i class="fa-solid fa-angle-right"></i></button>');
	}
	var sideMenuList = $('.tp-offcanvas-menu nav > ul > li button.tp-menu-close, .tp-offcanvas-menu nav > ul li.has-dropdown > a, .tp-offcanvas-menu nav > ul li.has-dropdown > ul > li.menu-item-has-children > a');
	$(sideMenuList).on('click', function (e) {
		e.preventDefault();
		if (!($(this).parent().hasClass('active'))) {
			$(this).parent().addClass('active');
			$(this).siblings('.tp-submenu, .mega-menu').slideDown();
		} else {
			$(this).siblings('.tp-submenu, .mega-menu').slideUp();
			$(this).parent().removeClass('active');
		}
	});

	///////////////////////////////////////////////////
	// 04. Sticky Header Js
	windowOn.on('scroll', function () {
		var scroll = windowOn.scrollTop();
		if (scroll < 400) {
			$("#header-sticky").removeClass("header-sticky");
		} else {
			$("#header-sticky").addClass("header-sticky");
		}
	});


	////////////////////////////////////////////////////
	// 05. Sidebar Js
	$(".tp-menu-bar").on("click", function () {
		$(".tp-offcanvas").addClass("opened");
		$(".body-overlay").addClass("apply");
	});
	$(".close-btn").on("click", function () {
		$(".tp-offcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});
	$(".body-overlay").on("click", function () {
		$(".tp-offcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});
	$(".tp-offcanvas-open-btn").on("click", function () {
		$(".tp-offcanvas-2-area, .body-overlay").addClass("opened");
	});

	// 15. overlay not working js //
	$('.tp-offcanvas-open-btn').on('click', function () {
		const hasOffcanvas2 = $('.tp-offcanvas-2-area').length;
		$('.body-overlay').toggleClass('opened', !hasOffcanvas2);
	});
	  

	////////////////////////////////////////////////////
	// 06. Search Js
	$(".tp-search-click").on("click", function () {
		$(".tp-search-form-toggle,.tp-search-body-overlay").addClass("active");
	});

	$(".tp-search-close,.tp-search-body-overlay").on("click", function () {
		$(".tp-search-form-toggle,.tp-search-body-overlay").removeClass("active");
	});

	$('.tp-offcanvas-2-area .tp-offcanvas-menu > nav > ul > li').on("mouseenter", function () {
		$(this).addClass('is-active').siblings().removeClass('is-active');
	}).on("mouseleave", function () {
		$(this).siblings().addClass('is-active');
	});

	$(".body-overlay, .tp-offcanvas-2-close-btn").on("click", function () {
		$(".tp-offcanvas-2-area").removeClass("opened cartmini-opened");
		$(".body-overlay").removeClass("opened");
	});


	////////////////////////////////////////////////////
	// 07. Common Js
	$("[data-background").each(function () {
		$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
	});

	$("[data-width]").each(function () {
		$(this).css("width", $(this).attr("data-width"));
	});

	$("[data-bg-color]").each(function () {
		$(this).css("background-color", $(this).attr("data-bg-color"));
	});

	$("[data-text-color]").each(function () {
		$(this).css("color", $(this).attr("data-text-color"));
	});

	
	////////////////////////////////////////////////////
	// 08. Smooth Scroll Js
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
	if($('#smooth-wrapper').length && $('#smooth-content').length){
		ScrollSmoother.create({
			smooth: 1.35,
			effects: true,
			smoothTouch: .1,
			ignoreMobileResize: false
		})

	}

	////////////////////////////////////////////////////
	// 09. back-to-top
	function back_to_top() {
		var btn = $('#back_to_top');
		var btn_wrapper = $('.back-to-top-wrapper');

		windowOn.scroll(function () {
			if (windowOn.scrollTop() > 300) {
				btn_wrapper.addClass('back-to-top-btn-show');
			} else {
				btn_wrapper.removeClass('back-to-top-btn-show');
			}
		});

		btn.on('click', function (e) {
			e.preventDefault();
			$('html, body').animate({ scrollTop: 0 }, '300');
		});
	}
	back_to_top();

	////////////////////////////////////////////////////
	// 10. magnificPopup img view
	$('.popup-image').magnificPopup({
		type: 'image',
		gallery: {
			enabled: true
		}
	});

	$(".popup-video").magnificPopup({
		type: "iframe",
	});

	////////////////////////////////////////////////////
	// 11. Counter Js
	new PureCounter();
	new PureCounter({
		filesizing: true,
		selector: ".filesizecount",
		pulse: 2,
	});

	////////////////////////////////////////////////////
	// 12. reveal-text
	const splitTypes = document.querySelectorAll(".reveal-text");

	splitTypes.forEach((char) => {
		const text = new SplitType(char, { types: 'words, chars' });

		gsap.fromTo(text.chars,
			{ className: "char" },
			{
				className: "char revealed",
				scrollTrigger: {
					trigger: char,
					start: 'top 80%',
					end: 'top 20%',
					scrub: true,
					markers: false
				},
				stagger: 0.1
			}
		);
	});

	////////////////////////////////////////////////////
	// 13. hover reveal start
	const hoverItem = document.querySelectorAll(".hover-reveal-item");
	function moveImage(e, hoverItem) {
		const item = hoverItem.getBoundingClientRect();
		const x = e.clientX - item.x;
		const y = e.clientY - item.y;
		if (hoverItem.children[1]) {
			hoverItem.children[1].style.transform = `translate(${x}px, ${y}px)`;
		}
	}
	hoverItem.forEach((item, i) => {
		item.addEventListener("mousemove", (e) => {
			setInterval(moveImage(e, item), 100);
		});
	});

	////////////////////////////////////////////////////
	// 13. addClass removeClass
	$('.design-award-wrap .design-award-item').on('mouseenter', function(){
		$(this).addClass('active').parent().siblings().find('.design-award-item').removeClass('active')
	}).on('mouseleave', function(){
		$(this).addClass('active').parent().siblings().find('.design-award-item').addClass('active')
	})

	////////////////////////////////////////////////////
	// 14. award anim
	const aw = gsap.matchMedia();
	aw.add("(min-width: 991px)", () => {
		const awardItems = document.querySelectorAll('.design-award-item');
		awardItems.forEach(function(div){
			div.addEventListener('mouseenter', function() {
				gsap.to(div, {
					width: '100%',
					duration: 2,
					ease: 'expo.out'
				});
			});
			div.addEventListener('mouseleave', function() {
				gsap.to(div, {
					width: '70%',
					duration: 2,
					ease: 'expo.out'
				});
			});
		})
	});

	////////////////////////////////////////////////////
	// 15. portfolio panel

	let mm = gsap.matchMedia();
	mm.add("(min-width: 767px)", () => {
		const panels = document.querySelectorAll(".des-portfolio-panel");

		panels.forEach((panel) => {
			gsap.set(panel, {
				scale: 0.5,
				rotateZ: -20,
				transformOrigin: "center center",
				zIndex: 1
			});

			gsap.to(panel, {
				scale: 1,
				rotateZ: 0,
				ease: "power2.out",
				scrollTrigger: {
					trigger: panel,
					start: "top 90%",
					end: "top 0",
					scrub: 1,
					markers: false,
				}
			});

			const thumb = panel.querySelector('.tp-project-2-thumb');
			const img = thumb?.querySelector('.img');

			if (thumb && img) {
				gsap.set(img, {
					scale: 1,
					rotateZ: 0,
					transform: "scale3d(1, 1, 1)",
					transformOrigin: "center center",
					willChange: "transform",
					scrollTrigger: {
						scale: .7,
					}
				});
				gsap.to(thumb, {
					scale: 1.8,
					rotateZ: 10,
					transformOrigin: "center center",
					willChange: "transform",
					scrollTrigger: {
						trigger: panel,
						start: "top 85%",
						end: "top 0",
						scrub: true,
						markers: false,
					}
				});

				gsap.to(img, {
					rotateZ: -10,
					scrollTrigger: {
					trigger: panel,
					start: "top 85%",
					end: "top 0",
					scrub: true,
					markers: false,
					}
				});
			}
		});
	});
	
	////////////////////////////////////////////////////
	// 16. light-dark-active
	
	function tpdarkLight() {
		if (!$('body').hasClass('bfolio-dark')) {
			$('body').removeClass('bfolio-light').addClass('bfolio-dark');
			localStorage.theme = 'dark';
		} else {
			$('body').removeClass('bfolio-dark').addClass('bfolio-light');
			localStorage.theme = 'light';
		}
	}

	$(".tp-dark-switch").on("click", function () {
		tpdarkLight();
	});


	// update-home-js-here

	/////////////////////////////////////////////////////
	// 17. Portfolio Animation
	if (device_width > 767) {
		const portfolioArea = document.querySelector(".bf-portfolio-sticky-area");
		const portfolioText = document.querySelector(".bf-portfolio-text-sticky");

		if (portfolioArea && portfolioText) {
			let portfolioline = gsap.timeline({
				scrollTrigger: {
					trigger: portfolioArea,
					start: "top center-=200",
					pin: portfolioText,
					end: "bottom bottom+=10",
					markers: false,
					pinSpacing: false,
					scrub: 1,
				}
			});

			portfolioline.to(portfolioText, { scale: 0.6, duration: 1 });
			portfolioline.to(portfolioText, { scale: 0.6, duration: 1 });
			portfolioline.to(portfolioText, { scale: 0.6, duration: 1 }, "+=2");

			gsap.to(portfolioText, {
			scrollTrigger: {
				trigger: portfolioArea,
				start: "top center-=100",
				end: "bottom bottom+=10",
				scrub: 1
			},
			});
		}
	}

	////////////////////////////////////////////////////
	// 18. tp-vimeo-video-perspective
	
	document.addEventListener("DOMContentLoaded", function() {
		const $projects = $(".project-item.project-style-3.hover-play");

		if ($projects.length === 0) return;

		$projects.css({
			perspective: "1500px",
			"transform-style": "preserve-3d",
			overflow: "visible",
		});

		function updateTransform() {
			if (window.innerWidth < 1024) {
			$projects.each(function () {
				const $inner = $(this).find(".project-item-inner");
				$inner.css({ transform: "none", transition: "none" });
				const $img = $inner.find(".bf-portfolio-post-thumbnail img");
				$img.css({ transform: "none", transition: "none" });
			});
			} else {
			const windowHeight = window.innerHeight;
			$projects.each(function () {
				const $project = $(this);
				const $inner = $project.find(".project-item-inner");

				if ($inner.length === 0) return;

				const rect = this.getBoundingClientRect();
				let percent = (rect.top + rect.height / 2 - windowHeight / 2) / (windowHeight / 2);
				percent = Math.max(-1, Math.min(percent, 1));

				const rotateX = 30 * -percent + 0.756;
				const scale = (0.996976 - 0.105 * Math.abs(percent)).toFixed(6);

				$inner.css({
				transform: `rotateX(${rotateX.toFixed(3)}deg) scale3d(${scale}, ${scale}, 1)`,
				transition:
					"transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
				"transform-style": "preserve-3d",
				"will-change": "transform, opacity",
				});

				const $img = $inner.find(".bf-portfolio-post-thumbnail img");
				if ($img.length) {
				const translateY = 20 * percent;
				$img.css({
					transform: `translateY(${translateY.toFixed(2)}px)`,
					transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
					"will-change": "transform",
				});
				}
			});
			}
		}

		let ticking = false;

		updateTransform();

		$(window).on("scroll resize", function () {
			if (!ticking) {
			window.requestAnimationFrame(() => {
				updateTransform();
				ticking = false;
			});
			ticking = true;
			}
		});
	});


	////////////////////////////////////////////////////
	// 19. bf-hero-2-video
	gsap.registerPlugin(ScrollTrigger);

	function hero_video_animation() {
		const videoWrap = document.querySelector(".bf-hero-2-video-wrap");
		const video = document.querySelector(".bf-hero-2-video");

		if (!videoWrap || !video) return;

		const mm = gsap.matchMedia();

		mm.add("(min-width: 992px)", () => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: videoWrap,
					start: "top top",
					end: "bottom+=1000 top",
					scrub: true,
					pin: true,
				},
			});

			tl.to(video, {
				width: "100vw",
				height: "100vh",
				bottom: 0,
				left: 0,
				borderRadius: 0,
				ease: "power2.out",
			}, 0);
		});
	}

	$(function () {
		hero_video_animation();
	});

	////////////////////////////////////////////////////
	// 20. moving-text
	function moving_text(){
		if ($('.moving-text').length > 0) {
			gsap.utils.toArray('.moving-text').forEach((section, index) => {
				const w = section.querySelector('.wrapper-text');
				const [x, xEnd] = (index % 2) ? [(section.offsetWidth - w.scrollWidth), 0] : [0, section.offsetWidth - w.scrollWidth];
				gsap.fromTo(w, { x }, {
					x: xEnd,
					scrollTrigger: {
						trigger: section,
						scrub: 0.1,
					}
				});
			});
		}
	}
	$(function(){
		moving_text();
	});

  /////////////////////////////////////////////////////
  // 35 .scrool-rotate-img

	$(".scrool-rotate-img").each(function () {
		gsap.to(this, {
			rotation: 720,
			ease: "power2.out",
			duration: 1,
			scrollTrigger: {
				trigger: this,
				start: "top bottom",
				end: "bottom top",
				scrub: 1.5,
			}
		});
	});

  /////////////////////////////////////////////////////
  // 36 .bf-portfolio-vp-rotate-wrap
	if (document.querySelectorAll('.bf-portfolio-vp-rotate-wrap')) {
		mm.add("(min-width: 1200px)", () => {
			document.querySelectorAll('.bf-portfolio-vp-rotate-wrap').forEach(item => {
				const leftItem = item.querySelector('.bf-portfolio-vp-rotate-item-1');
				const rightItem = item.querySelector('.bf-portfolio-vp-rotate-item-2');
				gsap.set(leftItem,  { x: -300, y: 200, rotate: 30,  opacity: 0.6, ease: "none" });
				gsap.set(rightItem, {x: 300,  y: 200, rotate: -30, opacity: 0.6, ease: "none" });

				let tl = gsap.timeline({
					scrollTrigger: {
						trigger: item,
						start: "top 90%",
						end: "bottom 10%",  
						scrub: 1,
					}
				});
				tl.to([leftItem, rightItem], {
					x: 0, y: 0, rotate: 0, opacity: 1, ease: "none"
				})
				.to(leftItem,  {  x: -300, y: -200, rotate: -30, opacity: 0.6 })
				.to(rightItem, { x: 300,  y: -200, rotate: 30,  opacity: 0.6 }, "<");
			});
		});
	}

	////////////////////////////////////////////////////
	// 15. portfolio animation start

	if ($('.bf-item-anime').length > 0) {
		mm.add("(min-width: 1200px)", () => {
			gsap.set('.bf-item-anime.marque', {
				x: '-23%'
			});

			gsap.timeline({
				scrollTrigger: {
					trigger: '.bf-hero-anime-area',
					start: '-100 10%',
					end: 'bottom 20%',
					scrub: true,
					invalidateOnRefresh: true
				}
			})
			.to('.bf-item-anime.marque', {
				x: '100%'
			});
		});
	}

	if ($('.bf-item-anime-md').length > 0) {
		mm.add("(min-width: 1200px)", () => {
			gsap.set('.bf-item-anime-md.marque', {
				x: '40%'
			});

			gsap.timeline({
				scrollTrigger: {
					trigger: '.bf-hero-anime-area',
					start: '-100 20%',
					end: 'bottom 20%',
					scrub: true,
					invalidateOnRefresh: true
				}
			})
			.to('.bf-item-anime-md.marque', {
				x: '-100%'
			});
		});
	}

	if ($('.bf-item-anime-inner').length > 0) {
		mm.add("(min-width: 1200px)", () => {
			gsap.set('.bf-item-anime-inner.marque', {
				x: '-8%'
			});

			gsap.timeline({
				scrollTrigger: {
					trigger: '.bf-hero-anime-area',
					start: '0 10%',
					end: 'bottom 20%',
					scrub: true,
					invalidateOnRefresh: true
				}
			})
			.to('.bf-item-anime-inner.marque', {
				x: '50%'
			});
		});
	}

	////////////////////////////////////////////////////
	// 13. button hover animation
	$('.bf-btn-rounded').on('mouseenter', function (e) {
		var x = e.pageX - $(this).offset().left;
		var y = e.pageY - $(this).offset().top;

		$(this).find('.bf-btn-circle-dot').css({
			top: y,
			left: x
		});
	});

  	/////////////////////////////////////////////////////
  	// 20. Button Move Animation
	const all_btn = gsap.utils.toArray(".btn_wrapper, #btn_wrapper");
	const all_btn_circle = gsap.utils.toArray(".btn-item");

	if (all_btn.length && all_btn_circle.length) {
		all_btn.forEach((btn, i) => {
			const circle = all_btn_circle[i];

			// Mouse move = parallax effect
			$(btn).on("mousemove", function (e) {
			const $this = $(this);
			const relX = e.pageX - $this.offset().left;
			const relY = e.pageY - $this.offset().top;
				gsap.to(circle, {
					duration: 0.5,
					x: ((relX - $this.width() / 2) / $this.width()) * 80,
					y: ((relY - $this.height() / 2) / $this.height()) * 80,
					ease: "power2.out",
				});
			});

			// Mouse leave = reset effect
			$(btn).on("mouseleave", function () {
				gsap.to(circle, {
					duration: 0.5,
					x: 0,
					y: 0,
					ease: "power2.out",
				});
			});
		});
	}

  	/////////////////////////////////////////////////////
  	// 20. tp-text-right-scroll
	gsap.matchMedia().add("(min-width: 991px)", () => {
		document.querySelectorAll(".title-box").forEach((box) => {
			const rightElements = box.querySelectorAll('.tp-text-right-scroll');
			const tl = gsap.timeline({
				scrollTrigger: {
				trigger: box,
				start: "top 100%",
				end: "bottom top",
				scrub: true,
				markers: false,
				}
			});
			if (rightElements.length) {
				tl.fromTo(rightElements, { xPercent: 50 }, { xPercent: -20, ease: "power1.out" }, 0);
			}
		});
	});
	  
  	/////////////////////////////////////////////////////
  	// 20. tp-text-right-scroll

	if (document.querySelector('.bf-portfolio-3-item')) {
		const pw = gsap.matchMedia();
		pw.add("(min-width: 991px)", () => {
			gsap.set('.bf-portfolio-3-thumb.item-1', { x: 400, rotate: 10,});
			gsap.set('.bf-portfolio-3-thumb.item-2', { x: -400, rotate: -10, });
			document.querySelectorAll('.bf-portfolio-3-item').forEach(item => {
				let tl = gsap.timeline({
					scrollTrigger: {
						trigger: item,
						start: 'top 100%',
						end: 'bottom center',
						scrub: 1,
					}
				});
				tl.to(item.querySelector('.bf-portfolio-3-thumb.item-1'), { x: 0, rotate: 0 })
				.to(item.querySelector('.bf-portfolio-3-thumb.item-2'), { x: 0, rotate: 0 }, 0);
			});
		});
	}


  	/////////////////////////////////////////////////////
  	// 20. tp-instagram-area

	if ($('.bf-instagram-area').length > 0) {
		mm.add("(min-width: 1200px)", () => {
			let tp_instagram_3 = gsap.timeline({
				scrollTrigger: {
					trigger: ".bf-instagram-area",
					start: "top 30%",
					pin: true,
					markers: false,
					scrub: 1,
					pinSpacing: false,
					end: "bottom 100%",
					duration: 3,
					
				}
			});
			tp_instagram_3.to(".bf-instagram-thumb img", {
				width: "580px",
				height: "580px",
				borderRadius: "10px",
			});
	
		});
	}

	////////////////////////////////////////////////////
	// 59. ttp-port-slider-title

	$('.tp-port-slider-title').on("mouseenter", function () {
		$('#tp-port-slider-wrap').removeClass().addClass($(this).attr('rel'));
		$(this).addClass('active').siblings().removeClass('active');
	});

	////////////////////////////////////////////////////
	// 60. tp-porfolio-10-title-wrap
	$('.tp-porfolio-10-title-wrap > ul > li').on('mouseenter', function(){
		$(this).siblings().removeClass('active');
		const rel = $(this).attr('rel');
		$(this).addClass('active');
		$('#tp-porfolio-10-bg-box').removeClass().addClass(rel);
	})

	////////////////////////////////////////////////////
	// 59. ttp-port-slider-title
	$('.tp-port-slider-title').on("mouseenter", function () {
		$('#tp-port-slider-wrap').removeClass().addClass($(this).attr('rel'));
		$(this).addClass('active').siblings().removeClass('active');
	});

	////////////////////////////////////////////////////
	// 57. tp-portfolio-revealing-slide

	(function () {
		var $slides = document.querySelectorAll('.tp-portfolio-revealing-slide');
		var $controls = document.querySelectorAll('.tp-portfolio-revealing-slider-control');
		var numOfSlides = $slides.length;
		var slidingAT = 1300;
		var slidingBlocked = false;

		[].slice.call($slides).forEach(function ($el, index) {
			var i = index + 1;
			$el.classList.add('tp-portfolio-revealing-slide-' + i);
			$el.dataset.slide = i;
		});

		if (!$slides.length) return;
		$slides[0].classList.add('s-active');

		[].slice.call($controls).forEach(function ($el) {
			$el.addEventListener('click', controlClickHandler);
		});

		// Scroll support
		window.addEventListener('wheel', function (e) {
			if (slidingBlocked) return;

			if (e.deltaY > 0) {
				changeSlide(true);
			} else if (e.deltaY < 0) {
				changeSlide(false);
			}
		});

		function controlClickHandler() {
			if (slidingBlocked) return;
			var isRight = this.classList.contains('m-right');
			changeSlide(isRight, this);
		}

		function changeSlide(isRight, $controlEl) {
			slidingBlocked = true;

			var $curActive = document.querySelector('.tp-portfolio-revealing-slide.s-active');
			if (!$curActive) {
				console.warn('No active slide found.');
				slidingBlocked = false;
				return;
			}

			var index = +$curActive.dataset.slide;
			isRight ? index++ : index--;
			if (index < 1) index = numOfSlides;
			if (index > numOfSlides) index = 1;
			var $newActive = document.querySelector('.tp-portfolio-revealing-slide-' + index);

			if ($controlEl) {
				$controlEl.classList.add('a-rotation');
			}

			$curActive.classList.remove('s-active', 's-active-prev');
			document.querySelector('.tp-portfolio-revealing-slide.s-prev')?.classList.remove('s-prev');

			$newActive.classList.add('s-active');
			if (!isRight) $newActive.classList.add('s-active-prev');

			var prevIndex = index - 1;
			if (prevIndex < 1) prevIndex = numOfSlides;
			document.querySelector('.tp-portfolio-revealing-slide-' + prevIndex).classList.add('s-prev');

			var direction = isRight ? 1 : -1;
			var currentHeading = $curActive.querySelector('.tp-portfolio-revealing-slide-heading');
			var nextHeading = $newActive.querySelector('.tp-portfolio-revealing-slide-heading');

			if (currentHeading && nextHeading) {
				gsap.timeline()
					.to(currentHeading, {
						scaleX: 2,
						xPercent: 20 * direction,
						duration: 1,
						ease: 'power3.inOut'
					}, 0)
					.fromTo(nextHeading, {
						scaleX: 2,
						xPercent: -10 * direction
					}, {
						scaleX: 1,
						xPercent: 0,
						duration: 1,
						ease: 'power3.inOut'
				}, 0);
			}

			setTimeout(function () {
				if ($controlEl) $controlEl.classList.remove('a-rotation');
				slidingBlocked = false;
			}, slidingAT * 0.75);
		}
	})();


})(jQuery);
