// KMRL Document Management System - Common JavaScript

class CommonManager {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    init() {
        // Initialize common functionality
        this.currentUser = this.getCurrentUser();
        this.setupNavigation();
        this.setupNotifications();
    }

    setupEventListeners() {
        // Global logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobileMenuToggle' || e.target.closest('#mobileMenuToggle')) {
                this.toggleMobileMenu();
            }
        });

        // Sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.id === 'sidebarToggle' || e.target.closest('#sidebarToggle')) {
                this.toggleSidebar();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.querySelector('#mobileMenuToggle');

            if (sidebar && !sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    checkAuthentication() {
        // Check if user is logged in
        const currentPath = window.location.pathname;
        const publicPaths = ['/index.html', '/login.html', '/'];

        if (!this.currentUser && !publicPaths.some(path => currentPath.includes(path))) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }

        // Set user info in UI if authenticated
        if (this.currentUser) {
            this.updateUserInfo();
            this.updateNavigation();
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    updateUserInfo() {
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        const userEmailElements = document.querySelectorAll('.user-email');

        userNameElements.forEach(el => el.textContent = this.currentUser.name || 'User');
        userRoleElements.forEach(el => el.textContent = this.currentUser.role || 'Unknown');
        userEmailElements.forEach(el => el.textContent = this.currentUser.email || '');
    }

    updateNavigation() {
        // Update navigation based on user role
        const role = this.currentUser.role;

        // Hide/show admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });

        // Hide/show manager+ elements
        const managerElements = document.querySelectorAll('.manager-only');
        managerElements.forEach(el => {
            el.style.display = ['admin', 'manager'].includes(role) ? 'block' : 'none';
        });

        // Update active navigation item
        this.updateActiveNavItem();
    }

    updateActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('./', ''))) {
                link.classList.add('active');
            }
        });
    }

    setupNavigation() {
        // Add active states and smooth transitions
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    setupNotifications() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;

        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    handleLogout() {
        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            // Clear user data
            localStorage.removeItem('kmrl_user');
            localStorage.removeItem('kmrl_login_time');

            // Show logout message
            this.showNotification('Logged out successfully', 'success', 2000);

            // Redirect to login after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }

        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
    }

    handleResize() {
        const sidebar = document.querySelector('.sidebar');

        // Auto-close mobile menu on desktop
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('show');
        }
    }

    // Utility functions
    formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Data validation utilities
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Local storage utilities
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    }

    removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    // API simulation utilities
    async simulateApiCall(data, delay = 1000) {
        await this.delay(delay);

        // Simulate occasional failures (10% chance)
        if (Math.random() < 0.1) {
            throw new Error('Network error: Please try again');
        }

        return {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };
    }

    // Search and filter utilities
    searchInText(text, query) {
        if (!text || !query) return false;
        return text.toLowerCase().includes(query.toLowerCase());
    }

    filterItems(items, filters) {
        return items.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                return this.searchInText(item[key], value);
            });
        });
    }

    sortItems(items, sortBy, direction = 'asc') {
        return items.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle dates
            if (aVal instanceof Date || bVal instanceof Date) {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }
}

// Initialize common manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commonManager = new CommonManager();
});

// Export commonly used functions globally
window.showNotification = (message, type, duration) => {
    if (window.commonManager) {
        window.commonManager.showNotification(message, type, duration);
    }
};

window.formatDate = (date) => {
    if (window.commonManager) {
        return window.commonManager.formatDate(date);
    }
    return date;
};

window.formatFileSize = (bytes) => {
    if (window.commonManager) {
        return window.commonManager.formatFileSize(bytes);
    }
    return bytes;
};