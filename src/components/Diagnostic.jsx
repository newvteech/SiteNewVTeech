import Icon from './Icon.jsx';
import { diagnostic } from '../data/content.js';
import { hasWhatsapp, openWhatsapp } from '../lib/whatsapp.js';

// Porta de entrada sem risco: diagnóstico gratuito de 30 minutos.
// O relógio marca os 30 minutos quando a seção aparece na tela.
export default function Diagnostic() {
  const onCta = (e) => {
    if (!hasWhatsapp()) return; // sem número: o link leva ao formulário de contato
    e.preventDefault();
    openWhatsapp(diagnostic.whatsappMessage);
  };

  return (
    <section className="section" id="diagnostico">
      <div className="diag">
        <div className="diag-clock reveal from-zoom" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <linearGradient id="diagGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0ea5f0" />
                <stop offset="0.6" stopColor="#1d4fe0" />
                <stop offset="1" stopColor="#4a2ef0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="84" className="dc-track" />
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1="100" y1="22" x2="100" y2={i % 3 === 0 ? 32 : 28}
                className="dc-tick"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
            {/* arco de 30 minutos (meia volta) */}
            <circle cx="100" cy="100" r="84" className="dc-arc" pathLength="100" stroke="url(#diagGrad)" />
            {/* ponto de luz que percorre a borda até os 30 minutos */}
            <g className="dc-hand">
              <circle cx="100" cy="16" r="9" className="dc-glow" />
              <circle cx="100" cy="16" r="5" className="dc-pin" />
            </g>
          </svg>
          <div className="dc-label">
            <strong>30</strong>
            <span>minutos</span>
          </div>
        </div>

        <div className="diag-copy">
          <div className="eyebrow reveal from-left">{diagnostic.eyebrow}</div>
          <h2 className="reveal from-left d1">
            {diagnostic.title[0]}
            <span className="grad">{diagnostic.title[1]}</span>
          </h2>
          <p className="sub reveal from-left d2">{diagnostic.sub}</p>
          <ul className="diag-list">
            {diagnostic.bullets.map((b, i) => (
              <li key={b} className={`reveal from-left d${i + 2}`}>
                <span className="diag-check"><Icon name="check" /></span>
                {b}
              </li>
            ))}
          </ul>
          <a href="#contato" onClick={onCta} className="btn btn-primary reveal from-up d4">
            {diagnostic.cta} <span className="arr">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
