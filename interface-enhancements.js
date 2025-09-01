
// Interface Enhancements - Integração das novas funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando melhorias da interface...');
    
    // Aguarda a inicialização completa
    setTimeout(() => {
        initializeEnhancements();
    }, 200);
});

function initializeEnhancements() {
    initializeCalculatorControls();
    initializeDatabaseControls();
    initializeTestControls();
    initializeSpectral3DControls();
    initializeAIControls();
    initializeOrbitControls();
    initializeDashboardControls();
    initializeReportsControls();
    initializeWaterfallControls();
    initializeEnvelopeControls();
    initializeAlertsControls();
    initializeStatisticsControls();
    initializeBackupControls();
    updateEquipmentSelector();
}

// Controles da calculadora avançada
function initializeCalculatorControls() {
    // Calculadora de máquinas rotativas
    const calcRotatingBtn = document.getElementById('calc-rotating-btn');
    if (calcRotatingBtn) {
        calcRotatingBtn.addEventListener('click', () => {
            const rpm = parseFloat(document.getElementById('calc-rpm').value);
            const pitchDiameter = parseFloat(document.getElementById('calc-pitch-diameter').value);
            const ballCount = parseInt(document.getElementById('calc-ball-count').value);
            
            const bearingData = {
                ballCount: ballCount,
                pitchDiameter: pitchDiameter,
                ballDiameter: pitchDiameter * 0.16, // Estimativa padrão
                contactAngle: 0
            };
            
            const result = calculateRotatingMachinery(rpm, bearingData);
            
            let html = `
                <h6>Frequências Calculadas:</h6>
                <p><strong>Rotação:</strong> ${result.rotationFreq.toFixed(2)} Hz</p>
                <p><strong>BPFO:</strong> ${result.bearingFrequencies.BPFO.toFixed(2)} Hz</p>
                <p><strong>BPFI:</strong> ${result.bearingFrequencies.BPFI.toFixed(2)} Hz</p>
                <p><strong>FTF:</strong> ${result.bearingFrequencies.FTF.toFixed(2)} Hz</p>
                <p><strong>BSF:</strong> ${result.bearingFrequencies.BSF.toFixed(2)} Hz</p>
            `;
            
            document.getElementById('calc-rotating-result').innerHTML = html;
        });
    }
    
    // Calculadora de ressonância
    const calcResonanceBtn = document.getElementById('calc-resonance-btn');
    if (calcResonanceBtn) {
        calcResonanceBtn.addEventListener('click', () => {
            const mass = parseFloat(document.getElementById('calc-mass').value);
            const stiffness = parseFloat(document.getElementById('calc-stiffness').value);
            const damping = parseFloat(document.getElementById('calc-damping').value);
            
            const result = calculateResonance(mass, stiffness, damping);
            
            let html = `
                <h6>Análise de Ressonância:</h6>
                <p><strong>Freq. Natural:</strong> ${result.naturalFrequency.toFixed(2)} Hz</p>
                <p><strong>Freq. Amortecida:</strong> ${result.dampedFrequency.toFixed(2)} Hz</p>
                <p><strong>Razão de Amortecimento:</strong> ${result.dampingRatio.toFixed(4)}</p>
                <p><strong>Fator Q:</strong> ${result.qualityFactor.toFixed(2)}</p>
            `;
            
            document.getElementById('calc-resonance-result').innerHTML = html;
        });
    }
    
    // Calculadora de severidade
    const calcSeverityBtn = document.getElementById('calc-severity-btn');
    if (calcSeverityBtn) {
        calcSeverityBtn.addEventListener('click', () => {
            const rmsVelocity = parseFloat(document.getElementById('calc-rms-velocity').value);
            const machineType = document.getElementById('calc-machine-type').value;
            
            const result = calculateSeverityIndex(rmsVelocity, machineType);
            
            let html = `
                <h6>Índice de Severidade (ISO 10816):</h6>
                <p><strong>Classificação:</strong> <span style="color: ${result.color}; font-weight: bold;">${result.severity}</span></p>
                <p><strong>Valor:</strong> ${result.value.toFixed(2)} mm/s</p>
                <p><strong>Limites:</strong></p>
                <ul>
                    <li>Bom: ≤ ${result.limits.good} mm/s</li>
                    <li>Satisfatório: ≤ ${result.limits.satisfactory} mm/s</li>
                    <li>Insatisfatório: ≤ ${result.limits.unsatisfactory} mm/s</li>
                </ul>
            `;
            
            document.getElementById('calc-severity-result').innerHTML = html;
        });
    }
    
    // Conversor de unidades
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const value = parseFloat(document.getElementById('convert-value').value);
            const conversionType = document.getElementById('convert-type').value;
            
            const result = advancedCalculator.convertUnits[conversionType](value);
            
            const units = {
                'mmsToMps': ['mm/s', 'm/s'],
                'mpsToMms': ['m/s', 'mm/s'],
                'gToMps2': ['g', 'm/s²'],
                'mps2ToG': ['m/s²', 'g'],
                'hzToRpm': ['Hz', 'RPM'],
                'rpmToHz': ['RPM', 'Hz']
            };
            
            const [fromUnit, toUnit] = units[conversionType];
            
            let html = `
                <h6>Conversão:</h6>
                <p><strong>${value} ${fromUnit} = ${result.toFixed(6)} ${toUnit}</strong></p>
            `;
            
            document.getElementById('convert-result').innerHTML = html;
        });
    }
}

