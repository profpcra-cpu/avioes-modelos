/* ============================================================
   BALL SORT — Airplane Builder | Motor 3D estável
   Etapa 1: recuperar drag funcional
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- CONFIG ---------- */
const CONFIG = Object.freeze({
  SNAP_DISTANCE: 2.8,
  SNAP_ANIM_MS: 350,
  RETURN_ANIM_MS: 350,
  PICKUP_SCALE: 1.4,
  HOVER_SCALE: 1.15
});

/* ---------- AVIAÇÕES ---------- */
const AIRPLANES = [
  {
    id: 'paper',
    name: 'Avião de Papel',
    emoji: '📄',
    parts: [
      { id:'fuselage',  color:0x38bdf8, geo:['cylinder',[0.5,0.5,3.5,16]],  slot:{pos:[0,0.6,0],   rot:[0,0,Math.PI/2]} },
      { id:'wing',      color:0xf43f5e, geo:['box',[4.5,0.15,1]],           slot:{pos:[0,0.6,0],   rot:[0,0,0]} },
      { id:'tail',      color:0xfacc15, geo:['box',[1.4,0.15,0.7]],         slot:{pos:[-1.6,0.6,0],rot:[0,0,0]} },
      { id:'fin',       color:0xa855f7, geo:['box',[0.8,0.8,0.15]],         slot:{pos:[-1.7,1.05,0],rot:[0,0,0]} },
      { id:'propeller', color:0x22c55e, geo:['cone',[0.4,0.7,8]],           slot:{pos:[2.1,0.6,0], rot:[0,0,-Math.PI/2]} }
    ]
  }
];

/* ---------- THREE.JS ---------- */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1628, 16, 34);

const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 100);
camera.position.set(6, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 18;
controls.target.set(0, 0.6, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const key = new THREE.DirectionalLight(0xffffff, 1.3);
key.position.set(5, 10, 7);
key.castShadow = true;
scene.add(key);
const fill = new THREE.DirectionalLight(0x7dd3fc, 0.5);
fill.position.set(-6, 3, -5);
scene.add(fill);

const grid = new THREE.GridHelper(24, 48, 0x3b82f6, 0x1e3a5f);
grid.position.y = -0.5;
scene.add(grid);

/* ---------- ESTADO ---------- */
const state = {
  meshes: new Map(),
  slots: new Map(),
  draggable: [],
  placedParts: new Set(),
  dragging: null,
  hovered: null
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

/* ---------- CARREGAR ---------- */
const plane = AIRPLANES[0];

/* Ghosts */
plane.parts.forEach(part => {
  const geo = buildGeometry(part.geo);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24, transparent: true, opacity: 0.35, wireframe: true
  });
  const ghost = new THREE.Mesh(geo, mat);
  ghost.position.set(...part.slot.pos);
  ghost.rotation.set(...part.slot.rot);
  scene.add(ghost);
  state.slots.set(part.id, ghost);
});

/* Peças — espalhadas em arco */
plane.parts.forEach((part, i) => {
  const geo = buildGeometry(part.geo);
  const mat = new THREE.MeshStandardMaterial({
    color: part.color, metalness: 0.15, roughness: 0.4,
    emissive: part.color, emissiveIntensity: 0.15
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
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

  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(state.draggable, false);
  if (!hits.length) return;

  state.dragging = hits[0].object;
  if (state.placedParts.has(state.dragging.userData.partId)) {
    state.dragging = null;
    return;
  }

  controls.enabled = false;

  dragPlane.setFromNormalAndCoplanarPoint(
    new THREE.Vector3(0,1,0), state.dragging.position
  );
  raycaster.ray.intersectPlane(dragPlane, intersect);
  dragOffset.copy(state.dragging.position).sub(intersect);

  /* Escala ao pegar */
  state.dragging.userData._s = 1;
  const up = () => {
    if (!state.dragging) return;
    state.dragging.userData._s = Math.min(CONFIG.PICKUP_SCALE, state.dragging.userData._s + 0.05);
    state.dragging.scale.setScalar(state.dragging.userData._s);
    if (state.dragging.userData._s < CONFIG.PICKUP_SCALE) requestAnimationFrame(up);
  };
  up();

  /* Captura o ponteiro para não perder o drag */
  try {
    renderer.domElement.setPointerCapture(e.pointerId);
  } catch {}
};

const onMove = (e) => {
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);

  if (state.dragging) {
    if (raycaster.ray.intersectPlane(dragPlane, intersect)) {
      state.dragging.position.copy(intersect.add(dragOffset));
    }
    return;
  }

  /* Hover */
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

  /* Volta a escala */
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
  const part = plane.parts.find(p => p.id === partId);
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
      console.log(`✅ Peça encaixada: ${part.id} (${state.placedParts.size}/${plane.parts.length})`);
    }
  };
  anim();
};

const returnHome = (mesh) => {
  const origin = mesh.userData.origin.clone();
  const start = mesh.position.clone();
  const t0 = performance.now();
  const anim = () => {
    const t = Math.min((performance.now() - t0) / CONFIG.RETURN_ANIM_MS, 1);
    const e = 1 - Math.pow(1 - t, 3);
    mesh.position.lerpVectors(start, origin, e);
    if (t < 1) requestAnimationFrame(anim);
  };
  anim();
};

/* ---------- EVENTOS ---------- */
renderer.domElement.addEventListener('pointerdown', onDown);
renderer.domElement.addEventListener('pointermove', onMove);
renderer.domElement.addEventListener('pointerup', onUp);
renderer.domElement.addEventListener('pointercancel', onUp);

/* ---------- RESIZE ---------- */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- LOOP ---------- */
const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  for (const [id, mesh] of state.meshes) {
    if (state.placedParts.has(id) || mesh === state.dragging) continue;
    const baseY = mesh.userData.origin?.y ?? -0.3;
    mesh.position.y = baseY + Math.sin(t * 1.5 + mesh.position.x) * 0.06;
    mesh.rotation.y += 0.004;
  }

  const prop = state.meshes.get('propeller');
  if (prop && state.placedParts.has('propeller')) prop.rotation.x += 0.18;

  for (const ghost of state.slots.values()) {
    if (ghost.visible) {
      const p = 0.7 + Math.sin(t * 2.5) * 0.3;
      ghost.material.opacity = 0.25 + p * 0.25;
    }
  }

  controls.update();
  renderer.render(scene, camera);
};
animate();

console.log('✅ game.js carregado —', plane.parts.length, 'peças criadas');
