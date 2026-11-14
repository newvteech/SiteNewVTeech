# NewV — Site institucional

Site da NewV: automação de atendimento no WhatsApp para pequenas empresas.
Feito com **React + Vite** e nuvens 3D em **Three.js**. Tudo open source e gratuito.

---

## 1. Abrir sem instalar nada

O arquivo **`pronto/index.html`** é o site completo num arquivo só.
Dê dois cliques nele e ele abre no navegador, no computador ou no celular, até sem internet.

---

## 2. Configurar (WhatsApp, Instagram, equipe, projetos)

Tudo o que vocês ainda vão preencher fica num único bloco, **`NEWV_CONFIG`**, no começo do
arquivo. Abra `pronto/index.html` (ou `NewV-site.html`) num editor de texto, como o Bloco
de Notas ou o VS Code, procure por `NEWV_CONFIG`, edite e salve.

```js
window.NEWV_CONFIG = {
  whatsapp: '5571999998888',          // 55 + DDD + número, só números
  instagram: '@newv',                 // ou o link completo do perfil
  empresa: { nome: 'NewV', cnpj: '', email: '' },   // aparece no aviso de privacidade
  equipe: [
    { nome: 'João Silva', funcao: 'Automação e n8n',
      sobre: 'Trabalha com suporte técnico há 5 anos.',
      foto: 'fotos/joao.jpg', linkedin: 'https://www.linkedin.com/in/joao' },
  ],
  projetos: [
    { titulo: 'Atendimento automático para clínica',
      descricao: 'Responde dúvidas, marca consultas e avisa a recepção.',
      video: 'https://youtu.be/XXXXXXXXXXX', tags: ['n8n', 'WhatsApp'] },
  ],
};
```

- **Seções vazias ficam escondidas.** Sem `equipe` ou sem `projetos`, essas seções e os
  itens do menu não aparecem. O site nunca mostra conteúdo de exemplo.
- **Fotos e vídeos:** coloque os arquivos numa pasta ao lado do site (ex.: `fotos/joao.jpg`,
  `videos/demo.mp4`) e use o caminho. Sem foto, aparecem as iniciais no gradiente da marca.
- **YouTube:** o vídeo só carrega quando a pessoa clica em assistir (modo sem rastreamento).
- **Sem número de WhatsApp:** o botão do diagnóstico leva ao formulário, e o formulário
  avisa que o WhatsApp ainda não foi configurado.

No código-fonte, a mesma configuração fica em `index.html` (na raiz). Depois de mudar, rode
`npm run build:single` para atualizar o arquivo pronto.

---

## 3. Publicar de graça

### Opção recomendada: Cloudflare Pages

No plano gratuito, as visitas ao site (arquivos estáticos) são gratuitas e ilimitadas, com
até 500 publicações por mês. Confira as condições atuais ao criar a conta.

1. Suba este projeto para um repositório no GitHub.
2. No painel da Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Escolha o repositório e preencha:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Variável de ambiente: `SITE_URL` = o endereço final (ex.: `https://newv.pages.dev/`)
4. Salve. A cada `git push`, o site é publicado de novo sozinho.

### Opção: GitHub Pages

O projeto já tem o arquivo `.github/workflows/deploy.yml`, que publica sozinho a cada push.

1. O repositório precisa ser **público** (no plano gratuito do GitHub).
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Faça um push na branch `main`.

**Atenção:** a documentação do GitHub diz que o Pages não é feito para ser hospedagem
gratuita de um negócio online. Um site institucional fica numa zona cinzenta, por isso a
Cloudflare é a opção recomendada.

---

## 4. Prévia do link no WhatsApp

Quando alguém envia o link do site, o WhatsApp mostra a imagem `public/og-image.png`, o
título e a descrição definidos em `index.html` (`og:title`, `og:description`).

A prévia **só funciona com o site publicado**, porque o WhatsApp precisa do endereço completo
da imagem. Por isso a variável `SITE_URL` existe: na Cloudflare você a define no painel, e no
GitHub Pages o deploy já preenche sozinho.

Para trocar a imagem, substitua `public/og-image.png` (1200 × 630 pixels).

---

## 5. Aviso de privacidade (LGPD)

O aviso abre pelo link no rodapé e pela frase embaixo do formulário. Ele explica em linguagem
simples quais dados o formulário recebe, para quê, e que o site não guarda nada nem usa
rastreamento. O texto fica em `src/components/Privacy.jsx`.

Quando a NewV tiver CNPJ, preencha `empresa` no `NEWV_CONFIG`, e vale revisar o texto com um
profissional de direito.

---

## 6. Segurança

O site é estático: não tem servidor, banco de dados, login nem senhas, e não guarda nada
do visitante. Isso já elimina a maior parte dos riscos. Além disso:

