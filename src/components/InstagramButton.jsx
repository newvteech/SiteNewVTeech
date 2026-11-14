import { useEffect, useRef, useState } from 'react';
import { instagram } from '../data/content.js';
import { prefersReducedMotion } from '../hooks/usePointer.js';

/* ------------------------------------------------------------------
   Ícone do Instagram que explode em partículas ao ser clicado
   e depois abre o perfil da NewV numa nova aba.
   O link fica em index.html (window.NEWV_CONFIG.instagram).
------------------------------------------------------------------- */

const GLYPH = (id) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <radialGradient id="${id}" cx="0.3" cy="1.07" r="1.3">
      <stop offset="0" stop-color="#fdf497"/>
      <stop offset="0.12" stop-color="#fdf497"/>
      <stop offset="0.45" stop-color="#fd5949"/>
      <stop offset="0.65" stop-color="#d6249f"/>
      <stop offset="0.95" stop-color="#285AEB"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke="url(#${id})" stroke-width="2.2">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/>
    <circle cx="12" cy="12" r="4.4"/>
  </g>
  <circle cx="17.4" cy="6.6" r="1.35" fill="url(#${id})"/>
</svg>`;

let glyphImg = null;
function getGlyphImage() {
  if (!glyphImg) {
    glyphImg = new Image();
    glyphImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(GLYPH('igSample'));
  }
  return glyphImg;
}

// cria uma camada temporária na tela inteira e solta as partículas do ícone
function explode(rect) {
  const img = getGlyphImage();
  if (!img.complete) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(rect.width * DPR);
  const off = document.createElement('canvas');
  off.width = off.height = size;
  const o = off.getContext('2d');
  o.drawImage(img, 0, 0, size, size);
  const data = o.getImageData(0, 0, size, size).data;

  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const parts = [];
  const step = Math.max(1, Math.round(DPR));
  for (let y = 0; y < size; y += step)
    for (let x = 0; x < size; x += step) {
      const i = (y * size + x) * 4;
      if (data[i + 3] < 120) continue;
      const px = rect.left + x / DPR, py = rect.top + y / DPR;
      const ang = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 0.9;
      const speed = 2 + Math.random() * 6;
      parts.push({
        x: px, y: py,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed - 2.5,
        s: 1.5 + Math.random() * 2,
        life: 1, decay: 0.012 + Math.random() * 0.014,
        c: `${data[i]},${data[i + 1]},${data[i + 2]}`,
      });
    }

  const c = document.createElement('canvas');
  c.className = 'ig-burst';
  c.width = Math.round(window.innerWidth * DPR);
  c.height = Math.round(window.innerHeight * DPR);
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  ctx.scale(DPR, DPR);

  // anel de onda de choque
  let ring = 0;
  const tick = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    ring += 0.06;
    if (ring < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, rect.width * 0.5 + ring * 60, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(214,36,159,${0.5 * (1 - ring)})`;
      ctx.lineWidth = 2 * (1 - ring) + 0.5;
      ctx.stroke();
    }
    let alive = 0;
    for (const p of parts) {
      if (p.life <= 0) continue;
      alive++;
      p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.16;
      p.x += p.vx; p.y += p.vy;
      p.life -= p.decay;
      ctx.fillStyle = `rgba(${p.c},${Math.max(0, p.life)})`;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    if (alive) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

export default function InstagramButton({ label = true, className = '' }) {
  const ref = useRef(null);
  const [state, setState] = useState(''); // '' | 'boom' | 'soon'
  const gradId = useRef(`ig${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => { getGlyphImage(); }, []);

  const onClick = (e) => {
    e.preventDefault();
    if (state === 'boom') return;
    const rect = ref.current.querySelector('svg').getBoundingClientRect();
    const reduce = prefersReducedMotion();
    if (!reduce) explode(rect);
    setState('boom');

    const delay = reduce ? 0 : 520;
    setTimeout(() => {
      if (instagram.url) {
        const win = window.open(instagram.url, '_blank', 'noopener');
        if (!win) window.location.href = instagram.url;
        setTimeout(() => setState(''), 700);
      } else {
        setState('soon');
        setTimeout(() => setState(''), 2200);
      }
    }, delay);
  };

  return (
    <a
      ref={ref}
      href={instagram.url || '#'}
      onClick={onClick}
      className={`ig-btn ${state} ${className}`}
      aria-label={instagram.url ? `Instagram da NewV${instagram.handle ? ` (${instagram.handle})` : ''}` : 'Instagram da NewV (em breve)'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="ig-icon" dangerouslySetInnerHTML={{ __html: GLYPH(gradId) }} />
      {label && <span className="ig-text">{instagram.handle || 'Instagram'}</span>}
      <span className="ig-soon" role="status">{state === 'soon' ? 'Instagram em breve!' : ''}</span>
    </a>
  );
}
