// AI Summarizer & Translation Module for KMRL Document Management System

class AISummarizer {
    constructor() {
        this.selectedDocument = null;
        this.currentLanguage = 'english';
        this.isModalOpen = false;
        this.geminiApiKey = 'AIzaSyCTPieAB3raewjMv3E_iecoInNkXmVSGKA';
        this.initializeAISummarizer();
        this.setupEventListeners();
    }

    initializeAISummarizer() {
        if (!document.getElementById('aiSummarizerModal')) {
            const modal = document.createElement('div');
            modal.id = 'aiSummarizerModal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-robot"></i> AI Summarizer & Translation</h2>
                        <button id="closeModal" class="close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-content">
                        <div id="documentSelectionStep" class="step active">
                            <h3>Select Document</h3>
                            <div class="document-search">
                                <input type="text" id="documentSearch" placeholder="Search documents...">
                                <select id="categoryFilter">
                                    <option value="">All Categories</option>
                                    <option value="technical">Technical</option>
                                    <option value="operations">Operations</option>
                                </select>
                            </div>
                            <div id="documentsList" class="documents-list"></div>
                            <button id="selectDocumentBtn" class="btn btn-primary" disabled>Continue</button>
                        </div>
                        
                        <div id="aiAnalysisStep" class="step">
                            <h3>AI Analysis Options</h3>
                            <div class="analysis-options">
                                <div class="option-card" data-action="summarize">
                                    <h4>Document Summary</h4>
                                    <button class="btn btn-outline">Generate Summary</button>
                                </div>
                                <div class="option-card" data-action="translate">
                                    <h4>Translation</h4>
                                    <button class="btn btn-outline">Translate</button>
                                </div>
                                <div class="option-card" data-action="analyze">
                                    <h4>Critical Analysis</h4>
                                    <button class="btn btn-outline">Analyze</button>
                                </div>
                            </div>
                            <button id="backToSelectionBtn" class="btn btn-secondary">Back</button>
                        </div>
                        
                        <div id="resultsStep" class="step">
                            <h3>Results</h3>
                            <div id="summaryResults" class="results-content">
                                <div class="split-screen-container">
                                    <div class="original-document">
                                        <h4>Original Document</h4>
                                        <div id="originalContent"></div>
                                    </div>
                                    <div class="summary-panel">
                                        <h4>AI Summary</h4>
                                        <div id="summaryContent"></div>
                                    </div>
                                </div>
                            </div>
                            <div id="translationResults" class="results-content">
                                <div id="sourceContent"></div>
                                <div id="translatedContent"></div>
                            </div>
                            <div id="analysisResults" class="results-content">
                                <div class="insights-grid">
                                    <div class="insight-card deadlines">
                                        <h5>Deadlines</h5>
                                        <div id="deadlinesList"></div>
                                    </div>
                                    <div class="insight-card safety">
                                        <h5>Safety Issues</h5>
                                        <div id="safetyList"></div>
                                    </div>
                                    <div class="insight-card regulatory">
                                        <h5>Regulatory Risks</h5>
                                        <div id="regulatoryList"></div>
                                    </div>
                                </div>
                            </div>
                            <button id="newAnalysisBtn" class="btn btn-secondary">New Analysis</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            this.addModalStyles();
        }
    }

    setupEventListeners() {
        const aiSummarizerLink = document.getElementById('aiSummarizerLink');
        if (aiSummarizerLink) {
            aiSummarizerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeModal') this.closeModal();
            if (e.target.id === 'selectDocumentBtn') this.goToAnalysisStep();
            if (e.target.id === 'backToSelectionBtn') this.goToSelectionStep();
            if (e.target.id === 'newAnalysisBtn') this.goToAnalysisStep();

            if (e.target.closest('.select-doc-btn')) {
                const docId = e.target.closest('.select-doc-btn').getAttribute('data-doc-id');
                this.selectDocument(docId);
            }

            if (e.target.closest('.option-card')) {
                const action = e.target.closest('.option-card').getAttribute('data-action');
                this.performAnalysis(action);
            }
        });

        const documentSearch = document.getElementById('documentSearch');
        const categoryFilter = document.getElementById('categoryFilter');

