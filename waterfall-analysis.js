
// Sistema de Análise Waterfall/Cascata
class WaterfallAnalysis {
    constructor() {
        this.waterfallData = [];
        this.maxHistory = 100; // Máximo de linhas no waterfall
        this.canvas = null;
        this.ctx = null;
        this.colorMap = this.generateColorMap();
        this.isActive = false;
    }

    generateColorMap() {
        // Gera mapa de cores para visualização de magnitude
        const colors = [];
        for (let i = 0; i < 256; i++) {
            const ratio = i / 255;
            if (ratio < 0.25) {
                // Azul para preto
                colors.push([0, 0, Math.floor(255 * ratio * 4)]);
            } else if (ratio < 0.5) {
                // Azul para verde
                const localRatio = (ratio - 0.25) * 4;
                colors.push([0, Math.floor(255 * localRatio), 255 - Math.floor(255 * localRatio)]);
            } else if (ratio < 0.75) {
                // Verde para amarelo
                const localRatio = (ratio - 0.5) * 4;
                colors.push([Math.floor(255 * localRatio), 255, 0]);
            } else {
                // Amarelo para vermelho
                const localRatio = (ratio - 0.75) * 4;
                colors.push([255, 255 - Math.floor(255 * localRatio), 0]);
            }
        }
        return colors;
    }

