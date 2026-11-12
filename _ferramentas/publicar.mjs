/*
   publicar.mjs — diz o que subir para a Hostinger desde a última publicação.

   node _ferramentas/publicar.mjs            lista o que mudou (enviar / apagar no servidor)
   node _ferramentas/publicar.mjs --aplicar  troca o ?v= dos CSS/JS alterados nos HTML que usam
   node _ferramentas/publicar.mjs --marcar   marca o commit atual como publicado (tag "publicado")

   Ordem: --aplicar, commit, subir a lista, verificar-no-ar.mjs, --marcar.
   */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { podePublicar, trocarVersao } from './regras-publicacao.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8' }).trim();
const linhas = texto => texto ? texto.split('\n') : [];
const TAG = 'publicado';

if (process.argv.includes('--marcar')) {
  git('tag', '-f', TAG, 'HEAD');
  console.log(`Tag "${TAG}" agora aponta para ${git('rev-parse', '--short', 'HEAD')}.`);
  process.exit(0);
}

if (git('status', '--porcelain')) {
  console.error('Tem coisa sem commit. Só publico o que já está commitado.');
  process.exit(1);
}

const enviar = new Set();
const apagar = [];
let temTag = true;
try { git('rev-parse', '--verify', '--quiet', TAG); } catch { temTag = false; }

if (temTag) {
  for (const l of linhas(git('diff', '--name-status', '--no-renames', TAG, 'HEAD'))) {
    const [status, caminho] = l.split('\t');
    if (!podePublicar(caminho)) continue;
    if (status === 'D') apagar.push(caminho);
    else enviar.add(caminho);
  }
} else {
  console.log(`Sem a tag "${TAG}": listando tudo que pode subir.\n`);
  for (const c of linhas(git('ls-files'))) if (podePublicar(c)) enviar.add(c);
}

if (process.argv.includes('--aplicar')) {
  const alterados = new Set([...enviar].filter(c => /\.(css|js)$/.test(c)));
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const versao = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;
  const trocados = [];

  for (const html of linhas(git('ls-files', '*.html')).filter(podePublicar)) {
    const antes = readFileSync(join(raiz, html), 'utf8');
    const depois = trocarVersao(antes, html, alterados, versao);
    if (depois !== antes) {
      writeFileSync(join(raiz, html), depois);
      trocados.push(html);
      enviar.add(html);
    }
  }
  console.log(trocados.length
    ? `?v=${versao} em: ${trocados.join(', ')}\nFaça o commit antes de subir.\n`
    : 'Nenhum ?v= para trocar.\n');
}

// HTML por último: se o envio parar no meio, a página antiga continua apontando para o CSS/JS antigo
const lista = [...enviar].sort((a, b) => a.endsWith('.html') - b.endsWith('.html') || a.localeCompare(b));
console.log(`Enviar (${lista.length}):`);
for (const c of lista) console.log(`  ${c}`);
if (apagar.length) {
  console.log(`\nApagar no servidor (${apagar.length}):`);
  for (const c of apagar) console.log(`  ${c}`);
}
