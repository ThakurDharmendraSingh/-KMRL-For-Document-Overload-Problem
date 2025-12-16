// KMRL Document Management System - Login JavaScript

class LoginManager {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Demo users for testing
        this.demoUsers = {
            'admin@kmrl.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
            'manager@kmrl.com': { password: 'manager123', role: 'manager', name: 'Manager User' },
            'staff@kmrl.com': { password: 'staff123', role: 'staff', name: 'Staff User' }
        };

        // Add demo credentials helper buttons (already exists in HTML)
        // this.addDemoCredentialsButtons();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));

        // Password toggle
        document.getElementById('passwordToggle').addEventListener('click', () => this.togglePassword());

        // Forgot password
        document.getElementById('forgotPassword').addEventListener('click', (e) => this.showForgotPassword(e));

        // Forgot password form
        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Modal controls
        document.getElementById('cancelReset').addEventListener('click', () => this.closeForgotPasswordModal());

        // Close modals on background click
        document.getElementById('forgotPasswordModal').addEventListener('click', (e) => {
            if (e.target.id === 'forgotPasswordModal') this.closeForgotPasswordModal();
        });

        // Real-time form validation
        document.getElementById('email').addEventListener('blur', () => this.validateEmail());
        document.getElementById('password').addEventListener('blur', () => this.validatePassword());
        document.getElementById('role').addEventListener('change', () => this.validateRole());
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Clear previous errors
        this.clearErrors();

        // Validate form
        if (!this.validateLoginForm(email, password, role)) {
            return;
        }

        // Show loading state
        this.setLoginButtonState(true);

        try {
            // Simulate API call delay
            await this.delay(1500);

            // Debug logging
            console.log('Login attempt:', { email, password: '***', role });
            console.log('Available users:', Object.keys(this.demoUsers));
            console.log('Demo users object:', this.demoUsers);

            // Normalize email (lowercase)
            const normalizedEmail = email.toLowerCase();

            // Check credentials
            const user = this.demoUsers[normalizedEmail] || this.demoUsers[email];
            console.log('Found user:', user);

            if (!user) {
                console.error('User not found for email:', email);
                throw new Error(`Email not found. Please use one of: ${Object.keys(this.demoUsers).join(', ')}`);
            }

            if (user.password !== password) {
                console.error('Password mismatch for user:', email);
                throw new Error(`Incorrect password. Expected: ${user.password}`);
            }

            if (user.role !== role) {
                console.error('Role mismatch:', { expected: user.role, provided: role });
                throw new Error(`Role mismatch. This user is registered as '${user.role}', but you selected '${role}'.`);
            }

            // Store user session
            this.storeUserSession({ email, role, name: user.name });

            // Show success notification
            this.showNotification('Login successful! Redirecting to dashboard...', 'success');

            // Redirect directly to dashboard (no 2FA)
            await this.delay(1500);
            window.location.href = 'dashboard.html';

        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setLoginButtonState(false);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();

        const email = document.getElementById('resetEmail').value.trim();
        const sendResetBtn = document.getElementById('sendResetBtn');

        // Clear previous errors
        document.getElementById('resetEmailError').textContent = '';

        if (!email) {
            document.getElementById('resetEmailError').textContent = 'Email is required';
            return;
        }

        if (!this.isValidEmail(email)) {
            document.getElementById('resetEmailError').textContent = 'Please enter a valid email';
            return;
        }

        // Show loading state
        this.setSendResetButtonState(true);

        try {
            // Simulate API call
            await this.delay(2000);

            // Check if email exists (demo)
            if (!this.demoUsers[email]) {
                throw new Error('Email not found in our records');
            }

            this.showNotification('Password reset link sent to your email!', 'success');
            this.closeForgotPasswordModal();

        } catch (error) {
            document.getElementById('resetEmailError').textContent = error.message;
        } finally {
            this.setSendResetButtonState(false);
        }
    }

    validateLoginForm(email, password, role) {
        let isValid = true;

        // Clear all error messages first
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('roleError').textContent = '';

        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email';
            isValid = false;
        }

        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 3) { // Relaxed for demo
            document.getElementById('passwordError').textContent = 'Password must be at least 3 characters';
            isValid = false;
        }

        if (!role) {
            document.getElementById('roleError').textContent = 'Please select your role';
            isValid = false;
        }

        return isValid;
    }

    validateEmail() {
        const email = document.getElementById('email').value.trim();
        const errorElement = document.getElementById('emailError');

        if (email && !this.isValidEmail(email)) {
            errorElement.textContent = 'Please enter a valid email';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('passwordError');

        if (password && password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    validateRole() {
        const role = document.getElementById('role').value;
        const errorElement = document.getElementById('roleError');

        if (!role) {
            errorElement.textContent = 'Please select your role';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearErrors() {
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('roleError').textContent = '';
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('passwordToggle');
        const icon = toggleButton.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    showForgotPassword(e) {
        e.preventDefault();
        const modal = document.getElementById('forgotPasswordModal');
        modal.classList.add('show');
        document.getElementById('resetEmail').focus();
    }

    closeForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        modal.classList.remove('show');
        document.getElementById('forgotPasswordForm').reset();
        document.getElementById('resetEmailError').textContent = '';
    }

    setLoginButtonState(loading) {
        const btn = document.getElementById('loginBtn');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');

        btn.disabled = loading;
        btn.classList.toggle('loading', loading);
        btnText.style.opacity = loading ? '0' : '1';
        spinner.classList.toggle('d-none', !loading);
    }

    setSendResetButtonState(loading) {
        const btn = document.getElementById('sendResetBtn');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');

        btn.disabled = loading;
        btn.classList.toggle('loading', loading);
        btnText.style.opacity = loading ? '0' : '1';
        spinner.classList.toggle('d-none', !loading);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById(type === 'error' ? 'errorNotification' : 'successNotification');
        const textElement = notification.querySelector('.notification-text');

        textElement.textContent = message;
        notification.classList.add('show');

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    storeUserSession(userData) {
        // Store user data in localStorage (in real app, use secure session storage)
        localStorage.setItem('kmrl_user', JSON.stringify(userData));
        localStorage.setItem('kmrl_login_time', new Date().toISOString());
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Auto-fill demo credentials helper (for testing)
function fillDemoCredentials(role = 'admin') {
    const credentials = {
        admin: { email: 'admin@kmrl.com', password: 'admin123' },
        manager: { email: 'manager@kmrl.com', password: 'manager123' },
        staff: { email: 'staff@kmrl.com', password: 'staff123' }
    };

    const cred = credentials[role];
    if (cred) {
        document.getElementById('email').value = cred.email;
        document.getElementById('password').value = cred.password;
        document.getElementById('role').value = role;
        
        // Clear any previous errors
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('roleError').textContent = '';
    }
}

// Add demo credentials helper to window for testing
window.fillDemoCredentials = fillDemoCredentials;