    initializeWaterfall(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        container.innerHTML = `
            <div class="waterfall-container">
                <div class="waterfall-controls">
                    <button id="start-waterfall"><i class="fas fa-wave-square"></i> Iniciar Waterfall</button>
                    <button id="stop-waterfall" disabled><i class="fas fa-stop"></i> Parar</button>
                    <button id="clear-waterfall"><i class="fas fa-trash"></i> Limpar</button>
                    <button id="export-waterfall"><i class="fas fa-save"></i> Exportar</button>
                    <label>
                        Velocidade: <input type="range" id="waterfall-speed" min="100" max="2000" value="500">
                        <span id="speed-value">500ms</span>
                    </label>
                </div>
                <canvas id="waterfall-canvas" width="800" height="600"></canvas>
                <div class="waterfall-legend">
                    <div class="color-scale"></div>
                    <div class="scale-labels">
                        <span>Baixo</span>
                        <span>Médio</span>
                        <span>Alto</span>
                    </div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('waterfall-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupWaterfallControls();
        this.drawColorScale();
        return true;
    }

    setupWaterfallControls() {
        document.getElementById('start-waterfall').addEventListener('click', () => this.startWaterfall());
        document.getElementById('stop-waterfall').addEventListener('click', () => this.stopWaterfall());
        document.getElementById('clear-waterfall').addEventListener('click', () => this.clearWaterfall());
        document.getElementById('export-waterfall').addEventListener('click', () => this.exportWaterfall());
        
        const speedSlider = document.getElementById('waterfall-speed');
        speedSlider.addEventListener('input', (e) => {
            document.getElementById('speed-value').textContent = e.target.value + 'ms';
        });
    }

    startWaterfall() {
        if (!accelerometerCapture) {
            alert('Acelerômetro não disponível para captura contínua');
            return;
        }

        this.isActive = true;
        document.getElementById('start-waterfall').disabled = true;
        document.getElementById('stop-waterfall').disabled = false;

        // Captura contínua para waterfall
        this.waterfallInterval = setInterval(() => {
            if (accelerometerCapture.isCapturing) {
                this.captureSpectrumSlice();
            }
        }, parseInt(document.getElementById('waterfall-speed').value));
    }

    stopWaterfall() {
        this.isActive = false;
        clearInterval(this.waterfallInterval);
        document.getElementById('start-waterfall').disabled = false;
        document.getElementById('stop-waterfall').disabled = true;
    }

    captureSpectrumSlice() {
        const data = accelerometerCapture.getCapturedData();
        if (data.length < 64) return;

        // Pega os últimos 256 pontos
        const recent = data.slice(-256).map(d => d.magnitude);
        const windowed = applyWindow(recent, 'hamming');
        const fftResult = fft(windowed);
        
        const magnitudes = fftResult.slice(0, 128).map(c => 
            Math.sqrt(c.re * c.re + c.im * c.im)
        );

        // Normaliza e adiciona ao waterfall
        const maxMag = Math.max(...magnitudes);
        const normalized = magnitudes.map(mag => mag / maxMag);
        
        this.waterfallData.push({
            spectrum: normalized,
            timestamp: Date.now(),
            maxMagnitude: maxMag
        });

        // Limita histórico
        if (this.waterfallData.length > this.maxHistory) {
            this.waterfallData.shift();
        }

        this.updateWaterfallDisplay();
    }

    updateWaterfallDisplay() {
        if (!this.ctx || this.waterfallData.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const spectrumWidth = this.waterfallData[0].spectrum.length;
        const pixelWidth = this.canvas.width / spectrumWidth;
        const pixelHeight = this.canvas.height / this.maxHistory;

        this.waterfallData.forEach((slice, timeIndex) => {
            slice.spectrum.forEach((magnitude, freqIndex) => {
                const colorIndex = Math.floor(magnitude * 255);
                const color = this.colorMap[colorIndex];
                
                this.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                this.ctx.fillRect(
                    freqIndex * pixelWidth,
                    timeIndex * pixelHeight,
                    pixelWidth,
                    pixelHeight
                );
            });
        });

        // Desenhar eixos e labels
        this.drawWaterfallAxes();
    }

    drawWaterfallAxes() {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#fff';

        // Eixo Y (tempo)
        for (let i = 0; i < 5; i++) {
            const y = (i / 4) * this.canvas.height;
            this.ctx.fillText(`${i * 25}s`, 5, y + 10);
        }

        // Eixo X (frequência)
        for (let i = 0; i < 5; i++) {
            const x = (i / 4) * this.canvas.width;
            this.ctx.fillText(`${i * 125}Hz`, x, this.canvas.height - 5);
        }
    }

    drawColorScale() {
        // Implementar escala de cores na legenda
        setTimeout(() => {
            const scaleDiv = document.querySelector('.color-scale');
            if (scaleDiv) {
                let gradient = 'linear-gradient(to right,';
                for (let i = 0; i < this.colorMap.length; i += 32) {
                    const color = this.colorMap[i];
                    gradient += `rgb(${color[0]}, ${color[1]}, ${color[2]}),`;
                }
                gradient = gradient.slice(0, -1) + ')';
                scaleDiv.style.background = gradient;
                scaleDiv.style.height = '20px';
                scaleDiv.style.border = '1px solid #ccc';
            }
        }, 100);
    }

    exportWaterfall() {
        if (this.waterfallData.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }

        // Exportar como imagem
        const link = document.createElement('a');
        link.download = `waterfall_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    clearWaterfall() {
        this.waterfallData = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Análise de Envelope para Detecção de Modulações
class EnvelopeAnalysis {
    constructor() {
        this.envelopeHistory = [];
    }

    calculateEnvelope(signal) {
        // Filtro passa-altas para remover DC
        const highpassed = this.highPassFilter(signal, 0.1);
        
        // Transformada de Hilbert aproximada
        const analytic = this.hilbertTransform(highpassed);
        
        // Envelope (magnitude do sinal analítico)
        const envelope = analytic.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        
        // FFT do envelope para detectar modulações
        const envelopeFFT = fft(envelope);
        const envelopeMagnitudes = envelopeFFT.slice(0, envelope.length / 2).map(c => 
            Math.sqrt(c.re * c.re + c.im * c.im)
        );

        return {
            envelope: envelope,
            envelopeSpectrum: envelopeMagnitudes,
            modulationFrequencies: this.detectModulationFrequencies(envelopeMagnitudes)
        };
    }

    hilbertTransform(signal) {
        // Aproximação da transformada de Hilbert usando FFT
        const N = signal.length;
        const fftResult = fft(signal);
        
        // Modificar componentes de frequência para Hilbert
        for (let k = 1; k < N/2; k++) {
            fftResult[k].im = -fftResult[k].im;
            fftResult[N-k].im = -fftResult[N-k].im;
        }
        
        return ifft(fftResult);
    }

    highPassFilter(signal, cutoffRatio) {
        // Filtro passa-altas simples
        const alpha = 1 - cutoffRatio;
        const filtered = [signal[0]];
        
        for (let i = 1; i < signal.length; i++) {
            filtered[i] = alpha * (filtered[i-1] + signal[i] - signal[i-1]);
        }
        
        return filtered;
    }

    detectModulationFrequencies(envelopeSpectrum) {
        const peaks = [];
        const threshold = Math.max(...envelopeSpectrum) * 0.1;
        
        for (let i = 1; i < envelopeSpectrum.length - 1; i++) {
            if (envelopeSpectrum[i] > threshold &&
                envelopeSpectrum[i] > envelopeSpectrum[i-1] &&
                envelopeSpectrum[i] > envelopeSpectrum[i+1]) {
                peaks.push({
                    frequency: i,
                    magnitude: envelopeSpectrum[i]
                });
            }
        }
        
        return peaks.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
    }
}

// Sistema de Alertas em Tempo Real
class RealTimeAlerts {
    constructor() {
        this.alertThresholds = {
            vibrationLevel: 5.0, // m/s²
            temperatureRise: 10, // °C
            unbalanceLevel: 3.0,
            bearingCondition: 0.5
        };
        this.alertHistory = [];
        this.notifications = [];
        this.soundEnabled = true;
    }

    checkAlerts(spectralData) {
        const alerts = [];
        const timestamp = new Date();

        // Verificar nível de vibração
        if (spectralData.overallLevel > this.alertThresholds.vibrationLevel) {
            alerts.push({
                type: 'CRITICAL',
                message: `Vibração excessiva: ${spectralData.overallLevel.toFixed(2)} m/s²`,
                timestamp: timestamp,
                action: 'Parar equipamento imediatamente'
            });
        }

        // Verificar desbalanceamento
        if (spectralData.diagnostics?.unbalanceLevel > this.alertThresholds.unbalanceLevel) {
            alerts.push({
                type: 'WARNING',
                message: `Desbalanceamento detectado: ${spectralData.diagnostics.unbalanceLevel.toFixed(2)} mm/s`,
                timestamp: timestamp,
                action: 'Programar balanceamento'
            });
        }

        // Verificar condição de rolamentos
        const bearingDefects = spectralData.diagnostics?.bearingDefects || [];
        if (bearingDefects.length > 0) {
            alerts.push({
                type: 'CRITICAL',
                message: `Defeito em rolamento detectado: ${bearingDefects[0].type}`,
                timestamp: timestamp,
                action: 'Inspeção urgente necessária'
            });
        }

        // Processar alertas
        alerts.forEach(alert => this.processAlert(alert));
        
        return alerts;
    }

    processAlert(alert) {
        // Adicionar ao histórico
        this.alertHistory.push(alert);
        
        // Limitar histórico
        if (this.alertHistory.length > 100) {
            this.alertHistory.shift();
        }

        // Exibir notificação
        this.showNotification(alert);
        
        // Som de alerta
        if (this.soundEnabled && alert.type === 'CRITICAL') {
            this.playAlertSound();
        }

        // Log no console
        console.log(`🚨 ALERTA ${alert.type}: ${alert.message}`);
    }

    showNotification(alert) {
        // Verificar suporte a notificações
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(`Alerta ${alert.type}`, {
                    body: alert.message,
                    icon: '🚨',
                    tag: alert.type
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(`Alerta ${alert.type}`, {
                            body: alert.message,
                            icon: '🚨'
                        });
                    }
                });
            }
        }

        // Notificação visual na interface
        this.createVisualAlert(alert);
    }

