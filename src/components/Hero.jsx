import { useEffect, useRef } from 'react';
import CloudScene from './CloudScene.jsx';
import CloudSky from './CloudSky.jsx';
import { usePerf } from '../hooks/usePerf.js';
import { hero } from '../data/content.js';

export default function Hero() {
  const { lite } = usePerf();
  const copyRef = useRef(null);

  // o texto sobe e desaparece suavemente enquanto a nuvem se dispersa
  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const sy = window.scrollY;
      const p = Math.min(1, sy / window.innerHeight);
      if (copyRef.current) {
        copyRef.current.style.transform = `translateY(${sy * 0.22}px)`;
        copyRef.current.style.opacity = String(Math.max(0, 1 - p * 1.15));
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="hero" id="topo">
      {!lite && <CloudSky />}
      <div className="hero-copy" ref={copyRef}>
        <div className="badge">
          <span className="pill">{hero.badgePill}</span> {hero.badgeText}
        </div>
        <h1>
          {hero.titleTop}
          <br />
          <span className="grad">{hero.titleAccent}</span>
        </h1>
        <p className="lead">{hero.lead}</p>
        <div className="btn-row">
          <a href={hero.primaryCta.href} className="btn btn-primary">
            {hero.primaryCta.label} <span className="arr">→</span>
          </a>
          <a href={hero.secondaryCta.href} className="btn btn-ghost">
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <CloudScene key={lite ? 'leve' : 'completo'} lite={lite} />
        <p className="cloud-hint">
          <span className="hint-mouse">{hero.hint}</span>
          <span className="hint-touch">{hero.hintTouch}</span>
        </p>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <div className="mouse" />
        role
      </div>
    </section>
  );
}
