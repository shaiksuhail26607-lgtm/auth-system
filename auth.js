/**
 * Authentication Module
 * Coordinates form validation, password criteria checking,
 * registration with duplicate detection, and login credential verification.
 */

import { CryptoUtil } from './crypto.js';
import { StorageService } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in, redirect them to dashboard
  const currentSession = StorageService.getCurrentSession();
  const isAuthPage = document.getElementById('loginForm') || document.getElementById('registerForm');
  if (currentSession && isAuthPage) {
    window.location.replace('dashboard.html');
    return;
  }

  setupPasswordToggles();
  setupAlertFromUrl();

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    initRegistration(registerForm);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    initLogin(loginForm);
  }
});

/**
 * Handles toggling visibility between password and plain text.
 */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInputId = btn.getAttribute('data-target');
      const input = document.getElementById(targetInputId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      btn.innerHTML = isPassword ? '👁️‍🗨️' : '👁️';
    });
  });
}

/**
 * Checks query parameters for incoming notifications (e.g., unauthorized redirect).
 */
function setupAlertFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const alertBox = document.getElementById('formAlert');
  if (!alertBox) return;

  if (params.get('redirect') === 'unauthorized') {
    showAlert(alertBox, 'Please log in to access the protected dashboard.', 'warning');
  } else if (params.get('registered') === 'true') {
    showAlert(alertBox, 'Registration successful! You can now log in with your credentials.', 'success');
  } else if (params.get('logout') === 'true') {
    showAlert(alertBox, 'You have been successfully logged out.', 'info');
  }
}

/**
 * Utility to display alerts with accessible roles.
 */
function showAlert(element, message, type = 'error') {
  if (!element) return;
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove('hidden');
}

function hideAlert(element) {
  if (!element) return;
  element.classList.add('hidden');
  element.textContent = '';
}

/**
 * Validates password rules:
 * - Minimum 8 characters
 * - At least 1 numeric digit
 */
export function validatePasswordRules(password) {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  return {
    isValid: hasMinLength && hasNumber,
    hasMinLength,
    hasNumber
  };
}

/**
 * Initializes registration page behaviors:
 * - Real-time password requirement checklist
 * - Non-empty submission validation
 * - Duplicate username/email verification
 * - SHA-256 password hashing
 */
function initRegistration(form) {
  const identifierInput = document.getElementById('regIdentifier');
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');
  const alertBox = document.getElementById('formAlert');
  const submitBtn = document.getElementById('regSubmitBtn');

  const reqLength = document.getElementById('req-length');
  const reqNumber = document.getElementById('req-number');

  // Real-time password criteria feedback
  if (passwordInput && reqLength && reqNumber) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const rules = validatePasswordRules(val);

      updateRequirementBadge(reqLength, rules.hasMinLength, 'At least 8 characters');
      updateRequirementBadge(reqNumber, rules.hasNumber, 'At least 1 number');
    });
  }

  function updateRequirementBadge(element, isValid, label) {
    if (isValid) {
      element.classList.add('valid');
      element.innerHTML = `<span class="req-icon">✓</span> ${label}`;
    } else {
      element.classList.remove('valid');
      element.innerHTML = `<span class="req-icon">✗</span> ${label}`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertBox);

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : password;

    // 1. Basic empty validation
    if (!identifier || !password) {
      showAlert(alertBox, 'All fields are required. Please fill in all inputs.', 'error');
      return;
    }

    // 2. Password criteria validation
    const rules = validatePasswordRules(password);
    if (!rules.isValid) {
      showAlert(alertBox, 'Password must be at least 8 characters long and contain at least 1 number.', 'error');
      passwordInput.focus();
      return;
    }

    // Optional match check if confirm password exists
    if (confirmPasswordInput && password !== confirmPassword) {
      showAlert(alertBox, 'Passwords do not match. Please re-enter.', 'error');
      confirmPasswordInput.focus();
      return;
    }

    // 3. Duplicate user check
    const existingUser = StorageService.findUser(identifier);
    if (existingUser) {
      showAlert(alertBox, 'An account with this username or email already exists. Please log in or use another username.', 'error');
      identifierInput.focus();
      return;
    }

    // Disable button during hashing
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering securely...';

    try {
      // 4. Hash password with SHA-256 (Never store plaintext)
      const passwordHash = await CryptoUtil.hash(password);

      // Save user
      const isEmail = identifier.includes('@');
      const newUser = StorageService.saveUser({
        username: isEmail ? identifier.split('@')[0] : identifier,
        email: isEmail ? identifier : `${identifier}@example.local`,
        passwordHash: passwordHash
      });

      // Automatically log the user in and redirect to dashboard
      StorageService.createSession(newUser);
      showAlert(alertBox, 'Account created successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } catch (err) {
      console.error('Registration error:', err);
      showAlert(alertBox, 'An unexpected error occurred during registration. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

/**
 * Initializes login page behaviors:
 * - Empty field validation
 * - Generic error handling (does not reveal if username or password was wrong)
 * - Session creation & redirect
 */
function initLogin(form) {
  const identifierInput = document.getElementById('loginIdentifier');
  const passwordInput = document.getElementById('loginPassword');
  const alertBox = document.getElementById('formAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertBox);

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    // 1. Basic empty validation
    if (!identifier || !password) {
      showAlert(alertBox, 'Please enter both your username/email and password.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying credentials...';

    try {
      // 2. Hash input password
      const enteredHash = await CryptoUtil.hash(password);

      // 3. Find user and verify hash
      const user = StorageService.findUser(identifier);

      // Generic error message: DO NOT reveal whether username or password was wrong
      if (!user || user.passwordHash !== enteredHash) {
        // Small artificial delay to mimic server response timing & resist side-channel timing analysis
        await new Promise(r => setTimeout(r, 350));
        showAlert(alertBox, 'Invalid username/email or password. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        passwordInput.value = '';
        passwordInput.focus();
        return;
      }

      // 4. Successful authentication -> Create session
      StorageService.createSession(user);
      showAlert(alertBox, 'Login successful! Redirecting to dashboard...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      showAlert(alertBox, 'Authentication service encountered an error. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}
