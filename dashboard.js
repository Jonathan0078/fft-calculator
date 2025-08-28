// Variáveis globais
let charts = {};
let dashboardData = null;
let currentExcelData = null;
const accentColor = '#00f6ff';
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Mapeamento de tipos de manutenção
const TIPO_MAPPING = {
    7: 'Corretiva',
    10: 'Preventiva', 
    22: 'Preditiva',
    12: 'Melhoria',
    21: 'Inspeção',
    11: 'Modificação',
    9: 'Calibração',
    5: 'Limpeza',
    8: 'Outros'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function setupEventListeners() {
    document.getElementById('btn-refresh').addEventListener('click', loadDashboardData);
    document.getElementById('btn-dashboard').addEventListener('click', () => showView('dashboard'));
    document.getElementById('btn-upload').addEventListener('click', () => showView('upload'));
    document.getElementById('btn-analytics').addEventListener('click', () => showView('analytics'));
    document.getElementById('btn-predictive').addEventListener('click', () => showView('predictive'));
    document.getElementById('btn-edit').addEventListener('click', () => showView('edit'));
    document.getElementById('btn-settings').addEventListener('click', () => showView('settings'));
    document.getElementById('btn-export').addEventListener('click', exportReport);
    document.getElementById('btn-process-file').addEventListener('click', processExcelFile);
    document.getElementById('excel-file-input').addEventListener('change', handleFileSelect);
    document.getElementById('btn-save-edit').addEventListener('click', saveEditedData);
    document.getElementById('btn-cancel-edit').addEventListener('click', () => showView('dashboard'));
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-cancel-settings').addEventListener('click', () => showView('dashboard'));
}

function showView(viewName) {
    // Esconder todas as views
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('upload-view').classList.add('hidden');
    document.getElementById('analytics-view').classList.add('hidden');
    document.getElementById('predictive-view').classList.add('hidden');
    document.getElementById('edit-view').classList.add('hidden');
    document.getElementById('settings-view').classList.add('hidden');

    // Mostrar view selecionada
    document.getElementById(viewName + '-view').classList.remove('hidden');

    // Atualizar botões ativos
    document.querySelectorAll('aside button').forEach(btn => {
        btn.classList.remove('text-kpi-accent', 'bg-gray-700/50');
        btn.classList.add('text-gray-400');
    });

    const activeBtn = document.getElementById('btn-' + viewName);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-400');
        activeBtn.classList.add('text-kpi-accent', 'bg-gray-700/50');
    }

    // Carregar dados específicos da view
    if (viewName === 'analytics' && currentExcelData) {
        loadEquipmentAnalysis();
    } else if (viewName === 'predictive' && currentExcelData) {
        loadPredictiveAnalysis();
    } else if (viewName === 'edit') {
        loadEditForm();
    } else if (viewName === 'settings') {
        loadSettingsForm();
    }
}

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('date-time-display').textContent = dateTimeString;
}

