/**
 * containerModel.js
 * Ultra-detailed 3D Procedural Model of 40ft High Cube ISO Shipping Container.
 * Features:
 * - Real-world ISO proportions (12.192m L x 2.438m W x 2.896m H)
 * - Ultra-high-detail Cargo Doors:
 *   * 5 forged steel hinges per door leaf (10 total) with knuckles, pins & 3 hex bolts each
 *   * 4 vertical galvanized lock rods with 4 guide bearing brackets each (16 total)
 *   * Forged top & bottom locking cams with dual-hook engagement
 *   * Top header & bottom sill cam keepers with anti-rack horns
 *   * Ergonomic lever handles with rubber grips, retainer catch brackets & customs seal lugs
 *   * Dual-lip EPDM rubber weather gasket with right-over-left center overlap flap
 *   * Authentic dual-sided door appearance: dark slate gray exterior with stencils,
 *     and light-gray interior with caution placards and technical stencils (photo 1)
 * - ISO 1161 Corner Castings with realistic 3D twistlock aperture cavities
 * - Chassis with 32 floor crossmembers, forklift pockets & gooseneck tunnel
 * - Marine Apitong hardwood plank floor with realistic wood grain & countersunk fasteners
 * - True 3D trapezoidal corrugated Corten walls & arched roof with crown camber
 * - Multi-stage construction sequencing & smooth exploded view mechanics
 */

import * as THREE from 'three';
import {
  createWoodFloorTexture,
  createCortenMetalTexture,
  createHazardStripeTexture,
  createDoorDecalsTexture,
  createInteriorDoorDecalsTexture
} from './textures.js';

export const CONTAINER_TYPES = {
  '40hc': {
    id: '40hc',
    name: "40' High Cube",
    shortName: '40HC',
    subtitle: '9\'6" High Cube ISO 1496-1',
    isoCode: '45G1',
    bicPrefix: 'LTSU  472404 5',
    length: 12.192,
    width: 2.438,
    height: 2.896,
    railHeight: 0.16,
    corrugationDepth: 0.045,
    corrugationPitch: 0.28,
    hasGooseneck: true,
    hasHazardStripes: true,
    isHighCube: true,
    crossmembersCount: 32,
    forkliftPockets: [-1.2, 1.2],
    tareKg: '3,900 KG',
    tareLbs: '8,600 LBS',
    maxGrossKg: '32,500 KG',
    maxGrossLbs: '71,650 LBS',
    payloadKg: '28,600 KG',
    payloadLbs: '63,050 LBS',
    cuM: '76.4 CU.M',
    cuFt: '2,700 CU.FT',
    intLength: "12,032 mm (39' 5.7\")",
    intWidth: "2,352 mm (7' 8.6\")",
    intHeight: "2,698 mm (8' 10.2\")",
    cameraFitRadius: 16.0
  },
  '40std': {
    id: '40std',
    name: "40' Standard",
    shortName: '40STD',
    subtitle: '8\'6" Standard Dry Van ISO 1496-1',
    isoCode: '42G1',
    bicPrefix: 'MSKU  819203 4',
    length: 12.192,
    width: 2.438,
    height: 2.591, // 8ft 6in (305mm lower than 40HC)
    railHeight: 0.16,
    corrugationDepth: 0.045,
    corrugationPitch: 0.28,
    hasGooseneck: true,
    hasHazardStripes: false,
    isHighCube: false,
    crossmembersCount: 32,
    forkliftPockets: [-1.2, 1.2],
    tareKg: '3,750 KG',
    tareLbs: '8,270 LBS',
    maxGrossKg: '32,500 KG',
    maxGrossLbs: '71,650 LBS',
    payloadKg: '28,750 KG',
    payloadLbs: '63,380 LBS',
    cuM: '67.7 CU.M',
    cuFt: '2,390 CU.FT',
    intLength: "12,032 mm (39' 5.7\")",
    intWidth: "2,352 mm (7' 8.6\")",
    intHeight: "2,393 mm (7' 10.2\")",
    cameraFitRadius: 15.5
  },
  '20std': {
    id: '20std',
    name: "20' Standard",
    shortName: '20STD',
    subtitle: '8\'6" Standard Dry Van ISO 1496-1',
    isoCode: '22G1',
    bicPrefix: 'TGHU  294812 7',
    length: 6.058, // 20 feet
    width: 2.438,
    height: 2.591,
    railHeight: 0.16,
    corrugationDepth: 0.045,
    corrugationPitch: 0.28,
    hasGooseneck: false,
    hasHazardStripes: false,
    isHighCube: false,
    crossmembersCount: 16,
    forkliftPockets: [0], // Centered forklift pocket per ISO 1496-1
    tareKg: '2,250 KG',
    tareLbs: '4,960 LBS',
    maxGrossKg: '30,480 KG',
    maxGrossLbs: '67,200 LBS',
    payloadKg: '28,230 KG',
    payloadLbs: '62,240 LBS',
    cuM: '33.2 CU.M',
    cuFt: '1,170 CU.FT',
    intLength: "5,898 mm (19' 4.2\")",
    intWidth: "2,352 mm (7' 8.6\")",
    intHeight: "2,393 mm (7' 10.2\")",
    cameraFitRadius: 9.5
  }
};

export const DIMENSIONS = CONTAINER_TYPES['40hc'];

export class ContainerModel {
  constructor(scene, typeId = '40hc') {
    this.scene = scene;
    this.currentTypeId = typeId;
    this.config = CONTAINER_TYPES[typeId] || CONTAINER_TYPES['40hc'];
    this.colorThemeHex = 0x155289;
    this.currentStage = 7;
    this.explosionFactor = 0;
    this.doorsOpenAngle = 0;
    this.currentRenderMode = 'shaded';

    this.group = new THREE.Group();
    this.group.name = 'shippingContainer';

    // Sub-assemblies for exploded view & construction sequencing
    this.parts = {
      understructure: new THREE.Group(),
      floor: new THREE.Group(),
      cornerPosts: new THREE.Group(),
      cornerCastings: new THREE.Group(),
      topRails: new THREE.Group(),
      wallLeft: new THREE.Group(),
      wallRight: new THREE.Group(),
      wallFront: new THREE.Group(),
      roof: new THREE.Group(),
      doorLeft: new THREE.Group(),
      doorRight: new THREE.Group(),
      decals: new THREE.Group()
    };

    this.doorPivots = {
      left: null,
      right: null
    };

    this.doorHandles = {
      left: [],
      right: []
    };

    this.materials = {};
    this.allMeshes = [];

    this.initMaterials();
    this.buildModel();
    this.setupExplodedVectors();

    this.scene.add(this.group);
  }

