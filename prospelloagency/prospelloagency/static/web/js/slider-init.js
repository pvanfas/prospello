/***************************************************
==================== JS INDEX ======================
****************************************************
01. tp-testimonial-avatar-slider
02. tp-brand-slide-active
17. tp-hero-2-arrow-active
****************************************************/


(function ($) {
	"use strict";

	////////////////////////////////////////////////////
	// 01. tp-testimonial-avatar-slider
	var avatarSlider = new Swiper('.tp-testimonial-avatar-slider', {
		slidesPerView: 1,
		loop: true,
		autoplay: {
			delay: 5000,
		},
		spaceBetween: 30,
		effect: "fade",
	});

	var textSlider = new Swiper('.tp-testimonial-text-slider', {
		slidesPerView: 1,
		loop: true,
		autoplay: {
			delay: 5000,
		},
		spaceBetween: 30,
		navigation: {
			nextEl: '.tp-testimonial-next',
			prevEl: '.tp-testimonial-prev',
		},
	});

	// Sync the sliders
	avatarSlider.controller.control = textSlider;
	textSlider.controller.control = avatarSlider;


	// 02. tp-brand-slide-active
	var tp_brand_slider= new Swiper(".tp-text-slide-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 80,
		speed: 8000,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	});

	////////////////////////////////////////////////////
	// 16. postbox-thumb-slider-active
	var postbox = new Swiper('.postbox-thumb-slider-active', {
		slidesPerView: 1,
		loop: true,
		autoplay: true,
		effect: 'fade',
		// Navigation arrows
		navigation: {
			nextEl: '.tp-postbox-arrow-next',
			prevEl: '.tp-postbox-arrow-prev',
		},
		a11y: false,
	});

	// update-js-here

	////////////////////////////////////////////////////
	// 18. bf-hero-2-arrow-active
	setTimeout(() => {
		var tp_brand_slide = new Swiper(".bf-hero-2-arrow-active", {
			loop: true,
			freemode: true,
			slidesPerView: 'auto',
			spaceBetween: 50,
			centeredSlides: true,
			allowTouchMove: false,
			speed: 1000,
			autoplay: {
			delay: 1,
			disableOnInteraction: true,
			},
		});
	}, 500);

	////////////////////////////////////////////////////
	// 24. tp-portfolio-mix-slider
	var tp_portfolio_mix_slider = new Swiper('.tp-portfolio-mix-slider', {
		loop: false,
		modules: [SwiperGL],
		speed: 1200,
		effect: "gl",
		mousewheel: true,
		navigation: {
		  nextEl: '.tp-portfolio-mix-button-next',
		  prevEl: '.tp-portfolio-mix-button-prev',
		},
		pagination: {
		  el: '.tp-portfolio-mix-pagination',
		   clickable: true,
		},
	});


})(jQuery);    