    createVisualAlert(alert) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `visual-alert alert-${alert.type.toLowerCase()}`;
        alertDiv.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${alert.type === 'CRITICAL' ? '<i class="fas fa-exclamation-triangle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}</span>
                <span class="alert-title">${alert.type}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="alert-body">
                <p>${alert.message}</p>
                <small>${alert.action}</small>
                <div class="alert-time">${alert.timestamp.toLocaleTimeString('pt-BR')}</div>
            </div>
        `;

        // Adicionar à página
        let alertContainer = document.getElementById('alerts-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alerts-container';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 350px;
            `;
            document.body.appendChild(alertContainer);
        }

        alertContainer.appendChild(alertDiv);

        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 10000);
    }

    playAlertSound() {
        // Gerar som de alerta usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Som de alerta não disponível');
        }
    }

    getAlertSummary() {
        const recent = this.alertHistory.filter(alert => 
            Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000 // Últimas 24h
        );

        return {
            totalAlerts: recent.length,
            criticalAlerts: recent.filter(a => a.type === 'CRITICAL').length,
            warningAlerts: recent.filter(a => a.type === 'WARNING').length,
            infoAlerts: recent.filter(a => a.type === 'INFO').length,
            lastAlert: recent.length > 0 ? recent[recent.length - 1] : null
        };
    }
}

