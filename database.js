
// Sistema de Base de Dados Local para Análise Vibracional
class VibrationDatabase {
    constructor() {
        this.dbName = 'VibrationAnalysisDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para análises
                if (!db.objectStoreNames.contains('analyses')) {
                    const analysesStore = db.createObjectStore('analyses', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    analysesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    analysesStore.createIndex('equipment', 'equipment', { unique: false });
                    analysesStore.createIndex('severity', 'severity', { unique: false });
                }
                
                // Store para equipamentos
                if (!db.objectStoreNames.contains('equipment')) {
                    const equipmentStore = db.createObjectStore('equipment', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    equipmentStore.createIndex('name', 'name', { unique: true });
                }
                
                // Store para baselines
                if (!db.objectStoreNames.contains('baselines')) {
                    const baselineStore = db.createObjectStore('baselines', {
                        keyPath: 'equipmentId'
                    });
                }
            };
        });
    }

    async saveAnalysis(analysisData) {
        const transaction = this.db.transaction(['analyses'], 'readwrite');
        const store = transaction.objectStore('analyses');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            equipment: analysisData.equipment || 'Equipamento Padrão',
            data: analysisData,
            severity: analysisData.diagnostics?.severityLevel || 'Normal'
        };
        
        return store.add(analysis);
    }

    async getAnalysisHistory(equipmentName = null, limit = 50) {
        const transaction = this.db.transaction(['analyses'], 'readonly');
        const store = transaction.objectStore('analyses');
        
        return new Promise((resolve, reject) => {
            const request = equipmentName ? 
                store.index('equipment').getAll(equipmentName) : 
                store.getAll();
                
            request.onsuccess = () => {
                const results = request.result
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, limit);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveEquipment(equipment) {
        const transaction = this.db.transaction(['equipment'], 'readwrite');
        const store = transaction.objectStore('equipment');
        return store.add(equipment);
    }

    async getEquipmentList() {
        const transaction = this.db.transaction(['equipment'], 'readonly');
        const store = transaction.objectStore('equipment');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveBaseline(equipmentId, baselineData) {
        const transaction = this.db.transaction(['baselines'], 'readwrite');
        const store = transaction.objectStore('baselines');
        
        const baseline = {
            equipmentId: equipmentId,
            data: baselineData,
            timestamp: new Date().toISOString()
        };
        
        return store.put(baseline);
    }

    async getBaseline(equipmentId) {
        const transaction = this.db.transaction(['baselines'], 'readonly');
        const store = transaction.objectStore('baselines');
        
        return new Promise((resolve, reject) => {
            const request = store.get(equipmentId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async exportDatabase() {
        const analyses = await this.getAnalysisHistory();
        const equipment = await this.getEquipmentList();
        
        const exportData = {
            analyses: analyses,
            equipment: equipment,
            exportDate: new Date().toISOString(),
            version: this.version
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibration_database_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Instância global da base de dados
let vibrationDB = null;

// Inicializa base de dados quando carregado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        vibrationDB = new VibrationDatabase();
        await vibrationDB.init();
        console.log('Base de dados inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar base de dados:', error);
    }
});
