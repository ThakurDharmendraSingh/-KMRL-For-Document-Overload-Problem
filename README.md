# KMRL Document Management System

A comprehensive web-based document management system built with HTML, CSS, and JavaScript. This system provides role-based access control, document upload and management, analytics, and AI-powered features for modern organizations.

## 🚀 Features

### Core Functionality
- **Role-Based Authentication**: Admin, Manager, and Staff roles with different permissions
- **Document Upload**: Drag-and-drop file upload with progress tracking
- **Document Management**: Search, filter, and organize documents efficiently
- **Analytics Dashboard**: Visual insights and reporting with Chart.js
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **AI Assistant**: Chatbot for user guidance and support

### User Roles & Permissions

#### Admin Users
- Full system access and management
- User management and configuration
- System analytics and reporting
- All document operations

#### Manager Users
- Document approval workflows
- Team document management
- Analytics and reporting
- Upload and organize documents

#### Staff Users
- Document upload and download
- Personal document management
- Basic search and filtering
- View assigned documents

## 📁 Project Structure

```
KMRL2/
├── css/
│   └── styles.css              # Main stylesheet with KMRL branding
├── js/
│   ├── common.js               # Shared utilities and authentication
│   ├── login.js                # Authentication and login logic
│   ├── dashboard.js            # Dashboard functionality and widgets
│   ├── upload.js               # File upload handling
│   ├── documents.js            # Document management
│   └── analytics.js            # Charts and reporting
├── images/                     # Static assets directory
├── index.html                  # Welcome landing page
├── login.html                  # Authentication page
├── dashboard.html              # Main dashboard
├── upload.html                 # Document upload interface
├── documents.html              # Document management
├── analytics.html              # Analytics and reporting
├── admin.html                  # Admin panel
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Quick Start
1. Clone or download the project files
2. Ensure all files are in the correct directory structure
3. Open `index.html` in a web browser
4. Navigate to the login page and use demo credentials

### Local Development Server
For best experience, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔐 Demo Credentials

The system includes demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kmrl.com | admin123 |
| Manager | manager@kmrl.com | manager123 |
| Staff | staff@kmrl.com | staff123 |

## 📖 Usage Guide

### Getting Started
1. **Access the System**: Open `index.html` in a web browser
2. **Login**: Click "Get Started" and use demo credentials
3. **Dashboard**: View system overview and quick statistics
4. **Navigation**: Use the sidebar to access different features

### Document Upload
1. Navigate to "Upload Documents" from the sidebar
2. Drag and drop files or click to browse
3. Fill in document metadata (title, category, description)
4. Submit for upload and processing

### Document Management
1. Go to "My Documents" section
2. Use search and filter options to find documents
3. View, download, or manage document permissions
4. Approve/reject documents (Manager/Admin roles)

### Analytics & Reporting
1. Access "Analytics" from the sidebar
2. View interactive charts and KPIs
3. Filter data by date ranges and categories
4. Export reports in various formats

### Admin Panel (Admin Only)
1. Navigate to "Admin Panel"
2. Manage user accounts and permissions
3. Configure system settings
4. Monitor system health and usage

## 🎨 Design System

### Brand Colors
- **Primary Blue**: #2563eb (KMRL brand color)
- **Success Green**: #059669
- **Warning Orange**: #d97706
- **Danger Red**: #dc2626
- **Neutral Grays**: #f8fafc to #0f172a

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Responsive Sizing**: 14px base on mobile, 16px on desktop
- **Weight Hierarchy**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Layout Principles
- **Mobile-First**: Responsive design starting from 320px width
- **Grid System**: CSS Grid and Flexbox for layouts
- **Spacing**: Consistent 8px spacing scale
- **Border Radius**: 4px to 16px for different elements

## 🔧 Technical Specifications

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES6+, CSS Grid, Flexbox, Local Storage

### Dependencies
- **Chart.js**: Data visualization and analytics
- **Font Awesome**: Icons and visual elements
- **No Framework**: Pure HTML, CSS, and JavaScript

### Performance
- **Optimized Assets**: Minified CSS, efficient JavaScript
- **Lazy Loading**: Images and components loaded as needed
- **Local Storage**: Client-side data persistence
- **Fast Interactions**: Smooth animations and transitions

## 🚀 Key Features Explained

### Authentication System
- **Session Management**: Browser local storage
- **Role-Based Access**: Dynamic UI based on user permissions
- **Security**: Input validation and sanitization
- **Demo Mode**: Pre-configured test accounts

### Document Processing
- **File Upload**: HTML5 File API with progress tracking
- **Validation**: File type, size, and content checks
- **Metadata**: Automatic and manual document tagging
- **Storage Simulation**: Local storage for demo purposes

### User Interface
- **Responsive Design**: Mobile-first, adaptive layouts
- **Dark/Light Themes**: KMRL brand color system
- **Accessibility**: Keyboard navigation, screen reader support
- **Animations**: Smooth transitions and micro-interactions

### Analytics Engine
- **Real-Time Data**: Dynamic chart updates
- **Multiple Views**: Charts, tables, and summary cards
- **Export Options**: PDF, Excel, and image formats
- **Filtering**: Date ranges, categories, and user groups

## 🔒 Security Features

### Data Protection
- **Input Sanitization**: XSS prevention
- **Content Security**: File type validation
- **Session Security**: Automatic timeout and validation
- **Role Enforcement**: Server-side permission checks (simulated)

### Best Practices
- **Password Requirements**: Enforced complexity rules
- **Session Management**: Secure token handling
- **Error Handling**: User-friendly error messages
- **Audit Logging**: User action tracking (simulated)

## 📱 Mobile Experience

### Responsive Features
- **Collapsible Navigation**: Mobile-optimized sidebar
- **Touch Interactions**: Swipe gestures and touch-friendly buttons
- **Adaptive Layouts**: Grid systems that reflow on small screens
- **Performance**: Optimized for slower mobile connections

### Mobile-Specific Enhancements
- **Touch Targets**: Minimum 44px tap targets
- **Readable Fonts**: Optimized typography for small screens
- **Fast Loading**: Minimal asset sizes and efficient code
- **Offline Support**: Service worker for basic offline functionality

## 🧪 Testing

### Manual Testing
- **Cross-Browser**: Test in Chrome, Firefox, Safari, Edge
- **Device Testing**: Desktop, tablet, and mobile devices
- **User Flows**: Complete feature testing scenarios
- **Accessibility**: Screen reader and keyboard testing

### Test Scenarios
1. **Login Flow**: All user roles and error cases
2. **File Upload**: Various file types and sizes
3. **Document Management**: CRUD operations
4. **Analytics**: Chart rendering and data accuracy
5. **Responsive**: All breakpoints and orientations

## 🚀 Deployment

### Production Setup
1. **Web Server**: Deploy to any web server (Apache, Nginx, etc.)
2. **HTTPS**: Enable SSL/TLS for security
3. **CDN**: Use CDN for static assets if needed
4. **Monitoring**: Set up analytics and error tracking

### Environment Configuration
- **API Endpoints**: Update for production API calls
- **Storage**: Configure proper document storage
- **Authentication**: Integrate with real authentication system
- **Database**: Connect to production database

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Submit pull request

### Code Standards
- **JavaScript**: ES6+ with proper error handling
- **CSS**: BEM methodology and consistent naming
- **HTML**: Semantic markup and accessibility
- **Comments**: Clear documentation for complex logic

## 📞 Support

### Documentation
- **User Guide**: Comprehensive feature documentation
- **API Reference**: JavaScript function documentation
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

### Contact Information
- **Email**: support@kmrl.com
- **Documentation**: [Internal Documentation]
- **Issues**: GitHub Issues for bug reports
- **Community**: Internal forums and chat

## 🗂️ Changelog

### Version 1.0.0 (Current)
- ✅ Initial release with core functionality
- ✅ Role-based authentication system
- ✅ Document upload and management
- ✅ Analytics dashboard with Chart.js
- ✅ Responsive design for all devices
- ✅ AI chatbot integration
- ✅ Admin panel for system management

### Planned Features
- 🔄 Real-time notifications
- 🔄 Advanced search with OCR
- 🔄 Document versioning
- 🔄 Advanced approval workflows
- 🔄 Integration APIs
- 🔄 Advanced analytics

## 📄 License

This project is proprietary software developed for KMRL. All rights reserved.

---

**KMRL Document Management System** - Streamlining document workflows with modern web technology.