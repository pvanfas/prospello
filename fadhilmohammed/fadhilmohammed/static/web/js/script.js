// Loader
setTimeout(function () {
document.querySelector("div.loading").classList.add("hidden")
}, 1000)


var fadeIn = {
    distance: '40px',
    origin: 'bottom',
    reset: true,
    opacity: 0
};
ScrollReveal().reveal('.fadeIn', fadeIn);

var fadeIn2 = {
    distance: '40px',
    origin: 'bottom',
    reset: true,
     delay: 100,
    opacity: 0
};
ScrollReveal().reveal('.fadeIn2', fadeIn2);

var fadeIn3 = {
    distance: '40px',
    origin: 'bottom',
    reset: true,
     delay: 200,
    opacity: 0
};
ScrollReveal().reveal('.fadeIn3', fadeIn3);

var fadeIn4 = {
    distance: '40px',
    origin: 'bottom',
    reset: true,
     delay: 300,
    opacity: 0
};
ScrollReveal().reveal('.fadeIn4', fadeIn4);

 var fadeIn5 = {
    distance: '40px',
    origin: 'bottom',
    reset: true,
     delay: 400,
    opacity: 0
};
ScrollReveal().reveal('.fadeIn5', fadeIn5);


// Add smooth scrolling to all links
$("a").on('click', function(event) {

  // Make sure this.hash has a value before overriding default behavior
  if (this.hash !== "") {
    // Prevent default anchor click behavior
    event.preventDefault();

    // Store hash
    var hash = this.hash;

    // Using jQuery's animate() method to add smooth page scroll
    // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
    $('html, body').animate({
      scrollTop: $(hash).offset().top
    }, 800, function(){

      // Add hash (#) to URL when done scrolling (default click behavior)
      window.location.hash = hash;
    });
  } // End if
});


// Hamburger
(function() {

    "use strict";

    var toggles = document.querySelectorAll(".hamburger");

    for (var i = toggles.length - 1; i >= 0; i--) {
      var toggle = toggles[i];
      toggleHandler(toggle);
    };

    function toggleHandler(toggle) {
      toggle.addEventListener( "click", function(e) {
        e.preventDefault();
        (this.classList.contains("is-active") === true) ? this.classList.remove("is-active") : this.classList.add("is-active");
      });
    }

  })();

// Mobile Menu Toggle
$('.nav-close a').click(function () {
	$('.nav-mobile').slideToggle('fast');
	$('body').toggleClass('fixed');
	$('.header').toggleClass('fixed');
	$('.hamburger').toggleClass('is-active');
});

$('.hamburger').click(function () {
	$('.nav-mobile').slideToggle('fast');
	$('.header').toggleClass('fixed');
	$('body').toggleClass('fixed');
});

  var acc = document.getElementsByClassName("accordion");
  var i;

  // Add onclick listener to every accordion element
  for (i = 0; i < acc.length; i++) {
    acc[i].onclick = function() {
      // For toggling purposes detect if the clicked section is already "active"
      var isActive = this.classList.contains("active");

      // Close all accordions
      var allAccordions = document.getElementsByClassName("accordion");
      for (j = 0; j < allAccordions.length; j++) {
        // Remove active class from section header
        allAccordions[j].classList.remove("active");

        // Remove the max-height class from the panel to close it
        var panel = allAccordions[j].nextElementSibling;
        var maxHeightValue = getStyle(panel, "maxHeight");

      if (maxHeightValue !== "0px") {
          panel.style.maxHeight = null;
        }
      }

      // Toggle the clicked section using a ternary operator
      isActive ? this.classList.remove("active") : this.classList.add("active");

      // Toggle the panel element
      var panel = this.nextElementSibling;
      var maxHeightValue = getStyle(panel, "maxHeight");

      if (maxHeightValue !== "0px") {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    };
  }

  // Cross-browser way to get the computed height of a certain element. Credit to @CMS on StackOverflow (http://stackoverflow.com/a/2531934/7926565)
  function getStyle(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function(value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}