  initMaterials() {
    // Generate high-resolution procedural textures
    const floorCanvas = createWoodFloorTexture();
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;

    const metalCanvas = createCortenMetalTexture('#f2f2f2');
    const metalTex = new THREE.CanvasTexture(metalCanvas);
    metalTex.wrapS = THREE.RepeatWrapping;
    metalTex.wrapT = THREE.RepeatWrapping;
    metalTex.repeat.set(4, 2);

    const hazardCanvas = createHazardStripeTexture();
    const hazardTex = new THREE.CanvasTexture(hazardCanvas);
    hazardTex.wrapS = THREE.RepeatWrapping;
    hazardTex.wrapT = THREE.RepeatWrapping;
    hazardTex.repeat.set(2, 1);

    const doorDecalCanvas = createDoorDecalsTexture('#ffffff', this.config);
    const doorDecalTex = new THREE.CanvasTexture(doorDecalCanvas);

    const leftDoorInteriorTex = new THREE.CanvasTexture(createInteriorDoorDecalsTexture('left'));
    const rightDoorInteriorTex = new THREE.CanvasTexture(createInteriorDoorDecalsTexture('right'));

    // Corten Steel (Default: CMA CGM Deep Ocean Blue - RAL 5010)
    this.materials.corten = new THREE.MeshStandardMaterial({
      color: 0x155289,
      roughness: 0.52,
      metalness: 0.28,
      map: metalTex,
      side: THREE.DoubleSide
    });

    // Interior Wall Paint (Light off-white gray, matching reference photo 1)
    this.materials.interiorWall = new THREE.MeshStandardMaterial({
      color: 0xd8dee4,
      roughness: 0.65,
      metalness: 0.15,
      side: THREE.DoubleSide
    });

    // Heavy Structural Steel (corner posts, rails, headers)
    this.materials.structuralSteel = new THREE.MeshStandardMaterial({
      color: 0x22272c,
      roughness: 0.52,
      metalness: 0.45
    });

    // Understructure Chassis Steel
    this.materials.chassisSteel = new THREE.MeshStandardMaterial({
      color: 0x1d2125,
      roughness: 0.62,
      metalness: 0.4
    });

    // Marine Hardwood Plywood Floor
    this.materials.marineWood = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.72,
      metalness: 0.05
    });

    // ISO 1161 Cast Steel Corner Castings
    this.materials.castSteel = new THREE.MeshStandardMaterial({
      color: 0x202428,
      roughness: 0.45,
      metalness: 0.6
    });

    // Twistlock Cavity (inner recessed hole)
    this.materials.twistlockCavity = new THREE.MeshBasicMaterial({
      color: 0x050709
    });

    // Galvanized Steel (Lock rods, cams, keepers, handles)
    this.materials.galvanized = new THREE.MeshStandardMaterial({
      color: 0xd4dadf,
      roughness: 0.28,
      metalness: 0.88
    });

    // Rubber EPDM Door Gaskets & Flaps
    this.materials.rubberEPDM = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.94,
      metalness: 0.05
    });

    // Handle Rubber Grip Sleeves (Matte black with ribbed texture)
    this.materials.rubberGrip = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.88,
      metalness: 0.08
    });

    // Chrome/Zinc Plated Bolts & Rivets
    this.materials.hardwareChrome = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.2,
      metalness: 0.95
    });

    // Hazard Stripes
    this.materials.hazardStripes = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.4,
      metalness: 0.1
    });

    // Exterior Door Decals
    this.materials.doorDecals = new THREE.MeshStandardMaterial({
      map: doorDecalTex,
      transparent: true,
      roughness: 0.5,
      metalness: 0.2
    });

    // Interior Left Door Decal
    this.materials.leftInteriorDecal = new THREE.MeshStandardMaterial({
      map: leftDoorInteriorTex,
      transparent: true,
      roughness: 0.4,
      metalness: 0.1
    });

    // Interior Right Door Decal
    this.materials.rightInteriorDecal = new THREE.MeshStandardMaterial({
      map: rightDoorInteriorTex,
      transparent: true,
      roughness: 0.4,
      metalness: 0.1
    });
  }

  buildModel() {
    const L = this.config.length;
    const W = this.config.width;
    const H = this.config.height;
    const rH = this.config.railHeight;

    this.allMeshes = [];

    // Add all part groups to the container if not already present
    Object.values(this.parts).forEach(grp => {
      if (!this.group.children.includes(grp)) {
        this.group.add(grp);
      }
    });

    // 1. UNDERSTRUCTURE & CHASSIS
    this.buildUnderstructure(L, W, H, rH);

    // 2. MARINE PLYWOOD FLOOR
    this.buildFloor(L, W, H, rH);

    // 3. STRUCTURAL SKELETON (CORNER POSTS & ISO CASTINGS)
    this.buildFrameAndCastings(L, W, H);

    // 4. CORRUGATED CORTEN WALLS
    this.buildCorrugatedWalls(L, W, H, rH);

    // 5. CORRUGATED ROOF PANEL WITH CROWN CAMBER
    this.buildRoof(L, W, H);

    // 6. ULTRA-DETAILED CARGO DOORS & LOCK HARDWARE
    this.buildCargoDoors(L, W, H, rH);

    // Register all meshes for shadows & raycasting
    this.group.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        this.allMeshes.push(obj);
      }
    });
  }

  buildUnderstructure(L, W, H, rH) {
    const uGroup = this.parts.understructure;
    const railWidth = 0.12;

    // Bottom Side Rails (Heavy C-Channels)
    const sideRailGeom = new THREE.BoxGeometry(railWidth, rH, L);
    const leftRail = new THREE.Mesh(sideRailGeom, this.materials.corten);
    leftRail.position.set(-W / 2 + railWidth / 2, rH / 2, 0);
    uGroup.add(leftRail);

    const rightRail = new THREE.Mesh(sideRailGeom, this.materials.corten);
    rightRail.position.set(W / 2 - railWidth / 2, rH / 2, 0);
    uGroup.add(rightRail);

    // Front Bottom Sill & Rear Door Sill
    const sillGeom = new THREE.BoxGeometry(W - railWidth * 2, rH, 0.16);
    const frontSill = new THREE.Mesh(sillGeom, this.materials.corten);
    frontSill.position.set(0, rH / 2, -L / 2 + 0.08);
    uGroup.add(frontSill);

    const rearSill = new THREE.Mesh(sillGeom, this.materials.corten);
    rearSill.position.set(0, rH / 2, L / 2 - 0.08);
    uGroup.add(rearSill);

    // Transverse Floor Crossmembers (spaced at 12-inch centers)
    const numCrossmembers = this.config.crossmembersCount;
    const crossSpacing = (L - 0.4) / numCrossmembers;
    const crossWidth = W - railWidth * 2;
    const floorThick = 0.028; // 28mm Apitong marine plywood
    const crossMemberH = rH - floorThick;
    const crossGeom = new THREE.BoxGeometry(crossWidth, crossMemberH, 0.05);

    for (let i = 1; i < numCrossmembers; i++) {
      const zPos = -L / 2 + 0.2 + i * crossSpacing;
      // Skip at forklift pocket locations
      let inPocket = false;
      for (const pz of this.config.forkliftPockets) {
        if (Math.abs(zPos - pz) < 0.25) { inPocket = true; break; }
      }
      if (inPocket) continue;

      const crossMember = new THREE.Mesh(crossGeom, this.materials.chassisSteel);
      crossMember.position.set(0, crossMemberH / 2, zPos);
      uGroup.add(crossMember);
    }

    // Forklift Pockets
    const pocketPositions = this.config.forkliftPockets;
    const pocketWidth = 0.355;
    const pocketHeight = 0.115;
    const pocketGeom = new THREE.BoxGeometry(W, pocketHeight, pocketWidth);

    pocketPositions.forEach(z => {
      const pocket = new THREE.Mesh(pocketGeom, this.materials.corten);
      pocket.position.set(0, pocketHeight / 2 + 0.02, z);
      uGroup.add(pocket);

      // Yellow exterior indicators on rail
      const indGeom = new THREE.BoxGeometry(0.01, 0.06, 0.22);
      const indLeft = new THREE.Mesh(indGeom, this.materials.hazardStripes);
      indLeft.position.set(-W / 2 - 0.005, rH / 2, z);
      uGroup.add(indLeft);

      const indRight = new THREE.Mesh(indGeom, this.materials.hazardStripes);
      indRight.position.set(W / 2 + 0.005, rH / 2, z);
      uGroup.add(indRight);
    });

    // Gooseneck Tunnel Recess (Standard on 40ft containers, omitted on 20ft)
    if (this.config.hasGooseneck) {
      const tunnelLength = 3.2;
      const tunnelWidth = 1.029;
      const tunnelHeight = 0.12;
      const tunnelGeom = new THREE.BoxGeometry(tunnelWidth, tunnelHeight, tunnelLength);
      const tunnel = new THREE.Mesh(tunnelGeom, this.materials.chassisSteel);
      tunnel.position.set(0, tunnelHeight / 2, -L / 2 + tunnelLength / 2);
      uGroup.add(tunnel);
    }
  }

  buildFloor(L, W, H, rH) {
    const fGroup = this.parts.floor;
    const floorThick = 0.028; // 28mm Apitong marine plywood
    // Width and length sized to fit cleanly inside interior perimeter of side rails and sills
    const floorWidth = W - 0.25;
    const floorLength = L - 0.34;

    const floorGeom = new THREE.BoxGeometry(floorWidth, floorThick, floorLength);
    const floorMesh = new THREE.Mesh(floorGeom, this.materials.marineWood);
    // Flush with top flange of bottom side rails and sill (rH = 0.16)
    floorMesh.position.set(0, rH - floorThick / 2, 0);
    floorMesh.name = 'marineWoodFloor';
    fGroup.add(floorMesh);
  }

  buildFrameAndCastings(L, W, H) {
    const postGroup = this.parts.cornerPosts;
    const castGroup = this.parts.cornerCastings;
    const topRailGroup = this.parts.topRails;

    const postSize = 0.14;
    const postHeight = H - 0.24;

    // 4 Heavy Corner Posts (Box profile with hinge lug mounts on rear)
    const postGeom = new THREE.BoxGeometry(postSize, postHeight, postSize);
    const posts = [
      { x: -W / 2 + postSize / 2, z: -L / 2 + postSize / 2, name: 'postFL' },
      { x: W / 2 - postSize / 2, z: -L / 2 + postSize / 2, name: 'postFR' },
      { x: -W / 2 + postSize / 2, z: L / 2 - postSize / 2, name: 'postRL' },
      { x: W / 2 - postSize / 2, z: L / 2 - postSize / 2, name: 'postRR' }
    ];

    posts.forEach(p => {
      const post = new THREE.Mesh(postGeom, this.materials.corten);
      post.position.set(p.x, H / 2, p.z);
      post.name = p.name;
      postGroup.add(post);
    });

    // 8 ISO 1161 Corner Castings with true 3D aperture cavities
    const castL = 0.178;
    const castW = 0.162;
    const castH = 0.118;

    const cornerCoords = [
      // Bottom 4 castings
      { x: -W / 2 + castW / 2, y: castH / 2, z: -L / 2 + castL / 2, isTop: false, rY: 0 },
      { x: W / 2 - castW / 2, y: castH / 2, z: -L / 2 + castL / 2, isTop: false, rY: Math.PI / 2 },
      { x: -W / 2 + castW / 2, y: castH / 2, z: L / 2 - castL / 2, isTop: false, rY: -Math.PI / 2 },
      { x: W / 2 - castW / 2, y: castH / 2, z: L / 2 - castL / 2, isTop: false, rY: Math.PI },
      // Top 4 castings
      { x: -W / 2 + castW / 2, y: H - castH / 2, z: -L / 2 + castL / 2, isTop: true, rY: 0 },
      { x: W / 2 - castW / 2, y: H - castH / 2, z: -L / 2 + castL / 2, isTop: true, rY: Math.PI / 2 },
      { x: -W / 2 + castW / 2, y: H - castH / 2, z: L / 2 - castL / 2, isTop: true, rY: -Math.PI / 2 },
      { x: W / 2 - castW / 2, y: H - castH / 2, z: L / 2 - castL / 2, isTop: true, rY: Math.PI }
    ];

    cornerCoords.forEach((c, idx) => {
      const cg = this.createDetailedCornerCasting(castW, castH, castL, c.isTop);
      cg.position.set(c.x, c.y, c.z);
      cg.rotation.y = c.rY;
      cg.name = `cornerCasting_${idx}`;
      castGroup.add(cg);
    });

    // Top Side Rails (Left & Right structural box tubes)
    const topRailGeom = new THREE.BoxGeometry(0.06, 0.08, L - postSize * 2);
    const leftTR = new THREE.Mesh(topRailGeom, this.materials.corten);
    leftTR.position.set(-W / 2 + 0.03, H - 0.04, 0);
    topRailGroup.add(leftTR);

    const rightTR = new THREE.Mesh(topRailGeom, this.materials.corten);
    rightTR.position.set(W / 2 - 0.03, H - 0.04, 0);
    topRailGroup.add(rightTR);

    // Front Top Header & Rear Door Top Header
    const headerGeom = new THREE.BoxGeometry(W - postSize * 2, 0.16, 0.08);
    const fHeader = new THREE.Mesh(headerGeom, this.materials.corten);
    fHeader.position.set(0, H - 0.08, -L / 2 + 0.04);
    topRailGroup.add(fHeader);

    const rHeader = new THREE.Mesh(headerGeom, this.materials.corten);
    rHeader.position.set(0, H - 0.08, L / 2 - 0.04);
    topRailGroup.add(rHeader);

    // Full Width Hazard Warning Stripes on Top Header (Required only on High Cube 9'6" containers)
    if (this.config.hasHazardStripes) {
      const hStripeGeom = new THREE.PlaneGeometry(W - 0.28, 0.08);
      const rHaz = new THREE.Mesh(hStripeGeom, this.materials.hazardStripes);
      rHaz.position.set(0, H - 0.08, L / 2 + 0.005);
      this.parts.decals.add(rHaz);

      const fHaz = new THREE.Mesh(hStripeGeom, this.materials.hazardStripes);
      fHaz.position.set(0, H - 0.08, -L / 2 - 0.005);
      fHaz.rotation.y = Math.PI;
      this.parts.decals.add(fHaz);
    }
  }

  createDetailedCornerCasting(w, h, l, isTop) {
    const grp = new THREE.Group();

    // Main cast steel block
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), this.materials.corten);
    grp.add(block);

    // Top / Bottom Face: Standard ISO Oval Aperture (124mm x 63.5mm)
    const ovalGeom = new THREE.CylinderGeometry(0.036, 0.036, 0.016, 18);
    ovalGeom.scale(1.0, 1.0, 1.95);
    const oval = new THREE.Mesh(ovalGeom, this.materials.twistlockCavity);
    oval.position.set(0, isTop ? h / 2 + 0.002 : -h / 2 - 0.002, 0);
    grp.add(oval);

    // Outer Side Face: Oblong Slot (63.5mm x 63.5mm)
    const sideSlotGeom = new THREE.BoxGeometry(0.014, 0.048, 0.09);
    const sideSlot = new THREE.Mesh(sideSlotGeom, this.materials.twistlockCavity);
    sideSlot.position.set(w / 2 + 0.002, 0, 0);
    grp.add(sideSlot);

    // Front/End Face: Oblong Slot
    const endSlotGeom = new THREE.BoxGeometry(0.09, 0.048, 0.014);
    const endSlot = new THREE.Mesh(endSlotGeom, this.materials.twistlockCavity);
    endSlot.position.set(0, 0, l / 2 + 0.002);
    grp.add(endSlot);

    return grp;
  }

  buildCorrugatedWalls(L, W, H, rH) {
    const wallH = H - rH - 0.08 + 0.01; // Spans between bottom rail top and top rail bottom with 5mm overlap on each
    const wallL = L - 0.28;
    const depth = this.config.corrugationDepth;
    const pitch = this.config.corrugationPitch;

    // True 3D trapezoidal corrugations
    const wallGeom = this.createCorrugatedWallGeometry(wallL, wallH, pitch, depth);

    // Left Corrugated Wall (welded seamlessly to bottom side rail)
    const leftW = new THREE.Mesh(wallGeom, this.materials.corten);
    leftW.position.set(-W / 2 + 0.03, rH - 0.005, 0);
    leftW.name = 'corrugatedWallLeft';
    this.parts.wallLeft.add(leftW);

    // Right Corrugated Wall (welded seamlessly to bottom side rail)
    const rightW = new THREE.Mesh(wallGeom, this.materials.corten);
    rightW.position.set(W / 2 - 0.03, rH - 0.005, 0);
    rightW.rotation.y = Math.PI;
    rightW.name = 'corrugatedWallRight';
    this.parts.wallRight.add(rightW);

    // Front Bulkhead End Wall (welded seamlessly to front sill)
    const frontGeom = this.createCorrugatedWallGeometry(W - 0.28, wallH, pitch, depth);
    const frontW = new THREE.Mesh(frontGeom, this.materials.corten);
    frontW.position.set(0, rH - 0.005, -L / 2 + 0.06);
    frontW.rotation.y = Math.PI / 2;
    frontW.name = 'frontBulkhead';
    this.parts.wallFront.add(frontW);

    // Air Ventilation Louvers/Cowls (near top corners of sidewalls, visible in photo 2)
    const ventGeom = new THREE.BoxGeometry(0.015, 0.08, 0.22);
    [-L / 2 + 1.2, L / 2 - 1.2].forEach(vz => {
      const ventL = new THREE.Mesh(ventGeom, this.materials.corten);
      ventL.position.set(-W / 2 - 0.005, H - 0.22, vz);
      this.parts.wallLeft.add(ventL);

      const ventR = new THREE.Mesh(ventGeom, this.materials.corten);
      ventR.position.set(W / 2 + 0.005, H - 0.22, vz);
      this.parts.wallRight.add(ventR);
    });
  }

  createCorrugatedWallGeometry(totalLen, height, pitch, depth) {
    const pts = [];
    const num = Math.floor(totalLen / pitch);
    const sZ = -totalLen / 2;

    pts.push({ z: sZ, x: 0 });
    for (let i = 0; i < num; i++) {
      const z0 = sZ + i * pitch;
      pts.push(
        { z: z0 + pitch * 0.25, x: 0 },
        { z: z0 + pitch * 0.45, x: depth },
        { z: z0 + pitch * 0.75, x: depth },
        { z: z0 + pitch * 0.95, x: 0 }
      );
    }
    pts.push({ z: totalLen / 2, x: 0 });

    const pos = [], uvs = [], idx = [];
    pts.forEach((p, i) => {
      pos.push(p.x, 0, p.z);
      uvs.push(i / (pts.length - 1), 0);

      pos.push(p.x, height, p.z);
      uvs.push(i / (pts.length - 1), 1);
    });

    for (let i = 0; i < pts.length - 1; i++) {
      const b0 = i * 2, t0 = i * 2 + 1;
      const b1 = (i + 1) * 2, t1 = (i + 1) * 2 + 1;
      idx.push(b0, b1, t0, b1, t1, t0);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  buildRoof(L, W, H) {
    const rGroup = this.parts.roof;
    const roofWidth = W - 0.12;
    const roofLength = L - 0.28;
    const pitch = 0.25;
    const depth = 0.035;
    const camber = 0.025; // 25mm crown arch

    const roofGeom = this.createCorrugatedRoofGeometry(roofLength, roofWidth, pitch, depth, camber);
    const roof = new THREE.Mesh(roofGeom, this.materials.corten);
    roof.position.set(0, H - 0.04, 0);
    roof.name = 'corrugatedRoof';
    rGroup.add(roof);
  }

  createCorrugatedRoofGeometry(length, width, pitch, depth, camber) {
    const zPts = [];
    const num = Math.floor(length / pitch);
    const sZ = -length / 2;

    zPts.push({ z: sZ, y: 0 });
    for (let i = 0; i < num; i++) {
      const z0 = sZ + i * pitch;
      zPts.push(
        { z: z0 + pitch * 0.25, y: 0 },
        { z: z0 + pitch * 0.45, y: depth },
        { z: z0 + pitch * 0.75, y: depth },
        { z: z0 + pitch * 0.95, y: 0 }
      );
    }
    zPts.push({ z: length / 2, y: 0 });

    const steps = 8;
    const pos = [], uvs = [], idx = [];

    for (let zi = 0; zi < zPts.length; zi++) {
      const pz = zPts[zi];
      for (let xi = 0; xi <= steps; xi++) {
        const u = xi / steps;
        const px = -width / 2 + u * width;
        const arch = camber * (1 - Math.pow((2 * px) / width, 2));
        pos.push(px, pz.y + arch, pz.z);
        uvs.push(u, zi / (zPts.length - 1));
      }
    }

    const stride = steps + 1;
    for (let zi = 0; zi < zPts.length - 1; zi++) {
      for (let xi = 0; xi < steps; xi++) {
        const i0 = zi * stride + xi;
        const i1 = i0 + 1;
        const i2 = (zi + 1) * stride + xi;
        const i3 = i2 + 1;
        idx.push(i0, i2, i1, i1, i2, i3);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // =========================================================
  // HIGH-DETAIL CARGO DOORS & LOCK HARDWARE
  // =========================================================
  buildCargoDoors(L, W, H, rH) {
    // Clear opening height between top header bottom (H - 0.16) and bottom sill top (rH)
    const clearH = (H - 0.16) - rH;
    // Overlap 12mm on top and bottom so door seals completely over sill and header
    const doorH = clearH + 0.024;
    const doorW = (W - 0.22) / 2;
    const doorCenterY = (rH - 0.012) + doorH / 2;

    // Left Door Pivot (at hinge post center line)
    const lPiv = new THREE.Group();
    lPiv.position.set(-W / 2 + 0.08, doorCenterY, L / 2 - 0.04);
    this.parts.doorLeft.add(lPiv);
    this.doorPivots.left = lPiv;

    // Right Door Pivot (at hinge post center line)
    const rPiv = new THREE.Group();
    rPiv.position.set(W / 2 - 0.08, doorCenterY, L / 2 - 0.04);
    this.parts.doorRight.add(rPiv);
    this.doorPivots.right = rPiv;

    // Build Detailed Left Door Leaf
    const lDoor = this.createDetailedDoorLeaf(doorW, doorH, 'left', L, W, H, rH);
    lDoor.position.set(doorW / 2, 0, 0);
    lPiv.add(lDoor);

    // Build Detailed Right Door Leaf
    const rDoor = this.createDetailedDoorLeaf(doorW, doorH, 'right', L, W, H, rH);
    rDoor.position.set(-doorW / 2, 0, 0);
    rPiv.add(rDoor);

    // Cam Keepers welded to the frame header and sill (4 top, 4 bottom)
    this.buildCamKeepers(doorW, doorH, W, H, L, rH, doorCenterY);
  }

  createDetailedDoorLeaf(doorW, doorH, side, L, W, H, rH) {
    const leaf = new THREE.Group();
    leaf.name = `doorLeaf_${side}`;
    const frameThick = 0.05;

    // 1. Perimeter Structural Box Frame (100mm x 50mm rectangular tubing)
    const outerFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, frameThick),
      this.materials.corten
    );
    leaf.add(outerFrame);

    // 2. Interior Face Plate (Light gray interior matching photo 1)
    const innerFace = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.02, doorH - 0.02, 0.01),
      this.materials.interiorWall
    );
    innerFace.position.set(0, 0, -frameThick / 2 - 0.005);
    leaf.add(innerFace);

    // 3. Corrugated Door Inset Panel (Vertical trapezoidal stamping)
    const corrugGeom = this.createCorrugatedWallGeometry(doorW - 0.08, doorH - 0.08, 0.24, 0.025);
    const corrugMesh = new THREE.Mesh(corrugGeom, this.materials.corten);
    corrugMesh.position.set(0, -doorH / 2 + 0.04, frameThick / 2 + 0.001);
    corrugMesh.rotation.y = -Math.PI / 2;
    leaf.add(corrugMesh);

    // 4. Continuous EPDM Weather Gasket around full perimeter
    const gasket = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.018, doorH + 0.018, 0.028),
      this.materials.rubberEPDM
    );
    gasket.position.set(0, 0, -0.015);
    leaf.add(gasket);

    // 5. Right Door Center Overlap Flap (Seals over the left door meeting edge)
    if (side === 'right') {
      const overlapFlap = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, doorH, 0.035),
        this.materials.rubberEPDM
      );
      overlapFlap.position.set(-doorW / 2 - 0.02, 0, 0.005);
      leaf.add(overlapFlap);
    }

    // 6. EXACTLY 5 FORGED STEEL HINGES PER DOOR (10 total, matching photo 1 & 2)
    const numHinges = 5;
    const hingeBladeGeom = new THREE.BoxGeometry(0.18, 0.065, 0.025);
    const hingeKnuckleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.09, 16);
    const hingePinGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 16);
    const zerkGeom = new THREE.CylinderGeometry(0.004, 0.004, 0.012, 8); // grease nipple
    const boltGeom = new THREE.CylinderGeometry(0.009, 0.009, 0.01, 6); // hex bolt head

    const hingeEdgeX = side === 'left' ? -doorW / 2 : doorW / 2;
    const bladeOffsetX = side === 'left' ? 0.08 : -0.08;

    for (let h = 0; h < numHinges; h++) {
      // Spacing: 5 hinges evenly distributed along door height
      const hy = -doorH / 2 + 0.18 + h * ((doorH - 0.36) / (numHinges - 1));

      // Hinge Knuckle on Post (painted body color)
      const knuckle = new THREE.Mesh(hingeKnuckleGeom, this.materials.corten);
      knuckle.position.set(hingeEdgeX, hy, frameThick / 2);
      leaf.add(knuckle);

      // Hinge Pin (galvanized)
      const pin = new THREE.Mesh(hingePinGeom, this.materials.galvanized);
      pin.position.set(hingeEdgeX, hy, frameThick / 2);
      leaf.add(pin);

      // Grease fitting on hinge knuckle
      const zerk = new THREE.Mesh(zerkGeom, this.materials.hardwareChrome);
      zerk.rotation.z = Math.PI / 2;
      zerk.position.set(hingeEdgeX + (side === 'left' ? -0.02 : 0.02), hy, frameThick / 2);
      leaf.add(zerk);

      // Forged Hinge Strap / Blade bolted to door frame (painted body color)
      const blade = new THREE.Mesh(hingeBladeGeom, this.materials.corten);
      blade.position.set(hingeEdgeX + bladeOffsetX, hy, frameThick / 2 + 0.012);
      leaf.add(blade);

      // 3 Hex Mounting Bolts per hinge blade
      [-0.05, 0, 0.05].forEach(bx => {
        const bolt = new THREE.Mesh(boltGeom, this.materials.hardwareChrome);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(hingeEdgeX + bladeOffsetX + bx, hy, frameThick / 2 + 0.026);
        leaf.add(bolt);
      });
    }

    // 7. TWO FULL-LENGTH VERTICAL LOCK RODS PER DOOR (4 total)
    const rodRadius = 0.018; // 36mm thick galvanized steel pipe
    const rodGeom = new THREE.CylinderGeometry(rodRadius, rodRadius, doorH + 0.09, 18);
    const rodPositions = side === 'left'
      ? [-doorW * 0.24, doorW * 0.25]
      : [-doorW * 0.25, doorW * 0.24];

    rodPositions.forEach((rx, rodIdx) => {
      // Vertical Lock Pipe
      const rod = new THREE.Mesh(rodGeom, this.materials.galvanized);
      rod.position.set(rx, 0, frameThick / 2 + 0.038);
      leaf.add(rod);

      // 4 Cast Steel Guide Bearing Brackets per rod (16 brackets total, painted body color)
      const numBrackets = 4;
      const bracketGeom = new THREE.BoxGeometry(0.075, 0.07, 0.045);
      const bushGeom = new THREE.CylinderGeometry(rodRadius + 0.005, rodRadius + 0.005, 0.065, 16);

      for (let b = 0; b < numBrackets; b++) {
        const by = -doorH / 2 + 0.15 + b * ((doorH - 0.3) / (numBrackets - 1));

        const bracket = new THREE.Mesh(bracketGeom, this.materials.corten);
        bracket.position.set(rx, by, frameThick / 2 + 0.028);
        leaf.add(bracket);

        // Anti-friction bushing insert
        const bush = new THREE.Mesh(bushGeom, this.materials.hardwareChrome);
        bush.position.set(rx, by, frameThick / 2 + 0.038);
        leaf.add(bush);

        // 2 Mounting Hex Bolts per bracket
        [-0.028, 0.028].forEach(boltX => {
          const bolt = new THREE.Mesh(boltGeom, this.materials.hardwareChrome);
          bolt.rotation.x = Math.PI / 2;
          bolt.position.set(rx + boltX, by, frameThick / 2 + 0.052);
          leaf.add(bolt);
        });
      }

      // Top & Bottom Forged Double-Hook Locking Cams
      const camGeom = this.createForgedCamGeometry();

      const topCam = new THREE.Mesh(camGeom, this.materials.galvanized);
      topCam.position.set(rx, doorH / 2 + 0.035, frameThick / 2 + 0.038);
      leaf.add(topCam);

      const bottomCam = new THREE.Mesh(camGeom, this.materials.galvanized);
      bottomCam.rotation.z = Math.PI; // Inverted for bottom engagement
      bottomCam.position.set(rx, -doorH / 2 - 0.035, frameThick / 2 + 0.038);
      leaf.add(bottomCam);

      // Ergonomic Operating Lever Handle at waist height
      const handleHubGeom = new THREE.CylinderGeometry(0.028, 0.028, 0.05, 16);
      const handleArmGeom = new THREE.BoxGeometry(0.018, 0.28, 0.022);
      const rubberGripGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 16);

      const handleGroup = new THREE.Group();
      handleGroup.position.set(rx, -0.15, frameThick / 2 + 0.038);

      // Handle Hub welded to rod
      const hub = new THREE.Mesh(handleHubGeom, this.materials.galvanized);
      handleGroup.add(hub);

      // Forged Handle Arm
      const arm = new THREE.Mesh(handleArmGeom, this.materials.galvanized);
      arm.position.set(0.045, -0.08, 0.03);
      arm.rotation.z = Math.PI / 5;
      handleGroup.add(arm);

      // Ribbed Black Rubber Grip Sleeve
      const grip = new THREE.Mesh(rubberGripGeom, this.materials.rubberGrip);
      grip.position.set(0.075, -0.14, 0.03);
      grip.rotation.z = Math.PI / 5;
      handleGroup.add(grip);

      leaf.add(handleGroup);
      this.doorHandles[side].push(handleGroup);

      // Handle Retainer Catch Bracket mounted to door face (painted body color)
      const catchGeom = new THREE.BoxGeometry(0.045, 0.065, 0.04);
      const catchBracket = new THREE.Mesh(catchGeom, this.materials.corten);
      catchBracket.position.set(rx + 0.08, -0.25, frameThick / 2 + 0.028);
      leaf.add(catchBracket);

      // Customs Seal Hole Latch (for ISO 17712 Bolt Seal)
      const sealHoleGeom = new THREE.TorusGeometry(0.012, 0.004, 8, 16);
      const sealLug = new THREE.Mesh(sealHoleGeom, this.materials.hardwareChrome);
      sealLug.rotation.y = Math.PI / 2;
      sealLug.position.set(rx + 0.08, -0.28, frameThick / 2 + 0.048);
      leaf.add(sealLug);
    });

    // 8. DOOR STENCILS & PLACARDS
    if (side === 'right') {
      // Exterior markings (LTSU 472404 5, 45G1, 45 HIGH, CSC plate)
      const extDecal = new THREE.Mesh(
        new THREE.PlaneGeometry(doorW * 0.88, doorH * 0.88),
        this.materials.doorDecals
      );
      extDecal.position.set(0, 0, frameThick / 2 + 0.027);
      leaf.add(extDecal);

      // Interior right door stencils & caution decal (photo 1)
      const intDecalR = new THREE.Mesh(
        new THREE.PlaneGeometry(doorW * 0.82, doorH * 0.82),
        this.materials.rightInteriorDecal
      );
      intDecalR.position.set(0, 0.08, -frameThick / 2 - 0.008);
      intDecalR.rotation.y = Math.PI;
      leaf.add(intDecalR);
    } else {
      // Interior left door caution decal & stencils (photo 1)
      const intDecalL = new THREE.Mesh(
        new THREE.PlaneGeometry(doorW * 0.82, doorH * 0.82),
        this.materials.leftInteriorDecal
      );
      intDecalL.position.set(0, 0.08, -frameThick / 2 - 0.008);
      intDecalL.rotation.y = Math.PI;
      leaf.add(intDecalL);
    }

    return leaf;
  }

  createForgedCamGeometry() {
    // Sculpted double-action locking cam
    const shape = new THREE.Shape();
    shape.moveTo(-0.025, -0.035);
    shape.lineTo(0.025, -0.035);
    shape.lineTo(0.032, 0.015);
    shape.lineTo(0.018, 0.045); // Tapered lead-in beak
    shape.lineTo(-0.018, 0.045);
    shape.lineTo(-0.032, 0.015);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 3
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }

  buildCamKeepers(doorW, doorH, W, H, L, rH, doorCenterY) {
    // 4 Top Cam Keepers on Door Header & 4 Bottom Cam Keepers on Door Sill
    const keeperGeom = new THREE.BoxGeometry(0.065, 0.05, 0.06);

    const leftRodPositions = [-doorW * 0.24, doorW * 0.25];
    const rightRodPositions = [-doorW * 0.25, doorW * 0.24];

    // Left door rod positions in world coordinates
    const leftWorldX = leftRodPositions.map(rx => -W / 2 + 0.08 + doorW / 2 + rx);
    // Right door rod positions in world coordinates
    const rightWorldX = rightRodPositions.map(rx => W / 2 - 0.08 - doorW / 2 + rx);
    const allRodX = [...leftWorldX, ...rightWorldX];

    // Align with top and bottom cam engagements
    const topCamY = doorCenterY + doorH / 2 + 0.035;
    const botCamY = doorCenterY - doorH / 2 - 0.035;

    allRodX.forEach(wx => {
      // Top Cam Keeper mounted on Rear Door Top Header
      const topKeeper = new THREE.Mesh(keeperGeom, this.materials.corten);
      topKeeper.position.set(wx, topCamY, L / 2 - 0.01);
      this.parts.topRails.add(topKeeper);

      // Bottom Cam Keeper mounted on Rear Door Sill
      const botKeeper = new THREE.Mesh(keeperGeom, this.materials.corten);
      botKeeper.position.set(wx, botCamY, L / 2 - 0.01);
      this.parts.understructure.add(botKeeper);
    });
  }

  setupExplodedVectors() {
    this.explodedOffsets = {
      understructure: new THREE.Vector3(0, -0.45, 0),
      floor: new THREE.Vector3(0, 0.85, 0),
      cornerPosts: new THREE.Vector3(0, 0, 0),
      cornerCastings: 0.95,
      topRails: new THREE.Vector3(0, 1.3, 0),
      wallLeft: new THREE.Vector3(-2.2, 0, 0),
      wallRight: new THREE.Vector3(2.2, 0, 0),
      wallFront: new THREE.Vector3(0, 0, -2.8),
      roof: new THREE.Vector3(0, 2.6, 0),
      doorLeft: new THREE.Vector3(-0.6, 0, 2.6),
      doorRight: new THREE.Vector3(0.6, 0, 2.6),
      decals: new THREE.Vector3(0, 0, 0)
    };

    this.restPositions = {};
    Object.keys(this.parts).forEach(key => {
      this.restPositions[key] = this.parts[key].position.clone();
    });
  }

  setExplosionFactor(t) {
    this.explosionFactor = t;

    Object.keys(this.parts).forEach(key => {
      const rest = this.restPositions[key];
      const offset = this.explodedOffsets[key];
      if (offset instanceof THREE.Vector3) {
        this.parts[key].position.lerpVectors(rest, rest.clone().add(offset), t);
      }
    });

    // Radial diagonal displacement for the 8 corner castings
    const castDist = this.explodedOffsets.cornerCastings * t;
    const { width: W, height: H, length: L } = this.config;
    this.parts.cornerCastings.children.forEach(casting => {
      const sx = casting.position.x >= 0 ? 1 : -1;
      const sy = casting.position.y >= H / 2 ? 1 : -1;
      const sz = casting.position.z >= 0 ? 1 : -1;
      casting.position.x = (sx * (W / 2 - 0.08)) + sx * castDist;
      casting.position.y = (sy > 0 ? H - 0.06 : 0.06) + sy * castDist * 0.6;
      casting.position.z = (sz * (L / 2 - 0.09)) + sz * castDist;
    });
  }

  setDoorAngle(angle) {
    // Realistic Sequential Door Opening:
    // In ISO containers, the Right Door overlaps the Left Door with an EPDM rubber seal.
    // The Right Door must open FIRST, followed by the Left Door!
    this.doorsOpenAngle = angle;

    if (this.doorPivots.right && this.doorPivots.left) {
      // Right door opens between 0.0 and 0.6 progress
      const rightProgress = Math.min(1.0, angle / (Math.PI * 1.5 * 0.65));
      const rightAngle = rightProgress * (Math.PI * 1.45); // opens up to ~260 deg

      // Left door starts opening once right door is clear (>0.35 progress)
      const leftProgress = Math.max(0.0, (angle - 0.4) / (Math.PI * 1.5 * 0.7));
      const leftAngle = Math.min(1.0, leftProgress) * (Math.PI * 1.45);

      this.doorPivots.right.rotation.y = rightAngle;
      this.doorPivots.left.rotation.y = -leftAngle;

      // Handle unlatch rotation during initial opening
      const handleRotate = Math.min(1.0, angle * 4.0) * (Math.PI / 3);
      ['left', 'right'].forEach(s => {
        this.doorHandles[s].forEach(h => {
          h.rotation.z = -handleRotate;
        });
      });
    }
  }

  setConstructionStage(stageNum) {
    this.currentStage = stageNum;
    this.parts.understructure.visible = stageNum >= 1;
    this.parts.floor.visible = stageNum >= 2;
    this.parts.cornerPosts.visible = stageNum >= 3;
    this.parts.cornerCastings.visible = stageNum >= 3;
    this.parts.wallLeft.visible = stageNum >= 4;
    this.parts.wallRight.visible = stageNum >= 4;
    this.parts.wallFront.visible = stageNum >= 4;
    this.parts.topRails.visible = stageNum >= 5;
    this.parts.roof.visible = stageNum >= 5;
    this.parts.doorLeft.visible = stageNum >= 6;
    this.parts.doorRight.visible = stageNum >= 6;
    this.parts.decals.visible = stageNum >= 7;
  }

  setRenderMode(mode) {
    this.currentRenderMode = mode;
    this.group.traverse(child => {
      if (!child.isMesh) return;

      if (mode === 'wireframe') {
        child.material.wireframe = true;
        child.material.opacity = 0.85;
        child.material.transparent = true;
      } else if (mode === 'xray') {
        child.material.wireframe = false;
        child.material.transparent = true;
        child.material.opacity = child.name === 'corrugatedWallLeft' || child.name === 'corrugatedRoof' ? 0.18 : 0.65;
        child.material.depthWrite = false;
      } else {
        child.material.wireframe = false;
        child.material.transparent =
          child.material === this.materials.doorDecals ||
          child.material === this.materials.leftInteriorDecal ||
          child.material === this.materials.rightInteriorDecal;
        child.material.opacity = 1.0;
        child.material.depthWrite = true;
      }
    });

    if (mode === 'cutaway') {
      this.parts.wallLeft.visible = false;
      this.parts.roof.visible = false;
    } else {
      this.parts.wallLeft.visible = true;
      this.parts.roof.visible = true;
    }
  }

  setColorTheme(themeHex) {
    this.colorThemeHex = themeHex;
    if (this.materials.corten) {
      this.materials.corten.color.setHex(themeHex);

      // Contrast adjustment for door stencil text:
      // Black stencils on bright livery (Orange RAL 2004, Yellow RAL 1023)
      // White stencils on dark livery (Ocean Blue RAL 5010, Sky Blue, Green, Slate Gray)
      const isLightTheme = (themeHex === 0xe25816 || themeHex === 0xf5ad18);
      const textColor = isLightTheme ? '#14181c' : '#ffffff';
      const newCanvas = createDoorDecalsTexture(textColor, this.config);
      if (this.materials.doorDecals && this.materials.doorDecals.map) {
        this.materials.doorDecals.map.image = newCanvas;
        this.materials.doorDecals.map.needsUpdate = true;
      }
    }
  }

  setContainerType(typeId) {
    if (!CONTAINER_TYPES[typeId]) return;
    const prevStage = this.currentStage;
    const prevExplosion = this.explosionFactor;
    const prevDoorsOpen = this.doorsOpenAngle;
    const prevColor = this.colorThemeHex;
    const prevMode = this.currentRenderMode || 'shaded';

    // Remove all children from container group
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    // Dispose old mesh geometries
    this.allMeshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
    });

    for (const key in this.materials) {
      if (this.materials[key].map) this.materials[key].map.dispose();
      this.materials[key].dispose();
    }

    this.currentTypeId = typeId;
    this.config = CONTAINER_TYPES[typeId];

    this.parts = {
      understructure: new THREE.Group(),
      floor: new THREE.Group(),
      cornerPosts: new THREE.Group(),
      cornerCastings: new THREE.Group(),
      topRails: new THREE.Group(),
      wallLeft: new THREE.Group(),
      wallRight: new THREE.Group(),
      wallFront: new THREE.Group(),
      roof: new THREE.Group(),
      doorLeft: new THREE.Group(),
      doorRight: new THREE.Group(),
      decals: new THREE.Group()
    };

    this.doorPivots = { left: null, right: null };
    this.doorHandles = { left: [], right: [] };
    this.materials = {};
    this.allMeshes = [];

    this.initMaterials();
    this.buildModel();
    this.setupExplodedVectors();

    this.setColorTheme(prevColor);
    this.setConstructionStage(prevStage);
    this.setExplosionFactor(prevExplosion);
    this.setDoorAngle(prevDoorsOpen);
    this.setRenderMode(prevMode);
  }
}

