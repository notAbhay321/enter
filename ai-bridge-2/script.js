// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAujRl1ma3iqw4HLnrgV6yaJcBEqeuEdqo",
    authDomain: "ai-bridge-21.firebaseapp.com",
    projectId: "ai-bridge-21",
    storageBucket: "ai-bridge-21.firebasestorage.app",
    messagingSenderId: "18670168227",
    appId: "1:18670168227:web:fa29e2740e1a252599f716",
    measurementId: "G-CJ3V2KJ6DS"
};

// Global variables
let currentUser = null;
let loginAttempts = 0;
let lastLoginAttempt = 0;
let signupAttempts = 0;
let lastSignupAttempt = 0;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

// Setup all event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Signup button
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Forgot password button
    const forgotPasswordBtn = document.getElementById('forgot-password');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    }

    // Password visibility toggle buttons
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    const loginPassword = document.getElementById('login-password');
    if (toggleLoginPassword && loginPassword) {
        toggleLoginPassword.addEventListener('click', function() {
            togglePasswordVisibility(loginPassword, toggleLoginPassword);
        });
    }

    const toggleSignupPassword = document.getElementById('toggle-signup-password');
    const signupPassword = document.getElementById('signup-password');
    if (toggleSignupPassword && signupPassword) {
        toggleSignupPassword.addEventListener('click', function() {
            togglePasswordVisibility(signupPassword, toggleSignupPassword);
        });
    }

    const toggleSignupConfirmPassword = document.getElementById('toggle-signup-confirm-password');
    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    if (toggleSignupConfirmPassword && signupConfirmPassword) {
        toggleSignupConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility(signupConfirmPassword, toggleSignupConfirmPassword);
        });
    }

    // Enter key handling
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeForm = document.querySelector('.auth-form:not(.hidden)');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('.auth-btn');
                if (submitBtn && !submitBtn.disabled) {
                    if (activeForm.id === 'login-form') {
                        handleLogin();
                    } else {
                        handleSignup();
                    }
                }
            }
        }
    });
    
    // Real-time validation for signup form
    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const loginEmail = document.getElementById('login-email');
    
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            validateInput(this);
            if (signupConfirmPassword.value) {
                checkPasswordMatch();
            }
        });
    }
    
    if (signupConfirmPassword) {
        signupConfirmPassword.addEventListener('input', function() {
            checkPasswordMatch();
            validateInput(this);
        });
    }
    
    if (signupName) {
        signupName.addEventListener('input', function() {
            validateInput(this);
        });
    }
    
    if (signupEmail) {
        signupEmail.addEventListener('input', function() {
            validateInput(this);
        });
    }
    
    if (loginEmail) {
        loginEmail.addEventListener('input', function() {
            validateInput(this);
        });
    }
}

// Check if user is already logged in using Chrome storage
async function checkAuthStatus() {
    try {
        const result = await chrome.storage.local.get(['user', 'isLoggedIn', 'firebaseToken']);
        if (result.isLoggedIn && result.user && result.firebaseToken) {
            // Verify token is still valid
            const isValid = await verifyFirebaseToken(result.firebaseToken);
            if (isValid) {
                currentUser = result.user;
                showHomePage();
            } else {
                // Token expired, clear storage
                await chrome.storage.local.remove(['user', 'isLoggedIn', 'firebaseToken']);
                showAuthPanel();
            }
        } else {
            showAuthPanel();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showAuthPanel();
    } finally {
        hideLoadingScreen();
    }
}

// Verify Firebase token
async function verifyFirebaseToken(token) {
    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: token
            })
        });
        
        const data = await response.json();
        return !data.error;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// Switch between login and signup tabs
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
    const signupTab = document.querySelector('.tab-btn[data-tab="signup"]');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
}

