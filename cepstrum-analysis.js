
// Análise de Cepstrum para Detecção de Periodicidades Complexas
class CepstrumAnalysis {
    constructor() {
        this.cepstrumData = null;
        this.quefrencyDomain = null;
    }

    calculateCepstrum(signal) {
        // Cepstrum real: IFFT(log(|FFT(signal)|))
        const fftResult = fft(signal);
        const magnitudes = fftResult.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        
        // Log do espectro de magnitude
        const logSpectrum = magnitudes.map(mag => Math.log(mag + 1e-10));
        
        // IFFT do log espectrum
        const cepstrum = ifft(logSpectrum.map(val => ({re: val, im: 0})));
        const cepstrumMagnitudes = cepstrum.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        
        // Domínio de quefrência
        const sampleRate = parseFloat(document.getElementById('sample-rate')?.value) || 1000;
        const quefrencies = Array.from({length: cepstrumMagnitudes.length}, (_, i) => 
            i / sampleRate // quefrência em segundos
        );

        this.cepstrumData = cepstrumMagnitudes;
        this.quefrencyDomain = quefrencies;

        return {
            cepstrum: cepstrumMagnitudes,
            quefrencies: quefrencies,
            rahmonics: this.detectRahmonics(cepstrumMagnitudes, quefrencies),
            periodicity: this.analyzePeriodicity(cepstrumMagnitudes, quefrencies)
        };
    }

    detectRahmonics(cepstrum, quefrencies) {
        // Detectar picos no cepstrum (rahmonics)
        const rahmonics = [];
        const threshold = Math.max(...cepstrum) * 0.1;
        
        for (let i = 1; i < cepstrum.length - 1; i++) {
            if (cepstrum[i] > threshold &&
                cepstrum[i] > cepstrum[i-1] &&
                cepstrum[i] > cepstrum[i+1] &&
                quefrencies[i] > 0.001) { // Evitar quefrências muito baixas
                
                rahmonics.push({
                    quefrency: quefrencies[i],
                    magnitude: cepstrum[i],
                    frequency: 1 / quefrencies[i], // Frequência fundamental correspondente
                    interpretation: this.interpretRahmonic(quefrencies[i])
                });
            }
        }
        
        return rahmonics.sort((a, b) => b.magnitude - a.magnitude).slice(0, 10);
    }

    interpretRahmonic(quefrency) {
        const frequency = 1 / quefrency;
        
        if (frequency < 5) return 'Modulação de baixa frequência';
        if (frequency < 50) return 'Possível frequência de engrenagem';
        if (frequency < 200) return 'Frequência de rolamento ou rotor';
        if (frequency < 1000) return 'Frequência de lâmina ou dente';
        return 'Alta frequência';
    }

    analyzePeriodicity(cepstrum, quefrencies) {
        // Analisar periodicidades no sinal
        const periodicities = [];
        
        // Procurar por padrões repetitivos
        for (let i = 1; i < Math.min(cepstrum.length / 4, 100); i++) {
            const period = quefrencies[i];
            const confidence = this.calculatePeriodicityConfidence(cepstrum, i);
            
            if (confidence > 0.3) {
                periodicities.push({
                    period: period,
                    frequency: 1 / period,
                    confidence: confidence,
                    type: this.classifyPeriodicity(period)
                });
            }
        }
        
        return periodicities.sort((a, b) => b.confidence - a.confidence);
    }

    calculatePeriodicityConfidence(cepstrum, index) {
        const value = cepstrum[index];
        const localMean = cepstrum.slice(Math.max(0, index-5), index+6)
                                 .reduce((sum, val) => sum + val, 0) / 11;
        
        return Math.min(value / (localMean + 1e-10), 1.0);
    }

    classifyPeriodicity(period) {
        const frequency = 1 / period;
        
        if (frequency < 10) return 'Modulação';
        if (frequency < 100) return 'Harmônico de baixa ordem';
        if (frequency < 500) return 'Frequência de defeito';
        return 'Alta frequência';
    }

