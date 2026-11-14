import SectionHeader from './SectionHeader.jsx';
import { process } from '../data/content.js';

export default function Process() {
  return (
    <section className="section" id="processo">
      <SectionHeader {...process} />
      <ol className="steps reveal-line reveal">
        {process.steps.map((s, i) => (
          <li key={s.title} className={`step reveal from-left d${i + 2}`}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