function showLoading(show) {
    const indicator = document.getElementById('loading-indicator');
    if (show) {
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

async function initializeDashboard() {
    // Tentar carregar dados salvos do Firebase
    await loadFromFirebase();
    
    // Se não há dados, mostrar view de upload
    if (!currentExcelData) {
        showView('upload');
    } else {
        await loadDashboardData();
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const statusEl = document.getElementById('upload-status');
    const processBtn = document.getElementById('btn-process-file');
    
    if (file) {
        statusEl.innerHTML = `<span class="text-blue-400">Arquivo selecionado: ${file.name}</span>`;
        processBtn.disabled = false;
    } else {
        statusEl.innerHTML = 'Selecione um arquivo Excel para começar a análise.';
        processBtn.disabled = true;
    }
}

async function processExcelFile() {
    const fileInput = document.getElementById('excel-file-input');
    const file = fileInput.files[0];
    const statusEl = document.getElementById('upload-status');
    
    if (!file) {
        statusEl.innerHTML = '<span class="text-red-500">Por favor, selecione um arquivo.</span>';
        return;
    }

    statusEl.innerHTML = '<span class="text-yellow-400">Processando arquivo...</span>';
    showLoading(true);

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        if (!sheet) {
            throw new Error("Nenhuma planilha encontrada no arquivo.");
        }
        
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (jsonData.length === 0) {
            throw new Error("Arquivo Excel está vazio.");
        }

        // Salvar dados processados
        currentExcelData = jsonData;
        
        // Salvar no Firebase
        await saveToFirebase(jsonData, file.name);
        
        statusEl.innerHTML = `<span class="text-green-500">✓ Arquivo processado com sucesso! ${jsonData.length} registros carregados.</span>`;
        
        // Processar dados e atualizar dashboard
        await loadDashboardData();
        
        // Voltar para o dashboard
        setTimeout(() => {
            showView('dashboard');
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        statusEl.innerHTML = `<span class="text-red-500">✗ Erro: ${error.message}</span>`;
    } finally {
        showLoading(false);
    }
}

async function saveToFirebase(data, filename) {
    try {
        if (!window.firebase) {
            console.log('Firebase não configurado, salvando apenas localmente');
            localStorage.setItem('maintenanceData', JSON.stringify(data));
            localStorage.setItem('maintenanceFilename', filename);
            return;
        }

        const { db, doc, setDoc } = window.firebase;
        
        // Salvar dados principais
        await setDoc(doc(db, 'maintenance', 'currentData'), {
            data: data,
            filename: filename,
            uploadDate: new Date().toISOString(),
            recordCount: data.length
        });
        
        console.log('Dados salvos no Firebase com sucesso');
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        // Fallback para localStorage
        localStorage.setItem('maintenanceData', JSON.stringify(data));
        localStorage.setItem('maintenanceFilename', filename);
    }
}

async function loadFromFirebase() {
    try {
        if (!window.firebase) {
            console.log('Firebase não configurado, carregando do localStorage');
            const data = localStorage.getItem('maintenanceData');
            if (data) {
                currentExcelData = JSON.parse(data);
                return;
            }
            return;
        }

        const { db, doc, getDoc } = window.firebase;
        
        const docRef = doc(db, 'maintenance', 'currentData');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const savedData = docSnap.data();
            currentExcelData = savedData.data;
            console.log('Dados carregados do Firebase:', savedData.recordCount, 'registros');
        }
    } catch (error) {
        console.error('Erro ao carregar do Firebase:', error);
        // Fallback para localStorage
        const data = localStorage.getItem('maintenanceData');
        if (data) {
            currentExcelData = JSON.parse(data);
        }
    }
}

async function loadDashboardData() {
    if (!currentExcelData) {
        console.log('Nenhum dado Excel disponível');
        return;
    }

    showLoading(true);
    try {
        const kpis = calculateKPIs(currentExcelData);
        const monthlyData = calculateMonthlyData(currentExcelData);
        const mttrMtbf = calculateMTTRMTBF(currentExcelData);
        
        dashboardData = {
            kpis: kpis,
            monthly_costs: monthlyData.costs,
            monthly_correctives: monthlyData.correctives,
            monthly_status: monthlyData.statusByMonth,
            mttr: mttrMtbf.mttr,
            mtbf: mttrMtbf.mtbf
        };
        
        updateKPIs(dashboardData.kpis);
        createAllCharts(dashboardData);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar dados do dashboard');
    } finally {
        showLoading(false);
    }
}

function calculateKPIs(data) {
    if (!data || data.length === 0) {
        return {
            corretivas: 0, preventivas: 0, preventivasVenc: 0,
            preditivas: 0, melhorias: 0, equipamentos: 0,
            osTotal: 0, availability: 0, custoTotal: 0
        };
    }
    
    // Contagem por tipo de manutenção
    const tipoCounts = {};
    data.forEach(row => {
        const tipo = row['Tipo de Manutenção'];
        tipoCounts[tipo] = (tipoCounts[tipo] || 0) + 1;
    });
    
    const kpis = {
        corretivas: tipoCounts[7] || 0,
        preventivas: tipoCounts[10] || 0,
        preditivas: tipoCounts[22] || 0,
        melhorias: tipoCounts[12] || 0,
        equipamentos: new Set(data.map(row => row['Equipamento'])).size,
        osTotal: data.length,
        preventivasVenc: 0
    };
    
    // Calcular preventivas vencidas
    try {
        const hoje = new Date();
        const preventivas = data.filter(row => row['Tipo de Manutenção'] === 10);
        const vencidas = preventivas.filter(row => {
            const dataManutencao = new Date(row['Data Manutenção']);
            return dataManutencao < hoje;
        });
        kpis.preventivasVenc = vencidas.length;
    } catch (e) {
        console.log('Erro ao calcular preventivas vencidas:', e);
    }
    
    // Calcular custo total
    try {
        let custoTotal = 0;
        data.forEach(row => {
            const valorMaterial = parseFloat(String(row['Valor Material'] || '0').replace(',', '.').replace('"', '')) || 0;
            const valorMaoObra = parseFloat(row['Valor Mão de Obra'] || 0) || 0;
            custoTotal += valorMaterial + valorMaoObra;
        });
        kpis.custoTotal = custoTotal;
    } catch (e) {
        console.log('Erro ao calcular custo total:', e);
        kpis.custoTotal = 0;
    }
    
    // Calcular disponibilidade (simulada)
    kpis.availability = Math.max(85, Math.min(99, 95 - (kpis.corretivas * 0.5)));
    
    return kpis;
}

function calculateMonthlyData(data) {
    const costs = Array(12).fill(0);
    const correctives = Array(12).fill(0);
    const statusByMonth = {
        'Não Iniciada': Array(12).fill(0),
        'Requisitada': Array(12).fill(0),
        'Iniciada': Array(12).fill(0),
        'Liberada': Array(12).fill(0),
        'Suspensa': Array(12).fill(0)
    };
    
    if (!data || data.length === 0) {
        return { costs, correctives, statusByMonth };
    }
    
    try {
        data.forEach(row => {
            const dataManutencao = new Date(row['Data Manutenção']);
            if (!isNaN(dataManutencao.getTime())) {
                const month = dataManutencao.getMonth(); // 0-11
                
                // Custos
                const valorMaterial = parseFloat(String(row['Valor Material'] || '0').replace(',', '.').replace('"', '')) || 0;
                const valorMaoObra = parseFloat(row['Valor Mão de Obra'] || 0) || 0;
                costs[month] += valorMaterial + valorMaoObra;
                
                // Corretivas
                if (row['Tipo de Manutenção'] === 7) {
                    correctives[month]++;
                }
                
                // Status das ordens por mês
                const estado = row['Estado'] || 'Não Iniciada';
                if (statusByMonth[estado]) {
                    statusByMonth[estado][month]++;
                }
            }
        });
    } catch (e) {
        console.log('Erro ao calcular dados mensais:', e);
    }
    
    return { costs, correctives, statusByMonth };
}

function calculateMTTRMTBF(data) {
    // MTTR e MTBF simulados baseados nos dados
    const mttr = [8, 6, 4]; // Trimestral
    const mtbf = Array(12).fill(0).map((_, i) => {
        const monthData = data.filter(row => {
            const date = new Date(row['Data Manutenção']);
            return !isNaN(date.getTime()) && date.getMonth() === i;
        });
        return Math.max(100, 1000 - monthData.length * 10);
    });
    
    return { mttr, mtbf };
}

function updateKPIs(kpis) {
    document.getElementById('kpi-corretivas').textContent = kpis.corretivas || 0;
    document.getElementById('kpi-preventivas').textContent = kpis.preventivas || 0;
    document.getElementById('kpi-preventivas-venc').textContent = kpis.preventivasVenc || 0;
    document.getElementById('kpi-preditivas').textContent = kpis.preditivas || 0;
    document.getElementById('kpi-melhorias').textContent = kpis.melhorias || 0;
    document.getElementById('kpi-equipamentos').textContent = kpis.equipamentos || 0;
    document.getElementById('kpi-os-total').textContent = kpis.osTotal || 0;
    document.getElementById('kpi-availability').textContent = Math.round(kpis.availability || 0) + '%';
    document.getElementById('kpi-custo-total').textContent = 'R$ ' + (kpis.custoTotal || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
}

function createAllCharts(data) {
    createMTTRChart(data.mttr);
    createMTBFChart(data.mtbf);
    createMonthlyCostsChart(data.monthly_costs);
    createMonthlyCorrectivesChart(data.monthly_correctives);
    createMonthlyStatusChart(data.monthly_status);
}

function createMTTRChart(mttrData) {
    const ctx = document.getElementById('mttrChart').getContext('2d');
    if (charts.mttr) charts.mttr.destroy();
    
    charts.mttr = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3'],
            datasets: [{
                label: 'MTTR (horas)',
                data: mttrData,
                backgroundColor: accentColor,
                borderColor: accentColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: { 
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function createMTBFChart(mtbfData) {
    const ctx = document.getElementById('mtbfChart').getContext('2d');
    if (charts.mtbf) charts.mtbf.destroy();
    
    charts.mtbf = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'MTBF (horas)',
                data: mtbfData,
                borderColor: accentColor,
                backgroundColor: accentColor + '20',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: { 
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function createMonthlyCostsChart(costsData) {
    const ctx = document.getElementById('monthlyCostsChart').getContext('2d');
    if (charts.costs) charts.costs.destroy();
    
    charts.costs = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Custos (R$)',
                data: costsData,
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { 
                        color: 'white',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: { 
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function createMonthlyCorrectivesChart(correctivesData) {
    const ctx = document.getElementById('monthlyCorrectivesChart').getContext('2d');
    if (charts.correctives) charts.correctives.destroy();
    
    charts.correctives = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'O.S Corretivas',
                data: correctivesData,
                borderColor: '#ef4444',
                backgroundColor: '#ef444420',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: { 
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function loadEquipmentAnalysis() {
    if (!currentExcelData) return;
    
    try {
        // Análise por equipamento
        const equipmentStats = {};
        
        currentExcelData.forEach(row => {
            const equipment = row['Nome Equipamento'];
            if (!equipmentStats[equipment]) {
                equipmentStats[equipment] = {
                    name: equipment,
                    total_orders: 0,
                    corrective: 0,
                    preventive: 0,
                    cost: 0
                };
            }
            
            equipmentStats[equipment].total_orders++;
            
            if (row['Tipo de Manutenção'] === 7) {
                equipmentStats[equipment].corrective++;
            } else if (row['Tipo de Manutenção'] === 10) {
                equipmentStats[equipment].preventive++;
            }
            
            const valorMaterial = parseFloat(String(row['Valor Material'] || '0').replace(',', '.').replace('"', '')) || 0;
            const valorMaoObra = parseFloat(row['Valor Mão de Obra'] || 0) || 0;
            equipmentStats[equipment].cost += valorMaterial + valorMaoObra;
        });
        
        // Converter para array e ordenar por custo
        const equipmentArray = Object.values(equipmentStats)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 10);
        
        const content = document.getElementById('equipment-analysis-content');
        content.innerHTML = `
            <h3 class="text-white font-semibold mb-4">Top 10 Equipamentos por Custo</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-white">
                    <thead>
                        <tr class="border-b border-gray-600">
                            <th class="text-left p-2">Equipamento</th>
                            <th class="text-left p-2">Total O.S</th>
                            <th class="text-left p-2">Corretivas</th>
                            <th class="text-left p-2">Preventivas</th>
                            <th class="text-left p-2">Custo Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${equipmentArray.map(eq => `
                            <tr class="border-b border-gray-700">
                                <td class="p-2 text-sm">${eq.name}</td>
                                <td class="p-2">${eq.total_orders}</td>
                                <td class="p-2 text-red-400">${eq.corrective}</td>
                                <td class="p-2 text-green-400">${eq.preventive}</td>
                                <td class="p-2">R$ ${eq.cost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar análise de equipamentos:', error);
    }
}

function loadPredictiveAnalysis() {
    if (!currentExcelData) return;
    
    try {
        // Análise de risco por equipamento
        const equipmentRisk = {};
        
        currentExcelData.forEach(row => {
            const equipment = row['Nome Equipamento'];
            if (!equipmentRisk[equipment]) {
                equipmentRisk[equipment] = {
                    equipment: equipment,
                    total_count: 0,
                    corrective_count: 0,
                    risk_score: 0
                };
            }
            
            equipmentRisk[equipment].total_count++;
            
            if (row['Tipo de Manutenção'] === 7) {
                equipmentRisk[equipment].corrective_count++;
            }
        });
        
        // Calcular score de risco e ordenar
        const riskArray = Object.values(equipmentRisk)
            .map(eq => {
                eq.risk_score = eq.total_count > 0 ? Math.round((eq.corrective_count / eq.total_count) * 100) : 0;
                return eq;
            })
            .sort((a, b) => b.risk_score - a.risk_score)
            .slice(0, 5);
        
        const content = document.getElementById('predictive-analysis-content');
        content.innerHTML = `
            <h3 class="text-white font-semibold mb-4">Equipamentos com Maior Risco</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${riskArray.map(eq => `
                    <div class="bg-kpi-main rounded-lg p-4">
                        <h4 class="text-white font-medium mb-2">${eq.equipment}</h4>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-gray-300">Score de Risco:</span>
                            <span class="text-${eq.risk_score > 50 ? 'red' : eq.risk_score > 25 ? 'yellow' : 'green'}-400 font-bold">
                                ${eq.risk_score}%
                            </span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-${eq.risk_score > 50 ? 'red' : eq.risk_score > 25 ? 'yellow' : 'green'}-400 h-2 rounded-full" 
                                 style="width: ${eq.risk_score}%"></div>
                        </div>
                        <div class="mt-2 text-sm text-gray-400">
                            ${eq.corrective_count} corretivas de ${eq.total_count} total
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar análise preditiva:', error);
    }
}

function createMonthlyStatusChart(statusData) {
    const ctx = document.getElementById('monthlyStatusChart').getContext('2d');
    if (charts.status) charts.status.destroy();
    
    const datasets = [];
    const colors = {
        'Não Iniciada': '#ef4444',
        'Requisitada': '#f59e0b', 
        'Iniciada': '#10b981',
        'Liberada': '#3b82f6',
        'Suspensa': '#8b5cf6'
    };
    
    Object.keys(statusData).forEach(status => {
        datasets.push({
            label: status,
            data: statusData[status],
            borderColor: colors[status] || '#6b7280',
            backgroundColor: (colors[status] || '#6b7280') + '20',
            fill: false,
            tension: 0.4
        });
    });
    
    charts.status = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    labels: { color: 'white' },
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Ordens por Status Mensal',
                    color: 'white'
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: { 
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function loadEditForm() {
    if (!dashboardData) {
        return;
    }
    
    // Carregar KPIs atuais nos campos de edição
    document.getElementById('edit-preventivas').value = dashboardData.kpis.preventivas || 0;
    document.getElementById('edit-preventivas-vencer').value = dashboardData.kpis.preventivasVenc || 0;
    document.getElementById('edit-preditivas').value = dashboardData.kpis.preditivas || 0;
    document.getElementById('edit-melhorias').value = dashboardData.kpis.melhorias || 0;
    document.getElementById('edit-equipamentos').value = dashboardData.kpis.equipamentos || 0;
    document.getElementById('edit-os-total').value = dashboardData.kpis.osTotal || 0;
    document.getElementById('edit-disponibilidade').value = dashboardData.kpis.availability || 0;
    
    // Carregar dados mensais de custos
    for (let i = 0; i < 12; i++) {
        document.getElementById(`edit-custo-${i}`).value = Math.round(dashboardData.monthly_costs[i] || 0);
        document.getElementById(`edit-corretiva-${i}`).value = dashboardData.monthly_correctives[i] || 0;
    }
    
    // Carregar MTTR e MTBF
    document.getElementById('edit-mttr').value = dashboardData.mttr.join(', ');
    document.getElementById('edit-mtbf').value = dashboardData.mtbf.join(', ');
}

async function saveEditedData() {
    try {
        // Coletar dados editados
        const editedData = {
            kpis: {
                preventivas: parseInt(document.getElementById('edit-preventivas').value) || 0,
                preventivasVenc: parseInt(document.getElementById('edit-preventivas-vencer').value) || 0,
                preditivas: parseInt(document.getElementById('edit-preditivas').value) || 0,
                melhorias: parseInt(document.getElementById('edit-melhorias').value) || 0,
                equipamentos: parseInt(document.getElementById('edit-equipamentos').value) || 0,
                osTotal: parseInt(document.getElementById('edit-os-total').value) || 0,
                availability: parseFloat(document.getElementById('edit-disponibilidade').value) || 0,
                corretivas: dashboardData.kpis.corretivas, // Manter valor original
                custoTotal: dashboardData.kpis.custoTotal // Manter valor original
            },
            monthly_costs: [],
            monthly_correctives: [],
            mttr: [],
            mtbf: []
        };
        
        // Coletar dados mensais
        for (let i = 0; i < 12; i++) {
            editedData.monthly_costs[i] = parseFloat(document.getElementById(`edit-custo-${i}`).value) || 0;
            editedData.monthly_correctives[i] = parseInt(document.getElementById(`edit-corretiva-${i}`).value) || 0;
        }
        
        // Coletar MTTR e MTBF
        const mttrText = document.getElementById('edit-mttr').value;
        const mtbfText = document.getElementById('edit-mtbf').value;
        
        editedData.mttr = mttrText.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        editedData.mtbf = mtbfText.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        
        // Manter dados de status se existirem
        if (dashboardData.monthly_status) {
            editedData.monthly_status = dashboardData.monthly_status;
        }
        
        // Atualizar dashboardData
        dashboardData = editedData;
        
        // Salvar no Firebase/localStorage
        await saveEditedDataToStorage(editedData);
        
        // Atualizar interface
        updateKPIs(editedData.kpis);
        createAllCharts(editedData);
        
        // Voltar ao dashboard
        showView('dashboard');
        
        alert('Dados salvos com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar dados editados:', error);
        alert('Erro ao salvar dados: ' + error.message);
    }
}

async function saveEditedDataToStorage(data) {
    try {
        if (!window.firebase) {
            console.log('Firebase não configurado, salvando apenas localmente');
            localStorage.setItem('editedMaintenanceData', JSON.stringify(data));
            return;
        }

        const { db, doc, setDoc } = window.firebase;
        
        await setDoc(doc(db, 'maintenance', 'editedData'), {
            data: data,
            editDate: new Date().toISOString()
        });
        
        console.log('Dados editados salvos no Firebase com sucesso');
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        // Fallback para localStorage
        localStorage.setItem('editedMaintenanceData', JSON.stringify(data));
    }
}

function loadSettingsForm() {
    // Carregar configurações salvas
    const savedSettings = JSON.parse(localStorage.getItem('maintenanceSettings') || '{}');
    
    document.getElementById('settings-username').value = savedSettings.username || 'Usuário Teste';
    document.getElementById('settings-meta-mttr').value = savedSettings.metaMTTR || 5;
    document.getElementById('settings-meta-mtbf').value = savedSettings.metaMTBF || 600;
    document.getElementById('settings-meta-disponibilidade').value = savedSettings.metaDisponibilidade || 95;
    
    // Atualizar indicadores de performance
    updateGoalProgress(savedSettings);
}

async function saveSettings() {
    try {
        const settings = {
            username: document.getElementById('settings-username').value || 'Usuário Teste',
            metaMTTR: parseFloat(document.getElementById('settings-meta-mttr').value) || 5,
            metaMTBF: parseFloat(document.getElementById('settings-meta-mtbf').value) || 600,
            metaDisponibilidade: parseFloat(document.getElementById('settings-meta-disponibilidade').value) || 95,
            lastUpdated: new Date().toISOString()
        };
        
        // Salvar localmente
        localStorage.setItem('maintenanceSettings', JSON.stringify(settings));
        
        // Salvar no Firebase se disponível
        if (window.firebase) {
            const { db, doc, setDoc } = window.firebase;
            await setDoc(doc(db, 'maintenance', 'settings'), settings);
        }
        
        // Atualizar indicadores de performance
        updateGoalProgress(settings);
        
        alert('Configurações salvas com sucesso!');
        showView('dashboard');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Erro ao salvar configurações: ' + error.message);
    }
}

function updateGoalProgress(settings) {
    if (!dashboardData || !settings) return;
    
    // Calcular médias atuais
    const currentMTTR = dashboardData.mttr.reduce((a, b) => a + b, 0) / dashboardData.mttr.length;
    const currentMTBF = dashboardData.mtbf.reduce((a, b) => a + b, 0) / dashboardData.mtbf.length;
    const currentAvailability = dashboardData.kpis.availability;
    
    // MTTR (menor é melhor)
    const mttrProgress = Math.max(0, Math.min(100, ((settings.metaMTTR - currentMTTR) / settings.metaMTTR) * 100 + 50));
    document.getElementById('mttr-performance').textContent = `${currentMTTR.toFixed(1)} / ${settings.metaMTTR}`;
    document.getElementById('mttr-progress').style.width = mttrProgress + '%';
    
    // MTBF (maior é melhor)
    const mtbfProgress = Math.max(0, Math.min(100, (currentMTBF / settings.metaMTBF) * 100));
    document.getElementById('mtbf-performance').textContent = `${currentMTBF.toFixed(0)} / ${settings.metaMTBF}`;
    document.getElementById('mtbf-progress').style.width = mtbfProgress + '%';
    
    // Disponibilidade (maior é melhor)
    const availabilityProgress = Math.max(0, Math.min(100, (currentAvailability / settings.metaDisponibilidade) * 100));
    document.getElementById('availability-performance').textContent = `${currentAvailability.toFixed(1)}% / ${settings.metaDisponibilidade}%`;
    document.getElementById('availability-progress').style.width = availabilityProgress + '%';
}

function exportReport() {
    if (!dashboardData) {
        alert('Carregue dados primeiro para exportar relatório');
        return;
    }
    
    try {
        const reportContent = `
RELATÓRIO DE MANUTENÇÃO
Gerado em: ${new Date().toLocaleString('pt-BR')}

RESUMO EXECUTIVO:
- Total de Ordens: ${dashboardData.kpis.osTotal}
- Equipamentos: ${dashboardData.kpis.equipamentos}
- Custo Total: R$ ${dashboardData.kpis.custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- % Corretivas: ${Math.round((dashboardData.kpis.corretivas / dashboardData.kpis.osTotal) * 100)}%

RESUMO MENSAL:
- Custo Mensal Total: R$ ${dashboardData.monthly_costs.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
- Média Corretivas/Mês: ${(dashboardData.monthly_correctives.reduce((a, b) => a + b, 0) / 12).toFixed(1)}

DISPONIBILIDADE: ${Math.round(dashboardData.kpis.availability)}%
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_manutencao.txt';
        a.click();
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        alert('Erro ao exportar relatório');
    }
}

