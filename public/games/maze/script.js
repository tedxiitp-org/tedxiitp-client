import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ─── Game State ───
let gltfScene = null;
let collidableMeshes = []; // meshes for raycasting
let startPoint = { x: 0, y: 0, z: 0 };
let exitPoint = { x: 0, y: 0, z: 0 };
let exitPortal = null;
let gameWon = false;
let isLoaded = false;

// ─── Timer for Score Tracking ───
let gameStartTime = 0;

// ─── Floor Path Line & Particles ───
let floorPathMesh = null;
let pathPulseParticles = [];

// ─── Physics Config ───
let playerYaw = 0;
let velocityY = 0;
let isGrounded = false;

const MOVE_SPEED = 4.5;
const ROT_SPEED = 2.2;
const GRAVITY = -18.0;
const JUMP_FORCE = 7.0;
const PLAYER_HEIGHT = 1.5;
const PLAYER_RADIUS = 0.35;
const STEP_HEIGHT = 0.5;
const NUM_COLLISION_RAYS = 12;

// ─── Input ───
const keys = {};
let joystickX = 0;
let joystickY = 0;

// ─── Scene ───
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080810);
scene.fog = new THREE.FogExp2(0x080810, 0.025);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 500
);

// ─── Lighting ───
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xc8d8ff, 0x444422, 0.6);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
sunLight.position.set(20, 40, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 120;
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// Player flashlight
const flashlight = new THREE.SpotLight(0xffffff, 3.0, 20, Math.PI / 5, 0.5, 0.7);
flashlight.castShadow = false;
const flashlightTarget = new THREE.Object3D();
flashlightTarget.position.set(0, -0.1, -1);
camera.add(flashlightTarget);
camera.add(flashlight);
flashlight.target = flashlightTarget;
scene.add(camera);

// ─── Renderer ───
const canvas = document.getElementById("maze-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const GRID_COLS = 50;
let GRID_ROWS = 50;
let mazeMin = new THREE.Vector3();
let mazeMax = new THREE.Vector3();
let mazeSize = new THREE.Vector3();
let floorHeights = [];
let floorGrids = [];

// ─── Raycasters ───
const _ray = new THREE.Raycaster();
const _down = new THREE.Vector3(0, -1, 0);
const _up = new THREE.Vector3(0, 1, 0);

// ═══════════════════════════════════════════════════════
// LOAD MODEL — restore original door handling
// ═══════════════════════════════════════════════════════
const loader = new GLTFLoader();
loader.load(
  "Maze.glb?t=" + Date.now(),
  (gltf) => {
    gltfScene = gltf.scene;
    scene.add(gltfScene);

    gltfScene.updateMatrixWorld(true);
    gltfScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.side = THREE.DoubleSide;
        child.visible = true;
        collidableMeshes.push(child);
      }
    });

    // Compute world bounds
    const box = new THREE.Box3().setFromObject(gltfScene);
    mazeMin.copy(box.min);
    mazeMax.copy(box.max);
    mazeSize.copy(box.max).sub(box.min);

    GRID_ROWS = Math.round(GRID_COLS * (mazeSize.z / mazeSize.x));
    GRID_ROWS = Math.max(GRID_ROWS, 10);
    GRID_ROWS = Math.min(GRID_ROWS, 80);

    addInteriorLights(box);
    scanFloors();
    setupMobileControls();

    // Hide loader
    const loaderEl = document.getElementById("loader-screen");
    if (loaderEl) {
      loaderEl.style.opacity = "0";
      setTimeout(() => loaderEl.style.display = "none", 600);
    }

    isLoaded = true;
    gameStartTime = Date.now();
  },
  undefined,
  (err) => console.error("GLTF load error:", err)
);

// ═══════════════════════════════════════════════════════
// INTERIOR LIGHTS
// ═══════════════════════════════════════════════════════
function addInteriorLights(box) {
  const cx = (box.min.x + box.max.x) / 2;
  const cz = (box.min.z + box.max.z) / 2;
  const sx = mazeSize.x * 0.35;
  const sz = mazeSize.z * 0.35;

  const positions = [
    [cx, 3, cz],
    [cx - sx, 3, cz - sz],
    [cx + sx, 3, cz - sz],
    [cx - sx, 3, cz + sz],
    [cx + sx, 3, cz + sz],
    [cx, 8, cz],
    [cx - sx, 8, cz],
    [cx + sx, 8, cz],
  ];

  positions.forEach(([x, y, z]) => {
    const pl = new THREE.PointLight(0xffe4c4, 1.8, 18);
    pl.position.set(x, y, z);
    scene.add(pl);
  });
}

