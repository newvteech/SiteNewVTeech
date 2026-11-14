import { stack } from '../data/content.js';

export default function TechMarquee() {
  const items = [...stack, ...stack]; // duplicado para o loop contínuo
  return (
    <div className="strip reveal from-right">
      <p>Construído com tecnologias sólidas e abertas</p>
      <div className="marquee">
        <div className="track">
          {items.map((name, i) => (
            <span key={i} aria-hidden={i >= stack.length}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