// Análise Estatística Avançada
class AdvancedStatistics {
    constructor() {
        this.statisticalMethods = {
            temporal: this.initializeTemporalStats(),
            spectral: this.initializeSpectralStats(),
            advanced: this.initializeAdvancedStats()
        };
    }

    initializeTemporalStats() {
        return {
            descriptiveStats: true,
            trendAnalysis: true,
            autocorrelation: true,
            crossCorrelation: true
        };
    }

    initializeSpectralStats() {
        return {
            spectralMoments: true,
            coherenceAnalysis: true,
            transferFunction: true,
            spectralKurtosis: true
        };
    }

    initializeAdvancedStats() {
        return {
            higherOrderStatistics: true,
            nonLinearAnalysis: true,
            chaoticAnalysis: true,
            fractalAnalysis: true
        };
    }

    calculateAdvancedStatistics(signal, sampleRate) {
        const stats = {
            temporal: this.calculateTemporalStatistics(signal),
            spectral: this.calculateSpectralStatistics(signal, sampleRate),
            advanced: this.calculateAdvancedMetrics(signal),
            diagnostic: this.generateDiagnosticStatistics(signal)
        };

        return stats;
    }

    calculateTemporalStatistics(signal) {
        const n = signal.length;
        const mean = signal.reduce((sum, val) => sum + val, 0) / n;
        const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        // Skewness (assimetria)
        const skewness = signal.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
        
        // Kurtosis (curtose)
        const kurtosis = signal.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
        
        // RMS
        const rms = Math.sqrt(signal.reduce((sum, val) => sum + val * val, 0) / n);
        
        // Pico
        const peak = Math.max(...signal.map(Math.abs));
        
        // Fator de crista
        const crestFactor = peak / rms;
        
        // Marginal de crista
        const crestMargin = peak / stdDev;
        
        return {
            mean: mean,
            variance: variance,
            stdDev: stdDev,
            skewness: skewness,
            kurtosis: kurtosis,
            rms: rms,
            peak: peak,
            crestFactor: crestFactor,
            crestMargin: crestMargin,
            range: Math.max(...signal) - Math.min(...signal)
        };
    }

    calculateSpectralStatistics(signal, sampleRate) {
        const fftResult = fft(signal);
        const magnitudes = fftResult.slice(0, signal.length / 2).map(c => 
            Math.sqrt(c.re * c.re + c.im * c.im)
        );
        
        const frequencies = Array.from({length: magnitudes.length}, (_, i) => 
            i * sampleRate / signal.length
        );

        // Centróide espectral
        const spectralCentroid = this.calculateSpectralCentroid(magnitudes, frequencies);
        
        // Dispersão espectral
        const spectralSpread = this.calculateSpectralSpread(magnitudes, frequencies, spectralCentroid);
        
        // Inclinação espectral
        const spectralSlope = this.calculateSpectralSlope(magnitudes, frequencies);
        
        // Rolloff espectral
        const spectralRolloff = this.calculateSpectralRolloff(magnitudes, frequencies);
        
        // Entropia espectral
        const spectralEntropy = this.calculateSpectralEntropy(magnitudes);

        return {
            spectralCentroid: spectralCentroid,
            spectralSpread: spectralSpread,
            spectralSlope: spectralSlope,
            spectralRolloff: spectralRolloff,
            spectralEntropy: spectralEntropy,
            bandwidthEfficiency: spectralSpread / spectralCentroid,
            spectralFlatness: this.calculateSpectralFlatness(magnitudes)
        };
    }

    calculateSpectralCentroid(magnitudes, frequencies) {
        const totalMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0);
        if (totalMagnitude === 0) return 0;
        