// ═══════════════════════════════════════════════════════
// FLOOR SCANNING
// ═══════════════════════════════════════════════════════
function scanFloors() {
  const allHits = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const px = mazeMin.x + (c / (GRID_COLS - 1)) * mazeSize.x;
      const pz = mazeMin.z + (r / (GRID_ROWS - 1)) * mazeSize.z;

      _ray.set(new THREE.Vector3(px, mazeMax.y + 5, pz), _down);
      const hits = _ray.intersectObjects(collidableMeshes, false);

      for (const hit of hits) {
        const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
        if (n.y > 0.65) {
          allHits.push({ x: hit.point.x, y: hit.point.y, z: hit.point.z });
        }
      }
    }
  }

  for (const h of allHits) {
    let found = false;
    for (const fh of floorHeights) {
      if (Math.abs(fh - h.y) < 1.2) { found = true; break; }
    }
    if (!found) floorHeights.push(h.y);
  }
  floorHeights.sort((a, b) => a - b);
  if (floorHeights.length === 0) floorHeights = [0];

  floorHeights.forEach((floorY, fi) => {
    floorGrids[fi] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      floorGrids[fi][r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const px = mazeMin.x + (c / (GRID_COLS - 1)) * mazeSize.x;
        const pz = mazeMin.z + (r / (GRID_ROWS - 1)) * mazeSize.z;

        const hasFloor = allHits.some(
          h => Math.abs(h.y - floorY) < 0.6 &&
               Math.abs(h.x - px) < mazeSize.x / GRID_COLS &&
               Math.abs(h.z - pz) < mazeSize.z / GRID_ROWS
        );
        floorGrids[fi][r][c] = hasFloor ? 0 : 1;
      }
    }
  });

  pickSpawnAndExit(allHits);
  setupMarkers();
  resetPlayer();
}

// ═══════════════════════════════════════════════════════
// PICK SPAWN & EXIT
// ═══════════════════════════════════════════════════════
function pickSpawnAndExit(allHits) {
  const CEIL_CHECK_DIST = 5.0;

  const floorInteriorCounts = floorHeights.map((fh) => {
    const pts = allHits.filter(h => Math.abs(h.y - fh) < 0.6);
    let interiorCount = 0;
    const step = Math.max(1, Math.floor(pts.length / 80));
    for (let i = 0; i < pts.length; i += step) {
      const p = pts[i];
      _ray.set(new THREE.Vector3(p.x, p.y + 0.5, p.z), _up);
      _ray.far = CEIL_CHECK_DIST;
      const hits = _ray.intersectObjects(collidableMeshes, false);
      if (hits.length > 0) interiorCount++;
    }
    _ray.far = Infinity;
    return interiorCount;
  });

  let mainFloorIdx = 0;
  let maxInterior = 0;
  floorInteriorCounts.forEach((count, idx) => {
    if (count > maxInterior) { maxInterior = count; mainFloorIdx = idx; }
  });

  const mainFloorY = floorHeights[mainFloorIdx];
  const mainFloorPts = allHits.filter(h => Math.abs(h.y - mainFloorY) < 0.6);

  console.log(`Main INTERIOR floor: F${mainFloorIdx + 1} at Y=${mainFloorY.toFixed(1)}`);

  startPoint = findBestRoomPoint(mainFloorPts) || mainFloorPts[0] || { x: 0, y: mainFloorY, z: 0 };

  let exitFound = false;
  
  // Filter out any isolated bottom structure below main floor (fh < mainFloorY - 3.0)
  const validFloors = floorHeights
    .map((fh, idx) => ({ idx, fh, dist: fh - mainFloorY }))
    .filter(f => f.fh >= mainFloorY - 3.0 && floorInteriorCounts[f.idx] > 0);

  // Sort by highest Y (upper floors first)
  validFloors.sort((a, b) => b.fh - a.fh);

  for (const { fh, idx } of validFloors) {
    if (idx === mainFloorIdx && validFloors.length > 1) continue;

    const pts = allHits.filter(h => Math.abs(h.y - fh) < 0.6);
    if (pts.length < 3) continue;

    const candidates = scoreRoomPoints(pts);
    const rooms = candidates.filter(c => c.isRoom);
    const pool = rooms.length > 0 ? rooms : candidates;

    // Pick candidate point nearest to spawn (at least 6m away)
    let bestDist = Infinity;
    let bestPt = null;
    for (const { pt } of pool) {
      const d = Math.hypot(pt.x - startPoint.x, pt.z - startPoint.z);
      if (d >= 6.0 && d < bestDist) {
        bestDist = d;
        bestPt = pt;
      }
    }
    if (!bestPt && pool.length > 0) bestPt = pool[0].pt;

    if (bestPt) {
      exitPoint = bestPt;
      exitFound = true;
      console.log(`Exit placed near spawn on floor Y=${fh.toFixed(1)}`);
      break;
    }
  }

  // Fallback: Pick nearest point on the main floor itself (>= 6m away)
  if (!exitFound) {
    let bestDist = Infinity;
    for (const h of mainFloorPts) {
      const d = Math.hypot(h.x - startPoint.x, h.z - startPoint.z);
      if (d >= 6.0 && d < bestDist) {
        bestDist = d;
        exitPoint = h;
      }
    }
    console.log(`Exit placed on main floor Y=${mainFloorY.toFixed(1)}`);
  }

  console.log(`[PLAYER SPAWN] X: ${startPoint.x.toFixed(2)}, Y: ${startPoint.y.toFixed(2)}, Z: ${startPoint.z.toFixed(2)}`);
  console.log(`[DESTINATION PORTAL] X: ${exitPoint.x.toFixed(2)}, Y: ${exitPoint.y.toFixed(2)}, Z: ${exitPoint.z.toFixed(2)}`);
}

