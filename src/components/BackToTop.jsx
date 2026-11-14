import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/usePointer.js';

/* ------------------------------------------------------------------
   Botão "voltar ao topo" em forma de nuvem.
   - o contorno da nuvem se desenha conforme a página é rolada (progresso)
   - a seta é o "V" da NewV de cabeça para baixo
   - ao clicar, a nuvem decola deixando um rastro de partículas
------------------------------------------------------------------- */

// nuvem dentro de um quadro 64 x 48
const CLOUD =
  'M17 41 H47 A9 9 0 0 0 49 23.2 A14 14 0 0 0 22.4 18.6 A11 11 0 0 0 17 41 Z';

const SPARKS = 16;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);
  const progressRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.strokeDashoffset = String(100 - p * 100);
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTop = () => {
    if (prefersReducedMotion()) {
      window.scrollTo({ top: 0 });
      return;
    }
    setLaunching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setLaunching(false), 1600);
  };

  const cls = ['to-top', visible && 'show', launching && 'launch'].filter(Boolean).join(' ');

  return (
    <button type="button" className={cls} onClick={goTop} aria-label="Voltar ao topo" tabIndex={visible ? 0 : -1}>
      <span className="to-top-label" aria-hidden="true">
        Voltar ao topo · <span ref={pctRef}>0%</span>
      </span>

      <span className="to-top-cloud">
        {/* rastro de luz preso embaixo da nuvem */}
        <b className="tt-streak" aria-hidden="true" />
        <svg viewBox="0 0 64 48" aria-hidden="true">
          <defs>
            <linearGradient id="toTopGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0ea5f0" />
              <stop offset="0.55" stopColor="#1d4fe0" />
              <stop offset="1" stopColor="#4a2ef0" />
            </linearGradient>
            <radialGradient id="toTopFill" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="rgba(120,190,255,0.35)" />
              <stop offset="1" stopColor="rgba(10,16,32,0.92)" />
            </radialGradient>
          </defs>
          {/* corpo de vidro */}
          <path d={CLOUD} className="tt-body" fill="url(#toTopFill)" />
          {/* trilho do contorno */}
          <path d={CLOUD} className="tt-track" pathLength="100" />
          {/* contorno que se desenha com o progresso da rolagem */}
          <path d={CLOUD} className="tt-progress" pathLength="100" ref={progressRef} stroke="url(#toTopGrad)" />
          {/* reflexo */}
          <path d="M22 26 A8 8 0 0 1 30 19.5" className="tt-shine" />
          {/* seta: o "V" da NewV invertido */}
          <g className="tt-arrow">
            <path d="M25.5 34.5 L32 27 L38.5 34.5" />
          </g>
        </svg>
      </span>

      {/* rastro de partículas da decolagem (fica para trás quando a nuvem sobe) */}
      <span className="tt-trail" aria-hidden="true">
        {Array.from({ length: SPARKS }, (_, i) => (
          <i key={i} style={{ '--x': `${((i * 7) % 11) * 6 - 30}px`, '--y': `${70 + ((i * 13) % 5) * 12}px`, '--d': `${(i * 41) % 420}ms`, '--s': `${5 + (i % 3) * 2}px` }} />
        ))}
      </span>
    </button>
  );
}