// Handle login form submission with Firebase REST API
async function handleLogin() {
    // Check rate limiting
    if (!checkRateLimit('login')) {
        return;
    }
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    // Comprehensive validation with edge cases
    const validationResult = validateLoginInput(sanitizedEmail, sanitizedPassword);
    if (!validationResult.isValid) {
        showMessage(validationResult.message, 'error');
        return;
    }
    
    // Show loading state
    const loginBtn = document.getElementById('login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.innerHTML = '<span class="loading"></span> Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Sign in with Firebase REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: sanitizedEmail,
                password: sanitizedPassword,
                returnSecureToken: true
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        currentUser = {
            uid: data.localId,
            email: data.email,
            name: data.displayName || sanitizedEmail.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        // Reset login attempts on successful login
        loginAttempts = 0;
        
        // Store user data and token
        await chrome.storage.local.set({
            user: currentUser,
            isLoggedIn: true,
            firebaseToken: data.idToken
        });
        
        showMessage('Login successful!', 'success');
        
        // Show home page after a short delay
        setTimeout(() => {
            showHomePage();
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        // Handle specific Firebase auth errors with comprehensive edge cases
        if (error.message.includes('EMAIL_NOT_FOUND')) {
            errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('INVALID_PASSWORD')) {
            errorMessage = 'Incorrect password. Please try again or reset your password.';
        } else if (error.message.includes('INVALID_EMAIL')) {
            errorMessage = 'Invalid email address format. Please enter a valid email.';
        } else if (error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
            errorMessage = 'Too many failed login attempts. Please try again in a few minutes for security reasons.';
        } else if (error.message.includes('USER_DISABLED')) {
            errorMessage = 'This account has been disabled. Please contact support.';
        } else if (error.message.includes('OPERATION_NOT_ALLOWED')) {
            errorMessage = 'Email/password sign-in is not enabled. Please contact support.';
        } else if (error.message.includes('NETWORK_REQUEST_FAILED')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('INVALID_CREDENTIAL')) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
        }
        
        showMessage(errorMessage, 'error');
        
        // Increment login attempts on failure
        loginAttempts++;
        lastLoginAttempt = Date.now();
    } finally {
        // Reset button state
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

// Handle signup form submission with Firebase REST API
async function handleSignup() {
    // Check rate limiting
    if (!checkRateLimit('signup')) {
        return;
    }
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);
    
    // Comprehensive validation with edge cases
    const validationResult = validateSignupInput(sanitizedName, sanitizedEmail, sanitizedPassword, sanitizedConfirmPassword);
    if (!validationResult.isValid) {
        showMessage(validationResult.message, 'error');
        return;
    }
    
    // Show loading state
    const signupBtn = document.getElementById('signup-btn');
    const originalText = signupBtn.textContent;
    signupBtn.innerHTML = '<span class="loading"></span> Creating account...';
    signupBtn.disabled = true;
    
    try {
        // Create user with Firebase REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: sanitizedEmail,
                password: sanitizedPassword,
                displayName: sanitizedName,
                returnSecureToken: true
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        currentUser = {
            uid: data.localId,
            email: data.email,
            name: sanitizedName,
            signupTime: new Date().toISOString(),
            loginTime: new Date().toISOString()
        };
        
        // Reset signup attempts on successful signup
        signupAttempts = 0;
        
        // Store user data and token
        await chrome.storage.local.set({
            user: currentUser,
            isLoggedIn: true,
            firebaseToken: data.idToken
        });
        
        showMessage('Account created successfully!', 'success');
        
        // Show home page after a short delay
        setTimeout(() => {
            showHomePage();
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Signup failed. Please try again.';
        
        // Handle specific Firebase auth errors with comprehensive edge cases
        if (error.message.includes('EMAIL_EXISTS')) {
            errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('INVALID_EMAIL')) {
            errorMessage = 'Invalid email address format. Please enter a valid email.';
        } else if (error.message.includes('WEAK_PASSWORD')) {
            errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.';
        } else if (error.message.includes('OPERATION_NOT_ALLOWED')) {
            errorMessage = 'Account creation is not enabled. Please contact support.';
        } else if (error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
            errorMessage = 'Too many signup attempts. Please try again in a few minutes.';
        } else if (error.message.includes('NETWORK_REQUEST_FAILED')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        showMessage(errorMessage, 'error');
        
        // Increment signup attempts on failure
        signupAttempts++;
        lastSignupAttempt = Date.now();
    } finally {
        // Reset button state
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Clear stored data
        await chrome.storage.local.remove(['user', 'isLoggedIn', 'firebaseToken']);
        
        currentUser = null;
        
        // Show auth panel
        showAuthPanel();
        
        // Clear form fields
        clearForms();
        
        showMessage('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed. Please try again.', 'error');
    }
}

// Handle forgot password
async function handleForgotPassword() {
    const email = document.getElementById('login-email').value.trim();
    
    // Validate email
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }
    
    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
        showMessage(emailValidation.message, 'error');
        return;
    }
    
    // Show loading state
    const forgotPasswordBtn = document.getElementById('forgot-password');
    const originalText = forgotPasswordBtn.textContent;
    forgotPasswordBtn.innerHTML = '<span class="loading"></span> Sending...';
    forgotPasswordBtn.disabled = true;
    
    try {
        // Send password reset email using Firebase REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestType: 'PASSWORD_RESET',
                email: sanitizedEmail
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        showMessage('Password reset email sent! Please check your inbox.', 'success');
        
    } catch (error) {
        console.error('Password reset error:', error);
        let errorMessage = 'Failed to send password reset email. Please try again.';
        
        // Handle specific Firebase errors
        if (error.message.includes('EMAIL_NOT_FOUND')) {
            errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('INVALID_EMAIL')) {
            errorMessage = 'Invalid email address format. Please enter a valid email.';
        } else if (error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
            errorMessage = 'Too many password reset attempts. Please try again later.';
        } else if (error.message.includes('NETWORK_REQUEST_FAILED')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        // Reset button state
        forgotPasswordBtn.textContent = originalText;
        forgotPasswordBtn.disabled = false;
    }
}

// Toggle password visibility with button
function togglePasswordVisibility(passwordField, toggleButton) {
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.querySelector('.eye-icon').classList.add('hidden');
        toggleButton.querySelector('.eye-off-icon').classList.remove('hidden');
    } else {
        passwordField.type = 'password';
        toggleButton.querySelector('.eye-icon').classList.remove('hidden');
        toggleButton.querySelector('.eye-off-icon').classList.add('hidden');
    }
}

// Show authentication panel
function showAuthPanel() {
    document.getElementById('auth-panel').classList.remove('hidden');
    document.getElementById('home-page').classList.add('hidden');
}

// Show home page
function showHomePage() {
    document.getElementById('auth-panel').classList.add('hidden');
    document.getElementById('home-page').classList.remove('hidden');

    // WhatsApp-style user info
    if (currentUser) {
        const name = currentUser.name || 'User';
        const email = currentUser.email || '';
        const avatar = document.getElementById('wa-avatar');
        const userName = document.getElementById('wa-user-name');
        const userEmail = document.getElementById('wa-user-email');
        if (avatar) {
            avatar.textContent = name[0].toUpperCase();
        }
        if (userName) {
            userName.textContent = name;
        }
        if (userEmail) {
            userEmail.textContent = email;
        }
    }

    // Chat send button logic
    const sendBtn = document.getElementById('wa-send-btn');
    const chatInput = document.getElementById('wa-chat-input');
    const chatArea = document.getElementById('wa-chat');
    if (sendBtn && chatInput && chatArea) {
        sendBtn.onclick = function() {
            const msg = chatInput.value.trim();
            if (msg) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'wa-message wa-message-out';
                msgDiv.innerHTML = `<div class='wa-message-content'></div>`;
                msgDiv.querySelector('.wa-message-content').textContent = msg;
                chatArea.appendChild(msgDiv);
                chatInput.value = '';
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        };
        chatInput.onkeydown = function(e) {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        };
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 300);
    }
}

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        loadingScreen.style.opacity = '1';
    }
}

// Clear all form fields
function clearForms() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });
}

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert message at the top of the auth box
    const authBox = document.querySelector('.auth-box');
    authBox.insertBefore(messageDiv, authBox.firstChild);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Comprehensive login input validation
