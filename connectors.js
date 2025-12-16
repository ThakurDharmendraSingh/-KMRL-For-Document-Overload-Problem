// Document Connector Simulation for KMRL Document Management System

export class DocumentConnectors {
    constructor() {
        this.connectors = {
            email: new EmailConnector(),
            sharepoint: new SharePointConnector(),
            maximo: new MaximoConnector(),
            whatsapp: new WhatsAppConnector()
        };
    }

    /**
     * Simulate document ingestion from various sources
     * @param {string} connectorType - Type of connector (email, sharepoint, maximo, whatsapp)
     * @returns {Array} Array of simulated documents
     */
    async ingestDocuments(connectorType) {
        if (!this.connectors[connectorType]) {
            throw new Error(`Connector type '${connectorType}' not supported`);
        }

        return await this.connectors[connectorType].fetchDocuments();
    }

    /**
     * Get all available connector types
     * @returns {Array} List of connector types
     */
    getAvailableConnectors() {
        return Object.keys(this.connectors);
    }

    /**
     * Get connector status
     * @returns {Object} Status of all connectors
     */
    getConnectorStatus() {
        const status = {};
        for (const [type, connector] of Object.entries(this.connectors)) {
            status[type] = connector.getStatus();
        }
        return status;
    }
}

class EmailConnector {
    constructor() {
        this.name = 'Email Integration';
        this.version = '2.1';
        this.lastSync = new Date().toISOString();
        this.status = 'active';
    }

    async fetchDocuments() {
        // Simulate email document fetching
        await this.delay(1000);

        return [
            {
                id: 'email_001',
                title: 'Track Inspection Report - Section A12',
                source: 'email',
                sender: 'john.doe@contractor.com',
                recipient: 'engineering@kmrl.co.in',
                date: '2024-01-18',
                department: 'Engineering',
                tags: ['track inspection', 'maintenance', 'safety'],
                attachments: ['Track_Inspection_A12.pdf'],
                priority: 'high',
                filePath: 'assets/Email_Track_Inspection_Report.txt'
            }
        ];
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            lastSync: this.lastSync,
            status: this.status,
            documentsCount: 23,
            lastDocument: '2024-01-18 14:30:00'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class SharePointConnector {
    constructor() {
        this.name = 'SharePoint Integration';
        this.version = '3.2';
        this.lastSync = new Date().toISOString();
        this.status = 'active';
    }

    async fetchDocuments() {
        // Simulate SharePoint document fetching
        await this.delay(1500);

        return [
            {
                id: 'sp_001',
                title: 'Metro Extension Phase 2 Design Specifications',
                source: 'sharepoint',
                site: 'KMRL Engineering Portal',
                library: 'Project Documents',
                author: 'Design Team Lead',
                date: '2024-01-15',
                department: 'Engineering',
                tags: ['design', 'specifications', 'metro extension', 'phase 2'],
                version: '2.3',
                classification: 'Restricted',
                filePath: 'assets/SharePoint_Metro_Extension_Design.txt'
            }
        ];
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            lastSync: this.lastSync,
            status: this.status,
            sitesConnected: 3,
            documentsCount: 156,
            lastDocument: '2024-01-18 09:15:00'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class MaximoConnector {
    constructor() {
        this.name = 'Maximo Asset Management';
        this.version = '2.0';
        this.lastSync = new Date().toISOString();
        this.status = 'active';
    }

    async fetchDocuments() {
        // Simulate Maximo work order fetching
        await this.delay(2000);

        return [
            {
                id: 'maximo_001',
                title: 'Escalator Maintenance Work Order - WO-ENG-2024-001523',
                source: 'maximo',
                workOrderNumber: 'WO-ENG-2024-001523',
                asset: 'ESC-ALV-01',
                location: 'Aluva Metro Station',
                date: '2024-01-15',
                department: 'Operations',
                tags: ['maintenance', 'escalator', 'preventive', 'aluva'],
                priority: 'High',
                status: 'Completed',
                filePath: 'assets/Maximo_Escalator_Maintenance_WO.txt'
            }
        ];
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            lastSync: this.lastSync,
            status: this.status,
            workOrdersCount: 89,
            assetsMonitored: 234,
            lastWorkOrder: '2024-01-18 16:45:00'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class WhatsAppConnector {
    constructor() {
        this.name = 'WhatsApp Business API';
        this.version = '1.5';
        this.lastSync = new Date().toISOString();
        this.status = 'active';
    }

    async fetchDocuments() {
        // Simulate WhatsApp chat export fetching
        await this.delay(800);

        return [
            {
                id: 'whatsapp_001',
                title: 'Emergency Response - Platform Obstruction Incident',
                source: 'whatsapp',
                group: 'KMRL Operations Emergency Response',
                participants: ['Control Room', 'Station Manager Ernakulam', 'Security Team'],
                date: '2024-01-18',
                department: 'Operations',
                tags: ['emergency', 'incident', 'platform', 'ernakulam', 'security'],
                incidentType: 'Platform Obstruction',
                duration: '8 minutes',
                filePath: 'assets/WhatsApp_Incident_Report.txt'
            }
        ];
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            lastSync: this.lastSync,
            status: this.status,
            groupsMonitored: 5,
            messagesProcessed: 342,
            lastMessage: '2024-01-18 11:30:00'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}