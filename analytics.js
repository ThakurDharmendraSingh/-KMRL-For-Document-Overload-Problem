// KMRL Document Management System - Analytics JavaScript
// KMRL Analytics JavaScript
class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.createCharts();
        this.animateKPIs();
    }

    createCharts() {
        this.createUploadsChart();
        this.createCategoriesChart();
        this.createUsageChart();
        this.createStatusChart();
    }

    createUploadsChart() {
        const ctx = document.getElementById('uploadsChart');
        if (!ctx) return;

        this.charts.uploads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                datasets: [{
                    label: 'Documents Uploaded',
                    data: [65, 78, 45, 89, 92, 67, 78, 95],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }

    createCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        this.charts.categories = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Financial', 'HR', 'Technical', 'Legal', 'Marketing', 'Operations'],
                datasets: [{
                    data: [30, 25, 20, 15, 10, 8],
                    backgroundColor: [
                        '#2563eb',
                        '#059669',
                        '#d97706',
                        '#dc2626',
                        '#7c3aed',
                        '#0891b2'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    createUsageChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;

        this.charts.usage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Views', 'Downloads', 'Shares', 'Comments', 'Approvals'],
                datasets: [{
                    label: 'Activity Count',
                    data: [850, 650, 420, 280, 180],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(220, 38, 38, 0.8)',
                        'rgba(124, 58, 237, 0.8)'
                    ],
                    borderColor: [
                        '#2563eb',
                        '#059669',
                        '#d97706',
                        '#dc2626',
                        '#7c3aed'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }

    createStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        this.charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Approved', 'Pending Review', 'Rejected', 'Draft'],
                datasets: [{
                    data: [68, 22, 6, 4],
                    backgroundColor: [
                        '#059669',
                        '#d97706',
                        '#dc2626',
                        '#64748b'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    animateKPIs() {
        // Animate KPI values on load
        const kpiElements = [
            { id: 'totalDocuments', target: 1247 },
            { id: 'totalUploads', target: 342 },
            { id: 'totalDownloads', target: 2156 },
            { id: 'activeUsers', target: 89 }
        ];

        kpiElements.forEach(({ id, target }) => {
            this.animateCounter(id, target);
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

            // Format number with commas
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Method to refresh all charts
    refreshCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }

    // Method to export chart as image
    exportChart(chartId) {
        const chart = this.charts[chartId];
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${chartId}-chart.png`;
            link.href = url;
            link.click();
        }
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();

    // Add event listeners for export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const exportType = btn.textContent.trim().toLowerCase();

            switch (true) {
                case exportType.includes('pdf'):
                    alert('PDF export functionality would be implemented here');
                    break;
                case exportType.includes('excel'):
                    alert('Excel export functionality would be implemented here');
                    break;
                case exportType.includes('csv'):
                    alert('CSV export functionality would be implemented here');
                    break;
                case exportType.includes('image'):
                    alert('Chart image export functionality would be implemented here');
                    break;
            }
        });
    });

    // Add refresh button functionality
    const refreshBtn = document.querySelector('.btn-primary');
    if (refreshBtn && refreshBtn.textContent.includes('Refresh')) {
        refreshBtn.addEventListener('click', () => {
            window.analyticsManager.refreshCharts();
            window.analyticsManager.animateKPIs();
        });
    }
});
