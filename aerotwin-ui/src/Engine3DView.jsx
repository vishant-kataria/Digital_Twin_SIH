import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RefreshCw, Maximize2, Flame, Layers, RotateCw, Compass, Gauge, AlertCircle } from 'lucide-react';

export default function Engine3DView({ telemetry }) {
  const mountRef = useRef(null);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodedView, setExplodedView] = useState(false);
  const [activeComponent, setActiveComponent] = useState('all'); // 'all', 'cylinders', 'crankcase', 'pistons', 'exhaust'
  const [showHotspots, setShowHotspots] = useState(true);

  // References to dynamic materials & mesh parts
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const engineGroupRef = useRef(null);
  const cylindersGroupRef = useRef([]);
  const headsGroupRef = useRef([]);
  const propGroupRef = useRef(null);
  const pistonsGroupRef = useRef([]);
  const materialsRef = useRef({
    cylinders: [],
    heads: [],
    exhaust: null,
    crankcase: null,
  });

  // State refs for animation loop
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const explodedRef = useRef(explodedView);
  explodedRef.current = explodedView;

  const wireframeRef = useRef(wireframeMode);
  wireframeRef.current = wireframeMode;

  const activeComponentRef = useRef(activeComponent);
  activeComponentRef.current = activeComponent;

  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1020);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(7.5, 4.5, 9.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(12, 16, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.9);
    dirLight2.position.set(-12, -8, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 25);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(20, 24, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);

    // 5. Construct Aero Piston Engine 3D Geometries
    const engineGroup = new THREE.Group();
    engineGroupRef.current = engineGroup;
    scene.add(engineGroup);

    // --- Base Materials ---
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
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
    const crankcaseGeo = new THREE.BoxGeometry(2.4, 2.2, 4.2);
    const crankcase = new THREE.Mesh(crankcaseGeo, crankcaseMat);
    crankcase.castShadow = true;
    crankcase.receiveShadow = true;
    crankcase.name = "Crankcase Assembly";
    engineGroup.add(crankcase);

    // --- 4 Horizontally Opposed Cylinders (Rotax 914 Layout) ---
    const cylinderPositions = [
      { x: 1.8, y: 0.2, z: 1.1, angle: 0, label: 'Cyl 1' },
      { x: -1.8, y: 0.2, z: 1.1, angle: Math.PI, label: 'Cyl 2' },
      { x: 1.8, y: 0.2, z: -1.1, angle: 0, label: 'Cyl 3' },
      { x: -1.8, y: 0.2, z: -1.1, angle: Math.PI, label: 'Cyl 4' },
    ];

    cylindersGroupRef.current = [];
    headsGroupRef.current = [];
    pistonsGroupRef.current = [];
    materialsRef.current.cylinders = [];
    materialsRef.current.heads = [];

    cylinderPositions.forEach((pos, idx) => {
      const cylGroup = new THREE.Group();
      cylGroup.position.set(pos.x > 0 ? 1.15 : -1.15, pos.y, pos.z);
      cylGroup.userData = {
        homeX: pos.x > 0 ? 1.15 : -1.15,
        homeY: pos.y,
        homeZ: pos.z,
        dir: pos.x > 0 ? 1 : -1,
        cylIdx: idx,
      };

      // Cylinder Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.45, 28);
      barrelGeo.rotateZ(Math.PI / 2);

      const headMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x075985,
        emissiveIntensity: 0.4,
        roughness: 0.35,
        metalness: 0.7,
      });
      materialsRef.current.heads.push(headMat);

      const barrel = new THREE.Mesh(barrelGeo, headMat);
      barrel.castShadow = true;
      barrel.name = `Cylinder ${idx + 1} Barrel`;
      cylGroup.add(barrel);

      // Cooling Fins
      for (let f = -0.5; f <= 0.5; f += 0.18) {
        const finGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 28);
        finGeo.rotateZ(Math.PI / 2);
        const fin = new THREE.Mesh(finGeo, metalMaterial);
        fin.position.x = pos.x > 0 ? f * 0.85 : -f * 0.85;
        cylGroup.add(fin);
      }

      // Cylinder Head
      const headGeo = new THREE.BoxGeometry(0.65, 1.55, 1.55);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.x = pos.x > 0 ? 0.95 : -0.95;
      head.name = `Cylinder Head ${idx + 1}`;
      cylGroup.add(head);

      // Spark Plug
      const plugGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 14);
      const plugMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(pos.x > 0 ? 1.25 : -1.25, 0.85, 0);
      cylGroup.add(plug);

      // Internal Piston
      const pistonGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.65, 24);
      pistonGeo.rotateZ(Math.PI / 2);
      const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
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
      metalness: 0.85,
      roughness: 0.45,
    });
    materialsRef.current.exhaust = exhaustMat;

    const exhaustGroup = new THREE.Group();
    [-1.15, 1.15].forEach((z) => {
      const pipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.6, 20);
      pipeGeo.rotateZ(Math.PI / 2);
      const pipe = new THREE.Mesh(pipeGeo, exhaustMat);
      pipe.position.set(0, -1.25, z);
      exhaustGroup.add(pipe);
    });
    engineGroup.add(exhaustGroup);

    // --- Front Shaft & Propeller ---
    const propGroup = new THREE.Group();
    propGroup.position.set(0, 0, 2.4);
    propGroupRef.current = propGroup;

    // Spinner Hub
    const hubGeo = new THREE.ConeGeometry(0.65, 1.3, 28);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    propGroup.add(hub);

    // 2 Propeller Blades
    [-1, 1].forEach((dir) => {
      const bladeGeo = new THREE.BoxGeometry(0.22, 3.4, 0.08);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, dir * 1.7, 0);
      blade.rotation.z = dir * 0.1;
      propGroup.add(blade);

      // Yellow Blade Tip
      const tipGeo = new THREE.BoxGeometry(0.24, 0.45, 0.09);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, dir * 3.15, 0);
      propGroup.add(tip);
    });

    engineGroup.add(propGroup);

    // 6. Manual Pointer / Orbit Interaction
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

      engineGroup.rotation.y += deltaX * 0.008;
      engineGroup.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.005, 4.5, 18);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Animation Loop (using performance.now for modern compatibility)
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;
      const telem = telemetryRef.current || {};
      const currentCht = telem.cht ?? telem.cht_c ?? 162;
      const currentEgt = telem.egt ?? telem.egt_c ?? 718;
      const currentRpm = telem.rpm ?? 2840;
      const isFault = (telem.fault_label && telem.fault_label !== 0) || currentCht > 210;

      // Auto-Rotation
      if (autoRotateRef.current && !isDragging) {
        engineGroup.rotation.y += 0.004;
      }

      // Propeller Spinning based on Telemetry RPM
      if (propGroupRef.current) {
        const spinSpeed = (currentRpm / 60) * 0.06;
        propGroupRef.current.rotation.z += spinSpeed;
      }

      // Piston Reciprocating Motion
      pistonsGroupRef.current.forEach((piston, idx) => {
        const strokePhase = elapsedTime * (currentRpm / 250) + (idx * Math.PI / 2);
        piston.position.x = Math.sin(strokePhase) * 0.32;
      });

      // Exploded View Expansion Animation
      cylindersGroupRef.current.forEach((cyl) => {
        const targetOffset = explodedRef.current ? cyl.userData.dir * 1.6 : 0;
        cyl.position.x = THREE.MathUtils.lerp(cyl.position.x, cyl.userData.homeX + targetOffset, 0.08);
      });

      // Component Visibility based on Active Component filter
      const comp = activeComponentRef.current;
      cylindersGroupRef.current.forEach((cyl) => {
        cyl.visible = comp === 'all' || comp === 'cylinders' || comp === 'pistons';
      });
      crankcase.visible = comp === 'all' || comp === 'crankcase';
      exhaustGroup.visible = comp === 'all' || comp === 'exhaust';

      // Dynamic Thermal Heatmap Material Updates
      materialsRef.current.heads.forEach((mat, idx) => {
        mat.wireframe = wireframeRef.current;

        // Individual cylinder thermal variation (e.g. Cyl 4 runs hotter during fault)
        let cylCht = currentCht;
        if (idx === 3 && isFault) {
          cylCht += 35; // Simulated Cyl 4 hotspot
        }

        if (cylCht > 190 || isFault) {
          // Critical Alert: Pulsing Neon Red
          const pulse = (Math.sin(elapsedTime * 6) + 1) / 2;
          mat.color.setHex(0xef4444);
          mat.emissive.setHex(0x991b1b);
          mat.emissiveIntensity = 0.5 + pulse * 0.5;
        } else if (cylCht > 165) {
          // Warning: Warm Amber
          mat.color.setHex(0xf59e0b);
          mat.emissive.setHex(0x78350f);
          mat.emissiveIntensity = 0.4;
        } else {
          // Normal: Tactical Cyan
          mat.color.setHex(0x0ea5e9);
          mat.emissive.setHex(0x0369a1);
          mat.emissiveIntensity = 0.3;
        }
      });

      if (materialsRef.current.crankcase) {
        materialsRef.current.crankcase.wireframe = wireframeRef.current;
      }
      if (materialsRef.current.exhaust) {
        materialsRef.current.exhaust.wireframe = wireframeRef.current;
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
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const resetCamera = () => {
    if (cameraRef.current && engineGroupRef.current) {
      cameraRef.current.position.set(7.5, 4.5, 9.5);
      cameraRef.current.lookAt(0, 0, 0);
      engineGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const telem = telemetry || {};
  const chtVal = telem.cht ?? telem.cht_c ?? 162.0;
  const egtVal = telem.egt ?? telem.egt_c ?? 718.0;
  const oilTempVal = telem.oilTemp ?? telem.oil_temp_c ?? 78.0;
  const oilPressVal = telem.oilPress ?? telem.oil_press_psi ?? 3.8;
  const rpmVal = telem.rpm ?? 2840;
  const isOverheat = chtVal > 185 || (telem.fault_label && telem.fault_label > 0);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#0a1020',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOverheat ? '#ef4444' : '#10b981',
              boxShadow: `0 0 8px ${isOverheat ? '#ef4444' : '#10b981'}`,
              display: 'inline-block',
            }}
          />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
              3D DIGITAL TWIN AERO ENGINE (ROTAX 914)
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Real-time WebGL Stress & Thermal Mapping
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: autoRotate ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: autoRotate ? '#38bdf8' : '#94a3b8',
            }}
            title="Toggle Auto Spin"
          >
            <RotateCw size={12} /> Auto-Spin
          </button>

          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: wireframeMode ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: wireframeMode ? '#38bdf8' : '#94a3b8',
            }}
            title="Holographic Wireframe"
          >
            <Layers size={12} /> Wireframe
          </button>

          <button
            onClick={() => setExplodedView(!explodedView)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: explodedView ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: explodedView ? '#38bdf8' : '#94a3b8',
            }}
            title="Deconstruct Engine Assembly"
          >
            <Maximize2 size={12} /> Deconstruct
          </button>

          <button
            onClick={resetCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: '#94a3b8',
            }}
            title="Reset Camera View"
          >
            <Compass size={12} /> Reset
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: showHotspots ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: showHotspots ? '#34d399' : '#94a3b8',
            }}
            title="Toggle Sensor Pins"
          >
            <Gauge size={12} /> Pins
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          position: 'relative',
        }}
      />

      {/* Interactive Sensor Hotspot Badges (matching reference quadrant 2) */}
      {showHotspots && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* EGT Pin (Top-Left / Exhaust) */}
          <div
            style={{
              position: 'absolute',
              top: '22%',
              left: '18%',
              pointerEvents: 'auto',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '6px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#fca5a5', fontWeight: 600 }}>EGT</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {egtVal.toFixed(0)}°C
              </div>
            </div>
          </div>

          {/* CHT Pin (Top-Right / Cylinder Head) */}
          <div
            style={{
              position: 'absolute',
              top: '26%',
              right: '18%',
              pointerEvents: 'auto',
              background: isOverheat ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)',
              border: `1px solid ${isOverheat ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.6)'}`,
              backdropFilter: 'blur(8px)',
              borderRadius: '6px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isOverheat ? '0 0 12px rgba(239, 68, 68, 0.4)' : '0 0 12px rgba(56, 189, 248, 0.3)',
              transform: 'translate(50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOverheat ? '#ef4444' : '#38bdf8' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: isOverheat ? '#fca5a5' : '#7dd3fc', fontWeight: 600 }}>CHT (Avg)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {chtVal.toFixed(1)}°C
              </div>
            </div>
          </div>

          {/* Oil Temp Pin (Middle-Right) */}
          <div
            style={{
              position: 'absolute',
              top: '60%',
              right: '20%',
              pointerEvents: 'auto',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '6px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
              transform: 'translate(50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#6ee7b7', fontWeight: 600 }}>Oil Temp</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {oilTempVal.toFixed(0)}°C
              </div>
            </div>
          </div>

          {/* Oil Pressure Pin (Bottom-Center/Left) */}
          <div
            style={{
              position: 'absolute',
              bottom: '22%',
              left: '22%',
              pointerEvents: 'auto',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '6px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
              transform: 'translate(-50%, 50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#93c5fd', fontWeight: 600 }}>Oil Pressure</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {oilPressVal.toFixed(2)} bar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Thermal Legend Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>THERMAL STRESS:</span>
        <div
          style={{
            width: '100px',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #0284c7 0%, #f59e0b 60%, #ef4444 100%)',
          }}
        />
        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
          &lt;140°C Normal | &gt;165°C Warn | &gt;190°C Critical
        </span>
      </div>
    </div>
  );
}