        return magnitudes.reduce((sum, mag, i) => sum + mag * frequencies[i], 0) / totalMagnitude;
    }

    calculateSpectralSpread(magnitudes, frequencies, centroid) {
        const totalMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0);
        if (totalMagnitude === 0) return 0;
        
        const variance = magnitudes.reduce((sum, mag, i) => 
            sum + mag * Math.pow(frequencies[i] - centroid, 2), 0
        ) / totalMagnitude;
        
        return Math.sqrt(variance);
    }

    calculateSpectralSlope(magnitudes, frequencies) {
        // Regressão linear do espectro em escala log
        const logMags = magnitudes.map(mag => Math.log(mag + 1e-10));
        const logFreqs = frequencies.map(freq => Math.log(freq + 1e-10));
        
        const n = logMags.length;
        const sumX = logFreqs.reduce((sum, x) => sum + x, 0);
        const sumY = logMags.reduce((sum, y) => sum + y, 0);
        const sumXY = logFreqs.reduce((sum, x, i) => sum + x * logMags[i], 0);
        const sumX2 = logFreqs.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    calculateSpectralRolloff(magnitudes, frequencies, percentage = 0.85) {
        const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
        const targetEnergy = totalEnergy * percentage;
        
        let cumulativeEnergy = 0;
        for (let i = 0; i < magnitudes.length; i++) {
            cumulativeEnergy += magnitudes[i] * magnitudes[i];
            if (cumulativeEnergy >= targetEnergy) {
                return frequencies[i];
            }
        }
        
        return frequencies[frequencies.length - 1];
    }

    calculateSpectralEntropy(magnitudes) {
        const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
        if (totalEnergy === 0) return 0;
        
        const probabilities = magnitudes.map(mag => (mag * mag) / totalEnergy);
        
        return -probabilities.reduce((sum, p) => {
            if (p > 0) {
                return sum + p * Math.log2(p);
            }
            return sum;
        }, 0);
    }

    calculateSpectralFlatness(magnitudes) {
        // Média geométrica / Média aritmética
        const arithmeticMean = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length;
        
        const geometricMean = Math.exp(
            magnitudes.reduce((sum, mag) => sum + Math.log(mag + 1e-10), 0) / magnitudes.length
        );
        
        return geometricMean / arithmeticMean;
    }

    generateDiagnosticStatistics(signal) {
        return {
            impulseIndicator: this.calculateImpulseIndicator(signal),
            marginFactor: this.calculateMarginFactor(signal),
            shapeIndicator: this.calculateShapeIndicator(signal),
            normalityTest: this.performNormalityTest(signal)
        };
    }

    calculateImpulseIndicator(signal) {
        const mean = signal.reduce((sum, val) => sum + Math.abs(val), 0) / signal.length;
        const peak = Math.max(...signal.map(Math.abs));
        return peak / mean;
    }

    calculateMarginFactor(signal) {
        const peak = Math.max(...signal.map(Math.abs));
        const squareMean = Math.sqrt(signal.reduce((sum, val) => sum + val * val, 0) / signal.length);
        return peak / squareMean;
    }

    calculateShapeIndicator(signal) {
        const rms = Math.sqrt(signal.reduce((sum, val) => sum + val * val, 0) / signal.length);
        const mean = signal.reduce((sum, val) => sum + Math.abs(val), 0) / signal.length;
        return rms / mean;
    }

    performNormalityTest(signal) {
        // Teste de normalidade simplificado (Shapiro-Wilk aproximado)
        const n = Math.min(signal.length, 100); // Limitar para performance
        const sorted = signal.slice(0, n).sort((a, b) => a - b);
        
        // Calcular estatística W aproximada
        const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
        const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        
        // W estatística simplificada
        const sumOfProducts = sorted.reduce((sum, val, i) => {
            const weight = this.getShapiroWeight(i, n);
            return sum + weight * val;
        }, 0);
        
        const W = Math.pow(sumOfProducts, 2) / (variance * n);
        
        return {
            statistic: W,
            isNormal: W > 0.9, // Limiar simplificado
            pValue: this.approximatePValue(W, n)
        };
    }

    getShapiroWeight(i, n) {
        // Pesos aproximados para teste de Shapiro-Wilk
        const m = Math.floor(n / 2);
        if (i >= m) return 0;
        
        return Math.sqrt(n) * (1 - 2 * i / n);
    }

    approximatePValue(W, n) {
        // Aproximação grosseira do p-value
        if (W > 0.95) return 0.9;
        if (W > 0.90) return 0.5;
        if (W > 0.85) return 0.1;
        return 0.01;
    }
}

// Sistema de Backup e Sincronização
class BackupSystem {
    constructor() {
        this.backupInterval = null;
        this.isAutoBackupEnabled = false;
        this.backupFrequency = 5 * 60 * 1000; // 5 minutos
        this.maxBackups = 10;
    }

    enableAutoBackup() {
        this.isAutoBackupEnabled = true;
        this.backupInterval = setInterval(() => {
            this.createBackup();
        }, this.backupFrequency);
        
        console.log('🔄 Backup automático habilitado');
    }

    disableAutoBackup() {
        this.isAutoBackupEnabled = false;
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        
        console.log('⏹️ Backup automático desabilitado');
    }