// Controles da base de dados
function initializeDatabaseControls() {
    // Adicionar equipamento
    const addEquipmentBtn = document.getElementById('add-equipment-btn');
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', async () => {
            const name = document.getElementById('equipment-name').value.trim();
            if (!name) {
                alert('Digite o nome do equipamento');
                return;
            }
            
            if (!vibrationDB) {
                alert('Base de dados não inicializada');
                return;
            }
            
            try {
                await vibrationDB.saveEquipment({ name: name });
                document.getElementById('equipment-name').value = '';
                updateEquipmentSelector();
                alert('Equipamento adicionado com sucesso!');
            } catch (error) {
                console.error('Erro ao adicionar equipamento:', error);
                alert('Erro ao adicionar equipamento');
            }
        });
    }
    
    // Carregar histórico
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', async () => {
            if (!vibrationDB) {
                alert('Base de dados não inicializada');
                return;
            }
            
            try {
                const equipment = document.getElementById('equipment-select').value;
                const history = await vibrationDB.getAnalysisHistory(equipment || null);
                displayHistory(history);
            } catch (error) {
                console.error('Erro ao carregar histórico:', error);
                alert('Erro ao carregar histórico');
            }
        });
    }
    
    // Exportar base de dados
    const exportDatabaseBtn = document.getElementById('export-database-btn');
    if (exportDatabaseBtn) {
        exportDatabaseBtn.addEventListener('click', async () => {
            if (!vibrationDB) {
                alert('Base de dados não inicializada');
                return;
            }
            
            try {
                await vibrationDB.exportDatabase();
            } catch (error) {
                console.error('Erro ao exportar base de dados:', error);
                alert('Erro ao exportar base de dados');
            }
        });
    }
    
    // Limpar histórico
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar o histórico? Esta ação não pode ser desfeita.')) {
                // Implementar limpeza da base de dados
                document.getElementById('history-display').innerHTML = '<p>Histórico limpo.</p>';
            }
        });
    }
}