function scoreRoomPoints(pts) {
  const results = [];
  const rayDir = new THREE.Vector3();
  const WALL_MAX_DIST = 8.0;
  const CEIL_MAX_DIST = 5.0;
  const MIN_WALL_SIDES = 3;

  const step = Math.max(1, Math.floor(pts.length / 200));

  for (let i = 0; i < pts.length; i += step) {
    const p = pts[i];
    const origin = new THREE.Vector3(p.x, p.y + 1.2, p.z);

    let wallCount = 0;
    let minWallDist = Infinity;

    for (let d = 0; d < 8; d++) {
      const angle = (d / 8) * Math.PI * 2;
      rayDir.set(Math.cos(angle), 0, Math.sin(angle));
      _ray.set(origin, rayDir);
      _ray.far = WALL_MAX_DIST;
      const hits = _ray.intersectObjects(collidableMeshes, false);

      if (hits.length > 0) {
        const n = hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld);
        if (Math.abs(n.y) < 0.5) {
          wallCount++;
          minWallDist = Math.min(minWallDist, hits[0].distance);
        }
      }
    }

    _ray.set(origin, _up);
    _ray.far = CEIL_MAX_DIST;
    const ceilHits = _ray.intersectObjects(collidableMeshes, false);
    const hasCeiling = ceilHits.length > 0;

    _ray.far = Infinity;

    const isRoom = wallCount >= MIN_WALL_SIDES && hasCeiling;
    const centerScore = minWallDist === Infinity ? 0 : minWallDist;

    results.push({ pt: p, isRoom, centerScore, wallCount });
  }

  return results;
}

function findBestRoomPoint(pts) {
  const scored = scoreRoomPoints(pts);
  const rooms = scored.filter(s => s.isRoom);

  if (rooms.length === 0) {
    scored.sort((a, b) => b.wallCount - a.wallCount || b.centerScore - a.centerScore);
    return scored.length > 0 ? scored[0].pt : null;
  }

  rooms.sort((a, b) => b.centerScore - a.centerScore);
  return rooms[0].pt;
}