        if (documentSearch) {
            documentSearch.addEventListener('input', () => this.filterDocuments());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterDocuments());
        }
    }

    openModal() {
        const modal = document.getElementById('aiSummarizerModal');
        if (modal) {
            modal.style.display = 'flex';
            this.isModalOpen = true;
            this.loadDocuments();
            this.goToSelectionStep();
        }
    }

    closeModal() {
        const modal = document.getElementById('aiSummarizerModal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
        }
    }

    goToSelectionStep() {
        this.showStep('documentSelectionStep');
    }

    goToAnalysisStep() {
        if (!this.selectedDocument) return;
        this.showStep('aiAnalysisStep');
    }

    goToResultsStep() {
        this.showStep('resultsStep');
    }

    showStep(stepId) {
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        const activeStep = document.getElementById(stepId);
        if (activeStep) activeStep.classList.add('active');
    }

    async loadDocuments() {
        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            this.displayDocuments(documents);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    displayDocuments(documents) {
        const documentsList = document.getElementById('documentsList');
        if (!documentsList) return;

        if (documents.length === 0) {
            documentsList.innerHTML = '<div class="no-documents"><h4>No Documents Found</h4><p>Upload documents first.</p></div>';
            return;
        }

        const documentsHTML = documents.map(doc => `
            <div class="document-item" data-doc-id="${doc.id}">
                <div class="document-info">
                    <h4>${doc.title}</h4>
                    <p>${doc.description || 'No description available'}</p>
                    <span class="badge">${doc.category}</span>
                </div>
                <button class="btn btn-outline select-doc-btn" data-doc-id="${doc.id}">Select</button>
            </div>
        `).join('');

        documentsList.innerHTML = documentsHTML;
    }

    selectDocument(docId) {
        document.querySelectorAll('.document-item').forEach(item => item.classList.remove('selected'));
        const docElement = document.querySelector(`[data-doc-id="${docId}"]`);
        if (docElement) docElement.classList.add('selected');

        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        this.selectedDocument = documents.find(doc => doc.id === docId);

        const selectBtn = document.getElementById('selectDocumentBtn');
        if (selectBtn) selectBtn.disabled = false;
    }

    filterDocuments() {
        const searchTerm = document.getElementById('documentSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';

        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const filteredDocuments = documents.filter(doc => {
            const matchesSearch = !searchTerm || doc.title.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || doc.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        this.displayDocuments(filteredDocuments);
    }

    async performAnalysis(action) {
        if (!this.selectedDocument) return;

        this.goToResultsStep();
        this.clearResults();

        try {
            switch (action) {
                case 'summarize':
                    await this.performSummaryAnalysis();
                    break;
                case 'translate':
                    await this.performTranslation();
                    break;
                case 'analyze':
                    await this.performCriticalAnalysis();
                    break;
            }
        } catch (error) {
            console.error('Analysis error:', error);
        }
    }

    clearResults() {
        document.querySelectorAll('.results-content').forEach(content => {
            content.style.display = 'none';
        });
    }

    async performSummaryAnalysis() {
        const summary = await this.getDocumentSummary(this.selectedDocument);

        const originalContent = document.getElementById('originalContent');
        const summaryContent = document.getElementById('summaryContent');
        const summaryResults = document.getElementById('summaryResults');

        if (originalContent) originalContent.innerHTML = this.formatDocumentContent(this.selectedDocument);
        if (summaryContent) summaryContent.innerHTML = this.formatSummary(summary);
        if (summaryResults) summaryResults.style.display = 'block';
    }

    async performTranslation() {
        const translation = await this.getDocumentTranslation(this.selectedDocument);

        const sourceContent = document.getElementById('sourceContent');
        const translatedContent = document.getElementById('translatedContent');
        const translationResults = document.getElementById('translationResults');

        if (sourceContent) sourceContent.innerHTML = `<h4>Original</h4>${this.formatDocumentContent(this.selectedDocument)}`;
        if (translatedContent) translatedContent.innerHTML = `<h4>Translated</h4>${this.formatTranslation(translation)}`;
        if (translationResults) translationResults.style.display = 'block';
    }

    async performCriticalAnalysis() {
        const insights = await this.getCriticalInsights(this.selectedDocument);
        this.displayCriticalInsights(insights);

        const analysisResults = document.getElementById('analysisResults');
        if (analysisResults) analysisResults.style.display = 'block';
    }

    async getDocumentSummary(document) {
        try {
            const prompt = `Summarize this document: ${document.title}. Description: ${document.description}`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Summary error:', error);
            return "Summary generation failed. Please try again.";
        }
    }

    async getDocumentTranslation(document) {
        try {
            const targetLang = this.currentLanguage === 'english' ? 'Malayalam' : 'English';
            const prompt = `Translate this to ${targetLang}: ${document.title}. ${document.description}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Translation error:', error);
            return "Translation failed. Please try again.";
        }
    }

    async getCriticalInsights(document) {
        try {
            const prompt = `Analyze for critical insights: ${document.title}. Extract deadlines, safety issues, and regulatory risks. Return as JSON with deadlines, safety, regulatory arrays.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                deadlines: ['No specific deadlines identified'],
                safety: ['No specific safety issues identified'],
                regulatory: ['No specific regulatory risks identified']
            };
        } catch (error) {
            console.error('Critical analysis error:', error);
            return {
                deadlines: ['Analysis failed'],
                safety: ['Analysis failed'],
                regulatory: ['Analysis failed']
            };
        }
    }

    formatDocumentContent(document) {
        return `
            <div class="document-header">
                <h3>${document.title}</h3>
                <p>${document.description || 'No description available'}</p>
                <span class="badge">${document.category}</span>
            </div>
        `;
    }

    formatSummary(summary) {
        return `<div class="summary-text">${summary.replace(/\n/g, '<br>')}</div>`;
    }

    formatTranslation(translation) {
        return `<div class="translation-text">${translation.replace(/\n/g, '<br>')}</div>`;
    }

    displayCriticalInsights(insights) {
        const deadlinesList = document.getElementById('deadlinesList');
        const safetyList = document.getElementById('safetyList');
        const regulatoryList = document.getElementById('regulatoryList');

        if (deadlinesList) {
            deadlinesList.innerHTML = insights.deadlines?.map(item =>
                `<div class="insight-item">${item}</div>`
            ).join('') || '<div class="no-insights">No deadlines found</div>';
        }

        if (safetyList) {
            safetyList.innerHTML = insights.safety?.map(item =>
                `<div class="insight-item">${item}</div>`
            ).join('') || '<div class="no-insights">No safety issues found</div>';
        }

        if (regulatoryList) {
            regulatoryList.innerHTML = insights.regulatory?.map(item =>
                `<div class="insight-item">${item}</div>`
            ).join('') || '<div class="no-insights">No regulatory risks found</div>';
        }
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #aiSummarizerModal {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center; z-index: 10000;
            }
            .modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); }
            .modal-container { position: relative; width: 90%; max-width: 1200px; height: 80%; background: white; border-radius: 15px; overflow: hidden; }
            .modal-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
            .close-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
            .modal-content { padding: 20px; height: calc(100% - 80px); overflow-y: auto; }
            .step { display: none; }
            .step.active { display: block; }
            .documents-list { max-height: 400px; overflow-y: auto; margin: 20px 0; }
            .document-item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
            .document-item.selected { border-color: #007bff; background: #f8f9fa; }
            .analysis-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
            .option-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; }
            .option-card:hover { border-color: #007bff; }
            .results-content { display: none; }
            .split-screen-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 400px; }
            .original-document, .summary-panel { border: 1px solid #ddd; padding: 15px; border-radius: 8px; overflow-y: auto; }
            .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
            .insight-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .insight-card.deadlines { border-left: 4px solid #dc3545; }
            .insight-card.safety { border-left: 4px solid #fd7e14; }
            .insight-card.regulatory { border-left: 4px solid #6f42c1; }
            .btn { padding: 10px 20px; border: 1px solid #007bff; background: #007bff; color: white; border-radius: 5px; cursor: pointer; }
            .btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .btn-outline { background: white; color: #007bff; }
            .btn-secondary { background: #6c757d; border-color: #6c757d; }
            .badge { background: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiSummarizer = new AISummarizer();
});