export function getHotspots(config = CONTAINER_TYPES['40hc']) {
  const L = config.length;
  const W = config.width;
  const H = config.height;
  const rH = config.railHeight;
  const is20 = (config.id === '20std');

  return [
    {
      id: 'hinges_hardware',
      title: '5-Hinge Heavy Forged Pin System',
      category: 'Door Suspension & Racking',
      position: new THREE.Vector3(W / 2 - 0.05, H * 0.65, L / 2 - 0.02),
      cameraTarget: new THREE.Vector3(W / 2 - 0.05, H * 0.65, L / 2),
      cameraPos: new THREE.Vector3(W / 2 + 0.6, H * 0.65, L / 2 + 0.8),
      material: 'Drop-Forged High Tensile Steel with Brass Bushings',
      purpose: 'Five heavy-duty forged hinge blades per door (10 total) bolted with triple high-tensile hex bolts. Carries the heavy door leaf weight and transfers longitudinal racking loads directly into the rear corner post.',
      loadSpec: 'Engineered to support 270-degree door swing without sagging; tested to resist 15,240 kg racking load.',
      fabrication: 'Hinge knuckles precision bored, fitted with self-lubricating bronze bushes and zerk grease fittings.'
    },
    {
      id: 'lock_rods_hardware',
      title: '4 Vertical Lock Rods & Cam-Keepers',
      category: 'Security & Cargo Surge Resistance',
      position: new THREE.Vector3(W / 4, H / 2, L / 2 + 0.05),
      cameraTarget: new THREE.Vector3(W / 4, H / 2, L / 2),
      cameraPos: new THREE.Vector3(W / 4 + 0.6, H / 2, L / 2 + 1.2),
      material: '36mm Heavy-Wall Hot-Dip Galvanized Carbon Steel Pipe',
      purpose: 'Four full-length locking bars guided by 16 cast bearing brackets. Rotating the operating handles drives the forged top and bottom cams into heavy keepers, locking the rear frame rigid.',
      loadSpec: 'Withstands dynamic cargo surge pressures of 0.6P during emergency train deceleration or vessel roll.',
      fabrication: 'Galvanized pipe with welded drop-forged cams; fitted with anti-theft customs seal lugs for ISO 17712 bolt seals.'
    },
    {
      id: 'handle_mechanism',
      title: 'Ergonomic Lever Handles & Customs Seal',
      category: 'Door Operation & Tamper Security',
      position: new THREE.Vector3(W / 4 + 0.08, H * 0.45, L / 2 + 0.08),
      cameraTarget: new THREE.Vector3(W / 4, H * 0.45, L / 2),
      cameraPos: new THREE.Vector3(W / 4 + 0.4, H * 0.45, L / 2 + 0.6),
      material: 'Forged Steel Handle with Molded Rubber Grip Sleeve',
      purpose: 'Provides ergonomic mechanical leverage to compress the airtight EPDM door seals into the frame. Latches into a steel catch bracket with holes for high-security customs bolt seals and padlocks.',
      loadSpec: 'Requires up to 300 Nm opening torque when seals are fully compressed.',
      fabrication: 'Drop-forged handle arm welded to heavy rod hub; fitted with weather-resistant nitrile rubber grip.'
    },
    {
      id: 'epdm_overlap',
      title: 'Dual-Lip EPDM Gasket & Center Overlap',
      category: 'Weatherproof & Airtight Sealing',
      position: new THREE.Vector3(0.02, H * 0.72, L / 2 + 0.02),
      cameraTarget: new THREE.Vector3(0, H * 0.72, L / 2),
      cameraPos: new THREE.Vector3(0.4, H * 0.72, L / 2 + 0.9),
      material: 'Vulcanized Dual-Lip EPDM (Ethylene Propylene Diene Monomer)',
      purpose: 'Continuous multi-lip seal around the door frame with a dedicated center vertical overlap flap on the right door. Ensures 100% wind-and-water-tight (WWT) cargo protection against high-seas waves.',
      loadSpec: 'Certified to maintain sealing elasticity across temperature extremes of -40°C to +80°C.',
      fabrication: 'Multi-cavity extrusion with molded corner joints; mechanically clamped with stainless steel rivets.'
    },
    {
      id: 'corner_casting',
      title: 'ISO 1161 Corner Castings',
      category: 'Stacking & Intermodal Rigging',
      position: new THREE.Vector3(W / 2, H, L / 2),
      cameraTarget: new THREE.Vector3(W / 2 - 0.2, H - 0.2, L / 2 - 0.2),
      cameraPos: new THREE.Vector3(W / 2 + 1.2, H + 0.8, L / 2 + 1.2),
      material: 'Cast Carbon-Manganese Steel (SCW 480 / ASTM A216 WCB)',
      purpose: 'Universal intermodal interface points with standardized twistlock apertures (top oval, side oblong). Enables twistlocks, ship cell guides, and crane spreaders to lift and secure the container.',
      loadSpec: 'Tested to support 86,400 kg (190,000 lbs) per post. Allows containers to stack 9-high fully loaded on ocean vessels.',
      fabrication: 'Sand-cast and heat-treated (quenched and tempered) to resist brittle fracture in arctic maritime conditions (-40°C).'
    },
    {
      id: 'corten_walls',
      title: 'Corten-A (SPA-H) Corrugated Side Panels',
      category: 'Monocoque Structural Envelope',
      position: new THREE.Vector3(W / 2 + 0.05, H / 2, 0),
      cameraTarget: new THREE.Vector3(W / 2, H / 2, 0),
      cameraPos: new THREE.Vector3(W / 2 + 3.0, H / 2 + 0.5, 0),
      material: '2.0mm SPA-H Atmospheric Corrosion-Resistant Corten Steel',
      purpose: 'Trapezoidal corrugation profile (repeating ridges & valleys) dramatically multiplies structural rigidity and shear strength without adding deadweight.',
      loadSpec: 'Resists transverse racking loads up to 15,240 kg (33,600 lbs) during sea swells.',
      fabrication: 'Cold-rolled coils stamped with hydraulic presses, continuously automated MIG seam-welded.'
    },
    {
      id: 'floor_crossmembers',
      title: 'Transverse Floor Crossmember Grid',
      category: 'Payload Substructure',
      position: new THREE.Vector3(0, 0.08, 0),
      cameraTarget: new THREE.Vector3(0, 0.2, 0),
      cameraPos: new THREE.Vector3(1.8, 1.2, 1.8),
      material: '4.5mm C-Channel / I-Beam High Tensile Structural Steel',
      purpose: `${config.crossmembersCount} heavy load-bearing transverse rib members spaced along the chassis to support concentrated cargo and forklift drive axles.`,
      loadSpec: 'Rated for heavy industrial forklift axle loads up to 5,460 kg (12,000 lbs) per ISO 1496-1 standard.',
      fabrication: 'Robotic fillet-welded directly to the bottom side rails; coated with black bitumen underseal.'
    },
    {
      id: 'marine_floor',
      title: 'Apitong Marine Hardwood Plywood Floor',
      category: 'Interior Flooring',
      position: new THREE.Vector3(0, rH + 0.05, is20 ? 1.0 : 2.5),
      cameraTarget: new THREE.Vector3(0, rH, is20 ? 0.8 : 2.0),
      cameraPos: new THREE.Vector3(0, rH + 1.2, is20 ? 2.5 : 4.5),
      material: '28mm (1-1/8") 19-Ply Laminated Apitong / Keruing Hardwood',
      purpose: 'Provides a non-slip, dense, rot-resistant deck capable of withstanding heavy pallet jacks and chemical resistance.',
      loadSpec: 'Multi-layer cross-grain lamination resists point punctures and shear loads up to 30 metric tons distributed payload.',
      fabrication: 'Panels are pressure-treated with quarantine insecticides per Australian AQIS regulations, screwed with countersunk self-tapping screws.'
    },
    {
      id: 'csc_plate',
      title: 'CSC Safety Approval Data Plate',
      category: 'Maritime Regulatory Compliance',
      position: new THREE.Vector3(W / 4, H * 0.35, L / 2 + 0.05),
      cameraTarget: new THREE.Vector3(W / 4, H * 0.35, L / 2),
      cameraPos: new THREE.Vector3(W / 4, H * 0.35, L / 2 + 0.9),
      material: 'Stainless Steel / Chemically Etched Aluminum',
      purpose: `Mandated by the International Convention for Safe Containers (CSC 1972). Certifies inspection, max gross weight (${config.maxGrossKg}), stacking capacity, and timber quarantine treatment.`,
      loadSpec: `Approved for ${config.maxGrossKg} Max Gross, 192,000 kg Stacking, 15,240 kg Racking.`,
      fabrication: 'Permanently riveted to the exterior of the door with tamper-evident stainless steel rivets.'
    }
  ];
}

export const HOTSPOTS = getHotspots(CONTAINER_TYPES['40hc']);
