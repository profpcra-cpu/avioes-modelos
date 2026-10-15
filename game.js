/* ============================================================
   AIRPLANE BUILDER — Motor 3D + Menu + HUD + Voz + Pedagogia
   Camada 3: integração com card pedagógico
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Voice } from './voice.js';
import { openLessonCard, isCardOpen, initPedagogy, speakLessonIntro } from './pedagogy.js';

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
    difficulty: 1,
    parts: [
      { id:'fuselage',  color:0x38bdf8, geo:['cylinder',[0.5,0.5,3.5,16]],  slot:{pos:[0,0.6,0],   rot:[0,0,Math.PI/2]} },
      { id:'wing',      color:0xf43f5e, geo:['box',[4.5,0.15,1]],           slot:{pos:[0,0.6,0],   rot:[0,0,0]} },
      { id:'tail',      color:0xfacc15, geo:['box',[1.4,0.15,0.7]],         slot:{pos:[-1.6,0.6,0],rot:[0,0,0]} },
      { id:'fin',       color:0xa855f7, geo:['box',[0.8,0.8,0.15]],         slot:{pos:[-1.7,1.05,0],rot:[0,0,0]} },
      { id:'propeller', color:0x22c55e, geo:['cone',[0.4,0.7,8]],           slot:{pos:[2.1,0.6,0], rot:[0,0,-Math.PI/2]} }
    ]
  },
  {
    id: 'fighter',
    name: 'Caça',
    emoji: '🛩️',
    difficulty: 2,
    parts: [
      { id:'fuselage', color:0x0ea5e9, geo:['cylinder',[0.45,0.6,3.8,16]], slot:{pos:[0,0.6,0], rot:[0,0,Math.PI/2]} },
      { id:'wing',     color:0xef4444, geo:['box',[5,0.15,1.2]],           slot:{pos:[0,0.6,0], rot:[0,0,0]} },
      { id:'tail',     color:0xf59e0b, geo:['box',[1.6,0.15,0.9]],         slot:{pos:[-1.5,0.6,0], rot:[0,0,0]} },
      { id:'fin',      color:0xa855f7, geo:['box',[0.8,1,0.15]],           slot:{pos:[-1.7,1.15,0], rot:[0,0,0]} },
      { id:'nose',     color:0x22c55e, geo:['cone',[0.45,0.8,16]],         slot:{pos:[2,0.6,0], rot:[0,0,-Math.PI/2]} }
    ]
  },
  {
    id: 'biplane',
    name: 'Biplano',
    emoji: '🛫',
    difficulty: 3,
    parts: [
      { id:'fuselage',    color:0xf59e0b, geo:['cylinder',[0.5,0.5,3.2,16]], slot:{pos:[0,0.6,0], rot:[0,0,Math.PI/2]} },
      { id:'wing-top',    color:0xfacc15, geo:['box',[4.5,0.15,1]],          slot:{pos:[0,1.15,0], rot:[0,0,0]} },
      { id:'wing-bottom', color:0xfacc15, geo:['box',[4.5,0.15,1]],          slot:{pos:[0,0.25,0], rot:[0,0,0]} },
      { id:'pillar-l',    color:0xdc2626, geo:['box',[0.08,0.8,0.08]],       slot:{pos:[0,0.7,-0.45], rot:[0,0,0]} },
      { id:'pillar-r',    color:0xdc2626, geo:['box',[0.08,0.8,0.08]],       slot:{pos:[0,0.7,0.45], rot:[0,0,0]} },
      { id:'propeller',   color:0x22c55e, geo:['box',[0.12,1.2,0.15]],       slot:{pos:[1.8,0.6,0], rot:[0,0,0]} }
    ]
  },
  {
    id: 'jet',
    name: 'Jato Comercial',
    emoji: '✈️',
    difficulty: 4,
    parts: [
      { id:'fuselage', color:0x38bdf8, geo:['cylinder',[0.55,0.55,5,16]], slot:{pos:[0,0.7,0], rot:[0,0,Math.PI/2]} },
      { id:'wing-l',   color:0xef4444, geo:['box',[2.4,0.15,1.3]], slot:{pos:[-0.2,0.45,-1.6], rot:[0,0.3,0]} },
      { id:'wing-r',   color:0xef4444, geo:['box',[2.4,0.15,1.3]], slot:{pos:[-0.2,0.45,1.6], rot:[0,-0.3,0]} },
      { id:'tail-wing',color:0xf59e0b, geo:['box',[1.6,0.12,1.1]], slot:{pos:[-2.2,0.7,0], rot:[0,0,0]} },
      { id:'fin',      color:0xf43f5e, geo:['box',[0.9,1.3,0.15]], slot:{pos:[-2.3,1.35,0], rot:[0,0,0]} },
      { id:'engine-l', color:0x22c55e, geo:['cylinder',[0.35,0.35,1.1,12]], slot:{pos:[0.2,0.2,-1.9], rot:[0,0,Math.PI/2]} },
      { id:'engine-r', color:0x22c55e, geo:['cylinder',[0.35,0.35,1.1,12]], slot:{pos:[0.2,0.2,1.9], rot:[0,0,Math.PI/2]} },
      { id:'nose',     color:0xa855f7, geo:['cone',[0.55,0.7,16]], slot:{pos:[2.7,0.7,0], rot:[0,0,-Math.PI/2]} }
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
controls.maxDistance = 20;
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

/* ---------- LIMPAR CENA ---------- */
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
      color: 0xfbbf24, transparent: true, opacity: 0.35, wireframe: true
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

      const isLastPart = state.placedParts.size === state.currentPlane.parts.length;

      if (!isLastPart) {
        setTimeout(() => {
          speakLessonIntro(part.id);
          openLessonCard(part.id);
        }, 500);
      } else {
        setTimeout(onWin, 600);
      }
    }
  };
  anim();
};

