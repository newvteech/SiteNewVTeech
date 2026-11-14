import Logo from './Logo.jsx';
import { nav, projects, team } from '../data/content.js';

// itens que dependem de conteúdo só aparecem quando a seção existe
const available = { projetos: projects.items.length > 0, equipe: team.members.length > 0 };
const items = nav.filter((i) => !i.needs || available[i.needs]);

export default function Navbar() {
  return (
    <header className="nav-wrap">
      <div className="navbar">
        <Logo />
        <nav>
          {items.map((item) => (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#diagnostico" className="btn btn-primary btn-small">
            Diagnóstico grátis <span className="arr">→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
