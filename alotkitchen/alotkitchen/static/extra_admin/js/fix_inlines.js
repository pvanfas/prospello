// Fix for admin_interface plugin conflicts with Django inlines
$(document).ready(function() {
    // Re-initialize inline formsets after admin_interface loads
    if (typeof django !== 'undefined' && django.jQuery) {
        const $ = django.jQuery;
        
        // Force re-initialization of inline formsets
        $('.js-inline-admin-formset').each(function() {
            const $this = $(this);
            const data = $this.data();
            
            if (data && data.inlineFormset) {
                const inlineOptions = data.inlineFormset;
                let selector;
                
                switch(data.inlineType) {
                    case "stacked":
                        selector = inlineOptions.name + "-group .inline-related";
                        if ($(selector).length) {
                            $(selector).stackedFormset(selector, inlineOptions.options);
                        }
                        break;
                    case "tabular":
                        selector = inlineOptions.name + "-group .tabular.inline-related tbody:first > tr.form-row";
                        if ($(selector).length) {
                            $(selector).tabularFormset(selector, inlineOptions.options);
                        }
                        break;
                }
            }
        });
    }
});