// ═══════════════════════════════════════════════════════
// MARKERS
// ═══════════════════════════════════════════════════════
function setupMarkers() {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 0.75, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ffaa, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(startPoint.x, startPoint.y + 0.06, startPoint.z);
  scene.add(ring);

  exitPortal = new THREE.Group();
  exitPortal.position.set(exitPoint.x, exitPoint.y + 1.2, exitPoint.z);

  const torusGeo = new THREE.TorusGeometry(0.55, 0.07, 16, 64);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 2.5,
    roughness: 0.1, metalness: 0.9
  });
  const r1 = new THREE.Mesh(torusGeo, torusMat);
  const r2 = new THREE.Mesh(torusGeo, torusMat);
  r2.scale.setScalar(1.25);
  exitPortal.add(r1, r2);
  scene.add(exitPortal);

  const gl = new THREE.PointLight(0xffaa00, 4, 8);
  gl.position.copy(exitPortal.position);
  scene.add(gl);
}

// ═══════════════════════════════════════════════════════
// FLOOR GUIDE LINE — A* path snapped flat to actual floor
// ═══════════════════════════════════════════════════════
function buildFloorGuideLine() {
  // Clean up previous
  if (floorPathMesh) { scene.remove(floorPathMesh); floorPathMesh = null; }
  pathPulseParticles.forEach(p => scene.remove(p));
  pathPulseParticles = [];

  const rawPath = calculateFloorPath(startPoint, exitPoint);
  if (!rawPath || rawPath.length < 2) {
    console.warn("Guide line: no valid path found");
    return;
  }

  console.log(`Guide line: ${rawPath.length} A* waypoints`);

  // Dense-sample the raw A* path and snap every point to the actual floor surface
  const snappedPoints = [];
  for (let i = 0; i < rawPath.length - 1; i++) {
    const a = rawPath[i];
    const b = rawPath[i + 1];
    const segDist = a.distanceTo(b);
    const numSub = Math.max(2, Math.ceil(segDist / 0.5)); // sample every 0.5m

    for (let s = 0; s < numSub; s++) {
      const t = s / numSub;
      const pt = new THREE.Vector3().lerpVectors(a, b, t);
      snapPointToFloor(pt);
      snappedPoints.push(pt);
    }
  }
  // Add final point
  const lastPt = rawPath[rawPath.length - 1].clone();
  snapPointToFloor(lastPt);
  snappedPoints.push(lastPt);

  // Remove near-duplicate points
  const filtered = [snappedPoints[0]];
  for (let i = 1; i < snappedPoints.length; i++) {
    if (snappedPoints[i].distanceTo(filtered[filtered.length - 1]) > 0.3) {
      filtered.push(snappedPoints[i]);
    }
  }
  if (filtered.length < 2) return;

  // Build smooth tube
  const curve = new THREE.CatmullRomCurve3(filtered, false, 'catmullrom', 0.1);
  const tubeSeg = Math.min(filtered.length * 3, 400);
  const geometry = new THREE.TubeGeometry(curve, tubeSeg, 0.06, 6, false);

  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.7,
  });

  floorPathMesh = new THREE.Mesh(geometry, material);
  scene.add(floorPathMesh);

  // Animated gold pulses flowing along line
  const numPulses = Math.min(Math.max(Math.floor(curve.getLength() / 3), 4), 20);
  for (let i = 0; i < numPulses; i++) {
    const pulseGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(pulseGeo, pulseMat);
    mesh.userData = { offset: i / numPulses, curve };
    scene.add(mesh);
    pathPulseParticles.push(mesh);
  }
}

// Snap a point's Y to the nearest walkable floor surface below
function snapPointToFloor(pt) {
  // Cast from above to find actual floor surface
  _ray.set(new THREE.Vector3(pt.x, pt.y + 4, pt.z), _down);
  _ray.far = 10;
  const hits = _ray.intersectObjects(collidableMeshes, false);

  for (const hit of hits) {
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (n.y > 0.5) {
      pt.y = hit.point.y + 0.04; // hover 4cm above floor
      _ray.far = Infinity;
      return;
    }
  }
  // Fallback: try from higher
  _ray.set(new THREE.Vector3(pt.x, pt.y + 10, pt.z), _down);
  _ray.far = 20;
  const hits2 = _ray.intersectObjects(collidableMeshes, false);
  for (const hit of hits2) {
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (n.y > 0.5) {
      pt.y = hit.point.y + 0.04;
      _ray.far = Infinity;
      return;
    }
  }
  _ray.far = Infinity;
}