const returnHome = (mesh) => {
  Voice.wrong();
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

/* ---------- WIN ---------- */
const onWin = () => {
  clearInterval(state.timerInterval);
  Voice.win(state.currentPlane.name);
  const planeId = state.currentPlane.id;
  if (!state.completedPlanes.includes(planeId)) {
    state.completedPlanes.push(planeId);
    Storage.setJSON('airplane.completed', state.completedPlanes);
  }
  const secs = Math.floor((Date.now() - state.startTime) / 1000);
  document.getElementById('win-title').textContent = `${state.currentPlane.emoji} Montado!`;
  document.getElementById('win-message').textContent = `Você completou o ${state.currentPlane.name}!`;
  document.getElementById('win-moves').textContent = state.moves;
  document.getElementById('win-time').textContent = `${secs}s`;
  document.getElementById('win-modal').classList.add('active');
};

/* ---------- EVENTOS 3D ---------- */
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

/* ============================================================
   INTERFACE — MENU E BOTÕES
   ============================================================ */
const $ = id => document.getElementById(id);

const renderMenu = () => {
  const grid = $('plane-grid');
  grid.replaceChildren();

  AIRPLANES.forEach((plane, idx) => {
    const completed = state.completedPlanes.includes(plane.id);
    const locked = idx > 0 && !state.completedPlanes.includes(AIRPLANES[idx-1].id);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'plane-card';
    if (completed) card.classList.add('completed');
    if (locked) card.classList.add('locked');
    card.disabled = locked;

    const emoji = document.createElement('span');
    emoji.className = 'plane-emoji';
    emoji.textContent = plane.emoji;

    const name = document.createElement('div');
    name.className = 'plane-name';
    name.textContent = plane.name;

    const parts = document.createElement('div');
    parts.className = 'plane-parts';
    parts.textContent = `${plane.parts.length} peças`;

    card.append(emoji, name, parts);
    if (!locked) card.addEventListener('click', () => startPlane(plane.id));
    grid.appendChild(card);
  });
};

const startPlane = (planeId) => {
  $('main-menu').classList.add('hidden');
  $('hud-top').style.display = '';
  $('hud-bottom').style.display = '';
  $('win-modal').classList.remove('active');
  loadPlane(planeId);
};

const backToMenu = () => {
  clearInterval(state.timerInterval);
  clearScene();
  Voice.stop();
  state.currentPlane = null;
  $('main-menu').classList.remove('hidden');
  $('hud-top').style.display = 'none';
  $('hud-bottom').style.display = 'none';
  $('win-modal').classList.remove('active');
  renderMenu();
};

/* Botões */
$('btn-back').addEventListener('click', backToMenu);

$('btn-reset').addEventListener('click', () => {
  if (!state.currentPlane) return;
  loadPlane(state.currentPlane.id);
});

$('btn-next').addEventListener('click', () => {
  const idx = AIRPLANES.indexOf(state.currentPlane);
  const next = AIRPLANES[idx + 1];
  if (next) startPlane(next.id);
  else backToMenu();
});

/* Botão de voz */
const btnVoice = $('btn-voice');
if (btnVoice) {
  btnVoice.textContent = Voice.isEnabled() ? '🔊' : '🔇';
  btnVoice.addEventListener('click', () => {
    const on = Voice.toggle();
    btnVoice.textContent = on ? '🔊' : '🔇';
  });
}

/* ---------- HOOKS ---------- */
/* Quando o card fecha, verifica se completou o avião */
window.__onCardClosed = () => {
  if (state.currentPlane && state.placedParts.size === state.currentPlane.parts.length) {
    setTimeout(onWin, 300);
  }
};

/* Permitir que o pedagogy.js chame a voz */
window.__voiceSpeak = (text) => Voice.say(text);

/* ---------- BOOT ---------- */
renderMenu();
initPedagogy();
document.getElementById('loading').classList.add('hidden');
console.log('✅ game.js carregado —', AIRPLANES.length, 'aviões disponíveis');

/* DEBUG: tecla V testa voz */
document.addEventListener('keydown', (e) => {
  if (e.key === 'v' || e.key === 'V') {
    console.log('🎤 Testando voz...');
    Voice.test();
  }
});
