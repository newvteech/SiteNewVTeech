import { useEffect, useRef } from 'react';
import { pointer, prefersReducedMotion } from '../hooks/usePointer.js';
import { perf } from '../hooks/usePerf.js';

// Fundo fixo: estrelas com parallax na rolagem + rede de pontos que foge do mouse,
// e manchas de luz que acompanham o scroll (dá a sensação de página contínua).
export default function Background() {
  const canvasRef = useRef(null);
  const glowA = useRef(null);
  const glowB = useRef(null);
  const glowC = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = prefersReducedMotion();
    let W, H, stars = [], nodes = [], raf;

    const size = () => {
      W = c.width = Math.round(innerWidth * DPR);
      H = c.height = Math.round(innerHeight * DPR);
      const area = innerWidth * innerHeight;
      stars = Array.from({ length: Math.min(260, Math.floor(area / 6000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H, z: Math.random(), tw: Math.random() * 6,
      }));
      nodes = Array.from({ length: Math.min(60, Math.floor(area / 24000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3 * DPR, vy: (Math.random() - 0.5) * 0.3 * DPR,
      }));
    };
    size();
    window.addEventListener('resize', size);

    const sm = { nx: 0 };
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const t = now / 1000;
      const sy = window.scrollY;
      ctx.clearRect(0, 0, W, H);

      for (const s of stars) {
        let y = (s.y - sy * DPR * (0.05 + s.z * 0.2)) % H;
        if (y < 0) y += H;
        const a = 0.25 + (reduce ? 0.4 : Math.abs(Math.sin(t * 0.8 + s.tw)) * 0.6) * s.z;
        ctx.fillStyle = `rgba(${s.z > 0.82 ? '255,210,150' : '170,215,255'},${a})`;
        const sz = (s.z * 1.4 + 0.4) * DPR;
        ctx.fillRect(s.x, y, sz, sz);
      }

      // no modo leve, só as estrelas (a rede de pontos é o trecho mais pesado)
      const lite = perf.lite;
      const mx = pointer.x * DPR, my = pointer.y * DPR, lim = 130 * DPR;
      if (!lite) {
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = n.x - mx, dy = n.y - my, d = Math.hypot(dx, dy);
        if (d < lim && d > 0) { n.x += (dx / d) * 0.8 * DPR; n.y += (dy / d) * 0.8 * DPR; }
      }
      ctx.lineWidth = DPR;
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < lim) {
            ctx.strokeStyle = `rgba(90,170,255,${0.12 * (1 - d / lim)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      ctx.fillStyle = 'rgba(130,205,255,.65)';
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.2 * DPR, 0, Math.PI * 2); ctx.fill(); }
      }

      sm.nx += (pointer.nx - sm.nx) * 0.05;
      glowA.current.style.transform = `translate(${sm.nx * 40}px, ${sy * 0.15}px)`;
      glowB.current.style.transform = `translate(${sm.nx * -30}px, ${sy * 0.1}px)`;
      glowC.current.style.transform = `translateY(${-sy * 0.12}px)`;
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <canvas ref={canvasRef} className="bg-canvas" />
      <div ref={glowA} className="glow glow-a" />
      <div ref={glowB} className="glow glow-b" />
      <div ref={glowC} className="glow glow-c" />
    </div>
  );
}