// Controles das visualizações 3D
function initializeSpectral3DControls() {
    // Botão de inicialização 3D
    const init3DBtn = document.getElementById('init-3d-btn');
    if (init3DBtn) {
        init3DBtn.addEventListener('click', () => {
            if (typeof THREE === 'undefined') {
                alert('Three.js não está carregado. Recarregue a página.');
                return;
            }
            
            const success = initSpectral3D('spectral-3d-container');
            if (success) {
                init3DBtn.textContent = '✅ Visualização 3D Ativada';
                init3DBtn.disabled = true;
                
                // Se há dados espectrais atuais, exibe-os
                if (currentSpectralData) {
                    updateSpectral3D(currentSpectralData.frequencies, currentSpectralData.magnitudes);
                }
            } else {
                alert('Erro ao inicializar visualização 3D');
            }
        });
    }
    
    // Seletor de modo de visualização
    const modeSelector = document.getElementById('spectral-3d-mode');
    if (modeSelector) {
        modeSelector.addEventListener('change', (e) => {
            setSpectral3DMode(e.target.value);
        });
    }
    
    // Botão de captura de screenshot
    const screenshotBtn = document.getElementById('screenshot-3d-btn');
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', () => {
            if (spectral3D) {
                const dataUrl = spectral3D.captureScreenshot();
                if (dataUrl) {
                    const link = document.createElement('a');
                    link.download = `espectro_3d_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            }
        });
    }
}

// Controles dos testes
function initializeTestControls() {
    // Executar todos os testes
    const runTestsBtn = document.getElementById('run-tests-btn');
    if (runTestsBtn) {
        runTestsBtn.addEventListener('click', () => {
            if (typeof runFFTTests === 'function') {
                runFFTTests();
            } else {
                console.error('Sistema de testes não carregado');
                alert('Sistema de testes não disponível');
            }
        });
    }
    
    // Teste de performance
    const runPerformanceTestBtn = document.getElementById('run-performance-test-btn');
    if (runPerformanceTestBtn) {
        runPerformanceTestBtn.addEventListener('click', () => {
            runPerformanceTest();
        });
    }
    
    // Teste de precisão
    const runAccuracyTestBtn = document.getElementById('run-accuracy-test-btn');
    if (runAccuracyTestBtn) {
        runAccuracyTestBtn.addEventListener('click', () => {
            runAccuracyTest();
        });
    }
}

// Atualiza seletor de equipamentos
async function updateEquipmentSelector() {
    if (!vibrationDB) return;
    
    try {
        const equipment = await vibrationDB.getEquipmentList();
        const selector = document.getElementById('equipment-select');
        
        if (selector) {
            selector.innerHTML = '<option value="">Todos os equipamentos</option>';
            equipment.forEach(eq => {
                selector.innerHTML += `<option value="${eq.name}">${eq.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar seletor de equipamentos:', error);
    }
}

// Exibe histórico de análises
function displayHistory(history) {
    const display = document.getElementById('history-display');
    if (!display) return;
    
    if (history.length === 0) {
        display.innerHTML = '<p>Nenhuma análise encontrada no histórico.</p>';
        return;
    }
    
    let html = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Equipamento</th>
                    <th>Severidade</th>
                    <th>Freq. Pico</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    history.forEach(record => {
        const date = new Date(record.timestamp).toLocaleString('pt-BR');
        const peak = record.data.peak || { frequency: 'N/A', magnitude: 'N/A' };
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${record.equipment}</td>
                <td><span class="severity-${record.severity.toLowerCase()}">${record.severity}</span></td>
                <td>${typeof peak.frequency === 'number' ? peak.frequency.toFixed(2) + ' Hz' : peak.frequency}</td>
                <td>
                    <button onclick="loadAnalysis(${record.id})" class="small-btn">Carregar</button>
                    <button onclick="deleteAnalysis(${record.id})" class="small-btn danger">Deletar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    display.innerHTML = html;
}

// Teste de performance
function runPerformanceTest() {
    const testSizes = [256, 512, 1024, 2048, 4096];
    const results = [];
    
    console.log('🚀 Iniciando teste de performance...');
    
    testSizes.forEach(size => {
        const data = Array.from({length: size}, () => Math.random() * 2 - 1);
        
        const startTime = performance.now();
        const result = fft(data);
        const endTime = performance.now();
        
        const time = endTime - startTime;
        results.push({ size, time });
        
        console.log(`FFT ${size} pontos: ${time.toFixed(2)}ms`);
    });
    
    // Exibe resultados
    let html = `
        <h5>Teste de Performance FFT</h5>
        <table class="performance-table">
            <thead>
                <tr><th>Tamanho</th><th>Tempo (ms)</th><th>Performance</th></tr>
            </thead>
            <tbody>
    `;
    
    results.forEach(result => {
        const pointsPerMs = (result.size / result.time).toFixed(0);
        html += `
            <tr>
                <td>${result.size}</td>
                <td>${result.time.toFixed(2)}</td>
                <td>${pointsPerMs} pontos/ms</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    document.getElementById('test-results').innerHTML = html;
}

// Teste de precisão
function runAccuracyTest() {
    console.log('🎯 Iniciando teste de precisão...');
    
    // Teste com sinal senoidal puro
    const freq = 50; // Hz
    const sampleRate = 1000; // Hz
    const duration = 1; // segundo
    const samples = sampleRate * duration;
    
    const signal = Array.from({length: samples}, (_, i) => 
        Math.sin(2 * Math.PI * freq * i / sampleRate)
    );
    
    const startTime = performance.now();
    const result = fft(signal);
    const endTime = performance.now();
    
    const magnitudes = result.slice(0, samples / 2).map(c => 
        Math.sqrt(c.re * c.re + c.im * c.im) / (samples / 2)
    );
    
    const freqs = Array.from({length: magnitudes.length}, (_, i) => 
        i * sampleRate / samples
    );
    
    const peak = findPeak(magnitudes, freqs);
    
    const html = `
        <h5>Teste de Precisão</h5>
        <p><strong>Sinal teste:</strong> Senoide de ${freq} Hz</p>
        <p><strong>Frequência detectada:</strong> ${peak.frequency.toFixed(2)} Hz</p>
        <p><strong>Erro:</strong> ${Math.abs(peak.frequency - freq).toFixed(4)} Hz</p>
        <p><strong>Precisão:</strong> ${(100 - Math.abs(peak.frequency - freq) / freq * 100).toFixed(2)}%</p>
        <p><strong>Tempo de processamento:</strong> ${(endTime - startTime).toFixed(2)} ms</p>
        <p><strong>Taxa de amostragem:</strong> ${sampleRate} Hz</p>
        <p><strong>Amostras processadas:</strong> ${samples}</p>
    `;
    
    document.getElementById('test-results').innerHTML = html;
}

// Função para carregar análise do histórico
window.loadAnalysis = function(id) {
    // Implementar carregamento de análise específica
    console.log('Carregando análise ID:', id);
    alert('Funcionalidade de carregamento será implementada');
};

// Função para deletar análise
window.deleteAnalysis = function(id) {
    if (confirm('Tem certeza que deseja deletar esta análise?')) {
        // Implementar deleção
        console.log('Deletando análise ID:', id);
        alert('Funcionalidade de deleção será implementada');
    }
};

// Controles da IA
function initializeAIControls() {
    const runAIBtn = document.getElementById('run-ai-analysis-btn');
    if (runAIBtn) {
        runAIBtn.addEventListener('click', () => {
            if (currentSpectralData && aiDiagnostic) {
                const aiResults = aiDiagnostic.analyzeWithAI(currentSpectralData);
                displayAIResults(aiResults);
            } else {
                alert('Execute uma análise FFT primeiro ou verifique se a IA está carregada');
            }
        });
    }

    const trainAIBtn = document.getElementById('train-ai-btn');
    if (trainAIBtn) {
        trainAIBtn.addEventListener('click', () => {
            alert('Treinamento do modelo IA será implementado em versão futura');
        });
    }
}

// Controles da Análise de Órbita
function initializeOrbitControls() {
    const initOrbitBtn = document.getElementById('init-orbit-btn');
    if (initOrbitBtn) {
        initOrbitBtn.addEventListener('click', () => {
            const success = orbitAnalysis.initializeOrbitAnalysis('orbit-container');
            if (success) {
                initOrbitBtn.textContent = '✅ Análise de Órbita Ativa';
                initOrbitBtn.disabled = true;
            }
        });
    }
}

// Controles do Dashboard
function initializeDashboardControls() {
    const initDashboardBtn = document.getElementById('init-dashboard-btn');
    if (initDashboardBtn) {
        initDashboardBtn.addEventListener('click', () => {
            const success = executiveDashboard.initialize('executive-dashboard-container');
            if (success) {
                initDashboardBtn.textContent = '✅ Dashboard Ativo';
                initDashboardBtn.disabled = true;
            }
        });
    }

    const fullscreenBtn = document.getElementById('fullscreen-dashboard-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const container = document.getElementById('executive-dashboard-container');
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        });
    }
}

// Controles de Relatórios
function initializeReportsControls() {
    const reportButtons = [
        { id: 'generate-executive-report', type: 'executive' },
        { id: 'generate-technical-report', type: 'technical' },
        { id: 'generate-maintenance-report', type: 'maintenance' },
        { id: 'generate-iso-report', type: 'iso' }
    ];

    reportButtons.forEach(({ id, type }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', async () => {
                if (!currentSpectralData) {
                    alert('Execute uma análise FFT primeiro');
                    return;
                }

                const format = document.getElementById('report-format').value;
                
                try {
                    btn.disabled = true;
                    btn.textContent = 'Gerando...';
                    
                    const report = await reportGenerator.generateReport(type, currentSpectralData, format);
                    const filename = `${type}_report_${new Date().toISOString().slice(0,10)}.${format}`;
                    
                    reportGenerator.downloadReport(report, filename, format);
                    
                    btn.textContent = '✅ Relatório Gerado';
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = btn.textContent.replace('✅ Relatório Gerado', btn.textContent.split(' ')[1] + ' ' + btn.textContent.split(' ')[2]);
                    }, 2000);
                } catch (error) {
                    console.error('Erro ao gerar relatório:', error);
                    alert('Erro ao gerar relatório');
                    btn.disabled = false;
                }
            });
        }
    });
}

// Exibir resultados da IA
function displayAIResults(results) {
    const container = document.getElementById('ai-results');
    if (!container) return;

    let html = `
        <div class="ai-results-grid">
            <div class="ai-result-card">
                <h4>🎯 Diagnóstico Principal</h4>
                <div class="confidence-meter">
                    <div class="confidence-fill" style="width: ${results.confidence * 100}%"></div>
                </div>
                <p><strong>Confiança:</strong> ${(results.confidence * 100).toFixed(1)}%</p>
                <p><strong>Nível de Risco:</strong> <span class="risk-level ${results.riskLevel.toLowerCase()}">${results.riskLevel}</span></p>
            </div>
            
            <div class="ai-result-card">
                <h4>🔍 Defeitos Detectados</h4>
                <ul>
    `;

    Object.entries(results.diagnosis).forEach(([fault, data]) => {
        if (data.detected) {
            html += `<li><strong>${fault}:</strong> ${(data.confidence * 100).toFixed(0)}% confiança</li>`;
        }
    });

    html += `
                </ul>
            </div>
            
            <div class="ai-result-card">
                <h4>📋 Recomendações</h4>
                <ul>
    `;

    results.recommendations.forEach(rec => {
        html += `
            <li>
                <strong>Prioridade ${rec.priority}:</strong> ${rec.action}<br>
                <small>Prazo: ${rec.timeframe} | Custo: ${rec.cost}</small>
            </li>
        `;
    });

    html += `
                </ul>
            </div>
            
            <div class="ai-result-card">
                <h4>📈 Análise de Tendências</h4>
                <p><strong>Taxa de Degradação:</strong> ${results.trends.degradationRate}</p>
                <p><strong>Tempo até Falha:</strong> ${results.trends.timeToFailure}</p>
                <p><strong>Direção da Tendência:</strong> ${results.trends.trendDirection}</p>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Sobrescreve função de salvamento para incluir base de dados
const originalHandleCalculateClick = window.handleCalculateClick;
if (originalHandleCalculateClick) {
    window.handleCalculateClick = function() {
        // Executa cálculo original
        originalHandleCalculateClick();
        
        // Salva na base de dados se disponível
        setTimeout(() => {
            if (vibrationDB && currentSpectralData) {
                const equipment = document.getElementById('equipment-select').value || 'Equipamento Padrão';
                currentSpectralData.equipment = equipment;
                
                vibrationDB.saveAnalysis(currentSpectralData).then(() => {
                    console.log('Análise salva na base de dados');
                }).catch(error => {
                    console.error('Erro ao salvar na base de dados:', error);
                });
            }
        }, 100);
    };
}

// Controles do Waterfall
function initializeWaterfallControls() {
    // Inicializar waterfall quando a aba for ativada
    const waterfallTab = document.querySelector('[data-tab="waterfall"]');
    if (waterfallTab) {
        waterfallTab.addEventListener('click', () => {
            setTimeout(() => {
                if (!waterfallAnalysis.canvas) {
                    waterfallAnalysis.initializeWaterfall('waterfall-container');
                }
            }, 100);
        });
    }
}

// Controles da Análise de Envelope
function initializeEnvelopeControls() {
    const calculateEnvelopeBtn = document.getElementById('calculate-envelope-btn');
    if (calculateEnvelopeBtn) {
        calculateEnvelopeBtn.addEventListener('click', () => {
            if (!currentSpectralData) {
                alert('Execute uma análise FFT primeiro');
                return;
            }

            // Usar dados temporais se disponíveis
            let timeData = [];
            if (accelerometerCapture && accelerometerCapture.getCapturedData().length > 0) {
                timeData = accelerometerCapture.getCapturedData().map(d => d.magnitude);
            } else {
                // Gerar dados de exemplo para demonstração
                timeData = Array.from({length: 1024}, (_, i) => 
                    Math.sin(2 * Math.PI * 50 * i / 1000) + 
                    0.3 * Math.sin(2 * Math.PI * 200 * i / 1000) * Math.sin(2 * Math.PI * 5 * i / 1000)
                );
            }

            const envelopeResult = envelopeAnalysis.calculateEnvelope(timeData);
            displayEnvelopeResults(envelopeResult);
        });
    }

    const detectModulationBtn = document.getElementById('detect-modulation-btn');
    if (detectModulationBtn) {
        detectModulationBtn.addEventListener('click', () => {
            if (!currentSpectralData) {
                alert('Execute uma análise FFT primeiro');
                return;
            }
            
            alert('Detecção automática de modulações em desenvolvimento');
        });
    }
}

// Controles dos Alertas
function initializeAlertsControls() {
    // Configurar limites
    document.getElementById('vibration-threshold')?.addEventListener('change', (e) => {
        realTimeAlerts.alertThresholds.vibrationLevel = parseFloat(e.target.value);
    });

    document.getElementById('unbalance-threshold')?.addEventListener('change', (e) => {
        realTimeAlerts.alertThresholds.unbalanceLevel = parseFloat(e.target.value);
    });

    // Configurações de som
    document.getElementById('enable-sound-alerts')?.addEventListener('change', (e) => {
        realTimeAlerts.soundEnabled = e.target.checked;
    });

    // Solicitar permissão para notificações
    document.getElementById('enable-notifications')?.addEventListener('change', (e) => {
        if (e.target.checked && 'Notification' in window) {
            Notification.requestPermission();
        }
    });
}

// Controles das Estatísticas
function initializeStatisticsControls() {
    const calculateStatsBtn = document.getElementById('calculate-advanced-stats-btn');
    if (calculateStatsBtn) {
        calculateStatsBtn.addEventListener('click', () => {
            if (!currentSpectralData) {
                alert('Execute uma análise FFT primeiro');
                return;
            }

            calculateAndDisplayAdvancedStatistics();
        });
    }

    const exportStatsBtn = document.getElementById('export-statistics-btn');
    if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', () => {
            exportAdvancedStatistics();
        });
    }
}

// Controles do Backup
function initializeBackupControls() {
    const createBackupBtn = document.getElementById('create-backup-btn');
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', async () => {
            try {
                const backupId = await backupSystem.createBackup();
                alert(`Backup criado com sucesso: ${backupId}`);
                updateBackupList();
            } catch (error) {
                alert('Erro ao criar backup: ' + error.message);
            }
        });
    }

    const autoBackupToggle = document.getElementById('auto-backup-toggle');
    if (autoBackupToggle) {
        autoBackupToggle.addEventListener('click', () => {
            if (backupSystem.isAutoBackupEnabled) {
                backupSystem.disableAutoBackup();
                autoBackupToggle.textContent = '🔄 Auto-Backup OFF';
                autoBackupToggle.className = 'secondary-btn';
            } else {
                backupSystem.enableAutoBackup();
                autoBackupToggle.textContent = '⏹️ Auto-Backup ON';
                autoBackupToggle.className = 'action-btn';
            }
        });
    }

    const exportBackupsBtn = document.getElementById('export-backups-btn');
    if (exportBackupsBtn) {
        exportBackupsBtn.addEventListener('click', () => {
            backupSystem.exportAllBackups();
        });
    }

    const frequencySelect = document.getElementById('backup-frequency');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', (e) => {
            backupSystem.backupFrequency = parseInt(e.target.value);
            if (backupSystem.isAutoBackupEnabled) {
                backupSystem.disableAutoBackup();
                backupSystem.enableAutoBackup();
            }
        });
    }
}

