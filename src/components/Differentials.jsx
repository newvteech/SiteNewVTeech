import SectionHeader from './SectionHeader.jsx';
import Card from './Card.jsx';
import { differentials } from '../data/content.js';

export default function Differentials() {
  return (
    <section className="section" id="diferencial">
      <SectionHeader {...differentials} />
      <div className="grid three">
        {differentials.items.map((d, i) => (
          <Card key={d.title} {...d} delay={i + 1} from={['left', 'up', 'right'][i % 3]} />
        ))}
      </div>
    </section>
  );
}