- **Cabeçalhos de segurança:** o build gera `dist/_headers` (lido pela Cloudflare) e uma
  `<meta>` de Content-Security-Policy (vale também no GitHub Pages). Eles:
  - só deixam rodar os scripts do próprio site e o bloco `NEWV_CONFIG` (liberado pelo hash,
    recalculado a cada build);
  - impedem que outro site coloque o de vocês dentro de uma moldura (proteção contra clickjacking);
  - bloqueiam câmera, microfone, localização e pagamento;
  - só permitem vídeos embutidos do YouTube (modo sem rastreamento).
- **Links da configuração validados:** em `NEWV_CONFIG`, só são aceitos links `http(s)`,
  caminhos relativos e imagens. Algo como `javascript:...` é ignorado, e o @ do Instagram
  aceita só letras, números, ponto e `_`.
- **Dependências:** `npm audit` sem vulnerabilidades (Vite 8). Rode `npm audit` de vez em quando.
- **Links externos** abrem em nova aba com `rel="noopener"`.

**Importante:** se você editar o `NEWV_CONFIG` direto no `dist/index.html` publicado (sem
rodar o build), o hash deixa de bater e o navegador bloqueia a configuração. Edite sempre o
`index.html` da raiz e deixe o deploy refazer o build. O arquivo `pronto/index.html` (dois
cliques) não tem essa trava e pode ser editado à vontade.

**Contas:** ativem a verificação em duas etapas no GitHub, na Cloudflare, no Instagram e no
e-mail da empresa. Quem invade uma dessas contas troca o site ou o número do WhatsApp.

## 7. Modo leve (celulares simples)

O modo leve desliga as nuvens pequenas e a rede de pontos do fundo, e reduz as partículas da
nuvem principal. Ele liga sozinho quando:

- o aparelho tem pouca memória ou poucos núcleos;
- o usuário ativou "economia de dados" ou "reduzir movimento";
- a animação fica abaixo de 30 quadros por segundo nos primeiros segundos.

O visitante também pode ligar ou desligar no rodapé ("Modo leve"), e a escolha fica salva no
navegador. O código fica em `src/hooks/usePerf.js`.

---

## 8. Rodar no computador (para editar)

Precisa do [Node.js](https://nodejs.org) 20.19 ou superior; recomendado o 22 (gratuito). O arquivo `.node-version` já avisa a Cloudflare para usar o 22.

```bash
npm install           # só na primeira vez
npm run dev           # site em http://localhost:5173 com recarga automática
npm run build         # pasta dist/ (para publicar)
npm run build:single  # pronto/index.html (arquivo único, abre com dois cliques)
```

---

## Estrutura

```
newv-site/
├── pronto/index.html            # SITE PRONTO: abre com dois cliques
├── index.html                   # página base, prévia do link e NEWV_CONFIG
├── public/og-image.png          # imagem da prévia do link
├── .github/workflows/deploy.yml # publicação automática no GitHub Pages
├── src/
│   ├── data/content.js          # todos os TEXTOS do site
│   ├── styles/global.css        # cores, vidro, layout e responsivo
│   ├── styles/fonts.css         # fontes embutidas (Inter e Fustat, licença OFL)
│   ├── three/cloud.js           # formato e shaders das nuvens
│   ├── lib/whatsapp.js          # links do WhatsApp
│   ├── lib/safeUrl.js           # valida os links vindos do NEWV_CONFIG
│   ├── hooks/                   # mouse, animações ao rolar, modo leve
│   └── components/
│       ├── Hero.jsx, CloudScene.jsx, CloudSky.jsx   # topo e nuvens
│       ├── Services.jsx         # o que automatizamos
│       ├── Diagnostic.jsx       # diagnóstico gratuito de 30 minutos
│       ├── Process.jsx          # do diagnóstico ao atendimento no ar
│       ├── Projects.jsx         # projetos (vem do NEWV_CONFIG)
│       ├── Differentials.jsx    # por que a NewV
│       ├── Team.jsx             # quem somos (vem do NEWV_CONFIG)
│       ├── Contact.jsx          # formulário → WhatsApp
│       ├── Privacy.jsx          # aviso de privacidade
│       ├── Footer.jsx, InstagramButton.jsx, BackToTop.jsx, Logo.jsx, Navbar.jsx
│       └── Background.jsx, TechMarquee.jsx, SectionHeader.jsx, Card.jsx, Icon.jsx
```

## Animações

- **Nuvem principal:** inclina com o mouse, explode no clique e se dispersa na rolagem.
- **Nuvens pequenas:** atravessam o topo devagar e reagem ao mouse e ao clique.
- **Seções:** títulos e cards entram pelos lados ao aparecer na tela, descendo ou subindo.
- **Relógio do diagnóstico:** marca os 30 minutos quando a seção aparece.
- **Logo:** vira partículas com o mouse em cima.
- **Instagram:** o ícone explode em partículas e abre o perfil.
- **Voltar ao topo:** a nuvem mostra o progresso da leitura e decola no clique.

Tudo respeita a opção do sistema "reduzir movimento".