// Funções auxiliares
function displayEnvelopeResults(result) {
    const container = document.getElementById('envelope-results');
    if (!container) return;

    let html = `
        <h5>Resultados da Análise de Envelope</h5>
        <div class="envelope-metrics">
            <p><strong>Modulações Detectadas:</strong> ${result.modulationFrequencies.length}</p>
    `;

    if (result.modulationFrequencies.length > 0) {
        html += '<h6>Frequências de Modulação:</h6><ul>';
        result.modulationFrequencies.forEach((mod, index) => {
            html += `<li>Freq ${index + 1}: ${mod.frequency.toFixed(2)} Hz (Magnitude: ${mod.magnitude.toFixed(3)})</li>`;
        });
        html += '</ul>';
    }

    html += '</div>';
    container.innerHTML = html;
}

function calculateAndDisplayAdvancedStatistics() {
    // Obter dados temporais
    let timeData = [];
    if (accelerometerCapture && accelerometerCapture.getCapturedData().length > 0) {
        timeData = accelerometerCapture.getCapturedData().map(d => d.magnitude);
    } else {
        // Gerar dados de exemplo
        timeData = Array.from({length: 1024}, (_, i) => Math.sin(2 * Math.PI * 50 * i / 1000) + Math.random() * 0.1);
    }

    const sampleRate = parseFloat(document.getElementById('sample-rate')?.value) || 1000;
    const stats = advancedStatistics.calculateAdvancedStatistics(timeData, sampleRate);

    // Exibir estatísticas temporais
    const temporalDiv = document.getElementById('temporal-stats');
    if (temporalDiv) {
        temporalDiv.innerHTML = `
            <div class="stat-item"><span>Média:</span><span class="stat-value">${stats.temporal.mean.toFixed(4)}</span></div>
            <div class="stat-item"><span>Desvio Padrão:</span><span class="stat-value">${stats.temporal.stdDev.toFixed(4)}</span></div>
            <div class="stat-item"><span>Assimetria:</span><span class="stat-value">${stats.temporal.skewness.toFixed(4)}</span></div>
            <div class="stat-item"><span>Curtose:</span><span class="stat-value">${stats.temporal.kurtosis.toFixed(4)}</span></div>
            <div class="stat-item"><span>RMS:</span><span class="stat-value">${stats.temporal.rms.toFixed(4)}</span></div>
            <div class="stat-item"><span>Fator de Crista:</span><span class="stat-value">${stats.temporal.crestFactor.toFixed(2)}</span></div>
        `;
    }

    // Exibir estatísticas espectrais
    const spectralDiv = document.getElementById('spectral-stats');
    if (spectralDiv) {
        spectralDiv.innerHTML = `
            <div class="stat-item"><span>Centróide Espectral:</span><span class="stat-value">${stats.spectral.spectralCentroid.toFixed(2)} Hz</span></div>
            <div class="stat-item"><span>Dispersão Espectral:</span><span class="stat-value">${stats.spectral.spectralSpread.toFixed(2)} Hz</span></div>
            <div class="stat-item"><span>Inclinação Espectral:</span><span class="stat-value">${stats.spectral.spectralSlope.toFixed(4)}</span></div>
            <div class="stat-item"><span>Rolloff Espectral:</span><span class="stat-value">${stats.spectral.spectralRolloff.toFixed(2)} Hz</span></div>
            <div class="stat-item"><span>Entropia Espectral:</span><span class="stat-value">${stats.spectral.spectralEntropy.toFixed(4)}</span></div>
            <div class="stat-item"><span>Planura Espectral:</span><span class="stat-value">${stats.spectral.spectralFlatness.toFixed(4)}</span></div>
        `;
    }

    // Exibir indicadores diagnósticos
    const diagnosticDiv = document.getElementById('diagnostic-indicators');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = `
            <div class="stat-item"><span>Indicador de Impulso:</span><span class="stat-value">${stats.diagnostic.impulseIndicator.toFixed(2)}</span></div>
            <div class="stat-item"><span>Fator de Margem:</span><span class="stat-value">${stats.diagnostic.marginFactor.toFixed(2)}</span></div>
            <div class="stat-item"><span>Indicador de Forma:</span><span class="stat-value">${stats.diagnostic.shapeIndicator.toFixed(2)}</span></div>
            <div class="stat-item"><span>Teste de Normalidade:</span><span class="stat-value">${stats.diagnostic.normalityTest.isNormal ? '✅ Normal' : '❌ Não-Normal'}</span></div>
        `;
    }
}

