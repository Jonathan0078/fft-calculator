
// Módulo de Acelerômetro para Análise de Vibrações
class AccelerometerCapture {
    constructor() {
        this.isCapturing = false;
        this.capturedData = [];
        this.sampleRate = 100; // Hz
        this.captureInterval = null;
        this.sensitivity = 'medium';
        this.startTime = null;
        this.duration = 10; // segundos
        
        // Configurações de sensibilidade
        this.sensitivitySettings = {
            low: { multiplier: 0.5, threshold: 0.1 },
            medium: { multiplier: 1.0, threshold: 0.05 },
            high: { multiplier: 2.0, threshold: 0.01 }
        };
        
        this.initializeControls();
        this.checkSensorAvailability();
    }
    
    async checkSensorAvailability() {
        const statusElement = document.getElementById('sensor-status-text');
        const indicatorElement = document.getElementById('sensor-indicator');
        
        if ('DeviceMotionEvent' in window) {
            try {
                // Verificar se precisamos de permissão (iOS 13+)
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    const permission = await DeviceMotionEvent.requestPermission();
                    if (permission === 'granted') {
                        statusElement.textContent = 'Sensor Disponível';
                        indicatorElement.classList.add('active');
                    } else {
                        statusElement.textContent = 'Permissão Negada';
                    }
                } else {
                    // Android ou iOS mais antigo
                    statusElement.textContent = 'Sensor Disponível';
                    indicatorElement.classList.add('active');
                }
            } catch (error) {
                console.error('Erro ao verificar sensor:', error);
                statusElement.textContent = 'Erro no Sensor';
            }
        } else {
            statusElement.textContent = 'Sensor Não Suportado';
        }
    }
    
    initializeControls() {
        const startBtn = document.getElementById('start-sensor-btn');
        const stopBtn = document.getElementById('stop-sensor-btn');
        const sensitivitySelect = document.getElementById('sensitivity');
        const durationInput = document.getElementById('capture-duration');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startCapture());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopCapture());
        }
        
        if (sensitivitySelect) {
            sensitivitySelect.addEventListener('change', (e) => {
                this.sensitivity = e.target.value;
            });
        }
        
        if (durationInput) {
            durationInput.addEventListener('change', (e) => {
                this.duration = parseFloat(e.target.value);
            });
        }
    }
    
    async startCapture() {
        if (this.isCapturing) return;
        
        // Verificar permissões novamente se necessário
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission !== 'granted') {
                alert('Permissão do acelerômetro é necessária para capturar vibrações');
                return;
            }
        }
        
        this.isCapturing = true;
        this.capturedData = [];
        this.startTime = Date.now();
        
        // Atualizar interface
        document.getElementById('start-sensor-btn').disabled = true;
        document.getElementById('stop-sensor-btn').disabled = false;
        document.getElementById('sensor-status-text').textContent = 'Capturando...';
        
        // Iniciar captura
        window.addEventListener('devicemotion', this.handleMotionEvent.bind(this));
        
        // Auto-parar após duração especificada
        setTimeout(() => {
            if (this.isCapturing) {
                this.stopCapture();
            }
        }, this.duration * 1000);
        
        console.log(`Iniciando captura por ${this.duration} segundos`);
    }
    
    stopCapture() {
        if (!this.isCapturing) return;
        
        this.isCapturing = false;
        window.removeEventListener('devicemotion', this.handleMotionEvent.bind(this));
        
        // Atualizar interface
        document.getElementById('start-sensor-btn').disabled = false;
        document.getElementById('stop-sensor-btn').disabled = true;
        document.getElementById('sensor-status-text').textContent = 'Captura Concluída';
        
        // Processar dados capturados
        this.processAndDisplayData();
        
        console.log(`Captura finalizada. ${this.capturedData.length} amostras coletadas`);
    }
    
    handleMotionEvent(event) {
        if (!this.isCapturing) return;
        
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;
        
        const settings = this.sensitivitySettings[this.sensitivity];
        const timestamp = Date.now();
        
        // Calcular magnitude total da aceleração
        const x = (acceleration.x || 0) * settings.multiplier;
        const y = (acceleration.y || 0) * settings.multiplier;
        const z = (acceleration.z || 0) * settings.multiplier;
        
        // Remover componente gravitacional aproximada
        const magnitude = Math.sqrt(x*x + y*y + z*z) - 9.81;
        
        // Filtrar ruído baseado no threshold
        if (Math.abs(magnitude) > settings.threshold) {
            this.capturedData.push({
                timestamp: timestamp - this.startTime,
                x: x,
                y: y,
                z: z,
                magnitude: magnitude
            });
        }
        
        // Atualizar display em tempo real
        this.updateDisplay(x, y, z, magnitude);
    }
    
    updateDisplay(x, y, z, magnitude) {
        document.getElementById('vibration-display').textContent = 
            `${Math.abs(magnitude).toFixed(3)} m/s²`;
        document.getElementById('accel-x').textContent = x.toFixed(2);
        document.getElementById('accel-y').textContent = y.toFixed(2);
        document.getElementById('accel-z').textContent = z.toFixed(2);
    }
    
    processAndDisplayData() {
        if (this.capturedData.length === 0) {
            alert('Nenhum dado de vibração foi capturado. Tente aumentar a sensibilidade.');
            return;
        }
        
        // Calcular taxa de amostragem real
        const totalTime = this.capturedData[this.capturedData.length - 1].timestamp / 1000;
        const realSampleRate = this.capturedData.length / totalTime;
        
        console.log(`Taxa de amostragem real: ${realSampleRate.toFixed(1)} Hz`);
        
        // Preparar dados para análise FFT
        const timeData = this.capturedData.map(sample => sample.magnitude);
        const timeArray = this.capturedData.map(sample => sample.timestamp / 1000);
        
        // Interpolar para taxa de amostragem uniforme se necessário
        const uniformData = this.interpolateToUniformSampling(timeData, timeArray, realSampleRate);
        
        // Atualizar campo de dados na interface
        const timeDataField = document.getElementById('time-data');
        if (timeDataField) {
            timeDataField.value = uniformData.join(', ');
        }
        
        // Atualizar taxa de amostragem
        const sampleRateField = document.getElementById('sample-rate');
        if (sampleRateField) {
            sampleRateField.value = Math.round(realSampleRate);
        }
        
        // Mostrar estatísticas da captura
        this.showCaptureStatistics(uniformData, realSampleRate);
        
        // Trigger análise automática se desejado
        const autoAnalyze = confirm('Dados capturados com sucesso! Deseja executar a análise FFT automaticamente?');
        if (autoAnalyze) {
            setTimeout(() => {
                const calculateBtn = document.getElementById('calculate-btn');
                if (calculateBtn) calculateBtn.click();
            }, 500);
        }
    }
    
    interpolateToUniformSampling(data, timeArray, targetSampleRate) {
        if (data.length < 2) return data;
        
        const targetInterval = 1 / targetSampleRate;
        const totalDuration = timeArray[timeArray.length - 1];
        const numSamples = Math.floor(totalDuration / targetInterval);
        
        const uniformData = [];
        
        for (let i = 0; i < numSamples; i++) {
            const targetTime = i * targetInterval;
            
            // Encontrar pontos adjacentes para interpolação
            let lowerIndex = 0;
            for (let j = 0; j < timeArray.length - 1; j++) {
                if (timeArray[j] <= targetTime && timeArray[j + 1] > targetTime) {
                    lowerIndex = j;
                    break;
                }
            }
            
            const upperIndex = Math.min(lowerIndex + 1, timeArray.length - 1);
            
            if (lowerIndex === upperIndex) {
                uniformData.push(data[lowerIndex]);
            } else {
                // Interpolação linear
                const t = (targetTime - timeArray[lowerIndex]) / (timeArray[upperIndex] - timeArray[lowerIndex]);
                const interpolatedValue = data[lowerIndex] + t * (data[upperIndex] - data[lowerIndex]);
                uniformData.push(interpolatedValue);
            }
        }
        
        return uniformData;
    }
    
    showCaptureStatistics(data, sampleRate) {
        const stats = this.calculateStatistics(data);
        
        const alertsSection = document.getElementById('alerts-output');
        if (alertsSection) {
            alertsSection.innerHTML += `
                <div class="alert-item alert-info">
                    <strong>📱 Dados do Acelerômetro Capturados:</strong><br>
                    <small>
                        • Amostras: ${data.length}<br>
                        • Taxa: ${sampleRate.toFixed(1)} Hz<br>
                        • Duração: ${(data.length / sampleRate).toFixed(1)}s<br>
                        • RMS: ${stats.rms.toFixed(4)} m/s²<br>
                        • Pico: ${stats.peak.toFixed(4)} m/s²<br>
                        • Sensibilidade: ${this.sensitivity}
                    </small>
                </div>
            `;
        }
    }
    
    calculateStatistics(data) {
        if (data.length === 0) return { rms: 0, peak: 0, mean: 0 };
        
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
        const peak = Math.max(...data.map(Math.abs));
        
        return { mean, rms, peak };
    }
    
    // Método para obter dados capturados
    getCapturedData() {
        return this.capturedData;
    }
    
    // Método para exportar dados brutos
    exportRawData() {
        if (this.capturedData.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }
        
        const csv = 'Timestamp(ms),X(m/s²),Y(m/s²),Z(m/s²),Magnitude(m/s²)\n' +
            this.capturedData.map(sample => 
                `${sample.timestamp},${sample.x},${sample.y},${sample.z},${sample.magnitude}`
            ).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accelerometer_data_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Instância global
let accelerometerCapture = null;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    accelerometerCapture = new AccelerometerCapture();
    console.log('Módulo de acelerômetro inicializado');
});

// Exportar para uso global
window.accelerometerCapture = accelerometerCapture;
