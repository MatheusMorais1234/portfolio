// Regras usadas pelos scripts de publicação. Sem acesso a disco ou rede, para dar para testar.
import { posix } from 'node:path';

// o que fica só na minha máquina ou só no GitHub
const PRIVADOS = ['_nao-publicar/', '_ferramentas/', '_gravacoes/', '.impeccable/', '.claude/', '.taste-skill/', '.github/'];
const ARQUIVOS_PRIVADOS = ['LEIA-ME.md', '.gitignore', '.gitattributes'];

export function podePublicar(caminho) {
  if (ARQUIVOS_PRIVADOS.includes(caminho)) return false;
  return !PRIVADOS.some(p => caminho.startsWith(p));
}

// caminho do arquivo no repo a partir de um href/src escrito dentro de caminhoHtml
export function resolver(caminhoHtml, url) {
  const limpo = url.split('#')[0].split('?')[0];
  let c = limpo.startsWith('/')
    ? limpo.slice(1)
    : posix.normalize(posix.join(posix.dirname(caminhoHtml), limpo));
  if (c === '.' || c === './') c = '';
  if (c === '' || c.endsWith('/')) c += 'index.html';
  return c;
}

const VERSIONADO = /(href|src)="([^"]+)\?v=([^"&]+)"/g;

export function trocarVersao(html, caminhoHtml, alterados, versao) {
  return html.replace(VERSIONADO, (tudo, attr, url) =>
    alterados.has(resolver(caminhoHtml, url)) ? `${attr}="${url}?v=${versao}"` : tudo);
}

export function extrairVersionados(html) {
  return [...html.matchAll(VERSIONADO)].map(m => `${m[2]}?v=${m[3]}`);
}

export function extrairLinksLocais(html) {
  const links = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map(m => m[1]);
  return links.filter(u => u && !u.startsWith('#') && !u.startsWith('//') && !/^[a-z][a-z0-9+.-]*:/i.test(u));
}
