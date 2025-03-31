// Form handler for inquiries page
console.log('Inquiries form script loading');

// Function to initialize the form
function initContactForm() {
    console.log('Initializing contact form');
    
    // Get form elements
    var form = document.getElementById('contact-form');
    var submitBtn = document.getElementById('form-submit');
    
    if (!form) {
        console.error('Form not found in the page');
        return false;
    }
    
    if (!submitBtn) {
        console.error('Submit button not found in the page');
        return false;
    }
    
    console.log('Form elements found, attaching event handlers');
    
    // Create a new function reference each time to avoid duplicates
    function onFormSubmit(event) {
        console.log('Form submission intercepted');
        if (event) {
            event.preventDefault();
        }
        submitForm();
        return false;
    }
    
    // Remove any existing handlers by cloning the elements
    var newForm = form.cloneNode(true);
    if (form.parentNode) {
        form.parentNode.replaceChild(newForm, form);
        form = newForm;
    }
    
    var newBtn = submitBtn.cloneNode(true);
    if (submitBtn.parentNode) {
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);
        submitBtn = newBtn;
    }
    
    // Get updated references after cloning
    form = document.getElementById('contact-form');
    submitBtn = document.getElementById('form-submit');
    
    if (!form || !submitBtn) {
        console.error('Lost references after cloning');
        return false;
    }
    
    // Multiple ways to attach event handlers for redundancy
    try {
        // 1. Direct attribute
        form.setAttribute('onsubmit', 'return submitForm(), false;');
        
        // 2. Property assignment
        form.onsubmit = onFormSubmit;
        
        // 3. Event listener
        form.addEventListener('submit', onFormSubmit);
        
        // Same for button
        submitBtn.setAttribute('onclick', 'submitForm(); return false;');
        submitBtn.onclick = onFormSubmit;
        submitBtn.addEventListener('click', onFormSubmit);
        
        console.log('Event handlers attached successfully using multiple methods');
    } catch (e) {
        console.error('Error attaching event handlers:', e);
        return false;
    }
    
    // Test if the handler is working
    setTimeout(function() {
        try {
            if (typeof form.onsubmit === 'function') {
                console.log('Form onsubmit is a function - good!');
            } else {
                console.error('Form onsubmit is not a function!');
            }
            
            if (typeof submitBtn.onclick === 'function') {
                console.log('Button onclick is a function - good!');
            } else {
                console.error('Button onclick is not a function!');
            }
        } catch (e) {
            console.error('Error testing handlers:', e);
        }
    }, 100);
    
    return true;
}

// Function to submit the form
function submitForm() {
    console.log('Submit form function called');
    
    // Get form elements
    var nameInput = document.getElementById('form-name');
    var emailInput = document.getElementById('form-email');
    var companyInput = document.getElementById('form-company');
    var phoneInput = document.getElementById('form-phone');
    var messageInput = document.getElementById('form-message');
    var statusEl = document.getElementById('form-status');
    
    // Check if elements exist
    if (!nameInput || !emailInput || !companyInput || !messageInput || !statusEl) {
        console.error('Form elements not found', {
            name: !!nameInput,
            email: !!emailInput,
            company: !!companyInput,
            message: !!messageInput,
            status: !!statusEl
        });
        alert('Error: Some form elements could not be found.');
        return false;
    }
    
    // Clear status and then set loading state
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    
    // Short delay to ensure CSS transition works correctly
    setTimeout(function() {
        // Set loading state
        statusEl.textContent = 'Sending...';
        statusEl.className = 'form-status loading';
        
        // Get values
        var name = nameInput.value.trim();
        var email = emailInput.value.trim();
        var company = companyInput.value.trim();
        var phone = phoneInput ? phoneInput.value.trim() : '';
        var message = messageInput.value.trim();
        
        // Basic validation
        if (!name || !email || !company || !message) {
            statusEl.textContent = 'Please fill out all required fields.';
            statusEl.className = 'form-status error';
            return false;
        }
        
        // Prepare data
        var formData = {
            name: name,
            email: email,
            company: company,
            phone: phone,
            message: message,
            origin: 'GSS'
        };
        
        console.log('Sending form data:', formData);
        
        // Send request
        fetch('https://form.digital-ninja.xyz/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(function(response) {
            console.log('Response received:', response);
            if (response.ok) {
                statusEl.textContent = 'Thank you for your message! We will contact you soon.';
                statusEl.className = 'form-status success';
                
                // Clear form
                nameInput.value = '';
                emailInput.value = '';
                companyInput.value = '';
                if (phoneInput) phoneInput.value = '';
                messageInput.value = '';
                
                console.log('Form submitted successfully');
            } else {
                // Parse the error message from the response
                console.error('Server returned error status:', response.status, response.statusText);
                
                // Try to get the detailed error from JSON
                return response.json()
                .then(function(errorData) {
                    // Successfully parsed JSON response
                    console.log('Parsed error data:', errorData);
                    
                    // Check various possible error message locations
                    var errorMessage = errorData.error || errorData.message || 'Server error: ' + response.status;
                    console.log('Using error message:', errorMessage);
                    
                    // Display the error in the UI
                    statusEl.textContent = errorMessage;
                    statusEl.className = 'form-status error';
                })
                .catch(function(parseError) {
                    // Failed to parse JSON - use status text instead
                    console.error('Failed to parse error response:', parseError);
                    statusEl.textContent = 'Server error: ' + response.status + ' ' + response.statusText;
                    statusEl.className = 'form-status error';
                });
            }
        })
        .catch(function(networkError) {
            // Network error (like CORS, network failure, etc)
            console.error('Network error submitting form:', networkError);
            statusEl.textContent = 'Network error: ' + (networkError.message || 'Could not connect to server');
            statusEl.className = 'form-status error';
            return false;
        });
    }, 10);
    
    return false;
}

// Multiple initialization methods for redundancy


// Method 2: Try on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, trying initialization again');
    initContactForm();
});




// Make functions globally available for direct access
window.initContactForm = initContactForm;
window.submitForm = submitForm;

console.log('Inquiries form script loaded and ready'); 