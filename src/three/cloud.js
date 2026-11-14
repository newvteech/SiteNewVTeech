/* Forma e shaders da nuvem de partículas da NewV,
   compartilhados pela nuvem principal (CloudScene) e pelas nuvens pequenas (CloudSky). */

// Bolhas que formam a silhueta da nuvem (x, y, z, raio)
export const PUFFS = [
  [-1.95, -0.42, 0.0, 0.62],
  [-1.05, 0.02, 0.0, 0.95],
  [0.1, 0.52, 0.0, 1.22],
  [1.22, 0.08, 0.0, 0.98],
  [2.02, -0.4, 0.0, 0.62],
  [-0.45, -0.45, 0.0, 0.75],
  [0.75, -0.45, 0.0, 0.75],
];
const FLOOR = -0.98;
const DEPTH = 0.55; // achata a nuvem em profundidade para a silhueta ficar nítida

function buriedIn(x, y, z, k, margin) {
  for (let j = 0; j < PUFFS.length; j++) {
    if (j === k) continue;
    const [cx, cy, cz, r] = PUFFS[j];
    if (Math.hypot(x - cx, y - cy, (z - cz) / DEPTH) < r - margin) return true;
  }
  return false;
}

export function buildCloud(count) {
  const pos = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 3);
  const edge = new Float32Array(count);
  const weights = PUFFS.map((p) => p[3] * p[3]);
  const total = weights.reduce((a, b) => a + b, 0);
  const width = 2.65;
  let i = 0, guard = 0;
  while (i < count && guard < count * 80) {
    guard++;
    let x, y, z, e = 0;
    if (Math.random() < 0.1) {
      // base reta da nuvem
      x = (Math.random() * 2 - 1) * width;
      y = FLOOR + Math.random() * 0.03;
      z = (Math.random() * 2 - 1) * 0.5 * DEPTH;
      if (Math.abs(x) > width - 0.25 && Math.random() < 0.6) continue;
      e = 0.8;
    } else {
      let pick = Math.random() * total, k = 0;
      while (pick > weights[k]) { pick -= weights[k]; k++; }
      const [cx, cy, cz, r] = PUFFS[k];
      const th = 2 * Math.PI * Math.random(), ph = Math.acos(2 * Math.random() - 1);
      const surface = Math.random() < 0.8;
      const rr = surface ? r * (0.94 + Math.random() * 0.08) : r * Math.cbrt(Math.random()) * 0.92;
      x = cx + rr * Math.sin(ph) * Math.cos(th);
      y = cy + rr * Math.sin(ph) * Math.sin(th);
      z = cz + rr * Math.cos(ph) * DEPTH;
      if (y < FLOOR) continue;
      if (surface) {
        if (buriedIn(x, y, z, k, 0.06)) continue; // mantém só o contorno externo
        e = 1;
      }
    }
    pos.set([x, y, z], i * 3);
    rnd.set([Math.random(), Math.random(), Math.random()], i * 3);
    edge[i] = e;
    i++;
  }
  return { pos: pos.subarray(0, i * 3), rnd: rnd.subarray(0, i * 3), edge: edge.subarray(0, i) };
}

export const cloudVertex = /* glsl */ `
  attribute vec3 aRand;
  attribute float aEdge;
  uniform float uTime, uBurst, uScatter, uSize, uPixelRatio, uHover, uOpacity;
  uniform vec3 uMouse;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime;

    // respiração + deriva suave
    p *= 1.0 + 0.025 * sin(t * 1.1);
    p += 0.05 * vec3(
      sin(t * 0.9 + aRand.x * 6.2831),
      cos(t * 0.8 + aRand.y * 6.2831),
      sin(t * 0.7 + aRand.z * 6.2831));

    // repulsão do cursor (no plano da nuvem)
    vec2 d = p.xy - uMouse.xy;
    float dist = length(d);
    float f = smoothstep(1.1, 0.0, dist) * uHover;
    p.xy += normalize(d + 1e-4) * f * 0.75;
    p.z  += f * 0.4 * (aRand.z - 0.5);

    // explosão ao clicar
    vec3 dir = normalize(position + (aRand - 0.5) * 0.6 + 1e-4);
    p += dir * uBurst * (0.9 + aRand.x * 1.9);

    // dispersão na rolagem
    p += (aRand - 0.5) * uScatter * 9.0;
    p.y += uScatter * (aRand.y * 2.5);

    // cor: ciano (esquerda/topo) -> azul -> violeta (direita), como a logo
    float g = clamp((position.x + 2.6) / 5.2 - position.y * 0.12, 0.0, 1.0);
    vec3 cyan   = vec3(0.055, 0.66, 0.96);
    vec3 blue   = vec3(0.12, 0.30, 0.93);
    vec3 violet = vec3(0.20, 0.13, 0.85);
    vColor = g < 0.55 ? mix(cyan, blue, g / 0.55) : mix(blue, violet, (g - 0.55) / 0.45);
    vColor += f * vec3(0.35, 0.45, 0.5);          // brilho perto do cursor
    vColor += uBurst * vec3(0.25, 0.3, 0.4);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aRand.y * 0.8 + aEdge * 0.35) * uPixelRatio * (6.0 / -mv.z);
    vColor += aEdge * vec3(0.06, 0.1, 0.12);
    // partículas que se afastam muito vão sumindo, em vez de bater na borda
    float travel = length(p - position);
    vAlpha = (0.3 + aEdge * 0.45 + aRand.z * 0.3) * (1.0 - uScatter * 0.7) * uOpacity;
    vAlpha *= 1.0 - smoothstep(1.4, 3.6, travel);
  }
`;

export const cloudFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

