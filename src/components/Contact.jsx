import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { contact, whatsapp } from '../data/content.js';
import { hasWhatsapp as hasNumber, waLink } from '../lib/whatsapp.js';
import { openPrivacy } from './Privacy.jsx';
import InstagramButton from './InstagramButton.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sentLink, setSentLink] = useState('');
  const [status, setStatus] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasNumber()) {
      setStatus('O WhatsApp da NewV ainda não foi configurado. Volte em breve!');
      return;
    }
    const text =
      `Olá, NewV! Meu nome é ${form.name.trim()}` +
      (form.email.trim() ? ` (${form.email.trim()})` : '') +
      `.\n\n${form.message.trim()}`;
    const link = waLink(text);
    setSentLink(link);
    setStatus('Abrimos o WhatsApp com sua mensagem pronta. É só tocar em enviar.');
    // abre o WhatsApp (app no celular, WhatsApp Web no computador)
    const win = window.open(link, '_blank', 'noopener');
    if (!win) setStatus('Toque no botão abaixo para abrir o WhatsApp com sua mensagem pronta.');
  };

  return (
    <section className="section contact" id="contato">
      <SectionHeader {...contact} center />
      <form className="contact-form reveal from-zoom d3" onSubmit={handleSubmit}>
        <label htmlFor="c-name">
          <span>Nome</span>
          <input id="c-name" type="text" value={form.name} onChange={update('name')} placeholder="Seu nome" required />
        </label>
        <label htmlFor="c-email">
          <span>E-mail (opcional)</span>
          <input id="c-email" type="email" value={form.email} onChange={update('email')} placeholder="voce@empresa.com" />
        </label>
        <label htmlFor="c-msg">
          <span>Mensagem</span>
          <textarea id="c-msg" rows="4" value={form.message} onChange={update('message')} placeholder="Qual problema você quer resolver?" required />
        </label>
        <button className="btn btn-whatsapp" type="submit">
          <WhatsIcon /> Enviar pelo WhatsApp <span className="arr">→</span>
        </button>
        {sentLink && (
          <a className="wa-fallback" href={sentLink} target="_blank" rel="noopener noreferrer">
            Abrir o WhatsApp de novo
          </a>
        )}
        <p className="consent">
          Ao enviar, você concorda com o nosso{' '}
          <button type="button" className="link-btn" onClick={openPrivacy}>aviso de privacidade</button>.
        </p>
        <p className="status" role="status">{status}</p>
        {hasNumber() && (
          <div className="wa-direct">
            <span>Prefere chamar direto?</span>
            <a href={waLink(whatsapp.greeting)} target="_blank" rel="noopener noreferrer">
              <WhatsIcon /> {whatsapp.display}
            </a>
          </div>
        )}
        <div className="wa-direct">
          <span>Acompanhe nosso trabalho</span>
          <InstagramButton />
        </div>
      </form>
    </section>
  );
}

function WhatsIcon() {
  return (
    <svg className="wa-ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
