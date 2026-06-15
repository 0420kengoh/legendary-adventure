/* ===========================================================
   RENO Works — Immersive experience
   Three.js WebGL hero + GSAP ScrollTrigger motion
   =========================================================== */
import * as THREE from 'three';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

document.documentElement.classList.add('js');

/* -----------------------------------------------------------
   1. WebGL hero — an animated field of "architectural pillars"
   ----------------------------------------------------------- */
function initWebGL() {
  const canvas = document.getElementById('webgl');
  if (!canvas) return { ready: Promise.resolve() };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0c0b, 0.085);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 7.5, 16);
  camera.lookAt(0, 1.5, 0);

  // Lighting — warm key + gold rim
  scene.add(new THREE.AmbientLight(0x3a3330, 0.8));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
  key.position.set(6, 12, 8);
  scene.add(key);
  const gold = new THREE.PointLight(0xf59e0b, 60, 40);
  gold.position.set(-6, 4, 4);
  scene.add(gold);
  const cool = new THREE.PointLight(0x5b7fa6, 22, 50);
  cool.position.set(10, 3, -6);
  scene.add(cool);

  // Instanced grid of pillars
  const GRID = 26;
  const SPACING = 1.15;
  const count = GRID * GRID;
  const geo = new THREE.BoxGeometry(0.55, 1, 0.55);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a7f76, roughness: 0.55, metalness: 0.25 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const cols = new THREE.Color();
  const baseCol = new THREE.Color(0x6b625a);
  const accentCol = new THREE.Color(0xf59e0b);
  const positions = [];
  let i = 0;
  for (let x = 0; x < GRID; x++) {
    for (let z = 0; z < GRID; z++) {
      const px = (x - GRID / 2) * SPACING;
      const pz = (z - GRID / 2) * SPACING;
      positions.push({ x: px, z: pz, d: Math.sqrt(px * px + pz * pz) });
      cols.copy(baseCol);
      mesh.setColorAt(i, cols);
      i++;
    }
  }
  scene.add(mesh);

  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollY = 0;

  function updateInstances(t) {
    for (let n = 0; n < count; n++) {
      const p = positions[n];
      const wave = Math.sin(p.d * 0.55 - t * 1.4) * 0.5 + 0.5;
      const h = 0.4 + wave * 4.2;
      dummy.position.set(p.x, h / 2, p.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      // tip-of-wave pillars glow gold
      cols.copy(baseCol).lerp(accentCol, Math.pow(wave, 3) * 0.9);
      mesh.setColorAt(n, cols);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  function render() {
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    if (!reduceMotion) updateInstances(t);
    // camera parallax + slow orbit, pulled back as you scroll
    const orbit = reduceMotion ? 0 : t * 0.06;
    const dist = 16 + scrollY * 6;
    camera.position.x = Math.sin(orbit) * 3 + pointer.x * 3;
    camera.position.z = Math.cos(orbit) * dist;
    camera.position.y = 7.5 - pointer.y * 2 + scrollY * 4;
    camera.lookAt(0, 1.2, 0);
    gold.position.x = Math.sin(t * 0.5) * 7;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
  updateInstances(0); // first frame for reduced-motion / preload

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Fade the canvas out as the user scrolls past the hero so dark sections read clearly
  if (gsap && ScrollTrigger) {
    gsap.to('.webgl', {
      opacity: 0.12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: (self) => { scrollY = self.progress; }
    });
  }

  return { ready: Promise.resolve() };
}

/* -----------------------------------------------------------
   2. Custom cursor + magnetic buttons
   ----------------------------------------------------------- */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  if (matchMedia('(hover: none)').matches) { document.body.classList.add('using-touch'); return; }

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });

  function loop() {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    const mode = el.getAttribute('data-cursor');
    el.addEventListener('mouseenter', () => cursor.classList.add(mode === 'view' ? 'is-view' : 'is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-view', 'is-hover'));
  });

  // Magnetic effect
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      if (gsap) gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => { if (gsap) gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }); });
  });
}

/* -----------------------------------------------------------
   3. Scroll-driven animations (GSAP ScrollTrigger)
   ----------------------------------------------------------- */
function initScroll() {
  if (!gsap || !ScrollTrigger) {
    document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('shown'));
    return;
  }

  // Hero title line reveal
  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.to('.hero-title .line > span', { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.2 });
  gsap.to('.hero .reveal-up', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.6 });

  // Generic reveal-up (outside hero)
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Manifesto — word-by-word brighten on scrub
  const manifesto = document.getElementById('manifesto');
  if (manifesto) {
    const words = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.to('.manifesto-text .w', {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 60%', scrub: true }
    });
  }

  // Horizontal pinned services
  const track = document.getElementById('h-track');
  if (track) {
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth + 48),
      ease: 'none',
      scrollTrigger: {
        trigger: '.h-section', start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth + 48),
        pin: '.h-pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  }

  // Stat counters
  gsap.utils.toArray('.stat-num').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
      })
    });
  });

  // Work parallax (each item drifts at its own speed)
  gsap.utils.toArray('.work-item').forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1;
    gsap.fromTo(el, { y: (1 - speed) * 80 }, {
      y: (speed - 1) * 80, ease: 'none',
      scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // Section refresh once preloader is gone
  ScrollTrigger.refresh();
}

/* -----------------------------------------------------------
   4. 3D tilt cards
   ----------------------------------------------------------- */
function initTilt() {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = 8;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* -----------------------------------------------------------
   5. Preloader → boot everything
   ----------------------------------------------------------- */
function runPreloader(onDone) {
  const pre = document.getElementById('preloader');
  const countEl = document.getElementById('preloader-count');
  const fill = document.getElementById('preloader-fill');
  if (!pre) { onDone(); return; }

  let p = 0;
  const tick = () => {
    p += Math.random() * 16 + 4;
    if (p >= 100) p = 100;
    if (countEl) countEl.textContent = Math.round(p);
    if (fill) fill.style.width = p + '%';
    if (p < 100) {
      setTimeout(tick, 90);
    } else {
      setTimeout(() => {
        pre.classList.add('done');
        onDone();
        if (ScrollTrigger) ScrollTrigger.refresh();
      }, 350);
    }
  };
  tick();
}

/* ----- Boot ----- */
document.getElementById('year').textContent = new Date().getFullYear();
initWebGL();
initCursor();
initTilt();
runPreloader(() => { initScroll(); });
