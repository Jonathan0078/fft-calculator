
// Dashboard Executivo para Análise Vibracional
class ExecutiveDashboard {
    constructor() {
        this.widgets = new Map();
        this.updateInterval = null;
        this.isInitialized = false;
    }

    initialize(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        container.innerHTML = this.createDashboardHTML();
        this.initializeWidgets();
        this.startAutoUpdate();
        this.isInitialized = true;
        return true;
    }

    createDashboardHTML() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>📊 Dashboard Executivo - Monitoramento Vibracional</h2>
                    <div class="dashboard-controls">
                        <button id="refresh-dashboard">🔄 Atualizar</button>
                        <button id="export-dashboard">📊 Exportar</button>
                        <select id="dashboard-timeframe">
                            <option value="realtime">Tempo Real</option>
                            <option value="hour">Última Hora</option>
                            <option value="day">Último Dia</option>
                            <option value="week">Última Semana</option>
                        </select>
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card" id="overall-health">
                        <h3>Saúde Geral</h3>
                        <div class="kpi-value" id="health-value">95%</div>
                        <div class="kpi-trend" id="health-trend">↗️ +2%</div>
                    </div>
                    <div class="kpi-card" id="critical-alerts">
                        <h3>Alertas Críticos</h3>
                        <div class="kpi-value" id="alerts-value">0</div>
                        <div class="kpi-trend" id="alerts-trend">✅ Normal</div>
                    </div>
                    <div class="kpi-card" id="equipment-monitored">
                        <h3>Equipamentos</h3>
                        <div class="kpi-value" id="equipment-value">12</div>
                        <div class="kpi-trend" id="equipment-trend">📈 Online</div>
                    </div>
                    <div class="kpi-card" id="maintenance-due">
                        <h3>Manutenção</h3>
                        <div class="kpi-value" id="maintenance-value">3</div>
                        <div class="kpi-trend" id="maintenance-trend">⏰ Programada</div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="widget severity-distribution">
                        <h3>Distribuição de Severidade</h3>
                        <canvas id="severity-chart" width="300" height="200"></canvas>
                    </div>
                    
                    <div class="widget trend-analysis">
                        <h3>Tendências de Vibração</h3>
                        <canvas id="trend-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="widget equipment-status">
                        <h3>Status dos Equipamentos</h3>
                        <div id="equipment-list"></div>
                    </div>
                    
                    <div class="widget maintenance-schedule">
                        <h3>Cronograma de Manutenção</h3>
                        <div id="maintenance-schedule"></div>
                    </div>
                    
                    <div class="widget cost-analysis">
                        <h3>Análise de Custos</h3>
                        <canvas id="cost-chart" width="300" height="200"></canvas>
                    </div>
                    
                    <div class="widget alerts-feed">
                        <h3>Feed de Alertas</h3>
                        <div id="alerts-feed"></div>
                    </div>
                </div>

                <div class="dashboard-footer">
                    <div class="performance-metrics">
                        <span>Última atualização: <span id="last-update">--:--</span></span>
                        <span>Tempo de resposta: <span id="response-time">0ms</span></span>
                        <span>Status do sistema: <span id="system-status">🟢 Online</span></span>
                    </div>
                </div>
            </div>
        `;
    }

    initializeWidgets() {
        this.initializeSeverityChart();
        this.initializeTrendChart();
        this.initializeCostChart();
        this.updateEquipmentStatus();
        this.updateMaintenanceSchedule();
        this.updateAlertsF
    }

    initializeSeverityChart() {
        const canvas = document.getElementById('severity-chart');
        const ctx = canvas.getContext('2d');
        
        const data = {
            labels: ['Normal', 'Atenção', 'Alerta', 'Crítico'],
            values: [70, 20, 8, 2],
            colors: ['#10b981', '#f59e0b', '#ef4444', '#dc2626']
        };

        this.drawPieChart(ctx, data, canvas.width, canvas.height);
        this.widgets.set('severity', { canvas, ctx, data });
    }

    initializeTrendChart() {
        const canvas = document.getElementById('trend-chart');
        const ctx = canvas.getContext('2d');
        
        // Simular dados de tendência
        const trendData = this.generateTrendData();
        this.drawLineChart(ctx, trendData, canvas.width, canvas.height);
        this.widgets.set('trend', { canvas, ctx, data: trendData });
    }

    initializeCostChart() {
        const canvas = document.getElementById('cost-chart');
        const ctx = canvas.getContext('2d');
        
        const costData = {
            labels: ['Preventiva', 'Corretiva', 'Preditiva', 'Emergencial'],
            values: [30000, 80000, 15000, 120000],
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
        };

        this.drawBarChart(ctx, costData, canvas.width, canvas.height);
        this.widgets.set('cost', { canvas, ctx, data: costData });
    }

    drawPieChart(ctx, data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        ctx.clearRect(0, 0, width, height);
        
        const total = data.values.reduce((sum, val) => sum + val, 0);
        let currentAngle = -Math.PI / 2;
        
        data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // Desenhar fatia
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = data.colors[index];
            ctx.fill();
            
            // Desenhar label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${value}%`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
        
