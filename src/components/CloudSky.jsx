import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { pointer, prefersReducedMotion } from '../hooks/usePointer.js';
import { buildCloud, cloudVertex, cloudFragment } from '../three/cloud.js';

/* ------------------------------------------------------------------
   Nuvens pequenas que atravessam o topo do site devagar.
   Cada uma reage ao mouse, explode ao ser clicada e se dispersa
   na rolagem, como a nuvem principal.
------------------------------------------------------------------- */

// x e y em fração da tela (0 a 1), z = profundidade (mais negativo = mais longe)
const LAYOUT = [
  { x: 0.08, y: 0.22, z: -2.0, s: 0.34, v: 0.16 },
  { x: 0.42, y: 0.12, z: -4.5, s: 0.42, v: 0.09 },
  { x: 0.30, y: 0.80, z: -3.0, s: 0.30, v: 0.13 },
  { x: 0.62, y: 0.88, z: -1.5, s: 0.24, v: 0.2 },
  { x: 0.88, y: 0.16, z: -3.5, s: 0.32, v: 0.11 },
  { x: 0.18, y: 0.55, z: -6.0, s: 0.5, v: 0.06 },
  { x: 0.75, y: 0.45, z: -7.0, s: 0.55, v: 0.05 },
];

export default function CloudSky() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const reduce = prefersReducedMotion();
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    } catch {
      return;
    }
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 10;

    const isSmall = window.innerWidth < 700;
    const layout = isSmall ? LAYOUT.filter((_, i) => i % 2 === 0) : LAYOUT;
    const time = { value: 0 };
    const scatter = { value: 0 };

    const clouds = layout.map((cfg) => {
      const { pos, rnd, edge } = buildCloud(isSmall ? 1100 : 1800);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3));
      geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 1));
      const depthFade = THREE.MathUtils.clamp(1 + cfg.z / 10, 0.3, 0.9);
      const uniforms = {
        uTime: time,
        uScatter: scatter,
        uBurst: { value: 0 },
        uHover: { value: 0 },
        uSize: { value: 3.6 },
        uOpacity: { value: depthFade * 0.75 },
        uPixelRatio: { value: DPR },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: cloudVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pts = new THREE.Points(geo, mat);
      pts.scale.setScalar(cfg.s);
      pts.position.z = cfg.z;
      pts.frustumCulled = false;
      scene.add(pts);
      return { pts, geo, mat, uniforms, cfg, burstVel: 0, offset: 0, phase: Math.random() * 6.28 };
    });

    // tamanho visível do mundo numa profundidade z
    const viewAt = (z) => {
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - z);
      return { w: h * camera.aspect, h };
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const tmp = new THREE.Vector3();

    // clique: explode a nuvem pequena mais próxima (sem roubar cliques de botões e links)
    const onDown = (e) => {
      if (e.target.closest('a, button, input, textarea, .cloud-scene')) return;
      const r = host.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      let best = null, bestD = Infinity;
      for (const c of clouds) {
        tmp.copy(c.pts.position).project(camera);
        const sx = r.left + ((tmp.x + 1) / 2) * r.width;
        const sy = r.top + ((1 - tmp.y) / 2) * r.height;
        const d = Math.hypot(sx - e.clientX, sy - e.clientY);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (best && bestD < 140) best.burstVel = 0.1;
    };
    window.addEventListener('pointerdown', onDown);

    let visible = true;
    const vis = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    vis.observe(host);

    const clock = new THREE.Clock();
    let raf;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      time.value = reduce ? 0 : t;

      const sp = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      scatter.value += (sp * 0.9 - scatter.value) * 0.12;

      const r = host.getBoundingClientRect();
      if (pointer.active) {
        ndc.set(((pointer.x - r.left) / r.width) * 2 - 1, -((pointer.y - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
      }

      for (const c of clouds) {
        const { w, h } = viewAt(c.cfg.z);
        // deriva lateral contínua: sai pela direita e volta pela esquerda
        if (!reduce) c.offset += c.cfg.v * dt;
        const span = w + 6 * c.cfg.s;
        const raw = c.cfg.x * w - w / 2 + c.offset * 3;
        const x = ((raw + span / 2) % span + span) % span - span / 2;
        const y = (0.5 - c.cfg.y) * h + Math.sin(t * 0.6 + c.phase) * 0.12 + sp * 2.5;
        c.pts.position.x = x + pointer.nx * 0.4 * (1 + c.cfg.z / 10);
        c.pts.position.y = y - pointer.ny * 0.3;
        c.pts.rotation.y = Math.sin(t * 0.25 + c.phase) * 0.25;

        // mouse no espaço local de cada nuvem
        let near = 0;
        if (pointer.active) {
          plane.constant = -c.cfg.z;
          if (raycaster.ray.intersectPlane(plane, hit)) {
            const dist = hit.distanceTo(c.pts.position) / c.cfg.s;
            near = dist < 3.2 ? 1 : 0;
            c.pts.worldToLocal(hit);
            c.uniforms.uMouse.value.lerp(hit, 0.25);
          }
        }
        c.uniforms.uHover.value += (near - c.uniforms.uHover.value) * 0.08;

        c.burstVel += -c.uniforms.uBurst.value * 0.035 - c.burstVel * 0.09;
        c.uniforms.uBurst.value = Math.max(0, c.uniforms.uBurst.value + c.burstVel);
      }
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vis.disconnect();
      window.removeEventListener('pointerdown', onDown);
      clouds.forEach((c) => { c.geo.dispose(); c.mat.dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="cloud-sky" ref={hostRef} aria-hidden="true" />;
}
