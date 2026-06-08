(function() {
    'use strict';

    // Helper function to clean up any literal "[]" text nodes in the DOM
    function cleanDomBrackets() {
        var elements = document.querySelectorAll('#result_list td, #result_list th');
        elements.forEach(function(el) {
            // Check text nodes directly to avoid messing up child HTML tags (like <input>)
            var child = el.firstChild;
            while (child) {
                if (child.nodeType === 3) { // Text Node
                    if (child.nodeValue.includes('[]')) {
                        child.nodeValue = child.nodeValue.replace(/\[\]/g, '').trim();
                    }
                }
                child = child.nextSibling;
            }
        });
    }

    // Intercept the copy event to clean up "[]" copy-paste artifact of checkbox inputs
    function handleCopy(e) {
        var selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }

        var text = selection.toString();
        if (text.includes('[]')) {
            // Replace "[]" in the copied text with an empty string/space
            var cleanedText = text.replace(/\[\]/g, '').trim();
            
            // Set the cleaned text to the clipboard
            e.clipboardData.setData('text/plain', cleanedText);
            e.preventDefault(); // Prevent default copy action
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            cleanDomBrackets();
            document.addEventListener('copy', handleCopy);
        });
    } else {
        cleanDomBrackets();
        document.addEventListener('copy', handleCopy);
    }
})();