        // Legenda
        data.labels.forEach((label, index) => {
            const legendY = 10 + index * 20;
            ctx.fillStyle = data.colors[index];
            ctx.fillRect(10, legendY, 15, 15);
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, 30, legendY + 12);
        });
    }

    drawLineChart(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Eixos
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Dados
        const maxValue = Math.max(...data.values);
        const stepX = chartWidth / (data.values.length - 1);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.values.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Pontos
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.stroke();
    }

    drawBarChart(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.values.length * 0.8;
        const barSpacing = chartWidth / data.values.length * 0.2;
        
        const maxValue = Math.max(...data.values);
        
        data.values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = height - padding - barHeight;
            
            ctx.fillStyle = data.colors[index];
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Valor no topo
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`R$${(value/1000).toFixed(0)}k`, x + barWidth/2, y - 5);
        });
    }

    generateTrendData() {
        const now = new Date();
        const data = {
            labels: [],
            values: []
        };
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.labels.push(time.getHours() + ':00');
            data.values.push(Math.random() * 5 + 2); // Valores entre 2 e 7
        }
        
        return data;
    }

    updateKPIs() {
        const startTime = performance.now();
        
        // Simular dados atualizados
        const health = 85 + Math.random() * 15;
        const alerts = Math.floor(Math.random() * 3);
        const equipment = 12;
        const maintenance = Math.floor(Math.random() * 5);
        
        document.getElementById('health-value').textContent = `${Math.round(health)}%`;
        document.getElementById('alerts-value').textContent = alerts;
        document.getElementById('equipment-value').textContent = equipment;
        document.getElementById('maintenance-value').textContent = maintenance;
        
        // Atualizar trends
        const healthTrend = Math.random() > 0.5 ? '↗️' : '↘️';
        document.getElementById('health-trend').textContent = `${healthTrend} ${(Math.random() * 5).toFixed(1)}%`;
        
        // Atualizar timestamp
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString('pt-BR');
        
        const endTime = performance.now();
        document.getElementById('response-time').textContent = `${Math.round(endTime - startTime)}ms`;
    }

    updateEquipmentStatus() {
        const equipmentList = document.getElementById('equipment-list');
        const equipment = [
            { name: 'Motor Principal', status: 'normal', vibration: 2.3 },
            { name: 'Bomba 01', status: 'attention', vibration: 4.1 },
            { name: 'Ventilador', status: 'normal', vibration: 1.8 },
            { name: 'Compressor', status: 'alert', vibration: 6.2 },
            { name: 'Gerador', status: 'normal', vibration: 2.1 }
        ];
        
        let html = '<div class="equipment-grid">';
        equipment.forEach(eq => {
            const statusClass = `status-${eq.status}`;
            const statusIcon = eq.status === 'normal' ? '🟢' : eq.status === 'attention' ? '🟡' : '🔴';
            
            html += `
                <div class="equipment-item ${statusClass}">
                    <div class="equipment-header">
                        <span class="equipment-name">${eq.name}</span>
                        <span class="equipment-status">${statusIcon}</span>
                    </div>
                    <div class="equipment-metrics">
                        <small>Vibração: ${eq.vibration} mm/s</small>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        equipmentList.innerHTML = html;
    }

    updateMaintenanceSchedule() {
        const scheduleDiv = document.getElementById('maintenance-schedule');
        const today = new Date();
        
        const maintenance = [
            { equipment: 'Motor Principal', type: 'Preventiva', date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), priority: 'medium' },
            { equipment: 'Bomba 01', type: 'Corretiva', date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), priority: 'high' },
            { equipment: 'Compressor', type: 'Emergencial', date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), priority: 'critical' }
        ];
        
        let html = '<div class="maintenance-list">';
        maintenance.forEach(item => {
            const daysUntil = Math.ceil((item.date - today) / (24 * 60 * 60 * 1000));
            const priorityClass = `priority-${item.priority}`;
            
            html += `
                <div class="maintenance-item ${priorityClass}">
                    <div class="maintenance-info">
                        <strong>${item.equipment}</strong><br>
                        <small>${item.type} - ${daysUntil} dias</small>
                    </div>
                    <div class="maintenance-priority">${this.getPriorityIcon(item.priority)}</div>
                </div>
            `;
        });
        html += '</div>';
        
        scheduleDiv.innerHTML = html;
    }

    updateAlertsFeed() {
        const alertsDiv = document.getElementById('alerts-feed');
        const alerts = [
            { time: '14:30', message: 'Vibração elevada detectada no Motor Principal', severity: 'warning' },
            { time: '13:45', message: 'Análise de órbita concluída - Bomba 01', severity: 'info' },
            { time: '12:15', message: 'Baseline atualizado para todos os equipamentos', severity: 'success' },
            { time: '11:30', message: 'Falha crítica detectada - Compressor requer atenção', severity: 'error' }
        ];
        
        let html = '<div class="alerts-list">';
        alerts.forEach(alert => {
            const severityIcon = this.getSeverityIcon(alert.severity);
            
            html += `
                <div class="alert-item severity-${alert.severity}">
                    <span class="alert-time">${alert.time}</span>
                    <span class="alert-icon">${severityIcon}</span>
                    <span class="alert-message">${alert.message}</span>
                </div>
            `;
        });
        html += '</div>';
        
        alertsDiv.innerHTML = html;
    }

    getPriorityIcon(priority) {
        const icons = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            critical: '🔴'
        };
        return icons[priority] || '⚪';
    }

    getSeverityIcon(severity) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[severity] || 'ℹ️';
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.updateKPIs();
            this.updateAlertsFeed();
        }, 30000); // Atualizar a cada 30 segundos
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    exportDashboard() {
        // Capturar todos os canvas e dados
        const dashboardData = {
            timestamp: new Date(),
            kpis: {
                health: document.getElementById('health-value').textContent,
                alerts: document.getElementById('alerts-value').textContent,
                equipment: document.getElementById('equipment-value').textContent,
                maintenance: document.getElementById('maintenance-value').textContent
            },
            charts: this.captureCharts()
        };
        
        // Gerar relatório
        this.generateDashboardReport(dashboardData);
    }

    captureCharts() {
        const charts = {};
        this.widgets.forEach((widget, key) => {
            if (widget.canvas) {
                charts[key] = widget.canvas.toDataURL();
            }
        });
        return charts;
    }

    generateDashboardReport(data) {
        const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard Report - ${data.timestamp.toLocaleDateString('pt-BR')}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .kpi-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                .kpi-card { text-align: center; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
                .charts { margin: 20px 0; }
                .chart-container { margin: 20px 0; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Dashboard Executivo - Relatório</h1>
                <p>Gerado em: ${data.timestamp.toLocaleString('pt-BR')}</p>
            </div>
            
            <div class="kpi-summary">
                <div class="kpi-card">
                    <h3>Saúde Geral</h3>
                    <h2>${data.kpis.health}</h2>
                </div>
                <div class="kpi-card">
                    <h3>Alertas Críticos</h3>
                    <h2>${data.kpis.alerts}</h2>
                </div>
                <div class="kpi-card">
                    <h3>Equipamentos</h3>
                    <h2>${data.kpis.equipment}</h2>
                </div>
                <div class="kpi-card">
                    <h3>Manutenção</h3>
                    <h2>${data.kpis.maintenance}</h2>
                </div>
            </div>
            
            <div class="charts">
                ${Object.entries(data.charts).map(([key, chartData]) => `
                    <div class="chart-container">
                        <h3>Gráfico - ${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <img src="${chartData}" alt="${key} chart" style="max-width: 100%;">
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
        `;
        
        const blob = new Blob([reportHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_report_${new Date().toISOString().slice(0,10)}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Instância global
const executiveDashboard = new ExecutiveDashboard();
window.executiveDashboard = executiveDashboard;
