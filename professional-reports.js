
// Sistema de Relatórios Profissionais
class ProfessionalReportGenerator {
    constructor() {
        this.reportTemplates = this.initializeTemplates();
        this.charts = [];
    }

    initializeTemplates() {
        return {
            executive: {
                name: 'Relatório Executivo',
                sections: ['summary', 'riskAnalysis', 'recommendations', 'costs']
            },
            technical: {
                name: 'Relatório Técnico Detalhado',
                sections: ['analysis', 'diagnostics', 'spectral', 'statistical', 'trends']
            },
            maintenance: {
                name: 'Plano de Manutenção',
                sections: ['schedule', 'procedures', 'parts', 'timeline']
            },
            iso: {
                name: 'Relatório ISO 10816',
                sections: ['compliance', 'measurements', 'classification', 'certification']
            }
        };
    }

    async generateReport(type, data, format = 'pdf') {
        const template = this.reportTemplates[type];
        if (!template) throw new Error('Tipo de relatório não encontrado');

        const reportData = await this.prepareReportData(data, template);
        
        switch (format) {
            case 'pdf':
                return this.generatePDF(reportData, template);
            case 'html':
                return this.generateHTML(reportData, template);
            case 'excel':
                return this.generateExcel(reportData, template);
            default:
                throw new Error('Formato não suportado');
        }
    }

    async prepareReportData(data, template) {
        const reportData = {
            header: this.generateHeader(),
            equipment: data.equipment || 'Equipamento Não Especificado',
            timestamp: new Date(),
            analyst: 'Sistema Automático',
            sections: {}
        };

        for (const section of template.sections) {
            reportData.sections[section] = await this.generateSection(section, data);
        }

        return reportData;
    }

