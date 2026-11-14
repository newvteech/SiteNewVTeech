import InstagramButton from './InstagramButton.jsx';
import { openPrivacy } from './Privacy.jsx';
import { perf, usePerf } from '../hooks/usePerf.js';

export default function Footer() {
  const { lite, auto } = usePerf();
  return (
    <footer className="footer">
      <div className="footer-social">
        <span>Siga a NewV</span>
        <InstagramButton />
      </div>
      <div className="footer-links">
        <button type="button" className="link-btn" onClick={openPrivacy}>Aviso de privacidade</button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className="link-btn lite-toggle"
          onClick={() => perf.toggle()}
          aria-pressed={lite}
          title="Reduz as animações para celulares mais simples"
        >
          Modo leve: {lite ? 'ligado' : 'desligado'}
          {lite && auto ? ' (automático)' : ''}
        </button>
      </div>
      <p>© {new Date().getFullYear()} NewV · Feito por quem entende o problema antes de escrever a primeira linha de código.</p>
    </footer>
  );
}
