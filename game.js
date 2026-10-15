/* ============================================================
   AIRPLANE BUILDER — v3
   Cores vivas + cenário 3D + pronúncia corrigida
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Voice } from './voice.js';
import { openLessonCard, isCardOpen, initPedagogy, speakLessonIntro } from './pedagogy.js';

const CONFIG = Object.freeze({
  SNAP_DISTANCE: 2.8,
  SNAP_ANIM_MS: 350,
  RETURN_ANIM_MS: 350,
  PICKUP_SCALE: 1.4,
  HOVER_SCALE: 1.15
});

/* ============================================================
   PALETA VIVA — cores saturadas com alto contraste
   ============================================================ */
const PALETTE = {
  fuselage: 0x1565c0,  /* azul forte */
  wing:     0xd32f2f,  /* vermelho vivo */
  tail:     0xfbc02d,  /* amarelo ouro */
  fin:      0x6a1b9a,  /* roxo profundo */
  propeller:0x2e7d32,  /* verde folha */
  nose:     0x00838f,  /* ciano escuro */
  engine:   0xef6c00,  /* laranja vibrante */
  cockpit:  0x00acc1,  /* ciano brilhante */
  pillar:   0x5d4037,  /* marrom madeira */
  accent:   0xf57c00   /* laranja quente */
};

/* ============================================================
   AVIAÇÕES
   ============================================================ */
const AIRPLANES = [
  {
    id: 'paper',
    name: 'Avião de Papel',
    emoji: '📄',
    parts: [
      { id:'fuselage',  color:PALETTE.fuselage,  geo:['cylinder',[0.5,0.5,3.5,16]],  slot:{pos:[0,0.6,0],   rot:[0,0,Math.PI/2]} },
      { id:'wing',      color:PALETTE.wing,      geo:['box',[4.5,0.15,1]],           slot:{pos:[0,0.6,0],   rot:[0,0,0]} },
      { id:'tail',      color:PALETTE.tail,      geo:['box',[1.4,0.15,0.7]],         slot:{pos:[-1.6,0.6,0],rot:[0,0,0]} },
      { id:'fin',       color:PALETTE.fin,       geo:['box',[0.8,0.8,0.15]],         slot:{pos:[-1.7,1.05,0],rot:[0,0,0]} },
      { id:'propeller', color:PALETTE.propeller, geo:['cone',[0.4,0.7,8]],           slot:{pos:[2.1,0.6,0], rot:[0,0,-Math.PI/2]} }
    ]
  },
  {
    id: 'fighter',
    name: 'Caça',
    emoji: '🛩️',
    parts: [
      { id:'fuselage', color:PALETTE.fuselage, geo:['cylinder',[0.45,0.6,3.8,16]], slot:{pos:[0,0.6,0], rot:[0,0,Math.PI/2]} },
      { id:'wing',     color:PALETTE.wing,     geo:['box',[5,0.15,1.2]],           slot:{pos:[0,0.6,0], rot:[0,0,0]} },
      { id:'tail',     color:PALETTE.accent,   geo:['box',[1.6,0.15,0.9]],         slot:{pos:[-1.5,0.6,0], rot:[0,0,0]} },
      { id:'fin',      color:PALETTE.fin,      geo:['box',[0.8,1,0.15]],           slot:{pos:[-1.7,1.15,0], rot:[0,0,0]} },
      { id:'nose',     color:PALETTE.propeller,geo:['cone',[0.45,0.8,16]],         slot:{pos:[2,0.6,0], rot:[0,0,-Math.PI/2]} }
    ]
  },
  {
    id: 'biplane',
    name: 'Biplano',
    emoji: '🛫',
    parts: [
      { id:'fuselage',    color:PALETTE.accent,    geo:['cylinder',[0.5,0.5,3.2,16]], slot:{pos:[0,0.6,0], rot:[0,0,Math.PI/2]} },
      { id:'wing-top',    color:PALETTE.tail,      geo:['box',[4.5,0.15,1]],          slot:{pos:[0,1.15,0], rot:[0,0,0]} },
      { id:'wing-bottom', color:PALETTE.tail,      geo:['box',[4.5,0.15,1]],          slot:{pos:[0,0.25,0], rot:[0,0,0]} },
      { id:'pillar-l',    color:PALETTE.wing,      geo:['box',[0.08,0.8,0.08]],       slot:{pos:[0,0.7,-0.45], rot:[0,0,0]} },
      { id:'pillar-r',    color:PALETTE.wing,      geo:['box',[0.08,0.8,0.08]],       slot:{pos:[0,0.7,0.45], rot:[0,0,0]} },
      { id:'propeller',   color:PALETTE.propeller, geo:['box',[0.12,1.2,0.15]],       slot:{pos:[1.8,0.6,0], rot:[0,0,0]} }
    ]
  },
  {
    id: 'jet',
    name: 'Jato Comercial',
    emoji: '✈️',
    parts: [
      { id:'fuselage',  color:PALETTE.cockpit,   geo:['cylinder',[0.55,0.55,5,16]], slot:{pos:[0,0.7,0], rot:[0,0,Math.PI/2]} },
      { id:'wing-l',    color:PALETTE.wing,      geo:['box',[2.4,0.15,1.3]], slot:{pos:[-0.2,0.45,-1.6], rot:[0,0.3,0]} },
      { id:'wing-r',    color:PALETTE.wing,      geo:['box',[2.4,0.15,1.3]], slot:{pos:[-0.2,0.45,1.6], rot:[0,-0.3,0]} },
      { id:'tail-wing', color:PALETTE.accent,    geo:['box',[1.6,0.12,1.1]], slot:{pos:[-2.2,0.7,0], rot:[0,0,0]} },
      { id:'fin',       color:PALETTE.fin,       geo:['box',[0.9,1.3,0.15]], slot:{pos:[-2.3,1.35,0], rot:[0,0,0]} },
      { id:'engine-l',  color:PALETTE.propeller, geo:['cylinder',[0.35,0.35,1.1,12]], slot:{pos:[0.2,0.2,-1.9], rot:[0,0,Math.PI/2]} },
      { id:'engine-r',  color:PALETTE.propeller, geo:['cylinder',[0.35,0.35,1.1,12]], slot:{pos:[0.2,0.2,1.9], rot:[0,0,Math.PI/2]} },
      { id:'nose',      color:PALETTE.engine,    geo:['cone',[0.55,0.7,16]], slot:{pos:[2.7,0.7,0], rot:[0,0,-Math.PI/2]} }
    ]
  }
];

