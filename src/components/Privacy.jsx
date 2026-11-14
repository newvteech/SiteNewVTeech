import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { company, instagram } from '../data/content.js';
import { hasWhatsapp } from '../lib/whatsapp.js';

/* ------------------------------------------------------------------
   Aviso de privacidade (LGPD) em linguagem simples.
   Abre por openPrivacy(), chamado no formulário e no rodapé.
   Revise com um profissional quando a NewV tiver CNPJ.
------------------------------------------------------------------- */

const EVENT = 'newv:privacidade';
export const openPrivacy = () => window.dispatchEvent(new Event(EVENT));

export default function Privacy() {
  const ref = useRef(null);

  useEffect(() => {
    const open = () => ref.current?.showModal?.();
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  const close = () => ref.current?.close();
  const contactWays = [hasWhatsapp() && 'pelo WhatsApp', company.email && `pelo e-mail ${company.email}`, instagram.url && `pelo Instagram ${instagram.handle}`]
    .filter(Boolean);

  return (
    <dialog ref={ref} className="privacy" aria-labelledby="privacy-title" onClick={(e) => e.target === ref.current && close()}>
      <div className="privacy-box">
        <button type="button" className="privacy-close" onClick={close} aria-label="Fechar">
          <Icon name="close" />
        </button>
        <h2 id="privacy-title">Aviso de privacidade</h2>
        <p className="privacy-intro">
          Explicamos, de forma direta, o que acontece com os dados que você informa neste site,
          conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <dl>
          <dt>Quais dados</dt>
          <dd>Nome, e-mail (opcional) e a mensagem que você escreve no formulário de contato.</dd>
          <dt>Para quê</dt>
          <dd>Somente para responder ao seu contato e conversar sobre o que você pediu.</dd>
          <dt>Como chegam até nós</dt>
          <dd>
            O site não guarda nada. Ao enviar, o WhatsApp abre com a mensagem pronta, e ela só é
            enviada quando você confirma no seu próprio WhatsApp.
          </dd>
          <dt>Compartilhamento</dt>
          <dd>
            Não vendemos nem repassamos seus dados. A conversa passa pelo WhatsApp, que tem a sua
            própria política de privacidade.
          </dd>
          <dt>Cookies e rastreamento</dt>
          <dd>
            Este site não usa cookies de rastreamento nem ferramentas de análise. Ele guarda no seu
            navegador apenas a preferência de “modo leve”, se você mudar. Vídeos do YouTube só
            carregam quando você clica para assistir.
          </dd>
          <dt>Seus direitos</dt>
          <dd>
            Você pode pedir para ver, corrigir ou apagar seus dados a qualquer momento
            {contactWays.length ? `, ${contactWays.join(', ')}` : ', pelos nossos canais de contato'}.
          </dd>
          <dt>Responsável</dt>
          <dd>
            {company.name}
            {company.cnpj ? ` · CNPJ ${company.cnpj}` : ''}
          </dd>
        </dl>
        <p className="privacy-date">Última atualização: novembro de 2026.</p>
      </div>
    </dialog>
  );
}
