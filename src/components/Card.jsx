import Icon from './Icon.jsx';

// Card de vidro com um brilho que segue o mouse
export default function Card({ icon, title, text, delay = 1, from = 'up' }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <article className={`card reveal from-${from} d${delay}`} onPointerMove={onMove}>
      {icon && (
        <div className="ic">
          <Icon name={icon} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