// A* pathfinding across multi-floor grid
function calculateFloorPath(start, exit) {
  const cellToWorld = (r, c) => ({
    x: mazeMin.x + (c / (GRID_COLS - 1)) * mazeSize.x,
    z: mazeMin.z + (r / (GRID_ROWS - 1)) * mazeSize.z
  });

  const worldToCell = (wx, wz) => ({
    c: Math.max(0, Math.min(GRID_COLS - 1, Math.round(((wx - mazeMin.x) / mazeSize.x) * (GRID_COLS - 1)))),
    r: Math.max(0, Math.min(GRID_ROWS - 1, Math.round(((wz - mazeMin.z) / mazeSize.z) * (GRID_ROWS - 1))))
  });

  const getFloorIdx = (y) => {
    let bestIdx = 0, minD = Infinity;
    floorHeights.forEach((fh, idx) => {
      const d = Math.abs(y - fh);
      if (d < minD) { minD = d; bestIdx = idx; }
    });
    return bestIdx;
  };

  const startFi = getFloorIdx(start.y);
  const exitFi = getFloorIdx(exit.y);
  const startCell = worldToCell(start.x, start.z);
  const exitCell = worldToCell(exit.x, exit.z);

  const startKey = `${startFi},${startCell.r},${startCell.c}`;

  const closedSet = new Set();
  const openSet = new Set([startKey]);
  const cameFrom = new Map();
  const gScore = new Map([[startKey, 0]]);
  const fScore = new Map();

  const h = (fi, r, c) => {
    const w = cellToWorld(r, c);
    return Math.hypot(w.x - exit.x, w.z - exit.z) + Math.abs(floorHeights[fi] - exit.y) * 2;
  };

  fScore.set(startKey, h(startFi, startCell.r, startCell.c));

  let reachedKey = null;
  let iter = 0;
  const MAX_ITER = 15000;

  while (openSet.size > 0 && iter++ < MAX_ITER) {
    let currKey = null;
    let minF = Infinity;
    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < minF) { minF = f; currKey = key; }
    }
    if (!currKey) break;

    const [cfi, cr, cc] = currKey.split(',').map(Number);

    // Check if we reached exit floor within 3 cells tolerance
    if (cfi === exitFi && Math.abs(cr - exitCell.r) <= 3 && Math.abs(cc - exitCell.c) <= 3) {
      reachedKey = currKey;
      break;
    }

    openSet.delete(currKey);
    closedSet.add(currKey);
    const currG = gScore.get(currKey);

    // 4-directional neighbors on same floor
    const neighbors = [
      [cfi, cr - 1, cc], [cfi, cr + 1, cc],
      [cfi, cr, cc - 1], [cfi, cr, cc + 1],
    ];

    // Floor transitions: allow jumping to ANY other floor at the same XZ cell
    for (let otherFi = 0; otherFi < floorHeights.length; otherFi++) {
      if (otherFi !== cfi) {
        neighbors.push([otherFi, cr, cc]);
      }
    }

    for (const [nfi, nr, nc] of neighbors) {
      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue;
      if (!floorGrids[nfi] || floorGrids[nfi][nr][nc] !== 0) continue;

      const nKey = `${nfi},${nr},${nc}`;
      if (closedSet.has(nKey)) continue;

      // Floor transitions cost proportional to height difference
      const heightDiff = Math.abs(floorHeights[nfi] - floorHeights[cfi]);
      const moveCost = nfi !== cfi ? (2 + heightDiff * 0.5) : 1;
      const tentG = currG + moveCost;

      if (tentG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currKey);
        gScore.set(nKey, tentG);
        fScore.set(nKey, tentG + h(nfi, nr, nc));
        openSet.add(nKey);
      }
    }
  }

  console.log(`A* finished: ${iter} iterations, reached=${!!reachedKey}`);

  if (!reachedKey) {
    // Fallback: straight line
    return [
      new THREE.Vector3(start.x, start.y, start.z),
      new THREE.Vector3(exit.x, exit.y, exit.z)
    ];
  }

  // Reconstruct path
  const keySeq = [];
  let curr = reachedKey;
  while (curr) {
    keySeq.unshift(curr);
    curr = cameFrom.get(curr);
  }

  const pts = [new THREE.Vector3(start.x, start.y, start.z)];

  // Sample every few keys to avoid too many points
  const sampleStep = Math.max(1, Math.floor(keySeq.length / 60));
  for (let i = sampleStep; i < keySeq.length; i += sampleStep) {
    const [fi, r, c] = keySeq[i].split(',').map(Number);
    const w = cellToWorld(r, c);
    pts.push(new THREE.Vector3(w.x, floorHeights[fi], w.z));
  }

  // Always include last A* node
  const [lastFi, lastR, lastC] = keySeq[keySeq.length - 1].split(',').map(Number);
  const lastW = cellToWorld(lastR, lastC);
  pts.push(new THREE.Vector3(lastW.x, floorHeights[lastFi], lastW.z));

  // Add exit point
  pts.push(new THREE.Vector3(exit.x, exit.y, exit.z));

  return pts;
}

