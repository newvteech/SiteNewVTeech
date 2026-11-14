import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// npm run build         -> pasta dist/ (para hospedar: Cloudflare Pages, GitHub Pages...)
// npm run build:single  -> pronto/index.html, um arquivo único que abre com dois cliques
//
// SITE_URL: endereço público do site (ex.: https://newv.pages.dev/). É usado na
// prévia do link (WhatsApp, Instagram...), que exige o endereço completo da imagem.
const siteUrl = (() => {
  const raw = process.env.SITE_URL || '';
  return raw && !raw.endsWith('/') ? `${raw}/` : raw;
})();

const siteUrlPlugin = () => ({
  name: 'newv-site-url',
  transformIndexHtml(html) {
    if (siteUrl) return html.replaceAll('__SITE_URL__', siteUrl);
    // sem endereço definido: remove as linhas que precisam dele
    return html
      .replace(/\s*<meta property="og:url"[^>]*\/>/, '')
      .replaceAll('__SITE_URL__og-image.png', 'og-image.png');
  },
});

/* ------------------------------------------------------------------
   Cabeçalhos de segurança para o site publicado (pasta dist/).
   - dist/_headers: lido pela Cloudflare Pages (e Netlify)
   - <meta> de Content-Security-Policy: vale também no GitHub Pages,
     que não permite cabeçalhos próprios
   O script de configuração (NEWV_CONFIG) é liberado pelo seu hash,
   calculado a cada build: se ele mudar, o build gera o hash novo.
------------------------------------------------------------------- */
const securityPlugin = () => {
  let outDir = resolve('dist');
  return {
  name: 'newv-security',
  apply: 'build',
  configResolved(config) {
    outDir = resolve(config.root, config.build.outDir);
  },
  closeBundle() {
    const file = resolve(outDir, 'index.html');
    if (!existsSync(file)) return;
    let html = readFileSync(file, 'utf8');
    const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
      (m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`
    );
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${hashes.join(' ')}`.trim(),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' https:",
      'frame-src https://www.youtube-nocookie.com',
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];
    // a meta tag não aceita frame-ancestors; ele vai só no cabeçalho
    const meta = `<meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}; upgrade-insecure-requests" />`;
    html = html.replace(/(<meta charset="UTF-8" \/>)/, `$1\n    ${meta}`);
    writeFileSync(file, html);

    const headers = `# Cabeçalhos de segurança (Cloudflare Pages / Netlify). Gerado no build.
/*
  Content-Security-Policy: ${csp.join('; ')}; frame-ancestors 'none'; upgrade-insecure-requests
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cross-Origin-Opener-Policy: same-origin-allow-popups

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
    writeFileSync(resolve(outDir, '_headers'), headers);
  },
  };
};

export default defineConfig(({ mode }) => ({
  plugins:
    mode === 'single'
      ? [react(), siteUrlPlugin(), viteSingleFile()]
      : [react(), siteUrlPlugin(), securityPlugin()],
  base: './',
  build: {
    outDir: mode === 'single' ? 'pronto' : 'dist',
    chunkSizeWarningLimit: 900,
  },
}));