function validateLoginInput(email, password) {
    // Check for empty fields
    if (!email || !password) {
        return { isValid: false, message: 'Please fill in all fields' };
    }
    
    // Check for whitespace-only inputs
    if (!email.trim() || !password.trim()) {
        return { isValid: false, message: 'Fields cannot contain only whitespace' };
    }
    
    // Email validation with comprehensive edge cases
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }
    
    // Password validation
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, message: 'Password cannot exceed 128 characters' };
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', '12345678'];
    if (weakPasswords.includes(password.toLowerCase())) {
        return { isValid: false, message: 'Please choose a stronger password' };
    }
    
    return { isValid: true };
}

// Comprehensive signup input validation
function validateSignupInput(name, email, password, confirmPassword) {
    // Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
        return { isValid: false, message: 'Please fill in all fields' };
    }
    
    // Check for whitespace-only inputs
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        return { isValid: false, message: 'Fields cannot contain only whitespace' };
    }
    
    // Name validation
    if (name.length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    
    if (name.length > 50) {
        return { isValid: false, message: 'Name cannot exceed 50 characters' };
    }
    
    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
        return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }
    
    // Password validation
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, message: 'Password cannot exceed 128 characters' };
    }
    
    // Check for password strength
    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength.isStrong) {
        return { isValid: false, message: passwordStrength.message };
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }
    
    return { isValid: true };
}

