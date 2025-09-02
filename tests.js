
// Sistema de Testes para Calculadora FFT
class FFTTestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runAllTests() {
        console.log('🧪 Iniciando bateria de testes...');
        this.results = [];
        
        for (const test of this.tests) {
            try {
                const startTime = performance.now();
                const result = await test.testFunction();
                const endTime = performance.now();
                
                this.results.push({
                    name: test.name,
                    status: 'PASSED',
                    result: result,
                    time: (endTime - startTime).toFixed(2) + 'ms',
                    error: null
                });
                console.log(`✅ ${test.name} - PASSOU (${(endTime - startTime).toFixed(2)}ms)`);
            } catch (error) {
                this.results.push({
                    name: test.name,
                    status: 'FAILED',
                    result: null,
                    time: null,
                    error: error.message
                });
                console.error(`❌ ${test.name} - FALHOU: ${error.message}`);
            }
        }
        
        this.displayResults();
        return this.results;
    }

    displayResults() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        
        console.log(`\nResultado dos Testes: ${passed} passou, ${failed} falhou`);
        
        // Exibe resultados na interface se elemento existir
        const testResultsDiv = document.getElementById('test-results');
        if (testResultsDiv) {
            testResultsDiv.innerHTML = this.generateTestReport();
        }
    }

    generateTestReport() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        
        let html = `
            <div class="test-summary">
                <h4><i class="fas fa-chart-bar"></i> Relatório de Testes</h4>
                <p><strong>Total:</strong> ${this.results.length} | 
                   <span class="test-passed">Passou: ${passed}</span> | 
                   <span class="test-failed">Falhou: ${failed}</span></p>
            </div>
            <div class="test-details">
        `;
        
        this.results.forEach(result => {
            const statusClass = result.status === 'PASSED' ? 'test-passed' : 'test-failed';
            const icon = result.status === 'PASSED' ? '<i class="fas fa-check success-icon"></i>' : '<i class="fas fa-times warning-icon"></i>';
            
            html += `
                <div class="test-item ${statusClass}">
                    <div class="test-header">
                        ${icon} <strong>${result.name}</strong>
                        ${result.time ? `<span class="test-time">(${result.time})</span>` : ''}
                    </div>
                    ${result.error ? `<div class="test-error">Erro: ${result.error}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
}

// Inicializa sistema de testes
const fftTests = new FFTTestSuite();

// Teste 1: Verificação de FFT básica
fftTests.addTest('FFT - Cálculo Básico', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = fft(data);
    
    if (!result || result.length !== data.length) {
        throw new Error('FFT não retornou resultado válido');
    }
    
    // Verifica se todos os elementos têm partes real e imaginária
    result.forEach((complex, i) => {
        if (typeof complex.re !== 'number' || typeof complex.im !== 'number') {
            throw new Error(`Elemento ${i} não é um número complexo válido`);
        }
    });
    
    return { success: true, length: result.length };
});

// Teste 2: Detecção de pico
fftTests.addTest('Detecção de Pico', () => {
    const magnitudes = [0.1, 0.2, 0.8, 0.3, 0.1];
    const freqs = [10, 20, 30, 40, 50];
    const peak = findPeak(magnitudes, freqs);
    
    if (peak.frequency !== 30 || peak.magnitude !== 0.8) {
        throw new Error(`Pico incorreto: esperado freq=30, mag=0.8, obtido freq=${peak.frequency}, mag=${peak.magnitude}`);
    }
    
    return { peak: peak };
});

// Teste 3: Análise diagnóstica
fftTests.addTest('Diagnóstico - Desbalanceamento', () => {
    const magnitudes = new Array(100).fill(0.1);
    magnitudes[30] = 0.8; // Pico em 1X RPM
    
    const freqs = Array.from({length: 100}, (_, i) => i * 10);
    const rpm = 1800;
    const peak = { frequency: 300, magnitude: 0.8 };
    
    const diagnosis = performDiagnosticAnalysis(magnitudes, freqs, rpm, peak);
    
    if (!diagnosis.faultDetection.unbalance) {
        throw new Error('Falha ao detectar desbalanceamento');
    }
    
    return { diagnosis: diagnosis.severityLevel };
});

// Teste 4: Cálculo de estatísticas
fftTests.addTest('Estatísticas Avançadas', () => {
    const timeData = [1, 2, 3, 4, 5, 4, 3, 2];
    const magnitudes = [0.1, 0.2, 0.8, 0.3, 0.1];
    const freqs = [10, 20, 30, 40, 50];
    
    const stats = calculateAdvancedStatistics(magnitudes, freqs, timeData);
    
    if (!stats.rms || !stats.crestFactor || !stats.kurtosis) {
        throw new Error('Estatísticas incompletas');
    }
    
    if (stats.rms <= 0 || stats.crestFactor <= 0) {
        throw new Error('Valores estatísticos inválidos');
    }
    
    return { rms: stats.rms, crestFactor: stats.crestFactor };
});

// Teste 5: Função de janelamento
fftTests.addTest('Janelamento - Hamming', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    const windowed = applyWindow(data, 'hamming');
    
    if (windowed.length !== data.length) {
        throw new Error('Janelamento alterou tamanho dos dados');
    }
    
    // Verifica se janela foi aplicada (valores nas bordas devem ser menores)
    if (windowed[0] >= data[0] || windowed[windowed.length-1] >= data[data.length-1]) {
        throw new Error('Janela Hamming não foi aplicada corretamente');
    }
    
    return { original: data[0], windowed: windowed[0] };
});

// Teste 6: Zero padding
fftTests.addTest('Zero Padding', () => {
    const data = [1, 2, 3, 4, 5];
    const padded = padData(data, 8);
    
    if (padded.length !== 8) {
        throw new Error(`Zero padding falhou: esperado 8, obtido ${padded.length}`);
    }
    
    // Verifica se dados originais foram preservados
    for (let i = 0; i < data.length; i++) {
        if (padded[i] !== data[i]) {
            throw new Error('Dados originais foram alterados durante padding');
        }
    }
    
    // Verifica se zeros foram adicionados
    for (let i = data.length; i < padded.length; i++) {
        if (padded[i] !== 0) {
            throw new Error('Padding não foi feito com zeros');
        }
    }
    
    return { originalLength: data.length, paddedLength: padded.length };
});

// Teste 7: Base de dados
fftTests.addTest('Base de Dados - Salvamento', async () => {
    if (!vibrationDB) {
        throw new Error('Base de dados não inicializada');
    }
    
    const testData = {
        peak: { frequency: 100, magnitude: 0.5 },
        diagnostics: { severityLevel: 'Normal' },
        equipment: 'Teste'
    };
    
    await vibrationDB.saveAnalysis(testData);
    const history = await vibrationDB.getAnalysisHistory('Teste', 1);
    
    if (history.length === 0) {
        throw new Error('Dados não foram salvos na base de dados');
    }
    
    return { saved: true, recordCount: history.length };
});

// Função para executar testes automaticamente
function runAutomaticTests() {
    if (typeof fft === 'undefined') {
        console.error('Funções FFT não carregadas - não é possível executar testes');
        return;
    }
    
    fftTests.runAllTests().then(results => {
        const passed = results.filter(r => r.status === 'PASSED').length;
        const total = results.length;
        
        if (passed === total) {
            console.log('🎉 Todos os testes passaram!');
        } else {
            console.warn(`⚠️ ${total - passed} teste(s) falharam`);
        }
    });
}

// Executar testes quando solicitado
window.runFFTTests = runAutomaticTests;
