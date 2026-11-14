export default function SectionHeader({ eyebrow, title, sub, center = false }) {
  return (
    <div className={center ? 'section-head center' : 'section-head'}>
      <div className={`eyebrow reveal ${center ? 'from-up' : 'from-left'}`}>{eyebrow}</div>
      <h2 className={`reveal d1 ${center ? 'from-up' : 'from-left'}`}>
        {title[0]}
        <span className="grad">{title[1]}</span>
      </h2>
      <p className={`sub reveal d2 ${center ? 'from-up' : 'from-left'}`}>{sub}</p>
    </div>
  );
}
