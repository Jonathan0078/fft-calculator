
// Sistema de Inteligência Artificial para Diagnóstico Vibracional
class AIVibrationDiagnostic {
    constructor() {
        this.patternDatabase = this.initializePatternDatabase();
        this.neuralNetwork = this.initializeSimpleNN();
        this.confidence = 0;
        this.learningRate = 0.01;
    }

    initializePatternDatabase() {
        return {
            unbalance: {
                patterns: [
                    { harmonics: [1], threshold: 0.3, confidence: 0.85 },
                    { harmonics: [1, 2], threshold: 0.25, confidence: 0.75 }
                ],
                symptoms: ['Vibração 1X RPM', 'Amplitude constante', 'Fase estável']
            },
            misalignment: {
                patterns: [
                    { harmonics: [2, 3], threshold: 0.4, confidence: 0.80 },
                    { harmonics: [1, 2, 3], threshold: 0.3, confidence: 0.70 }
                ],
                symptoms: ['Vibração 2X RPM dominante', 'Vibração axial alta', 'Temperatura elevada']
            },
            bearing: {
                patterns: [
                    { frequencies: ['BPFO', 'BPFI'], threshold: 0.2, confidence: 0.90 },
                    { frequencies: ['BSF', 'FTF'], threshold: 0.15, confidence: 0.85 }
                ],
                symptoms: ['Ruído de alta frequência', 'Modulação AM', 'Impactos periódicos']
            },
            looseness: {
                patterns: [
                    { harmonics: [1, 2, 3, 4, 5, 6], threshold: 0.15, confidence: 0.75 }
                ],
                symptoms: ['Múltiplos harmônicos', 'Fase instável', 'Não linearidade']
            },
            cavitation: {
                patterns: [
                    { randomNoise: true, broadband: true, threshold: 0.1, confidence: 0.70 }
                ],
                symptoms: ['Ruído de banda larga', 'Erosão', 'Queda de performance']
            }
        };
    }

    initializeSimpleNN() {
        // Rede neural simples para classificação
        return {
            weights: {
                input: Array(10).fill().map(() => Array(5).fill().map(() => Math.random() - 0.5)),
                hidden: Array(5).fill().map(() => Array(3).fill().map(() => Math.random() - 0.5)),
                output: Array(3).fill().map(() => Math.random() - 0.5)
            },
            biases: {
                hidden: Array(5).fill().map(() => Math.random() - 0.5),
                output: Array(3).fill().map(() => Math.random() - 0.5)
            }
        };
    }

    analyzeWithAI(spectralData) {
        const features = this.extractFeatures(spectralData);
        const patternResults = this.patternMatching(spectralData);
        const nnResults = this.neuralNetworkAnalysis(features);
        
        const combinedResults = this.combineResults(patternResults, nnResults);
        const recommendations = this.generateRecommendations(combinedResults);
        
        return {
            diagnosis: combinedResults,
            confidence: this.confidence,
            recommendations: recommendations,
            trends: this.analyzeTrends(spectralData),
            riskLevel: this.calculateRiskLevel(combinedResults)
        };
    }

    extractFeatures(spectralData) {
        const { magnitudes, frequencies, diagnostics } = spectralData;
        
        return {
            peakRatio: this.calculatePeakRatio(magnitudes),
            harmonicRatio: this.calculateHarmonicRatio(magnitudes, frequencies, diagnostics.rotationFreq),
            spectralKurtosis: this.calculateSpectralKurtosis(magnitudes),
            spectralSkewness: this.calculateSpectralSkewness(magnitudes),
            energyDistribution: this.calculateEnergyDistribution(magnitudes),
            modulationDepth: this.calculateModulationDepth(magnitudes, frequencies),
            noiseFloor: this.calculateNoiseFloor(magnitudes),
            peakSharpness: this.calculatePeakSharpness(magnitudes),
            spectralCentroid: this.calculateSpectralCentroid(magnitudes, frequencies),
            spectralRolloff: this.calculateSpectralRolloff(magnitudes, frequencies)
        };
    }

    patternMatching(spectralData) {
        const results = {};
        const { magnitudes, frequencies, diagnostics } = spectralData;
        
        Object.keys(this.patternDatabase).forEach(fault => {
            const patterns = this.patternDatabase[fault].patterns;
            let maxConfidence = 0;
            
            patterns.forEach(pattern => {
                const confidence = this.matchPattern(pattern, magnitudes, frequencies, diagnostics);
                maxConfidence = Math.max(maxConfidence, confidence);
            });
            
            results[fault] = {
                detected: maxConfidence > 0.5,
                confidence: maxConfidence,
                symptoms: this.patternDatabase[fault].symptoms
            };
        });
        
        return results;
    }

    neuralNetworkAnalysis(features) {
        const input = Object.values(features);
        const hidden = this.activateLayer(input, this.neuralNetwork.weights.input, this.neuralNetwork.biases.hidden);
        const output = this.activateLayer(hidden, this.neuralNetwork.weights.hidden, this.neuralNetwork.biases.output);
        
        return {
            severity: output[0],
            urgency: output[1],
            probability: output[2]
        };
    }