/* ---------- STORAGE ---------- */
const Storage = {
  get(k, fb=null){ try{ const r=localStorage.getItem(k); return r===null?fb:r; }catch{ return fb; } },
  set(k,v){ try{ localStorage.setItem(k,String(v)); }catch{} },
  getJSON(k, fb){ try{ const r=localStorage.getItem(k); return r===null?fb:JSON.parse(r); }catch{ return fb; } },
  setJSON(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }
};

/* ============================================================
   CENA 3D — com céu, nuvens e iluminação quente
   ============================================================ */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

/* Céu gradiente — azul claro em cima, mais escuro embaixo */
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0xb3e5fc, 25, 60);

const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 200);
camera.position.set(6, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

/* Controles */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 5;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 0.6, 0);

/* ---------- ILUMINAÇÃO QUENTE ---------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.4);
sunLight.position.set(8, 12, 6);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

const skyLight = new THREE.DirectionalLight(0xbbdefb, 0.5);
skyLight.position.set(-8, 5, -5);
scene.add(skyLight);

const backLight = new THREE.DirectionalLight(0xffcc80, 0.3);
backLight.position.set(0, -3, -10);
scene.add(backLight);

/* ---------- CHÃO ---------- */
/* Plano de grama estilizado */
const groundGeo = new THREE.PlaneGeometry(60, 60);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x7cb342,
  roughness: 0.95,
  metalness: 0.0
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

/* Grade sutil sobre o chão (referência visual) */
const grid = new THREE.GridHelper(40, 40, 0x4caf50, 0x66bb6a);
grid.position.y = -0.49;
grid.material.opacity = 0.35;
grid.material.transparent = true;
scene.add(grid);