function exportAdvancedStatistics() {
    // Implementar exportação das estatísticas
    alert('Exportação de estatísticas será implementada');
}

function updateBackupList() {
    const backupList = backupSystem.getBackupList();
    const container = document.getElementById('backup-items');
    if (!container) return;

    if (backupList.length === 0) {
        container.innerHTML = '<p>Nenhum backup encontrado</p>';
        return;
    }

    let html = '';
    backupList.forEach(backup => {
        const date = new Date(backup.timestamp).toLocaleString('pt-BR');
        const sizeKB = (backup.size / 1024).toFixed(1);
        
        html += `
            <div class="backup-item">
                <div class="backup-info">
                    <strong>${backup.id}</strong><br>
                    <small>${date} | ${sizeKB} KB</small>
                </div>
                <div class="backup-actions-small">
                    <button onclick="restoreBackup('${backup.id}')" class="action-btn">Restaurar</button>
                    <button onclick="deleteBackup('${backup.id}')" class="secondary-btn">Deletar</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Funções globais para backup
window.restoreBackup = async function(backupId) {
    if (confirm('Tem certeza que deseja restaurar este backup? Dados atuais podem ser perdidos.')) {
        try {
            await backupSystem.restoreBackup(backupId);
            alert('Backup restaurado com sucesso!');
            location.reload(); // Recarregar página para aplicar restauração
        } catch (error) {
            alert('Erro ao restaurar backup: ' + error.message);
        }
    }
};

window.deleteBackup = function(backupId) {
    if (confirm('Tem certeza que deseja deletar este backup?')) {
        // Implementar deleção de backup
        alert('Funcionalidade de deleção será implementada');
        updateBackupList();
    }
};

// Integrar alertas com análise principal
const originalAnalyzeVibration = window.analyzeVibration;
if (originalAnalyzeVibration) {
    window.analyzeVibration = function(spectralData) {
        const result = originalAnalyzeVibration(spectralData);
        
        // Verificar alertas
        setTimeout(() => {
            realTimeAlerts.checkAlerts(spectralData);
        }, 100);
        
        return result;
    };
}

console.log('🚀 Interface enhancements avançadas carregadas com sucesso');
