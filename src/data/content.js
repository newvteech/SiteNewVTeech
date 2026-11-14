// Todos os textos do site ficam aqui, para editar sem mexer nos componentes.
// Contatos, equipe e projetos ficam em index.html (window.NEWV_CONFIG),
// para poderem ser trocados até no arquivo pronto, sem recompilar.

import { safeUrl } from '../lib/safeUrl.js';

const cfg = (typeof window !== 'undefined' && window.NEWV_CONFIG) || {};

export const nav = [
  { label: 'Como funciona', href: '#servicos' },
  { label: 'Projetos', href: '#projetos', needs: 'projetos' },
  { label: 'Quem somos', href: '#equipe', needs: 'equipe' },
  { label: 'Contato', href: '#contato' },
];

export const hero = {
  badgePill: 'WhatsApp',
  badgeText: 'Automação de atendimento para pequenas empresas',
  titleTop: 'Seu WhatsApp atendendo,',
  titleAccent: 'mesmo quando sua equipe não pode.',
  lead:
    'A NewV automatiza respostas, triagem e agendamentos no WhatsApp da sua empresa. O que é repetitivo, o robô resolve. O que precisa de gente chega para a pessoa certa, com o histórico da conversa.',
  primaryCta: { label: 'Quero o diagnóstico grátis', href: '#diagnostico' },
  secondaryCta: { label: 'Ver como funciona', href: '#servicos' },
  hint: 'Passe o mouse e clique na nuvem',
  hintTouch: 'Toque na nuvem',
};

export const stack = ['WhatsApp', 'n8n', 'Java', 'Spring Boot', 'PostgreSQL', 'APIs REST', 'IA open source'];

export const services = {
  eyebrow: 'Como funciona',
  title: ['O que ', 'automatizamos'],
  sub: 'Começamos pelo que mais toma tempo da sua equipe no WhatsApp.',
  items: [
    { icon: 'chat', title: 'Respostas automáticas', text: 'Horários, preços, endereço, status do pedido: as perguntas que se repetem são respondidas na hora, a qualquer momento.' },
    { icon: 'route', title: 'Triagem e encaminhamento', text: 'O atendimento identifica o assunto e passa a conversa para o setor ou a pessoa certa, sem o cliente repetir tudo.' },
    { icon: 'calendar', title: 'Agendamentos e lembretes', text: 'Marca, confirma e lembra horários automaticamente, com menos idas e vindas de mensagens.' },
    { icon: 'plug', title: 'Ligado aos seus sistemas', text: 'Planilha, agenda, CRM ou sistema próprio: os dados da conversa vão para onde sua equipe já trabalha.' },
  ],
};

export const diagnostic = {
  eyebrow: 'Diagnóstico gratuito',
  title: ['30 minutos para descobrir ', 'onde seu atendimento perde tempo'],
  sub: 'Uma conversa por vídeo ou pelo WhatsApp, sem custo e sem compromisso.',
  bullets: [
    'Mapeamos as perguntas que mais se repetem no seu WhatsApp.',
    'Mostramos o que dá para automatizar e o que deve continuar com uma pessoa.',
    'Você sai com os próximos passos claros, contratando a NewV ou não.',
  ],
  cta: 'Agendar meu diagnóstico',
  whatsappMessage: 'Olá, NewV! Quero agendar o diagnóstico gratuito de 30 minutos.',
};

export const process = {
  eyebrow: 'Processo',
  title: ['Do diagnóstico ', 'ao atendimento no ar'],
  sub: 'Etapas curtas e claras, do primeiro contato ao robô funcionando no seu número.',
  steps: [
    { title: 'Diagnóstico', text: 'Em 30 minutos, mapeamos as conversas que mais se repetem no seu WhatsApp.' },
    { title: 'Protótipo', text: 'Montamos uma versão de teste com os seus casos reais para você experimentar.' },
    { title: 'Implantação', text: 'Colocamos no ar no seu número e mostramos para sua equipe como acompanhar.' },
    { title: 'Ajustes', text: 'Refinamos as respostas com base nas conversas reais das primeiras semanas.' },
  ],
};

export const projects = {
  eyebrow: 'Projetos',
  title: ['Veja ', 'funcionando'],
  sub: 'Demonstrações reais do que construímos.',
  items: Array.isArray(cfg.projetos)
    ? cfg.projetos
        .filter((p) => p && p.titulo)
        .map((p) => ({ ...p, video: safeUrl(p.video), imagem: safeUrl(p.imagem, { image: true }) }))
    : [],
};

export const team = {
  eyebrow: 'Quem somos',
  title: ['Quem vai cuidar ', 'do seu atendimento'],
  sub: 'Sem intermediários: você fala direto com quem constrói.',
  members: Array.isArray(cfg.equipe)
    ? cfg.equipe
        .filter((m) => m && m.nome)
        .map((m) => ({ ...m, foto: safeUrl(m.foto, { image: true }), linkedin: safeUrl(m.linkedin) }))
    : [],
};

export const differentials = {
  eyebrow: 'Diferencial',
  title: ['Por que a ', 'NewV'],
  sub: 'Somos pequenos de propósito, e isso significa atenção real a cada cliente.',
  items: [
    { title: 'Uma pessoa sempre no controle', text: 'O robô cuida do repetitivo. Quando o assunto pede atenção humana, a conversa vai para sua equipe.' },
    { title: 'Direto com quem constrói', text: 'Sem camadas de atendimento. Você fala com quem desenvolve a sua automação.' },
    { title: 'Transparência total', text: 'Custo, prazo e limitações claros desde a primeira conversa.' },
  ],
};

export const contact = {
  eyebrow: 'Contato',
  title: ['Vamos ', 'conversar?'],
  sub: 'Conte como é o atendimento da sua empresa hoje. Respondemos pessoalmente.',
};

// Dados da empresa para o aviso de privacidade (preencher quando tiverem CNPJ).
export const company = {
  name: (cfg.empresa && cfg.empresa.nome) || 'NewV',
  cnpj: (cfg.empresa && cfg.empresa.cnpj) || '',
  email: (cfg.empresa && cfg.empresa.email) || '',
};

// WhatsApp da NewV.
// O número fica em index.html (window.NEWV_CONFIG), para poder ser trocado
// até no arquivo pronto, sem recompilar. Se preferir fixar aqui, troque o '' abaixo.
const configured = cfg.whatsapp || '';
export const whatsapp = {
  number: configured || '',
  display: 'WhatsApp da NewV',
  greeting: 'Olá, NewV! Vim pelo site e quero saber mais sobre a automação do atendimento no WhatsApp.',
};

// Instagram da NewV. O link fica em index.html (window.NEWV_CONFIG.instagram).
// Aceita o link completo ou só o @. Se preferir fixar aqui, troque o '' abaixo.
const igRaw = String(cfg.instagram || '').trim();
const igUser = igRaw
  .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
  .replace(/^@/, '')
  .replace(/[/?#].*$/, '')
  .replace(/[^A-Za-z0-9._]/g, ''); // nome de usuário do Instagram: só letras, números, ponto e _
export const instagram = {
  url: igUser ? `https://www.instagram.com/${igUser}/` : '',
  handle: igUser ? `@${igUser}` : '',
};