/* ---------- NUVENS ---------- */
const createCloud = (x, y, z, scale = 1) => {
  const cloud = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.15,
    roughness: 1.0,
    metalness: 0.0
  });

  /* Cada nuvem = 4-5 esferas agrupadas */
  const count = 4 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const s = new THREE.SphereGeometry(0.7 + Math.random() * 0.4, 8, 8);
    const sphere = new THREE.Mesh(s, mat);
    sphere.position.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 1.2
    );
    cloud.add(sphere);
  }

  cloud.position.set(x, y, z);
  cloud.scale.setScalar(scale);
  return cloud;
};

const clouds = [
  createCloud(-14, 6, -18, 1.8),
  createCloud(12, 8, -22, 2.2),
  createCloud(-8, 10, -30, 2.5),
  createCloud(15, 5, -15, 1.5),
  createCloud(-18, 7, -25, 1.9)
];
clouds.forEach(c => scene.add(c));

/* ============================================================
   ESTADO
   ============================================================ */
const state = {
  currentPlane: null,
  meshes: new Map(),
  slots: new Map(),
  draggable: [],
  placedParts: new Set(),
  dragging: null,
  hovered: null,
  moves: 0,
  startTime: 0,
  timerInterval: null,
  completedPlanes: Storage.getJSON('airplane.completed', []) || []
};

/* ---------- GEOMETRIA ---------- */
const buildGeometry = (def) => {
  const [type, params] = def;
  switch (type) {
    case 'box':      return new THREE.BoxGeometry(...params);
    case 'cylinder': return new THREE.CylinderGeometry(...params);
    case 'cone':     return new THREE.ConeGeometry(...params);
    case 'sphere':   return new THREE.SphereGeometry(...params);
    default:         return new THREE.BoxGeometry(1,1,1);
  }
};

/* ---------- LIMPAR ---------- */
const clearScene = () => {
  for (const m of state.meshes.values()) scene.remove(m);
  for (const s of state.slots.values()) scene.remove(s);
  state.meshes.clear();
  state.slots.clear();
  state.draggable.length = 0;
  state.placedParts.clear();
};

/* ---------- CARREGAR AVIÃO ---------- */
const loadPlane = (planeId) => {
  const plane = AIRPLANES.find(p => p.id === planeId);
  if (!plane) return;

  clearScene();
  state.currentPlane = plane;
  state.moves = 0;
  state.startTime = Date.now();

  /* Ghosts */
  plane.parts.forEach(part => {
    const geo = buildGeometry(part.geo);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
    const ghost = new THREE.Mesh(geo, mat);
    ghost.position.set(...part.slot.pos);
    ghost.rotation.set(...part.slot.rot);
    scene.add(ghost);
    state.slots.set(part.id, ghost);
  });

  /* Peças */
  plane.parts.forEach((part, i) => {
    const geo = buildGeometry(part.geo);
    const mat = new THREE.MeshStandardMaterial({
      color: part.color,
      metalness: 0.2,
      roughness: 0.35,
      emissive: part.color,
      emissiveIntensity: 0.25
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partId = part.id;

    const angle = (i / plane.parts.length) * Math.PI - Math.PI/2;
    const radius = 6;
    mesh.position.set(
      Math.cos(angle) * radius * 1.3,
      -0.3,
      Math.sin(angle) * radius * 0.7 + 5
    );
    mesh.rotation.set(
      (Math.random()-0.5)*0.4,
      Math.random()*Math.PI*2,
      (Math.random()-0.5)*0.4
    );
    mesh.userData.origin = mesh.position.clone();

    scene.add(mesh);
    state.meshes.set(part.id, mesh);
    state.draggable.push(mesh);
  });

  const dist = 7.5 + plane.parts.length * 0.15;
  camera.position.set(dist * 0.7, dist * 0.55, dist);
  controls.target.set(0, 0.6, 0);

  document.getElementById('hud-title').textContent = plane.emoji + ' ' + plane.name.toUpperCase();
  updateHUD();
  startTimer();
  Voice.welcome(plane.name);
};

/* ---------- HUD ---------- */
const updateHUD = () => {
  document.getElementById('stat-parts').textContent =
    `${state.placedParts.size}/${state.currentPlane.parts.length}`;
  document.getElementById('stat-moves').textContent = state.moves;
};

const startTimer = () => {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - state.startTime) / 1000);
    document.getElementById('stat-time').textContent = `${secs}s`;
  }, 1000);
};