    activateLayer(input, weights, biases) {
        return weights.map((neuronWeights, i) => {
            const sum = neuronWeights.reduce((acc, weight, j) => acc + weight * input[j], 0) + biases[i];
            return this.sigmoid(sum);
        });
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    matchPattern(pattern, magnitudes, frequencies, diagnostics) {
        if (pattern.harmonics) {
            return this.matchHarmonicPattern(pattern, magnitudes, frequencies, diagnostics.rotationFreq);
        } else if (pattern.frequencies) {
            return this.matchFrequencyPattern(pattern, magnitudes, frequencies, diagnostics.bearingFrequencies);
        } else if (pattern.randomNoise) {
            return this.matchNoisePattern(pattern, magnitudes);
        }
        return 0;
    }

    matchHarmonicPattern(pattern, magnitudes, frequencies, rotationFreq) {
        let totalEnergy = 0;
        let harmonicEnergy = 0;
        
        pattern.harmonics.forEach(harmonic => {
            const targetFreq = rotationFreq * harmonic;
            const index = this.findClosestIndex(frequencies, targetFreq);
            if (index !== -1) {
                harmonicEnergy += magnitudes[index];
            }
        });
        
        totalEnergy = magnitudes.reduce((sum, mag) => sum + mag, 0);
        const ratio = harmonicEnergy / totalEnergy;
        
        return ratio > pattern.threshold ? pattern.confidence * (ratio / pattern.threshold) : 0;
    }

    generateRecommendations(diagnosis) {
        const recommendations = [];
        
        Object.keys(diagnosis).forEach(fault => {
            if (diagnosis[fault].detected && diagnosis[fault].confidence > 0.6) {
                switch (fault) {
                    case 'unbalance':
                        recommendations.push({
                            priority: 'High',
                            action: 'Balanceamento do rotor',
                            timeframe: '1-2 semanas',
                            cost: 'Médio',
                            impact: 'Redução de vibração 60-80%'
                        });
                        break;
                    case 'misalignment':
                        recommendations.push({
                            priority: 'High',
                            action: 'Alinhamento de eixos',
                            timeframe: '1 semana',
                            cost: 'Alto',
                            impact: 'Aumento da vida útil 200%'
                        });
                        break;
                    case 'bearing':
                        recommendations.push({
                            priority: 'Critical',
                            action: 'Substituição de rolamentos',
                            timeframe: 'Imediato',
                            cost: 'Médio',
                            impact: 'Evita falha catastrófica'
                        });
                        break;
                }
            }
        });
        
        return recommendations;
    }

    calculateRiskLevel(diagnosis) {
        let riskScore = 0;
        let criticalIssues = 0;
        
        Object.values(diagnosis).forEach(fault => {
            if (fault.detected) {
                riskScore += fault.confidence;
                if (fault.confidence > 0.8) criticalIssues++;
            }
        });
        
        if (criticalIssues > 2 || riskScore > 2.5) return 'CRITICAL';
        if (criticalIssues > 1 || riskScore > 1.5) return 'HIGH';
        if (riskScore > 0.8) return 'MEDIUM';
        return 'LOW';
    }

    // Métodos auxiliares de cálculo
    calculatePeakRatio(magnitudes) {
        const peak = Math.max(...magnitudes);
        const rms = Math.sqrt(magnitudes.reduce((sum, mag) => sum + mag * mag, 0) / magnitudes.length);
        return peak / rms;
    }

    calculateSpectralKurtosis(magnitudes) {
        const mean = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length;
        const variance = magnitudes.reduce((sum, mag) => sum + Math.pow(mag - mean, 2), 0) / magnitudes.length;
        const kurtosis = magnitudes.reduce((sum, mag) => sum + Math.pow(mag - mean, 4), 0) / (magnitudes.length * Math.pow(variance, 2));
        return kurtosis - 3; // Excess kurtosis
    }

    findClosestIndex(array, target) {
        return array.reduce((closestIndex, current, index) => 
            Math.abs(current - target) < Math.abs(array[closestIndex] - target) ? index : closestIndex, 0
        );
    }

    combineResults(patternResults, nnResults) {
        const combined = { ...patternResults };
        
        // Ajusta confiança baseado na rede neural
        Object.keys(combined).forEach(fault => {
            if (combined[fault].detected) {
                combined[fault].confidence *= (0.7 + 0.3 * nnResults.probability);
                combined[fault].aiSeverity = nnResults.severity;
                combined[fault].aiUrgency = nnResults.urgency;
            }
        });
        
        return combined;
    }

    analyzeTrends(spectralData) {
        // Implementar análise de tendências temporais
        return {
            degradationRate: 'Moderate',
            timeToFailure: '3-6 months',
            trendDirection: 'Increasing'
        };
    }
}

// Instância global
const aiDiagnostic = new AIVibrationDiagnostic();
window.aiDiagnostic = aiDiagnostic;
