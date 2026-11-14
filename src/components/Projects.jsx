import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Icon from './Icon.jsx';
import { projects } from '../data/content.js';

/* ------------------------------------------------------------------
   Projetos / demonstrações. Os itens vêm de NEWV_CONFIG.projetos
   (index.html). Sem projetos cadastrados, a seção não aparece.

   Vídeo aceito:
   - link do YouTube: mostra a capa e só carrega o player ao clicar
     (usa youtube-nocookie, sem rastrear quem não assistiu)
   - arquivo de vídeo (ex.: 'videos/demo.mp4' na mesma pasta do site)
------------------------------------------------------------------- */

function youtubeId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function Media({ p }) {
  const [playing, setPlaying] = useState(false);
  const yt = youtubeId(p.video);

  if (yt) {
    return playing ? (
      <iframe
        className="proj-media"
        src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
        title={p.titulo}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <button type="button" className="proj-media proj-poster" onClick={() => setPlaying(true)} aria-label={`Assistir: ${p.titulo}`}>
        <img src={p.imagem || `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" />
        <span className="proj-play"><Icon name="play" /></span>
      </button>
    );
  }
  if (p.video) {
    return <video className="proj-media" src={p.video} poster={p.imagem || undefined} controls preload="metadata" playsInline />;
  }
  if (p.imagem) return <img className="proj-media" src={p.imagem} alt={p.titulo} loading="lazy" />;
  return <div className="proj-media proj-empty" aria-hidden="true" />;
}

export default function Projects() {
  if (!projects.items.length) return null;
  return (
    <section className="section" id="projetos">
      <SectionHeader {...projects} />
      <div className={`proj-grid ${projects.items.length === 1 ? 'single' : ''}`}>
        {projects.items.map((p, i) => (
          <article key={p.titulo} className={`proj reveal ${i % 2 ? 'from-right' : 'from-left'} d${(i % 2) + 1}`}>
            <Media p={p} />
            <div className="proj-body">
              <h3>{p.titulo}</h3>
              {p.descricao && <p>{p.descricao}</p>}
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <ul className="proj-tags">
                  {p.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
