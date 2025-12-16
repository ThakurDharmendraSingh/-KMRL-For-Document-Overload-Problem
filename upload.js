// KMRL Document Management System - Upload JavaScript

// Import modules with error handling
let MetadataExtractor, DocumentConnectors;

// Load modules asynchronously
async function loadModules() {
    try {
        const metadataModule = await import('./metadata-extractor.js');
        const connectorsModule = await import('./connectors.js');
        MetadataExtractor = metadataModule.MetadataExtractor;
        DocumentConnectors = connectorsModule.DocumentConnectors;
    } catch (error) {
        console.warn('Error loading modules:', error);
        // Create fallback objects if modules fail to load
        MetadataExtractor = {
            extract: async (file) => ({
                title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
                date: new Date(file.lastModified).toISOString().split('T')[0],
                department: '',
                tags: []
            })
        };
        DocumentConnectors = class {
            constructor() {
                this.connectors = {};
            }
            async ingestDocuments() {
                return [];
            }
        };
    }
}

class UploadManager {
    constructor() {
        this.uploadedFiles = [];
        this.fileMetadata = new Map();
        this.connectors = null;
        this.init();
    }

    async init() {
        // Load modules first
        await loadModules();

        // Initialize connectors
        if (DocumentConnectors) {
            this.connectors = new DocumentConnectors();
        }

        // Get current user and setup UI
        this.currentUser = this.getCurrentUser();
        this.setupDropZone();
        this.setupEventListeners();
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

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const documentForm = document.getElementById('documentForm');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (documentForm) {
            documentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Handle click to browse
        dropZone.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.handleFiles(files);
    }

    async handleFiles(files) {
        this.uploadedFiles = Array.from(files);

        if (this.uploadedFiles.length === 0) return;

        // Validate files
        const validFiles = this.validateFiles(this.uploadedFiles);

        if (validFiles.length === 0) {
            this.showError('No valid files selected. Please choose supported file types.');
            return;
        }

        this.uploadedFiles = validFiles;
        this.showUploadProgress();

        // Extract metadata from files
        await this.extractMetadata();

        this.simulateUpload();
    }

    validateFiles(files) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        const maxSize = 50 * 1024 * 1024; // 50MB

        return files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                this.showError(`File type not supported: ${file.name}`);
                return false;
            }

            if (file.size > maxSize) {
                this.showError(`File too large: ${file.name} (max 50MB)`);
                return false;
            }

