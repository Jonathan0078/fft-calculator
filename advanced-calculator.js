
// Calculadora Avançada para Análise Vibracional
class AdvancedVibrationCalculator {
    constructor() {
        this.constants = {
            GRAVITY: 9.81,
            SPEED_OF_SOUND: 343,
            STEEL_DENSITY: 7850,
            ALUMINUM_DENSITY: 2700
        };
    }

    // Conversões de unidades
    convertUnits = {
        // Velocidade
        mmsToMps: (mms) => mms / 1000,
        mpsToMms: (mps) => mps * 1000,
        
        // Aceleração
        gToMps2: (g) => g * this.constants.GRAVITY,
        mps2ToG: (mps2) => mps2 / this.constants.GRAVITY,
        
        // Frequência
        hzToRpm: (hz) => hz * 60,
        rpmToHz: (rpm) => rpm / 60,
        
        // Temperatura
        celsiusToKelvin: (c) => c + 273.15,
        kelvinToCelsius: (k) => k - 273.15
    };

    // Cálculos de máquinas rotativas
    calculateRotatingMachinery(rpm, bearingData = {}) {
        const rotationFreq = rpm / 60;
        
        // Frequências características padrão
        const defaultBearing = {
            ballCount: 8,
            pitchDiameter: 50,
            ballDiameter: 8,
            contactAngle: 0
        };
        
        const bearing = { ...defaultBearing, ...bearingData };
        
        // Cálculos precisos de frequências de rolamento
        const bd_pd = bearing.ballDiameter / bearing.pitchDiameter;
        const cosAngle = Math.cos(bearing.contactAngle * Math.PI / 180);
        
        const bpfo = (bearing.ballCount / 2) * rotationFreq * (1 - bd_pd * cosAngle);
        const bpfi = (bearing.ballCount / 2) * rotationFreq * (1 + bd_pd * cosAngle);
        const ftf = rotationFreq * (1 - bd_pd * cosAngle) / 2;
        const bsf = (bearing.pitchDiameter / bearing.ballDiameter) * rotationFreq * 
                   (1 - Math.pow(bd_pd * cosAngle, 2)) / 2;

        return {
            rotationFreq,
            bearingFrequencies: {
                BPFO: bpfo,
                BPFI: bpfi,
                FTF: ftf,
                BSF: bsf
            },
            harmonics: Array.from({length: 10}, (_, i) => (i + 1) * rotationFreq)
        };
    }

    // Análise de ressonância
    calculateResonance(mass, stiffness, damping = 0) {
        const naturalFreq = Math.sqrt(stiffness / mass) / (2 * Math.PI);
        const dampingRatio = damping / (2 * Math.sqrt(mass * stiffness));
        const dampedFreq = naturalFreq * Math.sqrt(1 - Math.pow(dampingRatio, 2));
        
        return {
            naturalFrequency: naturalFreq,
            dampedFrequency: dampedFreq,
            dampingRatio: dampingRatio,
            qualityFactor: 1 / (2 * dampingRatio)
        };
    }

    // Análise de transmissão (engrenagens)
    calculateGearAnalysis(inputRpm, gearRatio, teethCount) {
        const outputRpm = inputRpm / gearRatio;
        const gearMeshFreq = (inputRpm / 60) * teethCount.input;
        
        return {
            inputFreq: inputRpm / 60,
            outputFreq: outputRpm / 60,
            gearMeshFrequency: gearMeshFreq,
            modulationFreq: Math.abs((inputRpm - outputRpm) / 60),
            sidebands: [
                gearMeshFreq - (inputRpm / 60),
                gearMeshFreq + (inputRpm / 60),
                gearMeshFreq - (outputRpm / 60),
                gearMeshFreq + (outputRpm / 60)
            ]
        };
    }

    // Análise de correia
    calculateBeltAnalysis(pulleyDiameter, rpm, beltLength) {
        const beltSpeed = (Math.PI * pulleyDiameter * rpm) / 60000; // m/s
        const beltFreq = beltSpeed / beltLength;
        
        return {
            beltSpeed: beltSpeed,
            beltPassFrequency: beltFreq,
            harmonics: Array.from({length: 5}, (_, i) => (i + 1) * beltFreq)
        };
    }

    // Cálculo de índices de severidade (ISO 10816)
    calculateSeverityIndex(rmsVelocity, machineType = 'general') {
        const limits = {
            general: { good: 2.3, satisfactory: 4.5, unsatisfactory: 7.1 },
            largeMachine: { good: 3.5, satisfactory: 7.1, unsatisfactory: 11.0 },
            pump: { good: 2.3, satisfactory: 4.5, unsatisfactory: 7.1 }
        };
        
        const limit = limits[machineType] || limits.general;
        
        let severity = 'Good';
        let color = 'green';
        
        if (rmsVelocity > limit.unsatisfactory) {
            severity = 'Unacceptable';
            color = 'red';
        } else if (rmsVelocity > limit.satisfactory) {
            severity = 'Unsatisfactory';
            color = 'orange';
        } else if (rmsVelocity > limit.good) {
            severity = 'Satisfactory';
            color = 'yellow';
        }
        
        return {
            severity,
            color,
            value: rmsVelocity,
            limits: limit
        };
    }

