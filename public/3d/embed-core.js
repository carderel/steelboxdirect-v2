/**
 * embed-core.js
 * Streamlined 3D Shipping Container Engine for Steel Box Direct Website Embeds.
 * Retains: Explode View (with spread slider), Open/Close Doors, Hotspots toggle & spec drawer.
 * The host page owns the desktop/mobile swap, so this file only ever runs the WebGL path.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ContainerModel, CONTAINER_TYPES, getHotspots } from './containerModel.js';

export class EmbedApp {
  constructor(options) {
    this.options = Object.assign({
      typeId: '40hc',
      color: 0x155289,
      title: 'ISO Shipping Container',
      tag: '40FT',
      sub: '9\'6" (45G1)'
    }, options);

    this.typeId = this.options.typeId;
    this.currentConfig = CONTAINER_TYPES[this.typeId] || CONTAINER_TYPES['40hc'];
    this.colorTheme = this.options.color;

    // Elements
    this.canvasContainer = document.getElementById('canvas-container');
    this.hotspotsOverlay = document.getElementById('hotspots-overlay');

    // State
    this.isExploded = false;
    this.explodedProgress = 0;
    this.targetExplodedProgress = 0;
    this.doorsOpen = false;
    this.doorsProgress = 0;
    this.targetDoorsProgress = 0;
    this.showHotspots = true;
    this.activeHotspot = null;

    // Camera animation state
    this.cameraAnimating = false;
    this.cameraLerpSpeed = 0.06;
    this.cameraTargetPos = new THREE.Vector3();
    this.controlsTargetPos = new THREE.Vector3();

    // Default camera positions
    const is20 = (this.typeId === '20std');
    this.defaultCameraPos = is20 ? new THREE.Vector3(9.5, 5.2, 11.5) : new THREE.Vector3(15.0, 6.8, 17.5);
    this.defaultControlsTarget = new THREE.Vector3(0, this.currentConfig.height * 0.5, 0);

    // The two vectors above are now only a SEED: they set the viewing direction, and
    // frameModelToFill() below solves the distance and the target from the model's own bounds.
    // An earlier fixed 25% tighten lived here and was removed, because a single constant cannot
    // serve a 20ft and a 40ft high cube at the same time; see frameModelToFill for the numbers.

    this.initThree();
    this.initLights();
    this.initGround();
    this.initContainer();
    this.initHotspots();
    this.setupEventListeners();

    // Owner request 2026-09-11: open at 50% exploded so the structure reads without a click. Set
    // AFTER setupEventListeners so the toolbar reflects it, and apply it to the model directly
    // because the animation loop only calls setExplosionFactor while progress is still converging.
    const INITIAL_EXPLODE = 0.5;
    this.isExploded = true;
    this.explodedProgress = INITIAL_EXPLODE;
    this.targetExplodedProgress = INITIAL_EXPLODE;
    this.containerModel.setExplosionFactor(INITIAL_EXPLODE);

    const initialSlider = document.getElementById('slider-explode');
    if (initialSlider) initialSlider.value = String(INITIAL_EXPLODE * 100);
    const initialExplodeBtn = document.getElementById('btn-explode-toggle');
    if (initialExplodeBtn) initialExplodeBtn.classList.add('active');

    this.frameModelToFill();

    // Visibility gate. Without this each embed renders at 60fps forever, including while the
    // reader is hundreds of pixels past it. The LOOP stays alive (see animate); we only skip
    // the work, so state keeps converging and nothing is stale when it scrolls back in.
    this.isVisible = true;
    this.initVisibilityObserver();

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x131820);
    this.scene.fog = new THREE.FogExp2(0x131820, 0.015);

    const width = this.canvasContainer ? this.canvasContainer.clientWidth : window.innerWidth;
    const height = this.canvasContainer ? this.canvasContainer.clientHeight : window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 150);
    this.camera.position.copy(this.defaultCameraPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    if (this.canvasContainer) {
      this.canvasContainer.appendChild(this.renderer.domElement);
    }

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.defaultControlsTarget);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going under floor
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 45;
  }

  initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 1.25);
    this.scene.add(ambientLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334455, 1.1);
    hemiLight.position.set(0, 25, 0);
    this.scene.add(hemiLight);

    // Primary Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    sunLight.position.set(16, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0003;

    const d = 14;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Secondary Fill Light
    const fillLight = new THREE.DirectionalLight(0x90b8e0, 1.9);
    fillLight.position.set(-15, 10, -14);
    this.scene.add(fillLight);

    // Front Door & Lock Rod Highlight Light
    const doorLight = new THREE.DirectionalLight(0xffffff, 2.2);
    doorLight.position.set(0, 5, 16);
    this.scene.add(doorLight);

    // Warm Interior Illumination
    this.interiorLight = new THREE.PointLight(0xffeedd, 3.5, 18);
    this.interiorLight.position.set(0, this.currentConfig.height * 0.75, 0);
    this.scene.add(this.interiorLight);
  }

  initGround() {
    const groundGeom = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1b222c,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(40, 40, 0x334455, 0x22303e);
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  initContainer() {
    this.containerModel = new ContainerModel(this.scene, this.typeId);
    this.containerModel.setColorTheme(this.colorTheme);
  }

  initHotspots() {
    this.hotspotElements = [];
    if (!this.hotspotsOverlay) return;

    this.hotspotsOverlay.innerHTML = '';
    const spots = getHotspots(this.currentConfig);

    spots.forEach(spot => {
      const el = document.createElement('button');
      el.className = 'hotspot-marker';
      el.setAttribute('aria-label', spot.title);
      el.innerHTML = `
        <span class="hotspot-pulse"></span>
        <span class="hotspot-dot"></span>
        <span class="hotspot-tooltip">${spot.title}</span>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectHotspot(spot);
      });

      this.hotspotsOverlay.appendChild(el);
      this.hotspotElements.push({ element: el, data: spot });
    });
  }

  selectHotspot(spot) {
    if (!this.showHotspots) return;
    this.activeHotspot = spot;

    // Fly camera smoothly to inspect component
    this.flyCameraTo(spot.cameraPos, spot.cameraTarget);

    // Show spec drawer
    this.showEngineeringCard(spot);

    // Highlight marker
    this.hotspotElements.forEach(item => {
      item.element.classList.toggle('active', item.data.id === spot.id);
    });
  }

  showEngineeringCard(spot) {
    const card = document.getElementById('spec-drawer');
    if (!card) return;

    const title = document.getElementById('card-title');
    const category = document.getElementById('card-category');
    const material = document.getElementById('card-material');
    const purpose = document.getElementById('card-purpose');
    const load = document.getElementById('card-load');
    const fab = document.getElementById('card-fab');

    if (title) title.textContent = spot.title;
    if (category) category.textContent = spot.category;
    if (material) material.textContent = spot.material;
    if (purpose) purpose.textContent = spot.purpose;
    if (load) load.textContent = spot.load;
    if (fab) fab.textContent = spot.fab;

    card.classList.add('open');
  }

  toggleHotspots(forceState) {
    this.showHotspots = (forceState !== undefined) ? forceState : !this.showHotspots;
    const btn = document.getElementById('btn-toggle-hotspots');
    if (btn) {
      btn.classList.toggle('active', this.showHotspots);
      btn.title = this.showHotspots ? 'Hide Hotspots (Key: H)' : 'Show Hotspots (Key: H)';
    }

    if (this.hotspotsOverlay) {
      this.hotspotsOverlay.style.display = this.showHotspots ? 'block' : 'none';
    }

    if (!this.showHotspots) {
      const card = document.getElementById('spec-drawer');
      if (card) card.classList.remove('open');
      if (this.hotspotElements) {
        this.hotspotElements.forEach(item => item.element.classList.remove('active'));
      }
      this.activeHotspot = null;
    }
  }

  updateHotspotPositions() {
    if (!this.showHotspots || !this.hotspotsOverlay || this.hotspotsOverlay.style.display === 'none') return;

    const width = this.canvasContainer ? this.canvasContainer.clientWidth : window.innerWidth;
    const height = this.canvasContainer ? this.canvasContainer.clientHeight : window.innerHeight;
    const wp = new THREE.Vector3();

    this.hotspotElements.forEach(item => {
      wp.copy(item.data.position);
      wp.project(this.camera);

      if (wp.z > 1) {
        item.element.style.display = 'none';
        return;
      }

      const x = (wp.x * 0.5 + 0.5) * width;
      const y = (-(wp.y * 0.5) + 0.5) * height;

      item.element.style.display = 'flex';
      item.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  flyCameraTo(targetEye, targetLookAt) {
    this.cameraTargetPos.copy(targetEye);
    this.controlsTargetPos.copy(targetLookAt);
    this.cameraAnimating = true;
  }

  resetCamera() {
    this.flyCameraTo(this.defaultCameraPos, this.defaultControlsTarget);
  }

  setupEventListeners() {
    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.canvasContainer) return;
      const w = this.canvasContainer.clientWidth;
      const h = this.canvasContainer.clientHeight;
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Explode View Toggle & Slider
    const explodeBtn = document.getElementById('btn-explode-toggle');
    const explodeSlider = document.getElementById('slider-explode');

    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        this.isExploded = !this.isExploded;
        this.targetExplodedProgress = this.isExploded ? 1.0 : 0.0;
        explodeBtn.classList.toggle('active', this.isExploded);
        if (explodeSlider) {
          explodeSlider.value = this.isExploded ? 100 : 0;
        }
      });
    }

    if (explodeSlider) {
      explodeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.targetExplodedProgress = val;
        this.isExploded = val > 0.05;
        if (explodeBtn) {
          explodeBtn.classList.toggle('active', this.isExploded);
        }
      });
    }

    // Cargo Doors Toggle
    const doorsBtn = document.getElementById('btn-doors-toggle');
    if (doorsBtn) {
      doorsBtn.addEventListener('click', () => {
        this.doorsOpen = !this.doorsOpen;
        this.targetDoorsProgress = this.doorsOpen ? 1.0 : 0.0;
        doorsBtn.classList.toggle('active', this.doorsOpen);
        doorsBtn.textContent = this.doorsOpen ? 'Close Doors' : 'Open Doors';
      });
    }

    // Hotspots Toggle
    const hotspotsBtn = document.getElementById('btn-toggle-hotspots');
    if (hotspotsBtn) {
      hotspotsBtn.addEventListener('click', () => {
        this.toggleHotspots();
      });
    }

    // Reset View
    const resetBtn = document.getElementById('btn-reset-cam');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCamera();
      });
    }

    // Close Spec Drawer
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        const card = document.getElementById('spec-drawer');
        if (card) card.classList.remove('open');
        if (this.hotspotElements) {
          this.hotspotElements.forEach(item => item.element.classList.remove('active'));
        }
        this.activeHotspot = null;
      });
    }

    // Keyboard Shortcuts (H for hotspots, R for reset)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') {
        this.toggleHotspots();
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetCamera();
      }
    });
  }

  /**
   * Frame the whole model, centred, instead of trusting a per-type camera preset.
   *
   * Measured before writing this, rather than assumed: at the ORIGINAL preset distance, with no
   * tighten at all, the 40ft high cube still projects to 1.22 in NDC. So the 40-footers were
   * already overflowing the frame; the 25% tighten made it worse but did not cause it. The presets
   * were tuned for an unexploded box, and at the 50% default spread the parts fly out along a hull
   * twice as long.
   *
   * Two things are solved here. The orbit target moves to the model's own bounding-box centre,
   * because the preset target sat at half the container height while the exploded roof floats well
   * above that, which is what left dead space over the box. Then the distance is solved so the
   * furthest corner lands just inside the frame. Projected size is very nearly inversely
   * proportional to distance, so a few corrective steps converge quickly; three is ample and
   * cannot stall the way a while-loop could.
   *
   * This is per-model and per-viewport by construction, so it keeps working if the default spread,
   * the field of view, the container aspect or the iframe size ever change.
   */
  frameModelToFill() {
    if (!this.containerModel || !this.containerModel.group) return;

    const box = new THREE.Box3().setFromObject(this.containerModel.group);
    if (box.isEmpty()) return;

    // Slightly over 1.0 on purpose: the binding constraint is the exploded roof floating high, and
    // holding every last corner inside the frame left the 20ft small with dead space either side.
    // At 1.12 the extreme corners may graze the edge while the body of the box reads at a useful
    // size. Tuned by eye at the real iframe aspect (1280x560), not at a square test window.
    const FRAME_FILL = 1.12;

    const corners = [];
    for (let xi = 0; xi < 2; xi++) {
      for (let yi = 0; yi < 2; yi++) {
        for (let zi = 0; zi < 2; zi++) {
          corners.push(new THREE.Vector3(
            xi ? box.max.x : box.min.x,
            yi ? box.max.y : box.min.y,
            zi ? box.max.z : box.min.z
          ));
        }
      }
    }

    const centre = box.getCenter(new THREE.Vector3());
    const dir = this.defaultCameraPos.clone().sub(this.defaultControlsTarget).normalize();
    let dist = this.defaultCameraPos.distanceTo(this.defaultControlsTarget);

    for (let pass = 0; pass < 3; pass++) {
      this.camera.position.copy(centre).add(dir.clone().multiplyScalar(dist));
      this.camera.lookAt(centre);
      this.camera.updateMatrixWorld(true);

      let extent = 0;
      corners.forEach((c) => {
        const p = c.clone().project(this.camera);
        extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
      });
      if (extent <= 0) return;
      dist = dist * (extent / FRAME_FILL);
    }

    // Reset View reads both of these, so the button returns to this framing rather than the preset.
    this.defaultControlsTarget.copy(centre);
    this.defaultCameraPos.copy(centre).add(dir.multiplyScalar(dist));

    this.camera.position.copy(this.defaultCameraPos);
    this.camera.lookAt(centre);
    if (this.controls) {
      this.controls.target.copy(centre);
      this.controls.update();
    }
  }

  initVisibilityObserver() {
    // No IntersectionObserver (or no container) means we cannot tell, so assume visible and
    // behave exactly as before rather than silently freezing the viewer.
    if (!this.canvasContainer || typeof IntersectionObserver === 'undefined') return;

    this.visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });

    this.visibilityObserver.observe(this.canvasContainer);

    // An iframe that is scrolled out of the PARENT viewport is not reported by the observer
    // inside it, but the browser does fire visibilitychange on tab switches, so pick that up.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.isVisible = false;
      else if (this.visibilityObserver) {
        // Re-observe to get a fresh intersection reading for the now visible tab.
        this.visibilityObserver.unobserve(this.canvasContainer);
        this.visibilityObserver.observe(this.canvasContainer);
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Off screen: keep the loop armed, do no work. Every animation below is driven from
    // target values that survive the pause, so explode, doors and camera all resume correctly.
    if (!this.isVisible) return;

    // Smooth Exploded View transition
    if (Math.abs(this.explodedProgress - this.targetExplodedProgress) > 0.001) {
      this.explodedProgress += (this.targetExplodedProgress - this.explodedProgress) * 0.1;
      // ContainerModel exposes setExplosionFactor(0..1), not setExplodedProgress. The embed was
      // generated against an API this model file does not have. Same 0..1 semantics, direct rename.
      this.containerModel.setExplosionFactor(this.explodedProgress);
    }

    // Smooth Doors Swing transition
    if (Math.abs(this.doorsProgress - this.targetDoorsProgress) > 0.001) {
      this.doorsProgress += (this.targetDoorsProgress - this.doorsProgress) * 0.08;
      // Likewise setDoorsProgress does not exist. setDoorAngle takes RADIANS, and the sequential
      // right-then-left swing inside it is fully open at about PI * 1.5, so scale 0..1 into that.
      this.containerModel.setDoorAngle(this.doorsProgress * Math.PI * 1.5);
    }

    // Smooth Camera Fly-to transition
    if (this.cameraAnimating) {
      this.camera.position.lerp(this.cameraTargetPos, this.cameraLerpSpeed);
      this.controls.target.lerp(this.controlsTargetPos, this.cameraLerpSpeed);

      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.05 &&
          this.controls.target.distanceTo(this.controlsTargetPos) < 0.05) {
        this.camera.position.copy(this.cameraTargetPos);
        this.controls.target.copy(this.controlsTargetPos);
        this.cameraAnimating = false;
      }
    }

    this.controls.update();
    this.updateHotspotPositions();
    this.renderer.render(this.scene, this.camera);
  }
}
