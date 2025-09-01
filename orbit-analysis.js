
// Análise de Órbita Avançada para Máquinas Rotativas
class OrbitAnalysis {
    constructor() {
        this.orbitCanvas = null;
        this.orbitCtx = null;
        this.orbitData = [];
        this.isCapturing = false;
        this.captureInterval = null;
    }

    initializeOrbitAnalysis(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        // Criar canvas para órbita
        this.orbitCanvas = document.createElement('canvas');
        this.orbitCanvas.width = 400;
        this.orbitCanvas.height = 400;
        this.orbitCanvas.style.border = '1px solid #ccc';
        this.orbitCanvas.style.background = '#000';
        
        container.appendChild(this.orbitCanvas);
        this.orbitCtx = this.orbitCanvas.getContext('2d');

        this.setupOrbitControls(container);
        return true;
    }

    setupOrbitControls(container) {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <div style="margin-top: 10px;">
                <button id="start-orbit-btn">🔄 Iniciar Análise de Órbita</button>
                <button id="stop-orbit-btn" disabled>⏹️ Parar</button>
                <button id="analyze-orbit-btn" disabled>📊 Analisar Órbita</button>
                <select id="orbit-mode">
                    <option value="realtime">Tempo Real</option>
                    <option value="filtered">Filtrado 1X</option>
                    <option value="2x">Filtrado 2X</option>
                </select>
            </div>
            <div id="orbit-results" style="margin-top: 10px;"></div>
        `;
        container.appendChild(controls);

        document.getElementById('start-orbit-btn').addEventListener('click', () => this.startOrbitCapture());
        document.getElementById('stop-orbit-btn').addEventListener('click', () => this.stopOrbitCapture());
        document.getElementById('analyze-orbit-btn').addEventListener('click', () => this.analyzeOrbit());
    }

    startOrbitCapture() {
        if (!accelerometerCapture) {
            alert('Acelerômetro não disponível');
            return;
        }

        this.isCapturing = true;
        this.orbitData = [];
        
        document.getElementById('start-orbit-btn').disabled = true;
        document.getElementById('stop-orbit-btn').disabled = false;

        // Simular captura de dois sensores perpendiculares
        this.captureInterval = setInterval(() => {
            if (accelerometerCapture.isCapturing) {
                const data = accelerometerCapture.getCapturedData();
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    this.orbitData.push({
                        x: latest.x,
                        y: latest.y,
                        timestamp: latest.timestamp
                    });
                    
                    this.updateOrbitDisplay();
                }
            }
        }, 50);
    }

    stopOrbitCapture() {
        this.isCapturing = false;
        clearInterval(this.captureInterval);
        
        document.getElementById('start-orbit-btn').disabled = false;
        document.getElementById('stop-orbit-btn').disabled = true;
        document.getElementById('analyze-orbit-btn').disabled = false;
    }

    updateOrbitDisplay() {
        if (!this.orbitCtx || this.orbitData.length < 2) return;

        this.orbitCtx.clearRect(0, 0, this.orbitCanvas.width, this.orbitCanvas.height);
        
        // Configurar sistema de coordenadas
        const centerX = this.orbitCanvas.width / 2;
        const centerY = this.orbitCanvas.height / 2;
        const scale = 50;

        // Desenhar eixos
        this.orbitCtx.strokeStyle = '#444';
        this.orbitCtx.lineWidth = 1;
        this.orbitCtx.beginPath();
        this.orbitCtx.moveTo(0, centerY);
        this.orbitCtx.lineTo(this.orbitCanvas.width, centerY);
        this.orbitCtx.moveTo(centerX, 0);
        this.orbitCtx.lineTo(centerX, this.orbitCanvas.height);
        this.orbitCtx.stroke();

        // Desenhar círculos de referência
        [0.5, 1.0, 1.5, 2.0].forEach(radius => {
            this.orbitCtx.strokeStyle = '#333';
            this.orbitCtx.lineWidth = 0.5;
            this.orbitCtx.beginPath();
            this.orbitCtx.arc(centerX, centerY, radius * scale, 0, 2 * Math.PI);
            this.orbitCtx.stroke();
        });

        // Desenhar órbita
        if (this.orbitData.length > 1) {
            this.orbitCtx.strokeStyle = '#00ff00';
            this.orbitCtx.lineWidth = 2;
            this.orbitCtx.beginPath();
            
            for (let i = 0; i < this.orbitData.length; i++) {
                const point = this.orbitData[i];
                const x = centerX + point.x * scale;
                const y = centerY - point.y * scale; // Inverter Y
                
                if (i === 0) {
                    this.orbitCtx.moveTo(x, y);
                } else {
                    this.orbitCtx.lineTo(x, y);
                }
            }
            this.orbitCtx.stroke();

            // Marcar ponto atual
            const current = this.orbitData[this.orbitData.length - 1];
            const currentX = centerX + current.x * scale;
            const currentY = centerY - current.y * scale;
            
            this.orbitCtx.fillStyle = '#ff0000';
            this.orbitCtx.beginPath();
            this.orbitCtx.arc(currentX, currentY, 3, 0, 2 * Math.PI);
            this.orbitCtx.fill();
        }
    }

    analyzeOrbit() {
        if (this.orbitData.length < 100) {
            alert('Dados insuficientes para análise. Capture mais dados.');
            return;
        }

        const analysis = this.performOrbitAnalysis();
        this.displayOrbitResults(analysis);
    }

    performOrbitAnalysis() {
        const xData = this.orbitData.map(d => d.x);
        const yData = this.orbitData.map(d => d.y);

        // Parâmetros básicos da órbita
        const maxX = Math.max(...xData.map(Math.abs));
        const maxY = Math.max(...yData.map(Math.abs));
        const rmsX = Math.sqrt(xData.reduce((sum, x) => sum + x*x, 0) / xData.length);
        const rmsY = Math.sqrt(yData.reduce((sum, y) => sum + y*y, 0) / yData.length);

        // Direção de rotação
        const direction = this.calculateRotationDirection(xData, yData);
        
        // Elipticidade
        const eccentricity = this.calculateEccentricity(xData, yData);
        
        // Análise harmônica da órbita
        const harmonicAnalysis = this.analyzeOrbitHarmonics(xData, yData);
        
        // Detecção de instabilidades
        const stability = this.analyzeStability(xData, yData);
        
        // Diagnóstico baseado na órbita
        const diagnosis = this.diagnoseFromOrbit(maxX, maxY, eccentricity, direction, stability);

        return {
            dimensions: { maxX, maxY, rmsX, rmsY },
            direction: direction,
            eccentricity: eccentricity,
            harmonics: harmonicAnalysis,
            stability: stability,
            diagnosis: diagnosis,
            dataPoints: this.orbitData.length
        };
    }

    calculateRotationDirection(xData, yData) {
        let sumCross = 0;
        
        for (let i = 1; i < Math.min(xData.length, 100); i++) {
            const dx = xData[i] - xData[i-1];
            const dy = yData[i] - yData[i-1];
            sumCross += xData[i-1] * dy - yData[i-1] * dx;
        }
        
        return sumCross > 0 ? 'Horário' : 'Anti-horário';
    }

    calculateEccentricity(xData, yData) {
        const maxX = Math.max(...xData.map(Math.abs));
        const maxY = Math.max(...yData.map(Math.abs));
        const a = Math.max(maxX, maxY);
        const b = Math.min(maxX, maxY);
        
        if (a === 0) return 0;
        return Math.sqrt(1 - (b*b)/(a*a));
    }

    analyzeOrbitHarmonics(xData, yData) {
        // FFT simplificado para análise harmônica
        const N = Math.min(256, xData.length);
        const xFFT = this.simpleFFT(xData.slice(0, N));
        const yFFT = this.simpleFFT(yData.slice(0, N));
        
        return {
            fundamental: { x: xFFT[1], y: yFFT[1] },
            secondHarmonic: { x: xFFT[2], y: yFFT[2] },
            thirdHarmonic: { x: xFFT[3], y: yFFT[3] }
        };
    }

    simpleFFT(data) {
        // Implementação simplificada para componentes principais
        const N = data.length;
        const result = [];
        
        for (let k = 0; k < Math.min(N/2, 10); k++) {
            let real = 0, imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += data[n] * Math.cos(angle);
                imag += data[n] * Math.sin(angle);
            }
            result[k] = Math.sqrt(real*real + imag*imag) / N;
        }
        
        return result;
    }

    analyzeStability(xData, yData) {
        // Análise de estabilidade baseada em variação da amplitude
        const windowSize = Math.floor(xData.length / 10);
        const amplitudes = [];
        
        for (let i = 0; i < xData.length - windowSize; i += windowSize) {
            const xWindow = xData.slice(i, i + windowSize);
            const yWindow = yData.slice(i, i + windowSize);
            const amplitude = Math.sqrt(
                xWindow.reduce((sum, x) => sum + x*x, 0) + 
                yWindow.reduce((sum, y) => sum + y*y, 0)
            ) / windowSize;
            amplitudes.push(amplitude);
        }
        
        const meanAmplitude = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
        const stdAmplitude = Math.sqrt(
            amplitudes.reduce((sum, a) => sum + Math.pow(a - meanAmplitude, 2), 0) / amplitudes.length
        );
        
        const stabilityIndex = stdAmplitude / meanAmplitude;
        
        return {
            stable: stabilityIndex < 0.1,
            stabilityIndex: stabilityIndex,
            classification: this.classifyStability(stabilityIndex)
        };
    }

    classifyStability(index) {
        if (index < 0.05) return 'Muito Estável';
        if (index < 0.1) return 'Estável';
        if (index < 0.2) return 'Moderadamente Instável';
        return 'Instável';
    }

    diagnoseFromOrbit(maxX, maxY, eccentricity, direction, stability) {
        const diagnoses = [];
        
        // Desbalanceamento
        if (eccentricity < 0.3 && maxX > 0.5) {
            diagnoses.push({
                condition: 'Desbalanceamento',
                confidence: 0.8,
                evidence: 'Órbita circular com amplitude significativa'
            });
        }
        
        // Desalinhamento
        if (eccentricity > 0.7) {
            diagnoses.push({
                condition: 'Desalinhamento',
                confidence: 0.7,
                evidence: 'Órbita elíptica acentuada'
            });
        }
        
        // Instabilidade
        if (!stability.stable) {
            diagnoses.push({
                condition: 'Instabilidade',
                confidence: 0.6,
                evidence: `Variação de amplitude: ${stability.classification}`
            });
        }
        
        // Roçamento
        if (maxX > 2.0 || maxY > 2.0) {
            diagnoses.push({
                condition: 'Possível Roçamento',
                confidence: 0.5,
                evidence: 'Amplitude excessiva detectada'
            });
        }
        
        return diagnoses;
    }

    displayOrbitResults(analysis) {
        const resultsDiv = document.getElementById('orbit-results');
        
        let html = `
            <h4>Resultados da Análise de Órbita</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h5>Parâmetros da Órbita</h5>
                    <p><strong>Amplitude Máx X:</strong> ${analysis.dimensions.maxX.toFixed(3)} m/s²</p>
                    <p><strong>Amplitude Máx Y:</strong> ${analysis.dimensions.maxY.toFixed(3)} m/s²</p>
                    <p><strong>RMS X:</strong> ${analysis.dimensions.rmsX.toFixed(3)} m/s²</p>
                    <p><strong>RMS Y:</strong> ${analysis.dimensions.rmsY.toFixed(3)} m/s²</p>
                    <p><strong>Direção:</strong> ${analysis.direction}</p>
                    <p><strong>Excentricidade:</strong> ${analysis.eccentricity.toFixed(3)}</p>
                </div>
                <div>
                    <h5>Estabilidade</h5>
                    <p><strong>Status:</strong> ${analysis.stability.classification}</p>
                    <p><strong>Índice:</strong> ${analysis.stability.stabilityIndex.toFixed(3)}</p>
                    <p><strong>Pontos Analisados:</strong> ${analysis.dataPoints}</p>
                </div>
            </div>
        `;
        
        if (analysis.diagnosis.length > 0) {
            html += `<h5>Diagnósticos Detectados</h5><ul>`;
            analysis.diagnosis.forEach(diag => {
                html += `<li><strong>${diag.condition}</strong> (${(diag.confidence*100).toFixed(0)}% confiança): ${diag.evidence}</li>`;
            });
            html += `</ul>`;
        }
        
        resultsDiv.innerHTML = html;
    }
}

// Instância global
const orbitAnalysis = new OrbitAnalysis();
window.orbitAnalysis = orbitAnalysis;
