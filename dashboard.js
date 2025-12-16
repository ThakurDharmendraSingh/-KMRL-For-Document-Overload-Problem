// KMRL Document Management System - Dashboard JavaScript

class DashboardManager {
    constructor() {
        this.init();
        this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    init() {
        // Initialize dashboard
        this.currentUser = this.getCurrentUser();
        this.setupRoleBasedView();
        this.setupChatbot();
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    setupRoleBasedView() {
        if (!this.currentUser) return;

        const role = this.currentUser.role;

        // Show/hide elements based on role
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });

        const managerElements = document.querySelectorAll('.manager-only');
        managerElements.forEach(el => {
            el.style.display = ['admin', 'manager'].includes(role) ? 'block' : 'none';
        });
    }

    setupEventListeners() {
        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshDashboard') {
                this.loadDashboardData();
            }
        });

        // Widget interactions
        document.querySelectorAll('.widget').forEach(widget => {
            widget.addEventListener('click', (e) => {
                const widgetType = widget.dataset.type;
                if (widgetType) {
                    this.handleWidgetClick(widgetType);
                }
            });
        });
    }

    async loadDashboardData() {
        try {
            // Show loading state
            this.showLoadingState();

            // Simulate API calls to load dashboard data
            const [stats, recentActivity] = await Promise.all([
                this.loadStatistics(),
                this.loadRecentActivity()
            ]);

            // Update UI with loaded data
            this.updateStatistics(stats);
            this.updateRecentActivity(recentActivity);

            // Hide loading state
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadStatistics() {
        // Simulate API delay
        await this.delay(1000);

        // Generate mock statistics based on user role
        const baseStats = {
            totalDocs: Math.floor(Math.random() * 1000) + 500,
            recentUploads: Math.floor(Math.random() * 50) + 10,
            pendingApprovals: Math.floor(Math.random() * 20) + 5,
            storageUsed: Math.floor(Math.random() * 80) + 20
        };

        // Adjust stats based on user role
        if (this.currentUser?.role === 'staff') {
            baseStats.totalDocs = Math.floor(baseStats.totalDocs * 0.3);
            baseStats.pendingApprovals = Math.floor(baseStats.pendingApprovals * 0.2);
        }

        return baseStats;
    }

    async loadRecentActivity() {
        // Simulate API delay
        await this.delay(800);

        const activities = [
            {
                type: 'upload',
                title: 'New document uploaded',
                description: 'Project_Report_2024.pdf',
                time: '2 minutes ago',
                icon: 'fas fa-upload',
                iconColor: '#059669'
            },
            {
                type: 'approval',
                title: 'Document approved',
                description: 'Financial_Statement.xlsx',
                time: '15 minutes ago',
                icon: 'fas fa-check-circle',
                iconColor: '#2563eb'
            },
            {
                type: 'comment',
                title: 'New comment added',
                description: 'Marketing_Strategy.docx',
                time: '1 hour ago',
                icon: 'fas fa-comment',
                iconColor: '#d97706'
            },
            {
                type: 'download',
                title: 'Document downloaded',
                description: 'Employee_Handbook.pdf',
                time: '2 hours ago',
                icon: 'fas fa-download',
                iconColor: '#7c3aed'
            },
            {
                type: 'share',
                title: 'Document shared',
                description: 'Quarterly_Review.pptx',
                time: '3 hours ago',
                icon: 'fas fa-share',
                iconColor: '#059669'
            }
        ];

        // Filter activities based on user role
        if (this.currentUser?.role === 'staff') {
            return activities.filter(activity =>
                ['upload', 'download', 'comment'].includes(activity.type)
            ).slice(0, 3);
        }

        return activities;
    }

    updateStatistics(stats) {
        // Update widget values with animation
        this.animateCounter('totalDocs', stats.totalDocs);
        this.animateCounter('recentUploads', stats.recentUploads);
        this.animateCounter('pendingApprovals', stats.pendingApprovals);
        this.animateCounter('storageUsed', stats.storageUsed);
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = '';

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon" style="background-color: ${activity.iconColor}20; color: ${activity.iconColor};">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;

            container.appendChild(activityElement);
        });
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    showLoadingState() {
        // Add loading animation to widgets
        document.querySelectorAll('.widget-value').forEach(el => {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    }

    hideLoadingState() {
        // Remove loading state - values will be updated by animation
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    handleWidgetClick(widgetType) {
        // Handle widget clicks for navigation
        const navigation = {
            'documents': 'documents.html',
            'uploads': 'upload.html',
            'approvals': 'documents.html?filter=pending',
            'storage': 'analytics.html'
        };

        if (navigation[widgetType]) {
            window.location.href = navigation[widgetType];
        }
    }

    startAutoRefresh() {
        // Auto-refresh dashboard data every 5 minutes
        setInterval(() => {
            this.loadDashboardData();
        }, 300000);
    }

    // Chatbot functionality
    setupChatbot() {
        this.chatbotResponses = [
            "I can help you manage your documents more efficiently!",
            "Would you like to know about document upload procedures?",
            "I can assist with search and filtering your documents.",
            "Need help with document approval workflows?",
            "I can explain the analytics and reporting features.",
            "Would you like tips for organizing your documents?",
            "I can help you understand user permissions and access.",
            "Let me know if you need assistance with any features!"
        ];

        // Setup chatbot input handler
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    openChatbot() {
        const chatbot = document.getElementById('chatbot');
        if (chatbot) {
            chatbot.style.display = 'block';
            chatbot.style.position = 'fixed';
            chatbot.style.bottom = '20px';
            chatbot.style.right = '20px';
            chatbot.style.width = '350px';
            chatbot.style.height = '500px';
            chatbot.style.backgroundColor = 'white';
            chatbot.style.borderRadius = '10px';
            chatbot.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            chatbot.style.zIndex = '1000';
            chatbot.style.border = '1px solid #e5e7eb';

            document.getElementById('chatbotInput')?.focus();
        }
    }

    closeChatbot() {
        const chatbot = document.getElementById('chatbot');
        if (chatbot) {
            chatbot.style.display = 'none';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');

        if (!input || !messagesContainer) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        this.addChatMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response delay
        await this.delay(1000 + Math.random() * 2000);

        // Remove typing indicator
        this.hideTypingIndicator();

        // Add bot response
        const response = this.generateBotResponse(message);
        this.addChatMessage(response, 'bot');
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        if (sender === 'bot') {
            messageElement.innerHTML = `
                <i class="fas fa-robot"></i>
                <span>${message}</span>
            `;
        } else {
            messageElement.innerHTML = `
                <span>${message}</span>
                <i class="fas fa-user"></i>
            `;
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.innerHTML = `
            <i class="fas fa-robot"></i>
            <span>
                <i class="fas fa-circle"></i>
                <i class="fas fa-circle"></i>
                <i class="fas fa-circle"></i>
            </span>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('upload') || lowerMessage.includes('add')) {
            return "To upload documents, click on 'Upload Documents' in the sidebar or use the quick action button. You can drag and drop files or click to browse.";
        }

        if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
            return "You can search documents in the 'My Documents' section. Use the search bar to find by name, type, or content.";
        }

        if (lowerMessage.includes('approval') || lowerMessage.includes('approve')) {
            return "Document approvals can be managed in the 'My Documents' section. Managers and admins can approve or reject pending documents.";
        }

        if (lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
            return "Visit the Analytics page to view detailed reports, charts, and insights about your document usage and system performance.";
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return "I'm here to help! You can ask me about uploading documents, searching, approvals, analytics, or any other features.";
        }

        // Default responses
        return this.chatbotResponses[Math.floor(Math.random() * this.chatbotResponses.length)];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for chatbot
function openChatbot() {
    if (window.dashboardManager) {
        window.dashboardManager.openChatbot();
    }
}

function closeChatbot() {
    if (window.dashboardManager) {
        window.dashboardManager.closeChatbot();
    }
}

function sendMessage() {
    if (window.dashboardManager) {
        window.dashboardManager.sendMessage();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// Add chatbot styles
const chatbotStyles = `
.chatbot {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chatbot-header {
    background: #2563eb;
    color: white;
    padding: 1rem;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chatbot-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
}

.chatbot-messages {
    height: 350px;
    overflow-y: auto;
    padding: 1rem;
    background: #f9fafb;
}

.message {
    margin-bottom: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.bot-message {
    justify-content: flex-start;
}

.user-message {
    justify-content: flex-end;
    flex-direction: row-reverse;
}

.bot-message span {
    background: white;
    padding: 0.75rem;
    border-radius: 0 10px 10px 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.user-message span {
    background: #2563eb;
    color: white;
    padding: 0.75rem;
    border-radius: 10px 0 10px 10px;
}

.chatbot-input {
    padding: 1rem;
    background: white;
    border-radius: 0 0 10px 10px;
    display: flex;
    gap: 0.5rem;
}

.chatbot-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
}

.chatbot-input button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
}

.typing-indicator span i {
    animation: typing 1.4s infinite;
    opacity: 0;
}

.typing-indicator span i:nth-child(1) { animation-delay: 0s; }
.typing-indicator span i:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span i:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 60%, 100% { opacity: 0; }
    30% { opacity: 1; }
}
`;

// Add chatbot styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = chatbotStyles;
document.head.appendChild(styleSheet);