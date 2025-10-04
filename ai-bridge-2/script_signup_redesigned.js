// Enhanced AI Bridge Signup Form with Real-time Validation
class SignupFormManager {
    constructor() {
        this.typingTimers = {};
        this.validationStates = {};
        this.passwordStrength = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createPasswordStrengthIndicator();
        this.createPasswordMatchIndicator();
    }

    setupEventListeners() {
        // Form elements
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');
        const toggleButton = document.getElementById('toggle-signup-passwords');
        const submitButton = document.getElementById('signup-btn');

        // Real-time validation with 500ms delay
        if (nameInput) {
            nameInput.addEventListener('input', () => this.handleInputWithDelay('name', nameInput));
            nameInput.addEventListener('blur', () => this.validateName(nameInput));
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => this.handleInputWithDelay('email', emailInput));
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.handleInputWithDelay('password', passwordInput);
                this.updatePasswordStrength(passwordInput.value);
                this.checkPasswordMatch();
            });
            passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.handleInputWithDelay('confirmPassword', confirmPasswordInput);
                this.checkPasswordMatch();
            });
            confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword(confirmPasswordInput));
        }

        // Password visibility toggle
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Form submission
        if (submitButton) {
            submitButton.addEventListener('click', (e) => this.handleSubmit(e));
        }

        // Enter key submission
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement.closest('#signup-form')) {
                this.handleSubmit(e);
            }
        });
    }

    handleInputWithDelay(fieldName, input) {
        // Clear existing timer
        if (this.typingTimers[fieldName]) {
            clearTimeout(this.typingTimers[fieldName]);
        }

        // Show typing indicator
        this.showTypingIndicator(fieldName);

        // Set new timer for 500ms delay
        this.typingTimers[fieldName] = setTimeout(() => {
            this.hideTypingIndicator(fieldName);
            this.validateField(fieldName, input);
        }, 500);
    }

    showTypingIndicator(fieldName) {
        const errorElement = document.getElementById(`signup-${fieldName.replace('confirmPassword', 'confirm-password')}-error`);
        if (errorElement) {
            errorElement.classList.add('typing');
        }
    }

    hideTypingIndicator(fieldName) {
        const errorElement = document.getElementById(`signup-${fieldName.replace('confirmPassword', 'confirm-password')}-error`);
        if (errorElement) {
            errorElement.classList.remove('typing');
        }
    }

    validateField(fieldName, input) {
        switch (fieldName) {
            case 'name':
                this.validateName(input);
                break;
            case 'email':
                this.validateEmail(input);
                break;
            case 'password':
                this.validatePassword(input);
                break;
            case 'confirmPassword':
                this.validateConfirmPassword(input);
                break;
        }
    }

    validateName(input) {
        const value = input.value.trim();
        const container = input.closest('.floating-input');
        const errorElement = document.getElementById('signup-name-error');
        const successCheck = container.querySelector('.success-check');

        let isValid = true;
        let message = '';

        if (!value) {
            isValid = false;
            message = 'Name is required';
        } else if (value.length < 2) {
            isValid = false;
            message = 'Name must be at least 2 characters';
        } else if (value.length > 50) {
            isValid = false;
            message = 'Name must be less than 50 characters';
        } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
            isValid = false;
            message = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }

        this.updateValidationState(container, errorElement, successCheck, isValid, message);
        this.validationStates.name = isValid;
        return isValid;
    }

    validateEmail(input) {
        const value = input.value.trim();
        const container = input.closest('.floating-input');
        const errorElement = document.getElementById('signup-email-error');
        const successCheck = container.querySelector('.success-check');

        let isValid = true;
        let message = '';

        if (!value) {
            isValid = false;
            message = 'Email is required';
        } else if (!this.isValidEmailFormat(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (value.length > 254) {
            isValid = false;
            message = 'Email address is too long';
        }

        this.updateValidationState(container, errorElement, successCheck, isValid, message);
        this.validationStates.email = isValid;
        return isValid;
    }

    validatePassword(input) {
        const value = input.value;
        const container = input.closest('.floating-input');
        const errorElement = document.getElementById('signup-password-error');

        let isValid = true;
        let message = '';

        if (!value) {
            isValid = false;
            message = 'Password is required';
        } else if (value.length < 6) {
            isValid = false;
            message = 'Password must be at least 6 characters';
        } else if (this.passwordStrength < 2) {
            isValid = false;
            message = 'Password is too weak';
        }

        this.updateValidationState(container, errorElement, null, isValid, message);
        this.validationStates.password = isValid;
        return isValid;
    }

    validateConfirmPassword(input) {
        const value = input.value;
        const passwordValue = document.getElementById('signup-password').value;
        const container = input.closest('.floating-input');
        const errorElement = document.getElementById('signup-confirm-password-error');
        const successCheck = container.querySelector('.success-check');

        let isValid = true;
        let message = '';

        if (!value) {
            isValid = false;
            message = 'Please confirm your password';
        } else if (value !== passwordValue) {
            isValid = false;
            message = 'Passwords do not match';
        }

        this.updateValidationState(container, errorElement, successCheck, isValid, message);
        this.validationStates.confirmPassword = isValid;
        return isValid;
    }

    updateValidationState(container, errorElement, successCheck, isValid, message) {
        // Remove all validation classes
        container.classList.remove('valid', 'invalid', 'warning');

        if (isValid) {
            container.classList.add('valid');
            errorElement.textContent = '';
            errorElement.className = 'validation-message success';
            if (successCheck) {
                successCheck.classList.remove('hidden');
            }
        } else {
            container.classList.add('invalid');
            errorElement.textContent = message;
            errorElement.className = 'validation-message error';
            if (successCheck) {
                successCheck.classList.add('hidden');
            }
        }
    }

    isValidEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && !email.includes('..') && 
               !email.startsWith('.') && !email.endsWith('.');
    }

    createPasswordStrengthIndicator() {
        const passwordGroup = document.getElementById('signup-password').closest('.form-group');
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength-indicator';
        strengthIndicator.innerHTML = `
            <div class="strength-bars">
                <div class="strength-bar" id="strength-bar-1"></div>
                <div class="strength-bar" id="strength-bar-2"></div>
                <div class="strength-bar" id="strength-bar-3"></div>
                <div class="strength-bar" id="strength-bar-4"></div>
            </div>
            <div class="strength-text" id="strength-text">Password strength</div>
        `;
        passwordGroup.appendChild(strengthIndicator);
    }

    createPasswordMatchIndicator() {
        const confirmPasswordGroup = document.getElementById('signup-confirm-password').closest('.form-group');
        const matchIndicator = document.createElement('div');
        matchIndicator.className = 'password-match-indicator';
        matchIndicator.id = 'password-match-indicator';
        confirmPasswordGroup.appendChild(matchIndicator);
    }

    updatePasswordStrength(password) {
        let strength = 0;
        let strengthLabel = 'Very Weak';
        let strengthClass = 'weak';

        // Calculate strength based on various criteria
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // Penalty for common patterns
        if (/(.)\\1{2,}/.test(password)) strength -= 1;
        if (/123|abc|qwe/i.test(password)) strength -= 1;

        // Determine strength level
        strength = Math.max(0, Math.min(4, strength));
        this.passwordStrength = strength;

        // Update strength bars and text
        const bars = document.querySelectorAll('.strength-bar');
        const strengthText = document.getElementById('strength-text');

        // Reset all bars
        bars.forEach(bar => {
            bar.className = 'strength-bar';
        });

        // Set strength level and class
        if (strength === 0) {
            strengthLabel = 'Very Weak';
            strengthClass = 'weak';
        } else if (strength === 1) {
            strengthLabel = 'Weak';
            strengthClass = 'weak';
            bars[0].classList.add('weak');
        } else if (strength === 2) {
            strengthLabel = 'Fair';
            strengthClass = 'fair';
            bars[0].classList.add('fair');
            bars[1].classList.add('fair');
        } else if (strength === 3) {
            strengthLabel = 'Good';
            strengthClass = 'good';
            bars[0].classList.add('good');
            bars[1].classList.add('good');
            bars[2].classList.add('good');
        } else if (strength === 4) {
            strengthLabel = 'Strong';
            strengthClass = 'strong';
            bars.forEach(bar => bar.classList.add('strong'));
        }

        // Update text
        if (strengthText) {
            strengthText.textContent = `Password strength: ${strengthLabel}`;
            strengthText.className = `strength-text ${strengthClass}`;
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const matchIndicator = document.getElementById('password-match-indicator');

        if (!confirmPassword) {
            matchIndicator.classList.remove('show');
            return;
        }

        matchIndicator.classList.add('show');

        if (password === confirmPassword) {
            matchIndicator.textContent = '✓ Passwords match';
            matchIndicator.className = 'password-match-indicator show match';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.className = 'password-match-indicator show no-match';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');
        const toggleButton = document.getElementById('toggle-signup-passwords');
        const eyeIcon = toggleButton.querySelector('.eye-icon');
        const eyeOffIcon = toggleButton.querySelector('.eye-off-icon');

        const isPasswordVisible = passwordInput.type === 'text';

        // Toggle both password fields
        passwordInput.type = isPasswordVisible ? 'password' : 'text';
        confirmPasswordInput.type = isPasswordVisible ? 'password' : 'text';

        // Toggle icons
        if (isPasswordVisible) {
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        } else {
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');

        const isNameValid = this.validateName(nameInput);
        const isEmailValid = this.validateEmail(emailInput);
        const isPasswordValid = this.validatePassword(passwordInput);
        const isConfirmPasswordValid = this.validateConfirmPassword(confirmPasswordInput);

        const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

        if (!isFormValid) {
            this.showFormError('Please fix the errors above before submitting.');
            return;
        }

        // Show loading state
        const submitButton = document.getElementById('signup-btn');
        this.setLoadingState(submitButton, true);

        try {
            // Simulate API call
            await this.submitForm({
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            });

            this.showFormSuccess('Account created successfully!');
            
            // Reset form after successful submission
            setTimeout(() => {
                this.resetForm();
            }, 2000);

        } catch (error) {
            this.showFormError(error.message || 'Signup failed. Please try again.');
        } finally {
            this.setLoadingState(submitButton, false);
        }
    }

    async submitForm(data) {
        // Simulate API call with delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.2) {
                    resolve(data);
                } else {
                    reject(new Error('Network error. Please try again.'));
                }
            }, 2000);
        });
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.textContent = '';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = 'Sign Up';
        }
    }

    showFormError(message) {
        this.showFormMessage(message, 'error');
    }

    showFormSuccess(message) {
        this.showFormMessage(message, 'success');
    }

    showFormMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-weight: 600;
            text-align: center;
            ${type === 'error' ? 
                'background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;' : 
                'background: #f0fdf4; color: #10b981; border: 1px solid #bbf7d0;'
            }
        `;

        // Insert at the top of the form
        const form = document.getElementById('signup-form');
        form.insertBefore(messageElement, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    resetForm() {
        // Reset all inputs
        const inputs = document.querySelectorAll('#signup-form input');
        inputs.forEach(input => {
            input.value = '';
            const container = input.closest('.floating-input');
            if (container) {
                container.classList.remove('valid', 'invalid', 'warning');
            }
        });

        // Reset validation states
        this.validationStates = {};
        this.passwordStrength = 0;

        // Reset error messages
        const errorElements = document.querySelectorAll('.validation-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.className = 'validation-message';
        });

        // Hide success checks
        const successChecks = document.querySelectorAll('.success-check');
        successChecks.forEach(check => {
            check.classList.add('hidden');
        });

        // Reset password strength indicator
        const strengthBars = document.querySelectorAll('.strength-bar');
        strengthBars.forEach(bar => {
            bar.className = 'strength-bar';
        });

        const strengthText = document.getElementById('strength-text');
        if (strengthText) {
            strengthText.textContent = 'Password strength';
            strengthText.className = 'strength-text';
        }

        // Reset password match indicator
        const matchIndicator = document.getElementById('password-match-indicator');
        if (matchIndicator) {
            matchIndicator.classList.remove('show');
        }
    }
}

// Initialize the signup form manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SignupFormManager();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignupFormManager;
}