    generateHeader() {
        return {
            company: 'Análise Vibracional Profissional',
            title: 'Relatório de Condição de Máquina',
            version: '2.0',
            date: new Date().toLocaleDateString('pt-BR'),
            logo: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="50" fill="#1e3a8a"/>
                    <text x="50" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="12">VIBRA</text>
                </svg>
            `)
        };
    }

    async generateSection(sectionType, data) {
        switch (sectionType) {
            case 'summary':
                return this.generateSummarySection(data);
            case 'riskAnalysis':
                return this.generateRiskAnalysisSection(data);
            case 'recommendations':
                return this.generateRecommendationsSection(data);
            case 'analysis':
                return this.generateAnalysisSection(data);
            case 'spectral':
                return this.generateSpectralSection(data);
            case 'statistical':
                return this.generateStatisticalSection(data);
            case 'compliance':
                return this.generateComplianceSection(data);
            default:
                return { title: sectionType, content: 'Seção em desenvolvimento' };
        }
    }

    generateSummarySection(data) {
        const severity = data.diagnostics?.severityLevel || 'Desconhecido';
        const condition = this.getSeverityDescription(severity);
        
        return {
            title: 'Resumo Executivo',
            content: {
                overallCondition: severity,
                conditionDescription: condition,
                criticalIssues: this.identifyCriticalIssues(data),
                mainConcerns: this.getMainConcerns(data),
                immediateActions: this.getImmediateActions(data),
                estimatedCosts: this.estimateMaintenanceCosts(data)
            }
        };
    }

    generateRiskAnalysisSection(data) {
        const riskMatrix = this.calculateRiskMatrix(data);
        
        return {
            title: 'Análise de Riscos',
            content: {
                riskMatrix: riskMatrix,
                failureProbability: this.calculateFailureProbability(data),
                consequenceAnalysis: this.analyzeConsequences(data),
                mtbf: this.estimateMTBF(data),
                riskMitigation: this.suggestRiskMitigation(data)
            }
        };
    }

    generateRecommendationsSection(data) {
        const recommendations = data.aiAnalysis?.recommendations || [];
        
        return {
            title: 'Recomendações',
            content: {
                immediate: recommendations.filter(r => r.priority === 'Critical'),
                shortTerm: recommendations.filter(r => r.priority === 'High'),
                longTerm: recommendations.filter(r => r.priority === 'Medium'),
                preventive: this.generatePreventiveRecommendations(data),
                costBenefit: this.calculateCostBenefit(recommendations)
            }
        };
    }

    generateHTML(reportData, template) {
        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${reportData.header.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 30px; page-break-inside: avoid; }
                .section h2 { color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px; }
                .risk-critical { color: #dc2626; font-weight: bold; }
                .risk-high { color: #ea580c; font-weight: bold; }
                .risk-medium { color: #d97706; }
                .risk-low { color: #16a34a; }
                .chart-placeholder { background: #f3f4f6; height: 300px; margin: 20px 0; text-align: center; line-height: 300px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                th { background-color: #f9fafb; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
        `;

        // Header
        html += `
        <div class="header">
            <h1>${reportData.header.title}</h1>
            <p><strong>Equipamento:</strong> ${reportData.equipment}</p>
            <p><strong>Data:</strong> ${reportData.timestamp.toLocaleString('pt-BR')}</p>
            <p><strong>Analista:</strong> ${reportData.analyst}</p>
        </div>
        `;

        // Sections
        Object.entries(reportData.sections).forEach(([key, section]) => {
            html += `<div class="section">`;
            html += `<h2>${section.title}</h2>`;
            html += this.renderSectionContent(section.content);
            html += `</div>`;
        });

        html += `
        <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 5px;">
                Imprimir Relatório
            </button>
        </div>
        </body>
        </html>
        `;

        return html;
    }

    renderSectionContent(content) {
        if (typeof content === 'string') return `<p>${content}</p>`;
        
        let html = '';
        Object.entries(content).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                html += `<h4>${this.formatKey(key)}</h4><ul>`;
                value.forEach(item => {
                    html += `<li>${typeof item === 'object' ? this.formatObject(item) : item}</li>`;
                });
                html += `</ul>`;
            } else if (typeof value === 'object') {
                html += `<h4>${this.formatKey(key)}</h4>`;
                html += this.renderSectionContent(value);
            } else {
                html += `<p><strong>${this.formatKey(key)}:</strong> ${value}</p>`;
            }
        });
        return html;
    }

    formatKey(key) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }

    formatObject(obj) {
        return Object.entries(obj).map(([k, v]) => `${this.formatKey(k)}: ${v}`).join(', ');
    }

    downloadReport(content, filename, type = 'html') {
        const blob = new Blob([content], { 
            type: type === 'html' ? 'text/html' : 'application/octet-stream' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Métodos auxiliares
    getSeverityDescription(severity) {
        const descriptions = {
            'Normal': 'Equipamento operando dentro dos parâmetros normais',
            'Atenção': 'Monitoramento recomendado, condição aceitável',
            'Alerta': 'Manutenção deve ser programada em breve',
            'Crítico': 'Intervenção imediata requerida'
        };
        return descriptions[severity] || 'Status desconhecido';
    }

    identifyCriticalIssues(data) {
        const issues = [];
        const faults = data.diagnostics?.faultDetection || {};
        
        if (faults.unbalance) issues.push('Desbalanceamento detectado');
        if (faults.misalignment) issues.push('Desalinhamento detectado');
        if (faults.bearingDefects?.length > 0) issues.push('Defeitos em rolamentos');
        if (faults.looseness) issues.push('Folgas mecânicas');
        
        return issues;
    }

    calculateRiskMatrix(data) {
        return {
            probability: 'Medium',
            consequence: 'High',
            riskLevel: 'High',
            riskScore: 12
        };
    }

    estimateMaintenanceCosts(data) {
        return {
            immediate: 'R$ 5.000 - R$ 15.000',
            planned: 'R$ 2.000 - R$ 8.000',
            preventive: 'R$ 500 - R$ 2.000'
        };
    }
}

// Instância global
const reportGenerator = new ProfessionalReportGenerator();
window.reportGenerator = reportGenerator;