// ═══════════════════════════════════════════════════════
// PLAYER RESET
// ═══════════════════════════════════════════════════════
function resetPlayer() {
  camera.position.set(startPoint.x, startPoint.y + PLAYER_HEIGHT, startPoint.z);
  velocityY = 0;
  isGrounded = true;
  playerYaw = 0;
  camera.rotation.set(0, 0, 0, 'YXZ');
  gameWon = false;
  gameStartTime = Date.now();
  const victoryEl = document.getElementById("victory-screen");
  if (victoryEl) victoryEl.classList.add("hidden");
}

// ═══════════════════════════════════════════════════════
// COLLISION — Smooth stair climbing and floor snapping
// ═══════════════════════════════════════════════════════

// Step-up: Probe at current position AND forward in move direction to climb steps
function attemptStepUp(moveVec) {
  if (!isGrounded) return;

  const feetY = camera.position.y - PLAYER_HEIGHT;
  const probePositions = [camera.position.clone()];

  if (moveVec && moveVec.lengthSq() > 0.0001) {
    const fwdDir = moveVec.clone().normalize();
    const fwdPos = camera.position.clone().add(fwdDir.multiplyScalar(PLAYER_RADIUS + 0.15));
    probePositions.push(fwdPos);
  }

  let bestStepY = -Infinity;

  for (const pos of probePositions) {
    const raised = pos.clone();
    raised.y = feetY + STEP_HEIGHT + 0.2;

    _ray.set(raised, _down);
    _ray.far = STEP_HEIGHT + 0.4;
    const hits = _ray.intersectObjects(collidableMeshes, false);

    for (const hit of hits) {
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (n.y < 0.5) continue; // Only walkable surfaces

      const floorY = hit.point.y;
      const stepUp = floorY - feetY;

      if (stepUp > 0.02 && stepUp <= STEP_HEIGHT && floorY > bestStepY) {
        bestStepY = floorY;
      }
    }
  }

  _ray.far = Infinity;

  if (bestStepY > -Infinity) {
    const headPos = new THREE.Vector3(camera.position.x, bestStepY + PLAYER_HEIGHT, camera.position.z);
    _ray.set(headPos, _up);
    _ray.far = 0.4;
    const ceilHits = _ray.intersectObjects(collidableMeshes, false);
    _ray.far = Infinity;

    if (ceilHits.length === 0) {
      camera.position.y = bestStepY + PLAYER_HEIGHT;
      velocityY = 0;
      isGrounded = true;
    }
  }
}

// Radial pushback ignoring low stair step risers
function resolveWallCollisions() {
  const heights = [0.0, 0.3, 0.6, 0.9, 1.2];
  const radius = isGrounded ? PLAYER_RADIUS : PLAYER_RADIUS * 1.2;
  const feetY = camera.position.y - PLAYER_HEIGHT;

  for (const hOffset of heights) {
    const origin = camera.position.clone();
    origin.y -= hOffset;

    for (let i = 0; i < NUM_COLLISION_RAYS; i++) {
      const angle = (i / NUM_COLLISION_RAYS) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));

      _ray.set(origin, dir);
      _ray.far = radius;
      const hits = _ray.intersectObjects(collidableMeshes, false);

      if (hits.length > 0) {
        const hit = hits[0];
        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);

        if (Math.abs(normal.y) < 0.55) {
          // If the point of hit is low enough to be a step riser, skip pushback
          if (hit.point.y <= feetY + STEP_HEIGHT + 0.05) {
            continue;
          }

          const penetration = radius - hit.distance;
          if (penetration > 0) {
            camera.position.x -= dir.x * penetration;
            camera.position.z -= dir.z * penetration;
          }
        }
      }
    }
  }
  _ray.far = Infinity;
}

