// Western Advisors Booking Form JavaScript
// Form validation and Google Sheets integration

// Configuration
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // Replace with your Google Apps Script URL

// Get form element
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Show loading state
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    try {
        // Submit to Google Sheets
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        }
        
        // Redirect to thank you page
        window.location.href = 'thankyou.html';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your form. Please try again or call us at (800) 436-4479.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function validateForm() {
    let isValid = true;
    
    // Clear previous error messages
    clearErrors();
    
    // Validate required text fields
    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'streetAddress', 'city', 'zipCode'];
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate email
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        showError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    const phoneField = document.getElementById('phone');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        showError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate required selects
    const requiredSelects = ['age', 'state'];
    requiredSelects.forEach(selectName => {
        const select = document.getElementById(selectName);
        if (!select.value) {
            showError(select, 'Please make a selection');
            isValid = false;
        }
    });
    
    // Validate radio buttons
    const assetsRadio = document.querySelector('input[name="assets"]:checked');
    if (!assetsRadio) {
        alert('Please select your total investable assets');
        isValid = false;
    }
    
    const statusRadio = document.querySelector('input[name="currentStatus"]:checked');
    if (!statusRadio) {
        alert('Please select your current retirement status');
        isValid = false;
    }
    
    return isValid;
}

function getFormData() {
    // Get all form values
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        age: document.getElementById('age').value,
        streetAddress: document.getElementById('streetAddress').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value.trim(),
        assets: document.querySelector('input[name="assets"]:checked')?.value || '',
        accountTypes: getCheckboxValues('accountTypes'),
        currentStatus: document.querySelector('input[name="currentStatus"]:checked')?.value || '',
        primaryGoals: getCheckboxValues('primaryGoals'),
        howHeard: document.getElementById('howHeard').value,
        comments: document.getElementById('comments').value.trim()
    };
    
    return formData;
}

function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value).join(', ');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
}

function showError(field, message) {
    field.style.borderColor = '#ef4444';
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    // Insert after field
    field.parentNode.appendChild(errorDiv);
}

function clearErrors() {
    // Reset border colors
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.style.borderColor = '#ddd';
    });
    
    // Remove error messages
    const errorMessages = bookingForm.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        
        if (value.length >= 6) {
            value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        }
        
        e.target.value = value;
    });
}

/*
Google Sheets Setup Instructions:
1. Create a Google Sheet with these column headers:
   Timestamp | First Name | Last Name | Phone | Email | Age | Street Address | City | State | Zip Code | Investable Assets | Account Types | Current Status | Primary Goals | How Heard | Comments

2. In your Google Sheet, go to Extensions > Apps Script

3. Paste this code:

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.firstName,
      data.lastName,
      data.phone,
      data.email,
      data.age,
      data.streetAddress,
      data.city,
      data.state,
      data.zipCode,
      data.assets,
      data.accountTypes,
      data.currentStatus,
      data.primaryGoals,
      data.howHeard,
      data.comments
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

4. Click Deploy > New deployment
5. Choose "Web app"
6. Set "Execute as" to "Me"
7. Set "Who has access" to "Anyone"
8. Click Deploy
9. Copy the Web App URL
10. Replace GOOGLE_SCRIPT_URL at the top of this file with your URL
*/