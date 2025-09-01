
// Módulo de Visualizações 3D para Análise Espectral
class Spectral3DVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.spectrogramData = [];
        this.maxHistoryFrames = 100;
        this.currentMode = 'waterfall';
        this.animationId = null;
    }

    // Inicializa o ambiente 3D
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container 3D não encontrado:', containerId);
            return false;
        }

        // Configuração da cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Configuração da câmera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(50, 30, 50);

        // Configuração do renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Controles de órbita
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Iluminação
        this.setupLighting();

        // Grid de referência
        this.setupGrid();

        // Eixos de coordenadas
        this.setupAxes();

        // Inicia loop de renderização
        this.animate();

        // Responsividade
        window.addEventListener('resize', () => this.onWindowResize(container));

        console.log('Visualizador 3D inicializado com sucesso');
        return true;
    }

    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direcional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz pontual para realce
        const pointLight = new THREE.PointLight(0x00ffff, 0.3, 100);
        pointLight.position.set(0, 20, 0);
        this.scene.add(pointLight);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }

    setupAxes() {
        const axesHelper = new THREE.AxesHelper(20);
        this.scene.add(axesHelper);

        // Labels dos eixos
        this.addAxisLabels();
    }

    addAxisLabels() {
        const loader = new THREE.FontLoader();
        // Para simplificar, usamos geometrias básicas como labels
        
        // X - Frequência
        const xGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xLabel = new THREE.Mesh(xGeometry, xMaterial);
        xLabel.position.set(22, 0, 0);
        xLabel.rotation.z = -Math.PI / 2;
        this.scene.add(xLabel);

        // Y - Magnitude
        const yGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yLabel = new THREE.Mesh(yGeometry, yMaterial);
        yLabel.position.set(0, 22, 0);
        this.scene.add(yLabel);

        // Z - Tempo
        const zGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zLabel = new THREE.Mesh(zGeometry, zMaterial);
        zLabel.position.set(0, 0, 22);
        zLabel.rotation.x = Math.PI / 2;
        this.scene.add(zLabel);
    }

    // Atualiza com novos dados espectrais
    updateSpectralData(frequencies, magnitudes, timestamp = Date.now()) {
        // Adiciona novos dados ao histórico
        this.spectrogramData.push({
            frequencies: [...frequencies],
            magnitudes: [...magnitudes],
            timestamp: timestamp
        });

        // Limita o histórico
        if (this.spectrogramData.length > this.maxHistoryFrames) {
            this.spectrogramData.shift();
        }

        // Atualiza visualização baseada no modo atual
        this.updateVisualization();
    }

    updateVisualization() {
        // Remove visualizações anteriores (exceto elementos fixos)
        this.clearSpectralObjects();

        switch (this.currentMode) {
            case 'waterfall':
                this.createWaterfallDisplay();
                break;
            case 'surface':
                this.createSurfaceDisplay();
                break;
            case 'bars':
                this.create3DBars();
                break;
            case 'orbit':
                this.createOrbitDisplay();
                break;
            default:
                this.createWaterfallDisplay();
        }
    }

    clearSpectralObjects() {
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.userData && child.userData.isSpectralObject) {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }

    // Visualização Waterfall/Espectrograma
    createWaterfallDisplay() {
        if (this.spectrogramData.length < 2) return;

        const geometry = new THREE.PlaneGeometry(1, 1, 
            this.spectrogramData[0].frequencies.length - 1, 
            this.spectrogramData.length - 1
        );

        const vertices = geometry.attributes.position;
        const colors = [];

        // Normalização dos dados
        const maxMagnitude = Math.max(...this.spectrogramData.flatMap(d => d.magnitudes));
        const freqRange = this.spectrogramData[0].frequencies.length;

        for (let t = 0; t < this.spectrogramData.length; t++) {
            for (let f = 0; f < freqRange; f++) {
                const index = t * freqRange + f;
                const magnitude = this.spectrogramData[t].magnitudes[f] || 0;
                
                // Posicionamento
                const x = (f / freqRange) * 40 - 20; // Frequência
                const z = (t / this.spectrogramData.length) * 40 - 20; // Tempo
                const y = (magnitude / maxMagnitude) * 15; // Magnitude

                vertices.setXYZ(index, x, y, z);

                // Coloração baseada na magnitude
                const intensity = magnitude / maxMagnitude;
                const color = this.getSpectralColor(intensity);
                colors.push(color.r, color.g, color.b);
            }
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const waterfall = new THREE.Mesh(geometry, material);
        waterfall.userData.isSpectralObject = true;
        this.scene.add(waterfall);
    }

    // Visualização de Superfície 3D
    createSurfaceDisplay() {
        if (this.spectrogramData.length < 2) return;

        const latestData = this.spectrogramData[this.spectrogramData.length - 1];
        const freqCount = latestData.frequencies.length;
        const timeCount = Math.min(this.spectrogramData.length, 20);

        const geometry = new THREE.PlaneGeometry(40, 40, freqCount - 1, timeCount - 1);
        const vertices = geometry.attributes.position;
        const colors = [];

        const maxMagnitude = Math.max(...this.spectrogramData.flatMap(d => d.magnitudes));

        for (let t = 0; t < timeCount; t++) {
            const dataIndex = Math.max(0, this.spectrogramData.length - timeCount + t);
            const data = this.spectrogramData[dataIndex];
            
            for (let f = 0; f < freqCount; f++) {
                const vertexIndex = t * freqCount + f;
                const magnitude = data.magnitudes[f] || 0;
                
                const x = (f / freqCount) * 40 - 20;
                const z = (t / timeCount) * 40 - 20;
                const y = (magnitude / maxMagnitude) * 20;

                vertices.setXYZ(vertexIndex, x, y, z);

                const intensity = magnitude / maxMagnitude;
                const color = this.getSpectralColor(intensity);
                colors.push(color.r, color.g, color.b);
            }
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        const surface = new THREE.Mesh(geometry, material);
        surface.userData.isSpectralObject = true;
        this.scene.add(surface);
    }

    // Visualização de Barras 3D
    create3DBars() {
        if (this.spectrogramData.length === 0) return;

        const latestData = this.spectrogramData[this.spectrogramData.length - 1];
        const maxMagnitude = Math.max(...latestData.magnitudes);

        latestData.frequencies.forEach((freq, index) => {
            const magnitude = latestData.magnitudes[index];
            const height = (magnitude / maxMagnitude) * 15;

            if (height > 0.1) { // Só mostra barras significativas
                const geometry = new THREE.BoxGeometry(0.5, height, 0.5);
                const intensity = magnitude / maxMagnitude;
                const color = this.getSpectralColor(intensity);
                
                const material = new THREE.MeshPhongMaterial({ 
                    color: new THREE.Color(color.r, color.g, color.b),
                    transparent: true,
                    opacity: 0.8
                });

                const bar = new THREE.Mesh(geometry, material);
                bar.position.set(
                    (index / latestData.frequencies.length) * 40 - 20,
                    height / 2,
                    0
                );
                bar.userData.isSpectralObject = true;
                this.scene.add(bar);
            }
        });
    }

    // Visualização de Órbita (para dados X, Y)
    createOrbitDisplay() {
        // Esta função seria chamada com dados de dois sensores perpendiculares
        // Por simplicidade, vamos simular com os dados atuais
        if (this.spectrogramData.length < 10) return;

        const points = [];
        const colors = [];

        this.spectrogramData.slice(-50).forEach((data, index) => {
            // Simula dados X e Y baseado nas magnitudes
            const x = Math.sin(index * 0.1) * data.magnitudes[0] * 10;
            const y = Math.cos(index * 0.1) * data.magnitudes[1] * 10;
            const z = index * 0.2;

            points.push(x, y, z);
            
            const intensity = index / 50;
            const color = this.getSpectralColor(intensity);
            colors.push(color.r, color.g, color.b);
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({ 
            vertexColors: true,
            linewidth: 3
        });

        const orbit = new THREE.Line(geometry, material);
        orbit.userData.isSpectralObject = true;
        this.scene.add(orbit);

        // Adiciona pontos na órbita
        const pointsMaterial = new THREE.PointsMaterial({ 
            vertexColors: true, 
            size: 0.3 
        });
        const pointsObj = new THREE.Points(geometry, pointsMaterial);
        pointsObj.userData.isSpectralObject = true;
        this.scene.add(pointsObj);
    }

    // Esquema de cores espectrais
    getSpectralColor(intensity) {
        // Mapa de cores do azul ao vermelho passando por verde
        const colors = [
            { r: 0, g: 0, b: 1 },      // Azul (baixa intensidade)
            { r: 0, g: 1, b: 1 },      // Ciano
            { r: 0, g: 1, b: 0 },      // Verde
            { r: 1, g: 1, b: 0 },      // Amarelo
            { r: 1, g: 0.5, b: 0 },    // Laranja
            { r: 1, g: 0, b: 0 }       // Vermelho (alta intensidade)
        ];

        const scaledIntensity = Math.max(0, Math.min(1, intensity));
        const colorIndex = scaledIntensity * (colors.length - 1);
        const lowerIndex = Math.floor(colorIndex);
        const upperIndex = Math.ceil(colorIndex);
        const t = colorIndex - lowerIndex;

        if (lowerIndex === upperIndex) {
            return colors[lowerIndex];
        }

        const lower = colors[lowerIndex];
        const upper = colors[upperIndex];

        return {
            r: lower.r + (upper.r - lower.r) * t,
            g: lower.g + (upper.g - lower.g) * t,
            b: lower.b + (upper.b - lower.b) * t
        };
    }

    // Troca modo de visualização
    setVisualizationMode(mode) {
        this.currentMode = mode;
        this.updateVisualization();
    }

    // Loop de animação
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Redimensionamento responsivo
    onWindowResize(container) {
        if (!container || !this.camera || !this.renderer) return;

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Captura screenshot
    captureScreenshot() {
        if (!this.renderer) return null;
        
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL('image/png');
    }

    // Limpeza de recursos
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// Instância global do visualizador 3D
let spectral3D = null;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda carregamento do Three.js
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            spectral3D = new Spectral3DVisualizer();
            console.log('Visualizador 3D pronto para uso');
        } else {
            console.warn('Three.js não carregado - funcionalidades 3D indisponíveis');
        }
    }, 500);
});

// Funções de interface global
window.initSpectral3D = function(containerId) {
    if (spectral3D) {
        return spectral3D.init(containerId);
    }
    return false;
};

window.updateSpectral3D = function(frequencies, magnitudes) {
    if (spectral3D) {
        spectral3D.updateSpectralData(frequencies, magnitudes);
    }
};

window.setSpectral3DMode = function(mode) {
    if (spectral3D) {
        spectral3D.setVisualizationMode(mode);
    }
};
