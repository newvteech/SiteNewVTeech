import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { pointer, prefersReducedMotion } from '../hooks/usePointer.js';
import { buildCloud, cloudVertex, cloudFragment } from '../three/cloud.js';
import { perf } from '../hooks/usePerf.js';

/* ------------------------------------------------------------------
   Nuvem 3D de partículas no formato da nuvem da logo NewV.
   Interações:
   - mouse: a nuvem inclina e as partículas se afastam do cursor
   - clique: a nuvem "explode" e se recompõe
   - rolagem: a nuvem se dispersa em poeira enquanto o site desce
------------------------------------------------------------------- */

const sparkVertex = /* glsl */ `
  attribute vec3 aRand;
  uniform float uTime, uPixelRatio, uScatter;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float ang = aRand.x * 6.2831 + uTime * (0.12 + aRand.y * 0.18);
    float rad = 2.75 + aRand.z * 0.7 + uScatter * 3.0;
    vec3 p = vec3(cos(ang) * rad, (aRand.y - 0.5) * 0.5, sin(ang) * rad * 0.55);
    // inclina o anel
    float c = cos(0.35), s = sin(0.35);
    p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + aRand.z * 2.2) * uPixelRatio * (6.0 / -mv.z);
    float front = smoothstep(0.0, 1.5, p.z);
    vAlpha = (0.25 + 0.75 * front) * (1.0 - uScatter);
    vColor = mix(vec3(1.0, 0.72, 0.35), vec3(0.6, 0.85, 1.0), aRand.y);
  }
`;

const sparkFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, d) * vAlpha);
  }
`;

// lite = modo leve (menos partículas e resolução menor, para celulares simples)
export default function CloudScene({ lite = false }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const reduce = prefersReducedMotion();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' });
    } catch {
      host.classList.add('no-webgl');
      return;
    }
    const DPR = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const group = new THREE.Group();
    scene.add(group);

    // --- nuvem ---
    const isSmall = window.innerWidth < 700;
    const { pos, rnd, edge } = buildCloud(lite ? (isSmall ? 2600 : 4000) : isSmall ? 6500 : 13000);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3));
    geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 1));
    const uniforms = {
      uTime: { value: 0 },
      uBurst: { value: 0 },
      uScatter: { value: 0 },
      uHover: { value: 0 },
      uSize: { value: 5.2 },
      uOpacity: { value: 1 },
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
    const cloud = new THREE.Points(geo, mat);
    group.add(cloud);

    // --- faíscas orbitando ---
    const sparkCount = lite ? 120 : isSmall ? 260 : 520;
    const sGeo = new THREE.BufferGeometry();
    const sRnd = new Float32Array(sparkCount * 3).map(() => Math.random());
    sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparkCount * 3), 3));
    sGeo.setAttribute('aRand', new THREE.BufferAttribute(sRnd, 3));
    const sUniforms = { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio, uScatter: uniforms.uScatter };
    const sMat = new THREE.ShaderMaterial({
      uniforms: sUniforms,
      vertexShader: sparkVertex,
      fragmentShader: sparkFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sGeo, sMat);
    sparks.frustumCulled = false;
    group.add(sparks);

    // --- brilho difuso atrás da nuvem ---
    const glowTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(41,140,255,0.55)');
      grd.addColorStop(0.5, 'rgba(37,65,214,0.18)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(8.5, 5, 1);
    glow.position.z = -1.2;
    group.add(glow);

    // --- tamanho ---
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // garante que a nuvem inteira caiba em telas estreitas
      camera.position.z = camera.aspect < 1.1 ? 10 / Math.max(camera.aspect, 0.6) : 10;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // --- interação ---
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    let hoverTarget = 0;
    let burstVel = 0;

    const onDown = (e) => {
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      burstVel = 0.09; // impulso da explosão
    };
    host.addEventListener('pointerdown', onDown);

    // pausa quando fora da tela (economiza bateria/CPU)
    let visible = true;
    const vis = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    vis.observe(host);

    const clock = new THREE.Clock();
    const tilt = { x: 0, y: 0 };
    let raf;

    let fpsFrames = 0, fpsDone = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // mede a fluidez no começo: se estiver travando, liga o modo leve sozinho
      if (!lite && !fpsDone) {
        if (t > 0.6) fpsFrames++;
        if (t > 3.1) { fpsDone = true; perf.reportFps(fpsFrames / 2.5); }
      }
      uniforms.uTime.value = reduce ? 0 : t;

      // ponteiro -> espaço local da nuvem
      const r = host.getBoundingClientRect();
      const inside =
        pointer.active && pointer.x > r.left && pointer.x < r.right && pointer.y > r.top && pointer.y < r.bottom;
      if (pointer.active) {
        ndc.set(((pointer.x - r.left) / r.width) * 2 - 1, -((pointer.y - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          group.worldToLocal(hit);
          uniforms.uMouse.value.lerp(hit, 0.25);
        }
      }
      hoverTarget = inside ? 1 : 0;
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.08;
      host.style.cursor = inside ? 'pointer' : '';

      // explosão com mola
      burstVel += -uniforms.uBurst.value * 0.035 - burstVel * 0.09;
      uniforms.uBurst.value = Math.max(0, uniforms.uBurst.value + burstVel);

      // rolagem
      const sp = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      uniforms.uScatter.value += (sp * 0.85 - uniforms.uScatter.value) * 0.12;

      // inclinação seguindo o mouse + flutuação
      tilt.x += (pointer.ny * 0.5 - tilt.x) * 0.05;
      tilt.y += (pointer.nx * 0.8 - tilt.y) * 0.05;
      group.rotation.x = tilt.x + (reduce ? 0 : Math.sin(t * 0.5) * 0.05);
      group.rotation.y = tilt.y + (reduce ? 0 : Math.sin(t * 0.3) * 0.18);
      group.position.y = (reduce ? 0 : Math.sin(t * 1.1) * 0.12) + sp * 1.2;

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vis.disconnect();
      host.removeEventListener('pointerdown', onDown);
      geo.dispose(); mat.dispose(); sGeo.dispose(); sMat.dispose(); glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lite]);

  return <div className="cloud-scene" ref={hostRef} aria-label="Nuvem interativa da NewV" role="img" />;
}
