// Function to initialize the form
function initContactForm() {
    if (window.initContactFormInitialized) return;
    window.initContactFormInitialized = true;

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit');
    if (!form || !submitBtn) {
        console.error('Form or submit button not found.');
        return;
    }

    // Remove inline event handlers if any
    form.removeAttribute('onsubmit');
    submitBtn.removeAttribute('onclick');

    // Attach click event listener to the submit button
    submitBtn.addEventListener('click', event => {
        event.preventDefault();
        submitForm();
    });

    console.log('Event handler attached successfully to button click');
}

// Function to submit the form
function submitForm() {
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const companyInput = document.getElementById('form-company');
    const phoneInput = document.getElementById('form-phone');
    const messageInput = document.getElementById('form-message');
    const statusEl = document.getElementById('form-status');

    if (!nameInput || !emailInput || !companyInput || !messageInput || !statusEl) {
        alert('Error: Some form elements could not be found.');
        return;
    }

    statusEl.textContent = '';
    statusEl.className = 'form-status';

    setTimeout(() => {
        statusEl.textContent = 'Sending...';
        statusEl.className = 'form-status loading';

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            company: companyInput.value.trim(),
            phone: phoneInput ? phoneInput.value.trim() : '',
            message: messageInput.value.trim(),
            origin: 'GSS'
        };

        if (!formData.name || !formData.email || !formData.company || !formData.message) {
            statusEl.textContent = 'Please fill out all required fields.';
            statusEl.className = 'form-status error';
            return;
        }

        fetch('https://form.digital-ninja.xyz/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.ok) {
                    statusEl.textContent = 'Thank you for your message! We will contact you soon.';
                    statusEl.className = 'form-status success';
                    nameInput.value = '';
                    emailInput.value = '';
                    companyInput.value = '';
                    if (phoneInput) phoneInput.value = '';
                    messageInput.value = '';
                } else {
                    return response.json()
                        .then(errData => {
                            const errorMsg = errData.error || errData.message || 'Error ' + response.status;
                            statusEl.textContent = errorMsg;
                            statusEl.className = 'form-status error';
                        })
                        .catch(() => {
                            statusEl.textContent = 'Server error: ' + response.status + ' ' + response.statusText;
                            statusEl.className = 'form-status error';
                        });
                }
            })
            .catch(error => {
                statusEl.textContent = 'Network error: ' + error.message;
                statusEl.className = 'form-status error';
            });
    }, 10);
}

/* Removed usage of DOMContentLoaded event and MutationObserver; now using a simple self executing function to initialize the form */
; (function () {
    initContactForm()
    console.log('Inquiries form script initialized via self executing function')
}())


