// Só aceita links seguros vindos da configuração (NEWV_CONFIG):
// endereços http/https, caminhos relativos (ex.: 'fotos/joao.jpg') e,
// para imagens, data:image. Qualquer outra coisa (ex.: 'javascript:...') é ignorada.
export function safeUrl(value, { image = false } = {}) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (image && /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i.test(url)) return url;
  // relativo: sem esquema (nada de "algo:" antes de uma barra)
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//')) return url;
  return '';
}