    // Análise de fase
    calculatePhaseAngle(real, imaginary) {
        return Math.atan2(imaginary, real) * 180 / Math.PI;
    }

    // Análise de coerência
    calculateCoherence(signal1FFT, signal2FFT) {
        const coherence = [];
        
        for (let i = 0; i < signal1FFT.length; i++) {
            const cross = signal1FFT[i].re * signal2FFT[i].re + 
                         signal1FFT[i].im * signal2FFT[i].im;
            const auto1 = signal1FFT[i].re * signal1FFT[i].re + 
                         signal1FFT[i].im * signal1FFT[i].im;
            const auto2 = signal2FFT[i].re * signal2FFT[i].re + 
                         signal2FFT[i].im * signal2FFT[i].im;
            
            coherence[i] = Math.pow(cross, 2) / (auto1 * auto2);
        }
        
        return coherence;
    }

    // Análise de envoltória (Envelope)
    calculateEnvelope(signal) {
        // Implementação simplificada da transformada de Hilbert
        const analytic = this.hilbertTransform(signal);
        return analytic.map(complex => 
            Math.sqrt(complex.re * complex.re + complex.im * complex.im)
        );
    }

    hilbertTransform(signal) {
        // Implementação aproximada da transformada de Hilbert
        const N = signal.length;
        const result = [];
        
        for (let n = 0; n < N; n++) {
            let sum = 0;
            for (let m = 0; m < N; m++) {
                if (m !== n) {
                    sum += signal[m] / (n - m);
                }
            }
            result[n] = {
                re: signal[n],
                im: -sum / Math.PI
            };
        }
        
        return result;
    }

    // Filtros digitais
    applyLowPassFilter(signal, cutoffFreq, sampleRate) {
        const RC = 1 / (2 * Math.PI * cutoffFreq);
        const dt = 1 / sampleRate;
        const alpha = dt / (RC + dt);
        
        const filtered = [signal[0]];
        for (let i = 1; i < signal.length; i++) {
            filtered[i] = alpha * signal[i] + (1 - alpha) * filtered[i - 1];
        }
        
        return filtered;
    }

    applyHighPassFilter(signal, cutoffFreq, sampleRate) {
        const RC = 1 / (2 * Math.PI * cutoffFreq);
        const dt = 1 / sampleRate;
        const alpha = RC / (RC + dt);
        
        const filtered = [signal[0]];
        for (let i = 1; i < signal.length; i++) {
            filtered[i] = alpha * (filtered[i - 1] + signal[i] - signal[i - 1]);
        }
        
        return filtered;
    }

    applyBandPassFilter(signal, lowFreq, highFreq, sampleRate) {
        const highPassed = this.applyHighPassFilter(signal, lowFreq, sampleRate);
        return this.applyLowPassFilter(highPassed, highFreq, sampleRate);
    }

    // Análise de órbita (para máquinas com 2 sensores perpendiculares)
    calculateOrbitAnalysis(xSignal, ySignal) {
        if (xSignal.length !== ySignal.length) {
            throw new Error('Sinais X e Y devem ter o mesmo tamanho');
        }
        
        // Calcula parâmetros da órbita
        const maxX = Math.max(...xSignal.map(Math.abs));
        const maxY = Math.max(...ySignal.map(Math.abs));
        const rmsX = Math.sqrt(xSignal.reduce((sum, val) => sum + val * val, 0) / xSignal.length);
        const rmsY = Math.sqrt(ySignal.reduce((sum, val) => sum + val * val, 0) / ySignal.length);
        
        return {
            majorAxis: Math.max(maxX, maxY),
            minorAxis: Math.min(maxX, maxY),
            rmsX: rmsX,
            rmsY: rmsY,
            eccentricity: Math.sqrt(1 - Math.pow(Math.min(maxX, maxY) / Math.max(maxX, maxY), 2))
        };
    }

    // Análise de impactos
    analyzeImpacts(signal, threshold = null) {
        if (!threshold) {
            const rms = Math.sqrt(signal.reduce((sum, val) => sum + val * val, 0) / signal.length);
            threshold = rms * 3; // 3 sigma como limiar padrão
        }
        
        const impacts = [];
        for (let i = 1; i < signal.length - 1; i++) {
            if (Math.abs(signal[i]) > threshold && 
                Math.abs(signal[i]) > Math.abs(signal[i-1]) && 
                Math.abs(signal[i]) > Math.abs(signal[i+1])) {
                impacts.push({
                    index: i,
                    magnitude: Math.abs(signal[i]),
                    time: i / signal.length // tempo normalizado
                });
            }
        }
        
        return {
            impacts: impacts,
            impactRate: impacts.length,
            threshold: threshold
        };
    }
}

// Instância global da calculadora avançada
const advancedCalc = new AdvancedVibrationCalculator();

// Adiciona funções à interface global
window.advancedCalculator = advancedCalc;
window.calculateRotatingMachinery = advancedCalc.calculateRotatingMachinery.bind(advancedCalc);
window.calculateResonance = advancedCalc.calculateResonance.bind(advancedCalc);
window.calculateGearAnalysis = advancedCalc.calculateGearAnalysis.bind(advancedCalc);
window.calculateSeverityIndex = advancedCalc.calculateSeverityIndex.bind(advancedCalc);