    visualizeCepstrum(containerId) {
        if (!this.cepstrumData || !this.quefrencyDomain) {
            alert('Execute uma análise de cepstrum primeiro');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Criar canvas para visualização
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.border = '1px solid #ccc';
        canvas.style.background = '#000';
        
        const ctx = canvas.getContext('2d');
        
        // Desenhar cepstrum
        this.drawCepstrum(ctx, canvas.width, canvas.height);
        
        container.innerHTML = `
            <h5>Visualização do Cepstrum</h5>
            <p>Eixo X: Quefrência (s) | Eixo Y: Magnitude</p>
        `;
        container.appendChild(canvas);
    }

    drawCepstrum(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const padding = 50;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Desenhar eixos
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // Desenhar dados
        const maxMagnitude = Math.max(...this.cepstrumData);
        const maxQuefrency = Math.max(...this.quefrencyDomain);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.cepstrumData.forEach((magnitude, i) => {
            const x = padding + (this.quefrencyDomain[i] / maxQuefrency) * chartWidth;
            const y = height - padding - (magnitude / maxMagnitude) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Labels dos eixos
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Quefrência (s)', width / 2, height - 10);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Magnitude', 0, 0);
        ctx.restore();
    }
}

// Sistema de Análise de Coerência
class CoherenceAnalysis {
    constructor() {
        this.coherenceData = null;
        this.transferFunction = null;
    }

    calculateCoherence(signal1, signal2) {
        if (signal1.length !== signal2.length) {
            throw new Error('Sinais devem ter o mesmo comprimento');
        }

        const N = signal1.length;
        const fft1 = fft(signal1);
        const fft2 = fft(signal2);
        
        // Densidade espectral cruzada
        const crossSpectrum = fft1.map((c1, i) => ({
            re: c1.re * fft2[i].re + c1.im * fft2[i].im,
            im: c1.im * fft2[i].re - c1.re * fft2[i].im
        }));
        
        // Densidades espectrais próprias
        const autoSpectrum1 = fft1.map(c => c.re * c.re + c.im * c.im);
        const autoSpectrum2 = fft2.map(c => c.re * c.re + c.im * c.im);
        
        // Função de coerência
        const coherence = crossSpectrum.map((cross, i) => {
            const crossMag = cross.re * cross.re + cross.im * cross.im;
            const denom = autoSpectrum1[i] * autoSpectrum2[i];
            return denom > 0 ? crossMag / denom : 0;
        });
        
        // Função de transferência
        const transferFunction = crossSpectrum.map((cross, i) => {
            const denom = autoSpectrum1[i];
            return denom > 0 ? {
                re: cross.re / denom,
                im: cross.im / denom
            } : {re: 0, im: 0};
        });
        
        this.coherenceData = coherence;
        this.transferFunction = transferFunction;
        
        return {
            coherence: coherence,
            transferFunction: transferFunction,
            crossSpectrum: crossSpectrum,
            coherenceQuality: this.assessCoherenceQuality(coherence)
        };
    }

    assessCoherenceQuality(coherence) {
        const meanCoherence = coherence.reduce((sum, val) => sum + val, 0) / coherence.length;
        const highCoherenceCount = coherence.filter(val => val > 0.8).length;
        const qualityRatio = highCoherenceCount / coherence.length;
        
        return {
            meanCoherence: meanCoherence,
            qualityRatio: qualityRatio,
            assessment: qualityRatio > 0.5 ? 'Boa' : qualityRatio > 0.2 ? 'Moderada' : 'Baixa'
        };
    }
}

// Instâncias globais
const cepstrumAnalysis = new CepstrumAnalysis();
const coherenceAnalysis = new CoherenceAnalysis();

window.cepstrumAnalysis = cepstrumAnalysis;
window.coherenceAnalysis = coherenceAnalysis;

console.log('🔬 Sistemas de análise avançada carregados');