            return true;
        });
    }

    showUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressList = document.getElementById('progressList');

        if (!uploadProgress || !progressList) return;

        uploadProgress.style.display = 'block';
        progressList.innerHTML = '';

        this.uploadedFiles.forEach((file, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.innerHTML = `
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <div class="progress">
                    <div class="progress-bar" id="progress-${index}" style="width: 0%"></div>
                </div>
            `;
            progressList.appendChild(progressItem);
        });
    }

    async simulateUpload() {
        for (let i = 0; i < this.uploadedFiles.length; i++) {
            const progressBar = document.getElementById(`progress-${i}`);

            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await this.delay(100);
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        }

        // Show success and form
        this.showSuccess('Files uploaded successfully!');
        this.showDocumentForm();
    }

    showDocumentForm() {
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.style.display = 'block';

            // Auto-fill title if single file
            if (this.uploadedFiles.length === 1) {
                const titleInput = document.getElementById('documentTitle');
                const file = this.uploadedFiles[0];
                const metadata = this.fileMetadata.get(file.name);

                if (titleInput && metadata) {
                    // Use extracted title if available, otherwise use filename
                    titleInput.value = metadata.title || file.name.substring(0, file.name.lastIndexOf('.'));
                }

                // Auto-fill tags if extracted
                const tagsInput = document.getElementById('documentTags');
                if (tagsInput && metadata && metadata.tags && metadata.tags.length > 0) {
                    tagsInput.value = metadata.tags.join(', ');
                }
            }

            // Show metadata extraction summary
            this.showMetadataPreview();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('documentTitle').value,
            category: document.getElementById('documentCategory').value,
            description: document.getElementById('documentDescription').value,
            tags: document.getElementById('documentTags').value,
            accessLevel: document.getElementById('accessLevel').value,
            files: this.uploadedFiles,
            uploadedBy: this.currentUser?.name || 'Unknown',
            uploadedAt: new Date().toISOString()
        };

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // Show loading
            const submitBtn = e.target.querySelector('button[type="submit"]');
            this.setButtonLoading(submitBtn, true);

            // Simulate API call
            await this.delay(2000);

            // Save to localStorage (demo)
            this.saveDocument(formData);

            this.showSuccess('Document saved successfully!');

            // Reset form after delay
            setTimeout(() => {
                this.resetUpload();
                window.location.href = 'documents.html';
            }, 2000);

        } catch (error) {
            this.showError('Failed to save document. Please try again.');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            this.setButtonLoading(submitBtn, false);
        }
    }

    validateForm(formData) {
        if (!formData.title.trim()) {
            this.showError('Document title is required');
            return false;
        }

        if (!formData.category) {
            this.showError('Please select a category');
            return false;
        }

        if (!formData.accessLevel) {
            this.showError('Please select an access level');
            return false;
        }

        return true;
    }

    saveDocument(formData) {
        // Get existing documents
        const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Create new document record with metadata
        const newDoc = {
            id: this.generateId(),
            title: formData.title,
            category: formData.category,
            description: formData.description,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            accessLevel: formData.accessLevel,
            files: formData.files.map(file => {
                const metadata = this.fileMetadata.get(file.name) || {};
                return {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    // Simulate file storage path
                    storagePath: `assets/${file.name}`,
                    // Include extracted metadata
                    metadata: {
                        extractedTitle: metadata.title || '',
                        extractedDate: metadata.date || '',
                        extractedDepartment: metadata.department || '',
                        extractedTags: metadata.tags || []
                    }
                }
            }),
            uploadedBy: formData.uploadedBy,
            uploadedAt: formData.uploadedAt,
            status: 'pending',
            downloads: 0,
            views: 0,
            // Add extracted metadata summary
            extractedMetadata: this.getMetadataSummary()
        };

        // Add to documents array
        existingDocs.push(newDoc);

        // Save back to localStorage
        localStorage.setItem('kmrl_documents', JSON.stringify(existingDocs));
    }

    resetUpload() {
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';

        // Hide progress and form
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadForm = document.getElementById('uploadForm');

        if (uploadProgress) uploadProgress.style.display = 'none';
        if (uploadForm) uploadForm.style.display = 'none';

        // Reset form
        const documentForm = document.getElementById('documentForm');
        if (documentForm) documentForm.reset();

        // Clear uploaded files and metadata
        this.uploadedFiles = [];
        this.fileMetadata.clear();
    }

    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': 'fas fa-file-pdf text-danger',
            'application/msword': 'fas fa-file-word text-primary',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word text-primary',
            'application/vnd.ms-excel': 'fas fa-file-excel text-success',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel text-success',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint text-warning',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint text-warning',
            'text/plain': 'fas fa-file-alt',
            'image/jpeg': 'fas fa-file-image text-info',
            'image/png': 'fas fa-file-image text-info',
            'image/gif': 'fas fa-file-image text-info'
        };

        return iconMap[fileType] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Save Document';
        }
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    generateId() {
        return 'doc_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getMetadataSummary() {
        const summary = {
            totalFiles: this.uploadedFiles.length,
            departmentsDetected: [],
            allTags: [],
            dateRange: { earliest: null, latest: null }
        };

        this.fileMetadata.forEach((metadata, fileName) => {
            if (metadata.department && !summary.departmentsDetected.includes(metadata.department)) {
                summary.departmentsDetected.push(metadata.department);
            }
            if (metadata.tags) {
                summary.allTags.push(...metadata.tags.filter(tag => !summary.allTags.includes(tag)));
            }
            if (metadata.date) {
                if (!summary.dateRange.earliest || metadata.date < summary.dateRange.earliest) {
                    summary.dateRange.earliest = metadata.date;
                }
                if (!summary.dateRange.latest || metadata.date > summary.dateRange.latest) {
                    summary.dateRange.latest = metadata.date;
                }
            }
        });

        return summary;
    }

    async testConnector(connectorType) {
        try {
            // Show loading state
            const button = document.querySelector(`button[onclick="testConnector('${connectorType}')"]`);
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            button.disabled = true;

            // Simulate connector sync
            const documents = await this.connectors.ingestDocuments(connectorType);

            // Process ingested documents
            for (const doc of documents) {
                await this.processConnectorDocument(doc);
            }

            // Show success notification
            this.showSuccess(`Successfully ingested ${documents.length} document(s) from ${connectorType}`);

            // Update connector status
            this.updateConnectorStatus(connectorType);

        } catch (error) {
            console.error(`Error syncing ${connectorType}:`, error);
            this.showError(`Failed to sync ${connectorType}: ${error.message}`);
        } finally {
            // Restore button state
            const button = document.querySelector(`button[onclick="testConnector('${connectorType}')"]`);
            button.innerHTML = '<i class="fas fa-sync"></i> Sync';
            button.disabled = false;
        }
    }

    async processConnectorDocument(doc) {
        // Create a simulated document entry
        const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        const newDoc = {
            id: doc.id,
            title: doc.title,
            category: this.mapDepartmentToCategory(doc.department),
            description: `Document ingested from ${doc.source}`,
            tags: doc.tags || [],
            accessLevel: 'internal',
            files: [{
                name: `${doc.title}.txt`,
                size: 1024, // Simulated size
                type: 'text/plain',
                lastModified: new Date(doc.date).getTime(),
                storagePath: doc.filePath,
                metadata: {
                    extractedTitle: doc.title,
                    extractedDate: doc.date,
                    extractedDepartment: doc.department,
                    extractedTags: doc.tags || []
                }
            }],
            uploadedBy: `${doc.source} Connector`,
            uploadedAt: new Date().toISOString(),
            status: 'approved', // Auto-approve connector documents
            downloads: 0,
            views: 0,
            source: doc.source,
            connectorData: doc
        };

        // Check if document already exists
        const existingIndex = existingDocs.findIndex(existing => existing.id === doc.id);
        if (existingIndex !== -1) {
            // Update existing document
            existingDocs[existingIndex] = newDoc;
        } else {
            // Add new document
            existingDocs.push(newDoc);
        }

        // Save to localStorage
        localStorage.setItem('kmrl_documents', JSON.stringify(existingDocs));
    }

    mapDepartmentToCategory(department) {
        const mapping = {
            'Engineering': 'technical',
            'HR': 'hr',
            'Finance': 'financial',
            'Operations': 'operations',
            'Legal': 'legal'
        };
        return mapping[department] || 'technical';
    }

    updateConnectorStatus(connectorType) {
        // Update the connector card to show last sync time
        const now = new Date().toLocaleTimeString();
        const card = document.querySelector(`button[onclick="testConnector('${connectorType}')"]`).closest('.card');
        const statusText = card.querySelector('.small');
        if (statusText) {
            statusText.innerHTML = `Last sync: ${now}`;
        }
    }

    showMetadataPreview() {
        // Create or update metadata preview section
        let metadataPreview = document.getElementById('metadataPreview');

        if (!metadataPreview) {
            metadataPreview = document.createElement('div');
            metadataPreview.id = 'metadataPreview';
            metadataPreview.className = 'metadata-preview mt-3';

            const uploadForm = document.getElementById('uploadForm');
            if (uploadForm) {
                uploadForm.insertBefore(metadataPreview, uploadForm.firstChild);
            }
        }

        const summary = this.getMetadataSummary();

        metadataPreview.innerHTML = `
            <div class="card border-info">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0"><i class="fas fa-search"></i> Auto-Extracted Metadata</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Files Processed:</strong> ${summary.totalFiles}</p>
                            ${summary.departmentsDetected.length > 0 ?
                `<p><strong>Departments Detected:</strong> ${summary.departmentsDetected.join(', ')}</p>` : ''}
                        </div>
                        <div class="col-md-6">
                            ${summary.allTags.length > 0 ?
                `<p><strong>Tags Found:</strong> ${summary.allTags.slice(0, 5).join(', ')}${summary.allTags.length > 5 ? '...' : ''}</p>` : ''}
                            ${summary.dateRange.earliest ?
                `<p><strong>Date Range:</strong> ${summary.dateRange.earliest} to ${summary.dateRange.latest}</p>` : ''}
                        </div>
                    </div>
                    <div class="alert alert-info alert-sm mb-0">
                        <small><i class="fas fa-info-circle"></i> Extracted metadata has been used to pre-fill form fields where possible.</small>
                    </div>
                </div>
            </div>
        `;
    }

    async extractMetadata() {
        if (!MetadataExtractor) {
            console.warn('MetadataExtractor not available, using basic metadata');
            // Use basic metadata extraction
            for (const file of this.uploadedFiles) {
                this.fileMetadata.set(file.name, {
                    title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
                    date: new Date(file.lastModified).toISOString().split('T')[0],
                    department: '',
                    tags: []
                });
            }
            return;
        }

        for (const file of this.uploadedFiles) {
            try {
                const metadata = await MetadataExtractor.extract(file);
                this.fileMetadata.set(file.name, metadata);
            } catch (error) {
                console.error(`Error extracting metadata for ${file.name}:`, error);
                // Set default metadata if extraction fails
                this.fileMetadata.set(file.name, {
                    title: file.name.substring(0, file.name.lastIndexOf('.')),
                    date: new Date(file.lastModified).toISOString().split('T')[0],
                    department: '',
                    tags: []
                });
            }
        }
    }
}

// Global function for reset
function resetUpload() {
    if (window.uploadManager) {
        window.uploadManager.resetUpload();
    }
}

// Global function for connector testing
function testConnector(connectorType) {
    if (window.uploadManager) {
        window.uploadManager.testConnector(connectorType);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});