// Enhanced email validation with comprehensive edge cases
function validateEmail(email) {
    // Check length limits
    if (email.length > 254) {
        return { isValid: false, message: 'Email address is too long (max 254 characters)' };
    }
    
    // Check for basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Check for multiple @ symbols
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
        return { isValid: false, message: 'Email must contain exactly one @ symbol' };
    }
    
    // Split email into local and domain parts
    const [localPart, domainPart] = email.split('@');
    
    // Validate local part (before @)
    if (localPart.length === 0) {
        return { isValid: false, message: 'Email must have a username before @' };
    }
    
    if (localPart.length > 64) {
        return { isValid: false, message: 'Email username is too long (max 64 characters)' };
    }
    
    // Check for consecutive dots in local part
    if (localPart.includes('..')) {
        return { isValid: false, message: 'Email cannot contain consecutive dots' };
    }
    
    // Check for dots at start or end of local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return { isValid: false, message: 'Email cannot start or end with a dot' };
    }
    
    // Validate domain part (after @)
    if (domainPart.length === 0) {
        return { isValid: false, message: 'Email must have a domain after @' };
    }
    
    if (domainPart.length > 255) {
        return { isValid: false, message: 'Email domain is too long (max 255 characters)' };
    }
    
    // Check for valid domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?))*$/;
    if (!domainRegex.test(domainPart)) {
        return { isValid: false, message: 'Invalid domain format' };
    }
    
    // Check for valid TLD (top-level domain)
    const tld = domainPart.split('.').pop();
    if (tld.length < 2) {
        return { isValid: false, message: 'Domain must have a valid extension (e.g., .com, .org)' };
    }
    
    // Check for common disposable email domains
    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
    if (disposableDomains.includes(domainPart.toLowerCase())) {
        return { isValid: false, message: 'Disposable email addresses are not allowed' };
    }
    
    return { isValid: true };
}

// Check password strength
function checkPasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Check for common weak passwords
    const weakPasswords = [
        'password', '123456', 'qwerty', 'abc123', 'password123', '12345678',
        'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello', 'login'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
        return { isStrong: false, message: 'This password is too common. Please choose a different one.' };
    }
    
    // Check for sequential characters
    const sequentialPatterns = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde'];
    const lowerPassword = password.toLowerCase();
    for (let pattern of sequentialPatterns) {
        if (lowerPassword.includes(pattern)) {
            return { isStrong: false, message: 'Password should not contain sequential characters' };
        }
    }
    
    // Check for repeated characters
    const repeatedPattern = /(.)\1{2,}/;
    if (repeatedPattern.test(password)) {
        return { isStrong: false, message: 'Password should not contain repeated characters' };
    }
    
    // Basic strength requirements
    if (password.length < minLength) {
        return { isStrong: false, message: `Password must be at least ${minLength} characters long` };
    }
    
    // For passwords 6-8 characters, require at least 3 character types
    if (password.length < 8) {
        const characterTypes = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
        const typeCount = characterTypes.filter(Boolean).length;
        
        if (typeCount < 3) {
            return { isStrong: false, message: 'Password must include at least 3 of: uppercase, lowercase, numbers, special characters' };
        }
    }
    
    return { isStrong: true };
}

