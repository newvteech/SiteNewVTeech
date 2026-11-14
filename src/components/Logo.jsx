import { useEffect, useRef } from 'react';
import { pointer } from '../hooks/usePointer.js';
import markUrl from '../assets/logo-mark.png';

/* ------------------------------------------------------------------
   Logo NewV em partículas: a imagem oficial (nuvem que vira o "V",
   com "New" em branco). No hover as partículas se espalham.

   O canvas é maior que a logo (PAD em volta) e as partículas
   somem aos poucos quando se afastam, então nunca aparece a borda.
------------------------------------------------------------------- */

const PAD = 22;          // espaço livre em volta da logo, em px
const SCATTER = [6, 16]; // distância mínima e máxima do espalhamento, em px

export default function Logo() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, pts = [], hover = false, raf;
    let sharp = null;  // logo nítida (usada quando está parada)
    let crisp = 0;     // 0 = partículas, 1 = logo nítida

    const img = new Image();
    img.src = markUrl;

    const build = () => {
      if (!img.complete || !img.naturalWidth) return;
      const r = c.getBoundingClientRect();
      W = c.width = Math.max(1, Math.round(r.width * DPR));
      H = c.height = Math.max(1, Math.round(r.height * DPR));
      const pad = PAD * DPR;
      const w = W - pad * 2, h = H - pad * 2; // área da logo

      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d');
      o.drawImage(img, pad, pad, w, h);

      // a imagem oficial já traz o "New" em branco embaixo da nuvem

      sharp = off;
      const data = o.getImageData(0, 0, W, H).data;
      const step = DPR > 1 ? 2 : 1;
      const first = pts.length === 0;
      const next = [];
      for (let y = 0; y < H; y += step)
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          if (data[i + 3] < 110) continue;
          const ang = Math.random() * Math.PI * 2;
          const dist = (SCATTER[0] + Math.random() * (SCATTER[1] - SCATTER[0])) * DPR;
          next.push({
            ox: x, oy: y,
            x: first ? pad + Math.random() * w : x,
            y: first ? pad + Math.random() * h : y,
            sx: x + Math.cos(ang) * dist, sy: y + Math.sin(ang) * dist,
            color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
            text: data[i] > 200 && data[i + 1] > 200,
            phase: Math.random() * 6.28,
          });
        }
      pts = next;
    };

    img.onload = build;
    document.fonts?.ready.then(build);
    window.addEventListener('resize', build);

    const enter = () => (hover = true);
    const leave = () => (hover = false);
    const box = c.parentElement;
    box.addEventListener('mouseenter', enter);
    box.addEventListener('mouseleave', leave);

    const fadeStart = 5, fadeEnd = SCATTER[1] + 4; // px
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!pts.length) return;
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      const r = c.getBoundingClientRect();
      const mx = (pointer.x - r.left) * DPR, my = (pointer.y - r.top) * DPR;
      const s = DPR > 1 ? 1.7 * DPR : 1.15;
      let maxTravel = 0;
      for (const p of pts) {
        let tx = hover ? p.sx : p.ox, ty = hover ? p.sy : p.oy;
        if (hover) { tx += Math.sin(t * 3 + p.phase) * DPR; ty += Math.cos(t * 3 + p.phase) * DPR; }
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 14 * DPR && d > 0) { tx += (dx / d) * 6 * DPR; ty += (dy / d) * 6 * DPR; }
        p.x += (tx - p.x) * 0.14;
        p.y += (ty - p.y) * 0.14;
        // some aos poucos conforme se afasta da posição original
        const travel = Math.hypot(p.x - p.ox, p.y - p.oy) / DPR;
        if (travel > maxTravel) maxTravel = travel;
        const k = Math.min(1, Math.max(0, (travel - fadeStart) / (fadeEnd - fadeStart)));
        ctx.globalAlpha = (1 - k * k * 0.9) * (1 - crisp);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, s, s);
      }
      // parada e montada: troca suavemente para a logo nítida
      const settled = !hover && maxTravel < 1.2;
      crisp += ((settled ? 1 : 0) - crisp) * (settled ? 0.12 : 0.35);
      if (crisp > 0.01 && sharp) {
        ctx.globalAlpha = crisp;
        ctx.drawImage(sharp, 0, 0);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener('mouseenter', enter);
      box.removeEventListener('mouseleave', leave);
      window.removeEventListener('resize', build);
    };
  }, []);

  return (
    <a href="#topo" className="logo" aria-label="NewV — início">
      <canvas ref={ref} style={{ '--pad': `${PAD}px` }} />
    </a>
  );
}
