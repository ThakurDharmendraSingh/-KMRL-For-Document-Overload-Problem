// KMRL Document Management System - Upload JavaScript

class UploadManager {
    constructor() {
        this.uploadedFiles = [];
        this.fileMetadata = new Map();
        this.extractedKeyPoints = new Map();
        this.fileContents = new Map();
        this.geminiApiKey = 'AIzaSyCTPieAB3raewjMv3E_iecoInNkXmVSGKA'; // Gemini API key
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.setupDropZone();
        this.setupEventListeners();

        // Test Gemini API connection on initialization
        this.testGeminiConnection().then(connected => {
            if (connected) {
                console.log('✅ Gemini API is ready');
            } else {
                console.warn('⚠️ Gemini API connection issues detected');
                this.showError('Gemini API connection issue detected. Basic metadata extraction will be used.');
            }
        }).catch(error => {
            console.error('Error testing Gemini connection:', error);
        });
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
        const extractKeyPointsBtn = document.getElementById('extractKeyPointsBtn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (documentForm) {
            documentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        if (extractKeyPointsBtn) {
            extractKeyPointsBtn.addEventListener('click', () => this.extractKeyPointsWithAI());
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

        // Extract basic metadata from files
        await this.extractBasicMetadata();

        // Store file contents for text files
        await this.storeFileContents();

        // Enhanced metadata extraction with Gemini AI
        await this.extractMetadataWithAI();

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

    async extractBasicMetadata() {
        for (const file of this.uploadedFiles) {
            // Extract basic metadata from file properties
            const metadata = {
                title: this.extractTitleFromFilename(file.name),
                date: new Date(file.lastModified).toISOString().split('T')[0],
                department: this.detectDepartmentFromFilename(file.name),
                tags: this.extractTagsFromFilename(file.name)
            };

            this.fileMetadata.set(file.name, metadata);
        }
    }

    extractTitleFromFilename(filename) {
        // Remove extension and format title
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
        return nameWithoutExt
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    detectDepartmentFromFilename(filename) {
        const lowerName = filename.toLowerCase();
        if (lowerName.includes('engineering') || lowerName.includes('technical')) return 'Engineering';
        if (lowerName.includes('hr') || lowerName.includes('human')) return 'HR';
        if (lowerName.includes('finance') || lowerName.includes('financial')) return 'Finance';
        if (lowerName.includes('operations') || lowerName.includes('maintenance')) return 'Operations';
        if (lowerName.includes('legal') || lowerName.includes('compliance')) return 'Legal';
        return '';
    }

    extractTagsFromFilename(filename) {
        const lowerName = filename.toLowerCase();
        const tags = [];

        if (lowerName.includes('report')) tags.push('report');
        if (lowerName.includes('policy')) tags.push('policy');
        if (lowerName.includes('safety')) tags.push('safety');
        if (lowerName.includes('maintenance')) tags.push('maintenance');
        if (lowerName.includes('financial')) tags.push('financial');
        if (lowerName.includes('schedule')) tags.push('schedule');
        if (lowerName.includes('compliance')) tags.push('compliance');

        return tags;
    }

    async storeFileContents() {
        for (const file of this.uploadedFiles) {
            if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                try {
                    const content = await this.readFileContent(file);
                    this.fileContents.set(file.name, content);
                } catch (error) {
                    console.error(`Error reading content from ${file.name}:`, error);
                }
            }
        }
    }

    async extractMetadataWithAI() {
        for (const file of this.uploadedFiles) {
            if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                try {
                    const fileContent = await this.readFileContent(file);
                    const enhancedMetadata = await this.analyzeContentWithGemini(fileContent, file.name);

                    // Merge AI-enhanced metadata with basic metadata
                    const existingMetadata = this.fileMetadata.get(file.name) || {};
                    this.fileMetadata.set(file.name, {
                        ...existingMetadata,
                        ...enhancedMetadata,
                        aiEnhanced: true
                    });
                } catch (error) {
                    console.error(`Error analyzing ${file.name} with AI:`, error);
                }
            }
        }
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async analyzeContentWithGemini(content, filename) {
        try {
            console.log('Starting Gemini analysis for:', filename);

            const prompt = `Analyze this document content and extract metadata. Return a JSON object with the following structure:
{
  "title": "extracted or improved title",
  "department": "detected department (Engineering, HR, Finance, Operations, Legal, or empty string)",
  "tags": ["array", "of", "relevant", "tags"],
  "summary": "brief 2-sentence summary",
  "category": "suggested category (technical, hr, financial, operations, legal, marketing)",
  "priority": "High, Medium, or Low",
  "documentType": "Report, Policy, Schedule, Manual, etc."
}

Document filename: ${filename}
Document content:
${content.substring(0, 4000)}`; // Limit content to avoid token limits

            console.log('Making API request to Gemini...');

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            // Validate response structure
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                console.error('Invalid response structure:', data);
                throw new Error('Invalid response structure from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            console.log('Generated text:', generatedText);

            // Extract JSON from the response
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    console.log('Parsed metadata:', parsedData);
                    return parsedData;
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Failed to parse JSON from response');
                }
            } else {
                console.warn('No valid JSON found in response, using fallback');
                // Fallback metadata extraction
                return {
                    title: this.extractTitleFromFilename(filename),
                    department: this.detectDepartmentFromFilename(filename),
                    tags: this.extractTagsFromFilename(filename),
                    summary: "Metadata extracted using fallback method due to API parsing issues.",
                    category: "technical",
                    priority: "Medium",
                    documentType: "Document"
                };
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);

            // Show user-friendly error
            this.showError(`Gemini API Error: ${error.message}. Using basic metadata extraction.`);

            // Return fallback metadata
            return {
                title: this.extractTitleFromFilename(filename),
                department: this.detectDepartmentFromFilename(filename),
                tags: this.extractTagsFromFilename(filename),
                summary: "Metadata extracted using basic method due to API connection issues.",
                category: "technical",
                priority: "Medium",
                documentType: "Document"
            };
        }
    }

    async extractKeyPointsWithAI() {
        const keyPointsLoading = document.getElementById('keyPointsLoading');
        const keyPointsContent = document.getElementById('keyPointsContent');
        const extractBtn = document.getElementById('extractKeyPointsBtn');

        if (keyPointsLoading) keyPointsLoading.style.display = 'block';
        if (extractBtn) extractBtn.style.display = 'none';
        if (keyPointsContent) keyPointsContent.innerHTML = '';

        try {
            let allKeyPoints = [];

            for (const file of this.uploadedFiles) {
                if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                    const fileContent = await this.readFileContent(file);
                    const keyPoints = await this.getKeyPointsFromGemini(fileContent, file.name);

                    if (keyPoints && keyPoints.length > 0) {
                        allKeyPoints.push({
                            fileName: file.name,
                            points: keyPoints
                        });
                        this.extractedKeyPoints.set(file.name, keyPoints);
                    }
                }
            }

            this.displayKeyPoints(allKeyPoints);
        } catch (error) {
            console.error('Error extracting key points:', error);
            if (keyPointsContent) {
                keyPointsContent.innerHTML = '<div class="alert alert-danger">Failed to extract key points. Please try again.</div>';
            }
        } finally {
            if (keyPointsLoading) keyPointsLoading.style.display = 'none';
            if (extractBtn) extractBtn.style.display = 'block';
        }
    }

    async getKeyPointsFromGemini(content, filename) {
        try {
            console.log('Extracting key points for:', filename);

            const prompt = `Extract the 5-7 most important key points from this document. Return them as a JSON array of strings.

Example format: ["Key point 1", "Key point 2", "Key point 3"]

Document: ${filename}
Content:
${content.substring(0, 4000)}`;

            console.log('Making key points API request...');

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            console.log('Key points response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Key points API Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const data = await response.json();
            console.log('Key points response:', data);

            // Validate response structure
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                console.error('Invalid key points response structure:', data);
                throw new Error('Invalid response structure from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            console.log('Generated key points text:', generatedText);

            // Extract JSON array from the response
            const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const keyPoints = JSON.parse(jsonMatch[0]);
                    console.log('Parsed key points:', keyPoints);
                    return Array.isArray(keyPoints) ? keyPoints : [];
                } catch (parseError) {
                    console.error('Key points JSON parse error:', parseError);
                }
            }

            // Fallback: split by lines and clean up
            console.log('Using fallback key points extraction');
            const fallbackPoints = generatedText.split('\n')
                .filter(line => line.trim() && !line.includes('```') && !line.includes('[') && !line.includes(']'))
                .map(line => line.replace(/^[\d\-\*\.\s]+/, '').trim())
                .filter(line => line.length > 10)
                .slice(0, 7);

            console.log('Fallback key points:', fallbackPoints);
            return fallbackPoints;

        } catch (error) {
            console.error('Error calling Gemini API for key points:', error);

            // Show user-friendly error
            this.showError(`Key Points API Error: ${error.message}. Please try again.`);

            // Return basic key points as fallback
            return [
                `Document: ${filename}`,
                "Content analysis failed - please check API connection",
                "Key points extraction requires valid API response",
                "Try refreshing the page and uploading again"
            ];
        }
    }

    async testGeminiConnection() {
        try {
            console.log('Testing Gemini API connection...');

            const testPrompt = "Return exactly this JSON: {\"test\": \"success\", \"status\": \"connected\"}";

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: testPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0,
                        maxOutputTokens: 100,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Connection test failed:', errorText);
                return false;
            }

            const data = await response.json();
            console.log('Connection test response:', data);

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                console.log('✅ Gemini API connection successful');
                return true;
            } else {
                console.error('❌ Invalid response structure');
                return false;
            }

        } catch (error) {
            console.error('❌ Gemini API connection failed:', error);
            return false;
        }
    }

    showKeyPointsSection() {
        const keyPointsSection = document.getElementById('keyPointsSection');
        if (keyPointsSection) {
            // Show key points section only if there are text files
            const hasTextFiles = this.uploadedFiles.some(file =>
                file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
            );

            if (hasTextFiles) {
                keyPointsSection.style.display = 'block';
            }
        }
    }

    displayKeyPoints(allKeyPoints) {
        const keyPointsContent = document.getElementById('keyPointsContent');
        if (!keyPointsContent) return;

        if (allKeyPoints.length === 0) {
            keyPointsContent.innerHTML = '<div class="alert alert-info">No text files found for key point extraction.</div>';
            return;
        }

        let html = '';
        allKeyPoints.forEach(filePoints => {
            html += `
                <div class="mb-3">
                    <h6 class="text-primary"><i class="fas fa-file-alt"></i> ${filePoints.fileName}</h6>
                    <ul class="list-unstyled">
            `;

            filePoints.points.forEach(point => {
                html += `<li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>${point}</li>`;
            });

            html += `
                    </ul>
                </div>
            `;
        });

        keyPointsContent.innerHTML = html;

        // Refresh the file content viewer tabs with updated key points
        this.createFileContentTabs();
    }

    showFileContentViewer() {
        const fileContentSection = document.getElementById('fileContentSection');
        if (!fileContentSection) return;

        // Show file content section only if there are text files
        const hasTextFiles = this.uploadedFiles.some(file =>
            file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
        );

        if (hasTextFiles) {
            fileContentSection.style.display = 'block';
            this.createFileContentTabs();
        }
    }

    createFileContentTabs() {
        const tabsContainer = document.getElementById('fileContentTabs');
        const tabContentContainer = document.getElementById('fileContentTabContent');

        if (!tabsContainer || !tabContentContainer) return;

        // Clear existing tabs
        tabsContainer.innerHTML = '';
        tabContentContainer.innerHTML = '';

        let activeTabSet = false;

        this.uploadedFiles.forEach((file, index) => {
            if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                const tabId = `file-tab-${index}`;
                const contentTabId = `file-content-${index}`;
                const keyPointsTabId = `file-keypoints-${index}`;
                const isActive = !activeTabSet;
                activeTabSet = true;

                // Create main file tab
                const mainTab = document.createElement('li');
                mainTab.className = 'nav-item dropdown';
                mainTab.innerHTML = `
                    <a class="nav-link dropdown-toggle ${isActive ? 'active' : ''}" data-bs-toggle="dropdown" href="#" role="button">
                        <i class="fas fa-file-alt"></i> ${fileName}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#${contentTabId}" data-bs-toggle="tab">View Content</a></li>
                        <li><a class="dropdown-item" href="#${keyPointsTabId}" data-bs-toggle="tab">Key Points</a></li>
                    </ul>
                `;
                tabsContainer.appendChild(mainTab);

                // Create content tab pane
                const contentPane = document.createElement('div');
                contentPane.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
                contentPane.id = contentTabId;
                contentPane.innerHTML = `
                    <h6><i class="fas fa-file-text"></i> Content: ${file.name}</h6>
                    <div class="file-content-viewer">${this.fileContents.get(file.name) || 'Content not available'}</div>
                `;
                tabContentContainer.appendChild(contentPane);

                // Create key points tab pane
                const keyPointsPane = document.createElement('div');
                keyPointsPane.className = 'tab-pane fade';
                keyPointsPane.id = keyPointsTabId;

                const keyPoints = this.extractedKeyPoints.get(file.name);
                let keyPointsHTML = `<h6><i class="fas fa-lightbulb"></i> Key Points: ${file.name}</h6>`;

                if (keyPoints && keyPoints.length > 0) {
                    keyPointsHTML += '<div class="key-points-viewer"><div class="list-group">';
                    keyPoints.forEach(point => {
                        keyPointsHTML += `<div class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${point}</div>`;
                    });
                    keyPointsHTML += '</div></div>';
                } else {
                    keyPointsHTML += '<div class="alert alert-info">Key points not extracted yet. Click "Extract Key Points with AI" button above.</div>';
                }

                keyPointsPane.innerHTML = keyPointsHTML;
                tabContentContainer.appendChild(keyPointsPane);
            }
        });
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
                    titleInput.value = metadata.title;
                }

                // Auto-fill tags if extracted
                const tagsInput = document.getElementById('documentTags');
                if (tagsInput && metadata && metadata.tags && metadata.tags.length > 0) {
                    tagsInput.value = metadata.tags.join(', ');
                }
            }

            // Show metadata extraction summary
            this.showMetadataPreview();

            // Show key points section if text files
            this.showKeyPointsSection();

            // Show file content viewer
            this.showFileContentViewer();
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
                        extractedTags: metadata.tags || [],
                        aiEnhanced: metadata.aiEnhanced || false,
                        documentType: metadata.documentType || '',
                        priority: metadata.priority || '',
                        summary: metadata.summary || '',
                        category: metadata.category || ''
                    }
                }
            }),
            uploadedBy: formData.uploadedBy,
            uploadedAt: formData.uploadedAt,
            status: 'pending',
            downloads: 0,
            views: 0,
            // Add extracted metadata summary
            extractedMetadata: this.getMetadataSummary(),
            // Add key points if extracted
            keyPoints: this.getKeyPointsSummary()
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
        this.extractedKeyPoints.clear();
        this.fileContents.clear();

        // Hide key points section
        const keyPointsSection = document.getElementById('keyPointsSection');
        if (keyPointsSection) keyPointsSection.style.display = 'none';

        // Hide file content section
        const fileContentSection = document.getElementById('fileContentSection');
        if (fileContentSection) fileContentSection.style.display = 'none';
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

    getMetadataSummary() {
        const summary = {
            totalFiles: this.uploadedFiles.length,
            departmentsDetected: [],
            allTags: [],
            dateRange: { earliest: null, latest: null },
            documentTypes: [],
            priorities: [],
            summaries: []
        };

        this.fileMetadata.forEach((metadata, fileName) => {
            if (metadata.department && !summary.departmentsDetected.includes(metadata.department)) {
                summary.departmentsDetected.push(metadata.department);
            }
            if (metadata.tags) {
                summary.allTags.push(...metadata.tags.filter(tag => !summary.allTags.includes(tag)));
            }
            if (metadata.documentType && !summary.documentTypes.includes(metadata.documentType)) {
                summary.documentTypes.push(metadata.documentType);
            }
            if (metadata.priority && !summary.priorities.includes(metadata.priority)) {
                summary.priorities.push(metadata.priority);
            }
            if (metadata.summary) {
                summary.summaries.push({ file: fileName, summary: metadata.summary });
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

    getKeyPointsSummary() {
        const keyPointsSummary = {};
        this.extractedKeyPoints.forEach((points, fileName) => {
            keyPointsSummary[fileName] = points;
        });
        return keyPointsSummary;
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    generateId() {
        return 'doc_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Connector test functionality (simplified)
    async testConnector(connectorType) {
        try {
            // Show loading state
            const button = document.querySelector(`button[onclick="testConnector('${connectorType}')"]`);
            if (button) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
                button.disabled = true;
            }

            // Simulate connector sync
            await this.delay(2000);

            // Create a sample document from connector
            const sampleDoc = this.createSampleConnectorDocument(connectorType);
            this.saveConnectorDocument(sampleDoc);

            this.showSuccess(`Successfully synced 1 document from ${connectorType}`);

        } catch (error) {
            console.error(`Error syncing ${connectorType}:`, error);
            this.showError(`Failed to sync ${connectorType}`);
        } finally {
            // Restore button state
            const button = document.querySelector(`button[onclick="testConnector('${connectorType}')"]`);
            if (button) {
                button.innerHTML = '<i class="fas fa-sync"></i> Sync';
                button.disabled = false;
            }
        }
    }

    createSampleConnectorDocument(connectorType) {
        const sampleDocs = {
            email: {
                id: 'email_001',
                title: 'Track Inspection Report - Email',
                category: 'technical',
                description: 'Document ingested from email connector',
                tags: ['email', 'track inspection', 'maintenance'],
                source: 'email'
            },
            sharepoint: {
                id: 'sp_001',
                title: 'Metro Extension Design - SharePoint',
                category: 'technical',
                description: 'Document ingested from SharePoint connector',
                tags: ['sharepoint', 'design', 'metro extension'],
                source: 'sharepoint'
            },
            maximo: {
                id: 'maximo_001',
                title: 'Escalator Maintenance WO - Maximo',
                category: 'operations',
                description: 'Document ingested from Maximo connector',
                tags: ['maximo', 'maintenance', 'escalator'],
                source: 'maximo'
            },
            whatsapp: {
                id: 'whatsapp_001',
                title: 'Emergency Response Chat - WhatsApp',
                category: 'operations',
                description: 'Document ingested from WhatsApp connector',
                tags: ['whatsapp', 'emergency', 'incident'],
                source: 'whatsapp'
            }
        };

        return sampleDocs[connectorType] || sampleDocs.email;
    }

    saveConnectorDocument(doc) {
        const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        const newDoc = {
            ...doc,
            accessLevel: 'internal',
            files: [{
                name: `${doc.title}.txt`,
                size: 1024,
                type: 'text/plain',
                lastModified: Date.now(),
                storagePath: `assets/${doc.source}_sample.txt`
            }],
            uploadedBy: `${doc.source} Connector`,
            uploadedAt: new Date().toISOString(),
            status: 'approved',
            downloads: 0,
            views: 0
        };

        existingDocs.push(newDoc);
        localStorage.setItem('kmrl_documents', JSON.stringify(existingDocs));
    }
}

// Global functions
function resetUpload() {
    if (window.uploadManager) {
        window.uploadManager.resetUpload();
    }
}

function testConnector(connectorType) {
    if (window.uploadManager) {
        window.uploadManager.testConnector(connectorType);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});