// Floor snapping for standing, stepping up, and descending stairs
function snapToFloor() {
  _ray.set(camera.position.clone(), _down);
  _ray.far = PLAYER_HEIGHT + 3.0;
  const hits = _ray.intersectObjects(collidableMeshes, false);

  const feetY = camera.position.y - PLAYER_HEIGHT;
  let bestFloorY = -Infinity;

  for (const hit of hits) {
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (n.y < 0.5) continue;

    const floorY = hit.point.y;
    if (floorY <= feetY + STEP_HEIGHT && floorY > bestFloorY) {
      bestFloorY = floorY;
    }
  }

  _ray.far = Infinity;

  if (bestFloorY <= -Infinity) {
    isGrounded = false;
    return;
  }

  const diff = bestFloorY - feetY;

  // Step UP
  if (diff > 0 && diff <= STEP_HEIGHT) {
    camera.position.y = bestFloorY + PLAYER_HEIGHT;
    velocityY = 0;
    isGrounded = true;
    return;
  }

  // AT LEVEL
  if (diff >= -0.2 && diff <= 0) {
    camera.position.y = bestFloorY + PLAYER_HEIGHT;
    velocityY = 0;
    isGrounded = true;
    return;
  }

  // Step DOWN (descending stairs)
  if (diff < -0.2 && diff >= -1.2 && velocityY <= 0) {
    camera.position.y = bestFloorY + PLAYER_HEIGHT;
    velocityY = 0;
    isGrounded = true;
    return;
  }

  isGrounded = false;
}

// Ceiling check
function checkCeiling() {
  _ray.set(camera.position.clone(), _up);
  const hits = _ray.intersectObjects(collidableMeshes, false);

  if (hits.length > 0 && hits[0].distance < 0.4) {
    velocityY = Math.min(velocityY, 0);
    camera.position.y = hits[0].point.y - 0.4;
  }
}

// ═══════════════════════════════════════════════════════
// PLAYER MOVEMENT
// ═══════════════════════════════════════════════════════
function updatePlayer(dt) {
  if (!isLoaded || gameWon) return;

  // ── Rotation ──
  let rot = 0;
  if (keys['a'] || keys['arrowleft']) rot += 1;
  if (keys['d'] || keys['arrowright']) rot -= 1;
  if (Math.abs(joystickX) > 0.1) rot -= joystickX * 1.2;
  playerYaw += rot * ROT_SPEED * dt;
  camera.rotation.set(0, playerYaw, 0, 'YXZ');

  // ── Horizontal movement ──
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  fwd.y = 0;
  fwd.normalize();

  const move = new THREE.Vector3();
  if (keys['w'] || keys['arrowup']) move.add(fwd);
  if (keys['s'] || keys['arrowdown']) move.sub(fwd);

  if (Math.abs(joystickY) > 0.1) {
    const joyMove = fwd.clone().multiplyScalar(-joystickY);
    move.add(joyMove);
  }

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(MOVE_SPEED * dt);

    attemptStepUp(move);

    camera.position.x += move.x;
    camera.position.z += move.z;

    attemptStepUp(move);
  }

  // ── Jump ──
  if (keys[' '] && isGrounded) {
    velocityY = JUMP_FORCE;
    isGrounded = false;
  }

  // ── Gravity ──
  if (!isGrounded) {
    velocityY += GRAVITY * dt;
  }
  camera.position.y += velocityY * dt;

  // ── Resolve collisions ──
  resolveWallCollisions();
  if (velocityY > 0) checkCeiling();
  snapToFloor();

  // ── Out of bounds reset ──
  if (camera.position.y < mazeMin.y - 10) {
    resetPlayer();
  }

  // ── HUD ──
  const coordsEl = document.getElementById("player-coords");
  if (coordsEl) {
    coordsEl.textContent = `X: ${camera.position.x.toFixed(1)}, Y: ${camera.position.y.toFixed(1)}, Z: ${camera.position.z.toFixed(1)}`;
  }

  // ── Win check ──
  const dExit = camera.position.distanceTo(
    new THREE.Vector3(exitPoint.x, exitPoint.y + 1.2, exitPoint.z)
  );
  if (dExit < 1.5) triggerVictory();
}

