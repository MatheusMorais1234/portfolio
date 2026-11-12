/*
   verificar-no-ar.mjs — confere o site publicado depois de subir os arquivos.

   node _ferramentas/verificar-no-ar.mjs [https://matheusmorais.com]

   - as páginas abrem (200)
   - o ?v= de cada CSS/JS no ar é o mesmo do HTML local (senão faltou subir algum HTML)
   - cada CSS/JS versionado responde 200
   - nada privado responde 200
   - a CSP do .htaccess está valendo
   Sai com código 1 se algo falhar.
   */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extrairVersionados } from './regras-publicacao.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv[2] || 'https://matheusmorais.com').replace(/\/$/, '');

// endereço no ar -> arquivo local
const PAGINAS = {
  '/': 'index.html',
  '/en/': 'en/index.html',
  '/freelamanager.html': 'freelamanager.html',
  '/en/freelamanager.html': 'en/freelamanager.html',
  '/ferramentas/': 'ferramentas/index.html',
  '/ferramentas/pix/': 'ferramentas/pix/index.html',
  '/ferramentas/boleto/': 'ferramentas/boleto/index.html',
  '/ferramentas/cnab/': 'ferramentas/cnab/index.html',
  '/servicos/': 'servicos/index.html',
  '/404.html': '404.html',
};

const PROIBIDOS = ['/_nao-publicar/', '/_ferramentas/publicar.mjs', '/.git/config', '/.gitignore', '/LEIA-ME.md', '/.github/workflows/testes.yml'];

let falhas = 0;
const erro = msg => { falhas++; console.log(`  ✗ ${msg}`); };
const pedir = url => fetch(url, { redirect: 'manual', headers: { 'user-agent': 'verificar-no-ar' } });

for (const [caminho, arquivo] of Object.entries(PAGINAS)) {
  const url = base + caminho;
  const resp = await pedir(url);
  if (resp.status !== 200) { erro(`${caminho} respondeu ${resp.status}`); continue; }

  const noAr = extrairVersionados(await resp.text()).sort();
  const local = extrairVersionados(readFileSync(join(raiz, arquivo), 'utf8')).sort();
  if (noAr.join() !== local.join()) {
    erro(`${caminho} no ar está diferente do local (faltou subir ${arquivo}?)`);
    console.log(`      no ar: ${noAr.join(' ')}\n      local: ${local.join(' ')}`);
  }

  for (const recurso of noAr) {
    const r = await pedir(new URL(recurso, url));
    if (r.status !== 200) erro(`${caminho}: ${recurso} respondeu ${r.status}`);
  }
  console.log(`  ${caminho}`);
}

for (const caminho of PROIBIDOS) {
  const r = await pedir(base + caminho);
  if (r.status === 200) erro(`${caminho} está acessível no ar`);
}

const inicio = await pedir(base + '/');
if (!inicio.headers.get('content-security-policy')) erro('página inicial sem Content-Security-Policy');

console.log(falhas ? `\n${falhas} problema(s).` : '\nTudo certo no ar.');
process.exit(falhas ? 1 : 0);
