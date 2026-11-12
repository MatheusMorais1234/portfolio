/*
   checar-links.mjs — todo href/src local dos HTML publicados aponta para um arquivo que existe.

   node _ferramentas/checar-links.mjs
   Roda também no GitHub Actions. Sai com código 1 se achar link quebrado.
   */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { podePublicar, resolver, extrairLinksLocais } from './regras-publicacao.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const paginas = execFileSync('git', ['ls-files', '*.html'], { cwd: raiz, encoding: 'utf8' })
  .trim().split('\n').filter(podePublicar);

let quebrados = 0;
for (const pagina of paginas) {
  const html = readFileSync(join(raiz, pagina), 'utf8');
  for (const link of new Set(extrairLinksLocais(html))) {
    if (!existsSync(join(raiz, resolver(pagina, link)))) {
      quebrados++;
      console.log(`  ✗ ${pagina}: ${link}`);
    }
  }
}

console.log(quebrados ? `\n${quebrados} link(s) quebrado(s).` : `${paginas.length} páginas, nenhum link quebrado.`);
process.exit(quebrados ? 1 : 0);
