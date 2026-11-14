import SectionHeader from './SectionHeader.jsx';
import Icon from './Icon.jsx';
import { team } from '../data/content.js';

/* ------------------------------------------------------------------
   Quem somos. Os sócios vêm de NEWV_CONFIG.equipe (index.html).
   Sem nomes cadastrados, a seção não aparece.
   Sem foto, mostra as iniciais no gradiente da marca.
------------------------------------------------------------------- */

const initials = (name) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export default function Team() {
  if (!team.members.length) return null;
  const from = ['left', 'up', 'right'];
  return (
    <section className="section" id="equipe">
      <SectionHeader {...team} />
      <div className={`team-grid n${Math.min(team.members.length, 4)}`}>
        {team.members.map((m, i) => (
          <article key={m.nome} className={`member reveal from-${from[i % 3]} d${(i % 3) + 1}`}>
            <div className="member-photo">
              {m.foto ? <img src={m.foto} alt={`Foto de ${m.nome}`} loading="lazy" /> : <span>{initials(m.nome)}</span>}
            </div>
            <h3>{m.nome}</h3>
            {m.funcao && <p className="member-role">{m.funcao}</p>}
            {m.sobre && <p className="member-bio">{m.sobre}</p>}
            {m.linkedin && (
              <a className="member-link" href={m.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" /> LinkedIn
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
