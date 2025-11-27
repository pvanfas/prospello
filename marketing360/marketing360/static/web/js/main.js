(function() {
	"use strict";

    // Header Sticky
    window.addEventListener('scroll', event => {
        const height = 150;
        const { scrollTop } = event.target.scrollingElement;
        document.querySelector('#navbar').classList.toggle('sticky', scrollTop >= height);
    });

    window.onload = function(){
        
        // Back to Top
        const getId = document.getElementById("back-to-top");
        if (getId) {
            const topbutton = document.getElementById("back-to-top");
            topbutton.onclick = function (e) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            };
            window.onscroll = function () {
                if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                    topbutton.style.opacity = "1";
                } else {
                    topbutton.style.opacity = "0";
                }
            };
        }

        // Preloader
        const getPreloaderId = document.getElementById('preloader');
        if (getPreloaderId) {
            getPreloaderId.style.display = 'none';
        }
        
        // Counter Js
        try {
            if ("IntersectionObserver" in window) {
                let counterObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                        let counter = entry.target;
                        let target = parseInt(counter.innerText);
                        let step = target / 200;
                        let current = 0;
                        let timer = setInterval(function () {
                            current += step;
                            counter.innerText = Math.floor(current);
                            if (parseInt(counter.innerText) >= target) {
                                clearInterval(timer);
                            }
                        }, 10);
                        counterObserver.unobserve(counter);
                        }
                    });
                });
                let counters = document.querySelectorAll(".counter");
                    counters.forEach(function (counter) {
                    counterObserver.observe(counter);
                });
            }
        } catch {}

        // Promote Text Hover Effect Js
        try {
            const circle = document.querySelector('.circle');
            const container = document.querySelector('.promote-text-hover-effect');
            
            container.addEventListener('mousemove', (e) => {
                const { offsetX, offsetY } = e;
                const { top, left } = container.getBoundingClientRect();
                
                circle.style.left = `${offsetX}px`;
                circle.style.top = `${offsetY}px`;
                circle.style.transform = 'translate(-50%, -50%) scale(1)';
                circle.style.opacity = '0.5';
            });
            container.addEventListener('mouseleave', () => {
                circle.style.opacity = '0';
            });
        } catch {}

        // Dark/Light Toggle
        const getSwitchToggleId = document.getElementById('switch-toggle');
        if (getSwitchToggleId) {
            const switchtoggle = document.querySelector(".switch-toggle, .switch-toggle2");
            const savedTheme = localStorage.getItem("torado_theme");
            if (savedTheme) {
                document.body.setAttribute("data-theme", savedTheme);
            }
            switchtoggle.addEventListener("click", function () {
                if (document.body.getAttribute("data-theme") === "dark") {
                    document.body.setAttribute("data-theme", "light");
                    localStorage.setItem("torado_theme", "light");
                } else {
                    document.body.setAttribute("data-theme", "dark");
                    localStorage.setItem("torado_theme", "dark");
                }
            });
        }
    };
    
    // Places Slide Swiper JS
	var SwiperTraveler = new Swiper(".places-slide-swiper", {
        loop: true,
        spaceBetween: 25,
        center: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            },
            1200: {
                slidesPerView: 3
            },
        }
    });

    // scrollCue
    scrollCue.init();

})();