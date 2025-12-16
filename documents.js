// KMRL Document Management System - Documents JavaScript

class DocumentsManager {
    constructor() {
        this.documents = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.loadDocuments();
        this.setupEventListeners();
        this.renderDocuments();
    }

    setupEventListeners() {
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('selectAll')?.addEventListener('change', (e) => this.selectAll(e.target.checked));
    }

    loadDocuments() {
        const storedDocs = localStorage.getItem('kmrl_documents');
        this.documents = storedDocs ? JSON.parse(storedDocs) : this.generateSampleDocuments();
        localStorage.setItem('kmrl_documents', JSON.stringify(this.documents));
    }

    generateSampleDocuments() {
        return [
            {
                id: 'doc_1',
                title: 'Financial Report Q4 2024',
                category: 'financial',
                files: [{ name: 'financial_report_q4.pdf', size: 2048000, type: 'application/pdf' }],
                uploadedAt: '2024-01-15T10:30:00Z',
                uploadedBy: 'Admin User',
                status: 'approved',
                downloads: 15,
                views: 45
            },
            {
                id: 'doc_2',
                title: 'Employee Handbook 2024',
                category: 'hr',
                files: [{ name: 'employee_handbook.docx', size: 1536000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }],
                uploadedAt: '2024-01-10T14:20:00Z',
                uploadedBy: 'Manager User',
                status: 'pending',
                downloads: 8,
                views: 22
            }
        ];
    }

    applyFilters() {
        const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const category = document.getElementById('categoryFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';

        const filtered = this.documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search) ||
                doc.category.toLowerCase().includes(search);
            const matchesCategory = !category || doc.category === category;
            const matchesStatus = !status || doc.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderDocuments(filtered);
    }

    renderDocuments(docs = this.documents) {
        const tbody = document.getElementById('documentsTableBody');
        const countEl = document.getElementById('documentCount');

        if (!tbody) return;

        tbody.innerHTML = '';
        countEl.textContent = docs.length;

        docs.forEach(doc => {
            const row = document.createElement('tr');
            row.className = 'document-row';
            row.innerHTML = `
                <td><input type="checkbox" class="doc-checkbox" data-id="${doc.id}"></td>
                <td>
                    <div class="file-info">
                        <div class="file-icon" style="background: #eff6ff; color: #2563eb;">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="file-details">
                            <h4>${doc.title}</h4>
                            <div class="file-meta">${doc.files[0]?.name || 'Unknown'}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-secondary">${doc.category}</span></td>
                <td>${this.formatDate(doc.uploadedAt)}</td>
                <td><span class="status-badge status-${doc.status}">${doc.status}</span></td>
                <td>${this.formatFileSize(doc.files[0]?.size || 0)}</td>
                <td>
                    <div class="document-actions">
                        <button class="action-btn action-view" onclick="viewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn action-download" onclick="downloadDocument('${doc.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${doc.status === 'pending' ? `
                        <button class="action-btn action-approve" onclick="approveDocument('${doc.id}')">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        <button class="action-btn action-delete" onclick="deleteDocument('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    selectAll(checked) {
        document.querySelectorAll('.doc-checkbox').forEach(cb => cb.checked = checked);
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString();
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

function applyFilters() {
    window.documentsManager?.applyFilters();
}

function viewDocument(id) {
    alert('View document: ' + id);
}

function downloadDocument(id) {
    alert('Download document: ' + id);
}

function approveDocument(id) {
    try {
        // Get existing documents
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Find and update the document
        const docIndex = documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
            documents[docIndex].status = 'approved';

            // Save back to localStorage
            localStorage.setItem('kmrl_documents', JSON.stringify(documents));

            // Show success notification
            if (window.showNotification) {
                window.showNotification('Document approved successfully!', 'success');
            } else {
                alert('Document approved successfully!');
            }

            // Refresh the documents list
            if (window.documentsManager) {
                window.documentsManager.applyFilters();
            }
        } else {
            throw new Error('Document not found');
        }
    } catch (error) {
        console.error('Error approving document:', error);
        if (window.showNotification) {
            window.showNotification('Failed to approve document', 'error');
        } else {
            alert('Failed to approve document');
        }
    }
}

function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        try {
            // Get existing documents
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

            // Filter out the document to delete
            const updatedDocuments = documents.filter(doc => doc.id !== id);

            // Save back to localStorage
            localStorage.setItem('kmrl_documents', JSON.stringify(updatedDocuments));

            // Show success notification
            if (window.showNotification) {
                window.showNotification('Document deleted successfully!', 'success');
            } else {
                alert('Document deleted successfully!');
            }

            // Refresh the documents list
            if (window.documentsManager) {
                window.documentsManager.applyFilters();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            if (window.showNotification) {
                window.showNotification('Failed to delete document', 'error');
            } else {
                alert('Failed to delete document');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();

    // Add sample documents if none exist
    const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
    if (existingDocs.length === 0) {
        const sampleDocs = [
            {
                id: 'sample_001',
                title: 'Engineering Safety Report 2024',
                category: 'technical',
                description: 'Annual safety report for engineering operations',
                tags: ['safety', 'engineering', 'annual'],
                accessLevel: 'internal',
                files: [{
                    name: 'Engineering_Safety_Report_2024.txt',
                    size: 15420,
                    type: 'text/plain',
                    lastModified: Date.now()
                }],
                uploadedBy: 'John Doe',
                uploadedAt: new Date().toISOString(),
                status: 'pending',
                downloads: 0,
                views: 0
            },
            {
                id: 'sample_002',
                title: 'HR Policy Manual 2024',
                category: 'hr',
                description: 'Updated HR policies and procedures',
                tags: ['hr', 'policy', 'manual'],
                accessLevel: 'internal',
                files: [{
                    name: 'HR_Policy_Manual_2024.txt',
                    size: 28450,
                    type: 'text/plain',
                    lastModified: Date.now() - 86400000
                }],
                uploadedBy: 'Jane Smith',
                uploadedAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'approved',
                downloads: 5,
                views: 12
            },
            {
                id: 'sample_003',
                title: 'Financial Quarter Report Q3',
                category: 'financial',
                description: 'Q3 financial performance analysis',
                tags: ['financial', 'quarterly', 'report'],
                accessLevel: 'confidential',
                files: [{
                    name: 'Finance_Q3_2024_Report.txt',
                    size: 42350,
                    type: 'text/plain',
                    lastModified: Date.now() - 172800000
                }],
                uploadedBy: 'Finance Team',
                uploadedAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'pending',
                downloads: 0,
                views: 3
            }
        ];

        localStorage.setItem('kmrl_documents', JSON.stringify(sampleDocs));
    }
});