function triggerVictory() {
  if (gameWon) return;
  gameWon = true;

  const victoryEl = document.getElementById("victory-screen");
  if (victoryEl) victoryEl.classList.remove("hidden");

  const secondsElapsed = Math.floor((Date.now() - (gameStartTime || Date.now())) / 1000);
  const score = Math.max(100, Math.floor(1000 - secondsElapsed * 3));

  const scoreEl = document.getElementById("victory-score-val");
  if (scoreEl) scoreEl.textContent = `${score}`;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'GAME_OVER',
      game: 'maze',
      score: score,
      timeTaken: secondsElapsed
    }, '*');
  }
}

// ═══════════════════════════════════════════════════════
// MOBILE VIRTUAL JOYSTICK & JUMP CONTROLS
// ═══════════════════════════════════════════════════════
function setupMobileControls() {
  const base = document.getElementById("joystick-base");
  const stick = document.getElementById("joystick-stick");
  const jumpBtn = document.getElementById("mobile-jump-btn");

  if (!base || !stick) return;

  let activeTouchId = null;
  let baseRect = null;
  const maxRadius = 40;

  function handleStart(e) {
    e.preventDefault();
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    activeTouchId = touch.identifier ?? 'mouse';
    baseRect = base.getBoundingClientRect();
    handleMove(e);
  }

  function handleMove(e) {
    if (activeTouchId === null) return;
    let touch = null;
    if (e.changedTouches || e.touches) {
      const touches = e.touches || e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        if ((touches[i].identifier ?? 'mouse') === activeTouchId) {
          touch = touches[i];
          break;
        }
      }
    } else {
      touch = e;
    }

    if (!touch || !baseRect) return;

    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;

    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    const dist = Math.hypot(deltaX, deltaY);
    if (dist > maxRadius) {
      deltaX = (deltaX / dist) * maxRadius;
      deltaY = (deltaY / dist) * maxRadius;
    }

    stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

    joystickX = deltaX / maxRadius;
    joystickY = deltaY / maxRadius;
  }

  function handleEnd() {
    activeTouchId = null;
    joystickX = 0;
    joystickY = 0;
    stick.style.transform = `translate(-50%, -50%)`;
  }

  base.addEventListener("touchstart", handleStart, { passive: false });
  window.addEventListener("touchmove", handleMove, { passive: false });
  window.addEventListener("touchend", handleEnd);
  window.addEventListener("touchcancel", handleEnd);

  base.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", (e) => { if (activeTouchId === 'mouse') handleMove(e); });
  window.addEventListener("mouseup", () => { if (activeTouchId === 'mouse') handleEnd(); });

  if (jumpBtn) {
    const startJump = (e) => { e.preventDefault(); keys[' '] = true; };
    const endJump = (e) => { e.preventDefault(); keys[' '] = false; };

    jumpBtn.addEventListener("touchstart", startJump, { passive: false });
    jumpBtn.addEventListener("touchend", endJump, { passive: false });
    jumpBtn.addEventListener("mousedown", startJump);
    jumpBtn.addEventListener("mouseup", endJump);
  }
}

// ═══════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') e.preventDefault();
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

const restartBtn = document.getElementById("restart-btn");
if (restartBtn) restartBtn.addEventListener("click", resetPlayer);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════
// GAME LOOP
// ═══════════════════════════════════════════════════════
let lastTime = 0;

function animate(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  updatePlayer(dt);

  // Spin exit portal
  if (exitPortal) {
    exitPortal.children[0].rotation.y += 1.2 * dt;
    exitPortal.children[1].rotation.x += 1.6 * dt;
  }

  // Animate pulse particles along guide line
  if (pathPulseParticles.length > 0) {
    const pulseSpeed = 0.18;
    pathPulseParticles.forEach((p) => {
      let t = (p.userData.offset + time * 0.001 * pulseSpeed) % 1.0;
      const pos = p.userData.curve.getPointAt(t);
      p.position.copy(pos);
      p.position.y += 0.03;
    });
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