// Rate limiting check
function checkRateLimit(type) {
    const now = Date.now();
    let attempts, lastAttempt;
    
    if (type === 'login') {
        attempts = loginAttempts;
        lastAttempt = lastLoginAttempt;
    } else {
        attempts = signupAttempts;
        lastAttempt = lastSignupAttempt;
    }
    
    // Reset attempts if rate limit window has passed
    if (now - lastAttempt > RATE_LIMIT_WINDOW) {
        if (type === 'login') {
            loginAttempts = 0;
        } else {
            signupAttempts = 0;
        }
        return true;
    }
    
    // Check if max attempts exceeded
    if (attempts >= MAX_ATTEMPTS) {
        const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
        showMessage(`Too many ${type} attempts. Please try again in ${timeLeft} minutes.`, 'error');
        return false;
    }
    
    return true;
}

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    // Remove null bytes and control characters
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthIndicator.classList.add('hidden');
        return;
    }
    
    strengthIndicator.classList.remove('hidden');
    
    // Calculate password strength
    let strength = 0;
    let strengthLabel = 'Very Weak';
    
    // Length check
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety check
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) strength -= 1;
    if (/123|abc|qwe/i.test(password)) strength -= 1;
    
    // Common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) strength = 0;
    
    // Determine strength level
    strength = Math.max(0, Math.min(4, strength));
    
    // Remove all strength classes
    strengthFill.classList.remove('weak', 'fair', 'good', 'strong');
    strengthText.classList.remove('weak', 'fair', 'good', 'strong');
    
    switch (strength) {
        case 0:
        case 1:
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthLabel = 'Weak';
            break;
        case 2:
            strengthFill.classList.add('fair');
            strengthText.classList.add('fair');
            strengthLabel = 'Fair';
            break;
        case 3:
            strengthFill.classList.add('good');
            strengthText.classList.add('good');
            strengthLabel = 'Good';
            break;
        case 4:
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthLabel = 'Strong';
            break;
    }
    
    strengthText.textContent = `Password strength: ${strengthLabel}`;
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const matchIndicator = document.getElementById('password-match');
    const matchText = document.querySelector('.match-text');
    
    if (!confirmPassword) {
        matchIndicator.classList.add('hidden');
        return;
    }
    
    matchIndicator.classList.remove('hidden');
    
    if (password === confirmPassword) {
        matchText.classList.remove('no-match');
        matchText.textContent = '✓ Passwords match';
    } else {
        matchText.classList.add('no-match');
        matchText.textContent = '✗ Passwords do not match';
    }
}

// Real-time input validation
function validateInput(input) {
    const value = input.value.trim();
    let isValid = false;
    
    // Remove existing validation classes
    input.classList.remove('valid', 'invalid');
    
    switch (input.id) {
        case 'login-email':
        case 'signup-email':
            isValid = value && validateEmail(value).isValid;
            break;
        case 'signup-name':
            isValid = value && value.length >= 2 && value.length <= 50 && /^[a-zA-Z\s\-']+$/.test(value);
            break;
        case 'signup-password':
            isValid = value && value.length >= 6 && value.length <= 128;
            break;
        case 'signup-confirm-password':
            const originalPassword = document.getElementById('signup-password').value;
            isValid = value && value === originalPassword;
            break;
        default:
            isValid = value.length > 0;
    }
    
    if (value) {
        input.classList.add(isValid ? 'valid' : 'invalid');
    }
}

// Legacy email validation helper (kept for backward compatibility)
function isValidEmail(email) {
    const validation = validateEmail(email);
    return validation.isValid;
}
