import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RefreshCw, Maximize2, Flame, Layers, RotateCw } from 'lucide-react';

export default function Engine3DView({ telemetry }) {
  const mountRef = useRef(null);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodedView, setExplodedView] = useState(false);
  const [activeComponent, setActiveComponent] = useState('Whole Assembly');

  // References to dynamic materials & mesh parts
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cylindersGroupRef = useRef([]);
  const headsGroupRef = useRef([]);
  const propGroupRef = useRef(null);
  const pistonsGroupRef = useRef([]);
  const materialsRef = useRef({
    cylinders: [],
    heads: [],
    exhaust: null,
    crankcase: null
  });

  // State refs for animation loop
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const explodedRef = useRef(explodedView);
  explodedRef.current = explodedView;

  const wireframeRef = useRef(wireframeMode);
  wireframeRef.current = wireframeMode;

  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0e17);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(7, 5, 9);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3a6073, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 20);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 20, 0x00f0ff, 0x1f293d);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // 5. Construct Aero Piston Engine 3D Geometries
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // --- Base Materials ---
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: false,
    });

    const crankcaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });
    materialsRef.current.crankcase = crankcaseMat;

    // --- Crankcase Body ---
    const crankcaseGeo = new THREE.BoxGeometry(2.2, 2.2, 4.0);
    const crankcase = new THREE.Mesh(crankcaseGeo, crankcaseMat);
    crankcase.castShadow = true;
    crankcase.name = "Crankcase Assembly";
    engineGroup.add(crankcase);

    // --- 4 Horizontally Opposed Cylinders ---
    const cylinderPositions = [
      { x: 1.8, y: 0.2, z: 1.1, angle: 0 },   // Cyl 1 (Right Front)
      { x: -1.8, y: 0.2, z: 1.1, angle: Math.PI }, // Cyl 2 (Left Front)
      { x: 1.8, y: 0.2, z: -1.1, angle: 0 },  // Cyl 3 (Right Rear)
      { x: -1.8, y: 0.2, z: -1.1, angle: Math.PI } // Cyl 4 (Left Rear)
    ];

    cylindersGroupRef.current = [];
    headsGroupRef.current = [];
    pistonsGroupRef.current = [];
    materialsRef.current.cylinders = [];
    materialsRef.current.heads = [];

    cylinderPositions.forEach((pos, idx) => {
      const cylGroup = new THREE.Group();
      cylGroup.position.set(pos.x > 0 ? 1.1 : -1.1, pos.y, pos.z);
      cylGroup.userData = { homeX: pos.x > 0 ? 1.1 : -1.1, homeY: pos.y, homeZ: pos.z, dir: pos.x > 0 ? 1 : -1 };

      // Cylinder Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24);
      barrelGeo.rotateZ(Math.PI / 2);

      const headMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x003344,
        roughness: 0.4,
        metalness: 0.6,
      });
      materialsRef.current.heads.push(headMat);

      const barrel = new THREE.Mesh(barrelGeo, headMat);
      barrel.castShadow = true;
      barrel.name = `Cylinder ${idx + 1} Barrel`;
      cylGroup.add(barrel);

      // Cooling Fins
      for (let f = -0.5; f <= 0.5; f += 0.2) {
        const finGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.04, 24);
        finGeo.rotateZ(Math.PI / 2);
        const fin = new THREE.Mesh(finGeo, metalMaterial);
        fin.position.x = pos.x > 0 ? f * 0.8 : -f * 0.8;
        cylGroup.add(fin);
      }

      // Cylinder Head
      const headGeo = new THREE.BoxGeometry(0.6, 1.5, 1.5);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.x = pos.x > 0 ? 0.9 : -0.9;
      head.name = `Cylinder Head ${idx + 1}`;
      cylGroup.add(head);

      // Spark Plug
      const plugGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12);
      const plugMat = new THREE.MeshStandardMaterial({ color: 0xffb700, metalness: 0.9 });
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(pos.x > 0 ? 1.2 : -1.2, 0.8, 0);
      cylGroup.add(plug);

      // Internal Piston
      const pistonGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.6, 20);
      pistonGeo.rotateZ(Math.PI / 2);
      const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
      const piston = new THREE.Mesh(pistonGeo, pistonMat);
      piston.userData = { cylIdx: idx };
      pistonsGroupRef.current.push(piston);
      cylGroup.add(piston);

      engineGroup.add(cylGroup);
      cylindersGroupRef.current.push(cylGroup);
    });

    // --- Exhaust Manifold System ---
    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.5,
    });
    materialsRef.current.exhaust = exhaustMat;

    const exhaustGroup = new THREE.Group();
    [-1.1, 1.1].forEach(z => {
      const pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.4, 16);
      pipeGeo.rotateZ(Math.PI / 2);
      const pipe = new THREE.Mesh(pipeGeo, exhaustMat);
      pipe.position.set(0, -1.2, z);
      exhaustGroup.add(pipe);
    });
    engineGroup.add(exhaustGroup);

    // --- Front Shaft & Propeller ---
    const propGroup = new THREE.Group();
    propGroup.position.set(0, 0, 2.3);
    propGroupRef.current = propGroup;

    // Spinner Hub
    const hubGeo = new THREE.ConeGeometry(0.6, 1.2, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    propGroup.add(hub);

    // 2 Propeller Blades
    [-1, 1].forEach(dir => {
      const bladeGeo = new THREE.BoxGeometry(0.2, 3.2, 0.08);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, dir * 1.6, 0);
      blade.rotation.z = dir * 0.1;
      propGroup.add(blade);

      // Yellow Blade Tip
      const tipGeo = new THREE.BoxGeometry(0.22, 0.4, 0.09);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, dir * 3.0, 0);
      propGroup.add(tip);
    });

    engineGroup.add(propGroup);

    // 6. Manual Pointer/Orbit Controls (Drag to rotate scene)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      engineGroup.rotation.y += deltaX * 0.01;
      engineGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.005, 4, 18);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const telem = telemetryRef.current || {};
      const currentCht = telem.cht ?? telem.cht_c ?? 120;
      const currentEgt = telem.egt ?? telem.egt_c ?? 650;
      const currentRpm = telem.rpm ?? 2400;
      const isFault = telem.fault_label && telem.fault_label !== 0;

      // Auto-Rotation
      if (autoRotateRef.current && !isDragging) {
        engineGroup.rotation.y += 0.005;
      }

      // Propeller Spinning based on Telemetry RPM
      if (propGroupRef.current) {
        const spinSpeed = (currentRpm / 60) * 0.08;
        propGroupRef.current.rotation.z += spinSpeed;
      }

      // Piston Reciprocating Motion
      pistonsGroupRef.current.forEach((piston, idx) => {
        const strokePhase = elapsedTime * (currentRpm / 300) + (idx * Math.PI / 2);
        piston.position.x = Math.sin(strokePhase) * 0.3;
      });

      // Exploded View Expansion Animation
      cylindersGroupRef.current.forEach(cyl => {
        const targetOffset = explodedRef.current ? cyl.userData.dir * 1.5 : 0;
        cyl.position.x = THREE.MathUtils.lerp(cyl.position.x, cyl.userData.homeX + targetOffset, 0.08);
      });

      // Thermal Heatmap Color Dynamic Updates
      materialsRef.current.heads.forEach(mat => {
        mat.wireframe = wireframeRef.current;

        if (isFault || currentCht > 180) {
          // Critical Alert: Glowing Pulsing Neon Red
          const pulse = (Math.sin(elapsedTime * 8) + 1) / 2;
          mat.color.setHex(0xff0033);
          mat.emissive.setHSL(0, 1, 0.2 + pulse * 0.3);
        } else if (currentCht > 150) {
          // Warning state: Caution Amber
          mat.color.setHex(0xffb700);
          mat.emissive.setHex(0x553300);
        } else {
          // Normal state: Tactical Cyan
          mat.color.setHex(0x00f0ff);
          mat.emissive.setHex(0x002233);
        }
      });

      if (materialsRef.current.crankcase) {
        materialsRef.current.crankcase.wireframe = wireframeRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const telem = telemetry || {};
  const chtVal = telem.cht ?? telem.cht_c ?? 120;
  const egtVal = telem.egt ?? telem.egt_c ?? 650;
  const rpmVal = telem.rpm ?? 2400;
  const isOverheat = chtVal > 175 || (telem.fault_label && telem.fault_label > 0);
  const cht = (typeof chtVal === 'number' ? chtVal : 120).toFixed(1);
  const egt = (typeof egtVal === 'number' ? egtVal : 650).toFixed(1);
  const rpm = (typeof rpmVal === 'number' ? rpmVal : 2400).toFixed(0);

  return (
    <div className="engine-3d-card card">
      <div className="engine-3d-header">
        <div className="engine-title-group">
          <div className="status-dot-pulse" style={{ backgroundColor: isOverheat ? '#ff0033' : '#00f0ff' }}></div>
          <div>
            <h3>3D DIGITAL TWIN AERO ENGINE (ROTAX 914)</h3>
            <p className="subtitle">Real-time WebGL Stress & Thermal Mapping</p>
          </div>
        </div>

        {/* Viewport Control Bar */}
        <div className="engine-controls-bar">
          <button 
            className={`btn-icon-pill ${autoRotate ? 'active' : ''}`} 
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto-Spin"
          >
            <RotateCw className="icon-sm" /> Auto-Spin
          </button>

          <button 
            className={`btn-icon-pill ${wireframeMode ? 'active' : ''}`} 
            onClick={() => setWireframeMode(!wireframeMode)}
            title="Toggle Hologram Wireframe"
          >
            <Layers className="icon-sm" /> Wireframe
          </button>

          <button 
            className={`btn-icon-pill ${explodedView ? 'active' : ''}`} 
            onClick={() => setExplodedView(!explodedView)}
            title="Explosive Component Breakdown"
          >
            <Maximize2 className="icon-sm" /> Deconstruct
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="engine-canvas-container" ref={mountRef}>
        {/* HUD Thermal Metrics Overlay */}
        <div className="engine-hud-overlay">
          <div className={`hud-badge ${isOverheat ? 'alert' : ''}`}>
            <Flame className="icon-sm" />
            <div>
              <span className="hud-label">CYLINDER HEAD TEMP</span>
              <span className="hud-val">{cht}°C</span>
            </div>
          </div>

          <div className="hud-badge">
            <RefreshCw className="icon-sm" />
            <div>
              <span className="hud-label">CRANK ROTATION</span>
              <span className="hud-val">{rpm} RPM</span>
            </div>
          </div>
        </div>

        {/* Thermal Legend */}
        <div className="engine-thermal-legend">
          <span className="legend-label">THERMAL STRESS:</span>
          <div className="legend-gradient"></div>
          <div className="legend-ticks">
            <span>NORMAL (&lt;140°C)</span>
            <span>WARN (&gt;150°C)</span>
            <span className="legend-danger">CRITICAL (&gt;180°C)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
