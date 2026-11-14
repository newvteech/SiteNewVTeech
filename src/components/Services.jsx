import SectionHeader from './SectionHeader.jsx';
import Card from './Card.jsx';
import { services } from '../data/content.js';

export default function Services() {
  return (
    <section className="section" id="servicos">
      <SectionHeader {...services} />
      <div className="grid four">
        {services.items.map((s, i) => (
          <Card key={s.title} {...s} delay={(i % 4) + 1} from={i % 2 === 0 ? 'left' : 'right'} />
        ))}
      </div>
    </section>
  );
}