    async createBackup() {
        try {
            const backupData = await this.collectBackupData();
            const backup = {
                id: this.generateBackupId(),
                timestamp: new Date(),
                data: backupData,
                version: '2.0'
            };

            // Salvar no localStorage
            this.saveBackupLocally(backup);
            
            // Tentar sincronizar com servidor (simulado)
            await this.syncToCloud(backup);
            
            console.log(`✅ Backup criado: ${backup.id}`);
            return backup.id;
        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            throw error;
        }
    }

    async collectBackupData() {
        const data = {
            equipment: await this.getEquipmentData(),
            analyses: await this.getAnalysesData(),
            baselines: await this.getBaselinesData(),
            settings: this.getSettingsData(),
            waterfallHistory: waterfallAnalysis?.waterfallData || [],
            alertHistory: realTimeAlerts?.alertHistory || []
        };

        return data;
    }

    async getEquipmentData() {
        if (vibrationDB) {
            return await vibrationDB.getEquipmentList();
        }
        return [];
    }

    async getAnalysesData() {
        if (vibrationDB) {
            return await vibrationDB.getAnalysisHistory();
        }
        return [];
    }

    async getBaselinesData() {
        return JSON.parse(localStorage.getItem('baselineData') || '{}');
    }

    getSettingsData() {
        return {
            sampleRate: document.getElementById('sample-rate')?.value,
            windowFunction: document.getElementById('window-function')?.value,
            analysisType: document.getElementById('analysis-type')?.value,
            sensitivity: document.getElementById('sensitivity')?.value
        };
    }

    generateBackupId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    saveBackupLocally(backup) {
        const existingBackups = JSON.parse(localStorage.getItem('vibrationBackups') || '[]');
        existingBackups.push(backup);
        
        // Limitar número de backups
        if (existingBackups.length > this.maxBackups) {
            existingBackups.splice(0, existingBackups.length - this.maxBackups);
        }
        
        localStorage.setItem('vibrationBackups', JSON.stringify(existingBackups));
    }

    async syncToCloud(backup) {
        // Simulação de sincronização com nuvem
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`☁️ Backup ${backup.id} sincronizado com a nuvem (simulado)`);
                resolve(true);
            }, 1000);
        });
    }

    async restoreBackup(backupId) {
        try {
            const backup = await this.getBackup(backupId);
            if (!backup) {
                throw new Error('Backup não encontrado');
            }

            // Restaurar dados
            await this.restoreData(backup.data);
            
            console.log(`✅ Backup ${backupId} restaurado com sucesso`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            throw error;
        }
    }

    async getBackup(backupId) {
        const backups = JSON.parse(localStorage.getItem('vibrationBackups') || '[]');
        return backups.find(backup => backup.id === backupId);
    }

    async restoreData(data) {
        // Restaurar equipamentos
        if (data.equipment && vibrationDB) {
            for (const equipment of data.equipment) {
                await vibrationDB.saveEquipment(equipment);
            }
        }

        // Restaurar baselines
        if (data.baselines) {
            localStorage.setItem('baselineData', JSON.stringify(data.baselines));
        }

        // Restaurar configurações
        if (data.settings) {
            Object.entries(data.settings).forEach(([key, value]) => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = value;
                }
            });
        }
    }

    getBackupList() {
        const backups = JSON.parse(localStorage.getItem('vibrationBackups') || '[]');
        return backups.map(backup => ({
            id: backup.id,
            timestamp: backup.timestamp,
            version: backup.version,
            size: JSON.stringify(backup).length
        }));
    }

    exportAllBackups() {
        const backups = JSON.parse(localStorage.getItem('vibrationBackups') || '[]');
        const dataStr = JSON.stringify(backups, null, 2);
        
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibration_backups_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Instâncias globais
const waterfallAnalysis = new WaterfallAnalysis();
const envelopeAnalysis = new EnvelopeAnalysis();
const realTimeAlerts = new RealTimeAlerts();
const advancedStatistics = new AdvancedStatistics();
const backupSystem = new BackupSystem();

// Exportar para uso global
window.waterfallAnalysis = waterfallAnalysis;
window.envelopeAnalysis = envelopeAnalysis;
window.realTimeAlerts = realTimeAlerts;
window.advancedStatistics = advancedStatistics;
window.backupSystem = backupSystem;

console.log('🚀 Sistema de análise waterfall e alertas carregado');
