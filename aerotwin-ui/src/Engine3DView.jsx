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
    scene.background = new THREE.Color(0xF8FAFC);

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

    // 4. Lighting Setup (Aeronautical Studio Lighting with Balanced Fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(12, 16, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdbeafe, 1.0);
    dirLight2.position.set(-14, 10, 12);
    scene.add(dirLight2);

    const groundLight = new THREE.DirectionalLight(0xf1f5f9, 0.7);
    groundLight.position.set(0, -10, 0);
    scene.add(groundLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rimLight.position.set(0, 10, -12);
    scene.add(rimLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(22, 26, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);

    // Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(7, 7);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
    radGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.06)');
    radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -2.78;
    scene.add(shadowMesh);

    // 5. Construct Aero Piston Engine 3D Geometries
    const engineGroup = new THREE.Group();
    engineGroupRef.current = engineGroup;
    scene.add(engineGroup);

    // --- Base Materials (Titanium & Brushed Steel CAD System) ---
    // CNC Milled Mirror Chrome Cooling Fins & Fasteners
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      metalness: 0.96,
      roughness: 0.08,
      wireframe: false,
    });

    // Satin Bead-Blasted Aircraft Cast Aluminum (Crankcase Block)
    const crankcaseMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      metalness: 0.85,
      roughness: 0.22,
      wireframe: false,
    });
    materialsRef.current.crankcase = crankcaseMat;

    // Machined Titanium Nose Casing / Gearbox Collar
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      metalness: 0.88,
      roughness: 0.2,
    });

    // Matte Tungsten Graphite Valve Cover Plates
    const rockerMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.72,
      roughness: 0.28,
    });

    // --- Crankcase Body ---
    const crankcaseGeo = new THREE.BoxGeometry(2.4, 2.2, 4.2);
    const crankcase = new THREE.Mesh(crankcaseGeo, crankcaseMat);
    crankcase.castShadow = true;
    crankcase.receiveShadow = true;
    crankcase.name = "Crankcase Assembly";
    engineGroup.add(crankcase);

    // Front Nose Collar / Reduction Gearbox Casing
    const noseGeo = new THREE.CylinderGeometry(0.75, 0.95, 0.6, 28);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, collarMat);
    nose.position.set(0, 0, 2.2);
    engineGroup.add(nose);

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

      // Cylinder Barrel (Machined Cold-Rolled Titanium Steel)
      const barrelGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.45, 28);
      barrelGeo.rotateZ(Math.PI / 2);

      const headMat = new THREE.MeshStandardMaterial({
        color: 0x64748B,
        emissive: 0x0F172A,
        emissiveIntensity: 0.04,
        roughness: 0.18,
        metalness: 0.9,
      });
      materialsRef.current.heads.push(headMat);

      const barrel = new THREE.Mesh(barrelGeo, headMat);
      barrel.castShadow = true;
      barrel.name = `Cylinder ${idx + 1} Barrel`;
      cylGroup.add(barrel);

      // Cooling Fins (Mirror-polished aluminum rings)
      for (let f = -0.5; f <= 0.5; f += 0.18) {
        const finGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 28);
        finGeo.rotateZ(Math.PI / 2);
        const fin = new THREE.Mesh(finGeo, metalMaterial);
        fin.position.x = pos.x > 0 ? f * 0.85 : -f * 0.85;
        cylGroup.add(fin);
      }

      // Cylinder Head Main Body
      const headGeo = new THREE.BoxGeometry(0.65, 1.55, 1.55);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.x = pos.x > 0 ? 0.95 : -0.95;
      head.name = `Cylinder Head ${idx + 1}`;
      cylGroup.add(head);

      // Rocker / Valve Cover Plate (Tungsten Graphite contrast)
      const rockerGeo = new THREE.BoxGeometry(0.08, 1.35, 1.35);
      const rocker = new THREE.Mesh(rockerGeo, rockerMat);
      rocker.position.x = pos.x > 0 ? 1.32 : -1.32;
      cylGroup.add(rocker);

      // Chrome Center Fastener / Logo Plate
      const plateGeo = new THREE.BoxGeometry(0.04, 0.45, 0.7);
      const plate = new THREE.Mesh(plateGeo, metalMaterial);
      plate.position.x = pos.x > 0 ? 1.38 : -1.38;
      cylGroup.add(plate);

      // Spark Plug (White ceramic insulator with bronze electrode)
      const plugGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 14);
      const plugMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.4, roughness: 0.3 });
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(pos.x > 0 ? 1.25 : -1.25, 0.85, 0);
      cylGroup.add(plug);

      // Internal Piston (Gleaming forged aluminum)
      const pistonGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.65, 24);
      pistonGeo.rotateZ(Math.PI / 2);
      const pistonMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.96, roughness: 0.08 });
      const piston = new THREE.Mesh(pistonGeo, pistonMat);
      piston.userData = { cylIdx: idx };
      pistonsGroupRef.current.push(piston);
      cylGroup.add(piston);

      engineGroup.add(cylGroup);
      cylindersGroupRef.current.push(cylGroup);
    });

    // --- Top Intake Manifold Pipes (Surgical Stainless) ---
    const intakeMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      metalness: 0.92,
      roughness: 0.14,
    });
    const intakeGroup = new THREE.Group();
    [-1.1, 1.1].forEach((z) => {
      const pipeGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.8, 16);
      pipeGeo.rotateZ(Math.PI / 2);
      const pipe = new THREE.Mesh(pipeGeo, intakeMat);
      pipe.position.set(0, 1.05, z);
      intakeGroup.add(pipe);
    });
    engineGroup.add(intakeGroup);

    // --- Exhaust Manifold System (Heat-treated surgical stainless) ---
    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      metalness: 0.85,
      roughness: 0.3,
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

    // Spinner Hub (Polished chrome alloy)
    const hubGeo = new THREE.ConeGeometry(0.65, 1.3, 28);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.92, roughness: 0.12 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    propGroup.add(hub);

    // 2 Propeller Blades (Matte carbon graphite with white and orange safety tips)
    [-1, 1].forEach((dir) => {
      const bladeGeo = new THREE.BoxGeometry(0.22, 3.4, 0.08);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, dir * 1.7, 0);
      blade.rotation.z = dir * 0.1;
      propGroup.add(blade);

      // Safety White Stripe
      const stripeGeo = new THREE.BoxGeometry(0.23, 0.25, 0.085);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, dir * 2.85, 0);
      propGroup.add(stripe);

      // Safety Orange Blade Tip
      const tipGeo = new THREE.BoxGeometry(0.24, 0.4, 0.09);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.2 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, dir * 3.18, 0);
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
        if (idx === 3 && (telem.fault_label === 3 || telem.fault_label === 4 || isFault)) {
          cylCht += 25; // Simulated Cyl 4 hotspot
        }

        const isCriticalFault = telem.fault_label === 4 || telem.fault_label === 1 || cylCht > 190;
        const isWarningFault = telem.fault_label === 3 || cylCht > 165;

        if (isCriticalFault) {
          // Critical Alert: Clean Aviation Red
          const pulse = (Math.sin(elapsedTime * 6) + 1) / 2;
          mat.color.setHex(0xEF4444);
          mat.emissive.setHex(0xDC2626);
          mat.emissiveIntensity = 0.45 + pulse * 0.4;
        } else if (isWarningFault) {
          // Warning: Clean Aviation Amber
          mat.color.setHex(0xF59E0B);
          mat.emissive.setHex(0xD97706);
          mat.emissiveIntensity = 0.28;
        } else {
          // Nominal Cruise: Machined Cold-Rolled Titanium Steel CAD Finish
          mat.color.setHex(0x64748B);
          mat.emissive.setHex(0x0F172A);
          mat.emissiveIntensity = 0.04;
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
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
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
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.92)', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOverheat ? '#DC2626' : '#15803D',
              boxShadow: `0 0 6px ${isOverheat ? 'rgba(220, 38, 38, 0.4)' : 'rgba(21, 128, 61, 0.4)'}`,
              display: 'inline-block',
            }}
          />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.5px' }}>
              3D DIGITAL TWIN AERO ENGINE (ROTAX 914)
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
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
            background: 'rgba(255, 255, 255, 0.92)',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
              background: autoRotate ? '#EFF6FF' : 'transparent',
              color: autoRotate ? '#1E40AF' : '#64748B',
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
              background: wireframeMode ? '#EFF6FF' : 'transparent',
              color: wireframeMode ? '#1E40AF' : '#64748B',
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
              background: explodedView ? '#EFF6FF' : 'transparent',
              color: explodedView ? '#1E40AF' : '#64748B',
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
              color: '#64748B',
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
              background: showHotspots ? '#F0FDF4' : 'transparent',
              color: showHotspots ? '#15803D' : '#64748B',
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

      {/* Interactive Sensor Hotspot Badges */}
      {showHotspots && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* EGT Pin (Top-Left / Exhaust) */}
          <div
            style={{
              position: 'absolute',
              top: '22%',
              left: '18%',
              pointerEvents: 'auto',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderLeft: '3px solid #DC2626',
              borderRadius: '6px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#DC2626', fontWeight: 700 }}>EGT</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', fontFamily: '"JetBrains Mono", monospace' }}>
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
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderLeft: `3px solid ${isOverheat ? '#DC2626' : '#1E40AF'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translate(50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOverheat ? '#DC2626' : '#1E40AF' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: isOverheat ? '#DC2626' : '#1E40AF', fontWeight: 700 }}>CHT (Avg)</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', fontFamily: '"JetBrains Mono", monospace' }}>
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
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderLeft: '3px solid #15803D',
              borderRadius: '6px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translate(50%, -50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: 700 }}>Oil Temp</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', fontFamily: '"JetBrains Mono", monospace' }}>
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
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderLeft: '3px solid #0284C7',
              borderRadius: '6px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translate(-50%, 50%)',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284C7' }} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#0284C7', fontWeight: 700 }}>Oil Pressure</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', fontFamily: '"JetBrains Mono", monospace' }}>
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
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700 }}>THERMAL STRESS:</span>
        <div
          style={{
            width: '100px',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #15803D 0%, #D97706 60%, #DC2626 100%)',
          }}
        />
        <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 500 }}>
          &lt;140°C Normal | &gt;165°C Warn | &gt;190°C Critical
        </span>
      </div>
    </div>
  );
}