/* ---------- DRAG & DROP ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
const dragOffset = new THREE.Vector3();
const intersect = new THREE.Vector3();

const updatePointer = (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
};

const onDown = (e) => {
  if (e.button !== undefined && e.button !== 0) return;
  if (!state.currentPlane) return;
  if (isCardOpen()) return;

  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(state.draggable, false);
  if (!hits.length) return;

  state.dragging = hits[0].object;
  if (state.placedParts.has(state.dragging.userData.partId)) {
    state.dragging = null;
    return;
  }

  Voice.pickup(state.dragging.userData.partId);

  controls.enabled = false;

  dragPlane.setFromNormalAndCoplanarPoint(
    new THREE.Vector3(0,1,0), state.dragging.position
  );
  raycaster.ray.intersectPlane(dragPlane, intersect);
  dragOffset.copy(state.dragging.position).sub(intersect);

  state.dragging.userData._s = 1;
  const up = () => {
    if (!state.dragging) return;
    state.dragging.userData._s = Math.min(CONFIG.PICKUP_SCALE, state.dragging.userData._s + 0.05);
    state.dragging.scale.setScalar(state.dragging.userData._s);
    if (state.dragging.userData._s < CONFIG.PICKUP_SCALE) requestAnimationFrame(up);
  };
  up();

  try { renderer.domElement.setPointerCapture(e.pointerId); } catch {}
};

const onMove = (e) => {
  if (!state.currentPlane) return;
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);

  if (state.dragging) {
    if (raycaster.ray.intersectPlane(dragPlane, intersect)) {
      state.dragging.position.copy(intersect.add(dragOffset));
    }
    return;
  }

  const hits = raycaster.intersectObjects(state.draggable, false);
  if (hits.length) {
    const obj = hits[0].object;
    if (!state.placedParts.has(obj.userData.partId)) {
      if (state.hovered !== obj) {
        if (state.hovered) state.hovered.scale.setScalar(1);
        state.hovered = obj;
        renderer.domElement.style.cursor = 'grab';
      }
      const t = CONFIG.HOVER_SCALE;
      if (obj.scale.x < t) obj.scale.setScalar(Math.min(t, obj.scale.x + 0.05));
    }
  } else if (state.hovered) {
    state.hovered.scale.setScalar(1);
    state.hovered = null;
    renderer.domElement.style.cursor = '';
  }
};

const onUp = (e) => {
  if (!state.dragging) return;

  const mesh = state.dragging;
  state.dragging = null;
  controls.enabled = true;

  mesh.userData._s = CONFIG.PICKUP_SCALE;
  const down = () => {
    mesh.userData._s = Math.max(1, mesh.userData._s - 0.05);
    mesh.scale.setScalar(mesh.userData._s);
    if (mesh.userData._s > 1) requestAnimationFrame(down);
    else mesh.scale.setScalar(1);
  };
  down();

  const partId = mesh.userData.partId;
  const slot = state.slots.get(partId);
  const part = state.currentPlane.parts.find(p => p.id === partId);
  const dist = mesh.position.distanceTo(slot.position);

  if (dist < CONFIG.SNAP_DISTANCE) {
    snap(mesh, part, slot);
  } else {
    returnHome(mesh);
  }

  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch {}
};

const snap = (mesh, part, slot) => {
  const sPos = mesh.position.clone();
  const sRot = mesh.rotation.clone();
  const tPos = slot.position.clone();
  const tRot = new THREE.Euler(...part.slot.rot);
  const t0 = performance.now();

  const anim = () => {
    const t = Math.min((performance.now() - t0) / CONFIG.SNAP_ANIM_MS, 1);
    const e = 1 - Math.pow(1 - t, 3);
    mesh.position.lerpVectors(sPos, tPos, e);
    mesh.rotation.x = sRot.x + (tRot.x - sRot.x) * e;
    mesh.rotation.y = sRot.y + (tRot.y - sRot.y) * e;
    mesh.rotation.z = sRot.z + (tRot.z - sRot.z) * e;
    if (t < 1) requestAnimationFrame(anim);
    else {
      slot.visible = false;
      state.placedParts.add(part.id);
      state.moves++;
      updateHUD();
      Voice.snap(part.id);
      console.log(`✅ ${part.id} (${state.placedParts.size}/${state.currentPlane.parts.length})`);

      const isLastPart = state.placedParts
