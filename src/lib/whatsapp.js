import { whatsapp } from '../data/content.js';

// Monta o link do WhatsApp (wa.me) com a mensagem já escrita.
export const waNumber = () => whatsapp.number.replace(/\D/g, '');
export const hasWhatsapp = () => waNumber().length >= 12;
export const waLink = (text) => {
  const base = `https://wa.me/${waNumber()}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};

// Abre o WhatsApp numa nova aba; se o navegador bloquear, abre na mesma aba.
export function openWhatsapp(text) {
  const link = waLink(text);
  const win = window.open(link, '_blank', 'noopener');
  if (!win) window.location.href = link;
  return link;
}
