// node --test _ferramentas/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  podePublicar, resolver, trocarVersao, extrairVersionados, extrairLinksLocais,
} from './regras-publicacao.mjs';

test('pastas e arquivos privados nunca sobem', () => {
  for (const c of [
    '_nao-publicar/certificado.pdf', '_ferramentas/publicar.mjs', '_gravacoes/bruto.mkv',
    '.impeccable/x.png', '.claude/settings.json', '.taste-skill/a.md', '.github/workflows/testes.yml',
    'LEIA-ME.md', '.gitignore', '.gitattributes',
  ]) assert.equal(podePublicar(c), false, c);
});

test('arquivos do site sobem', () => {
  for (const c of ['index.html', 'en/index.html', 'css/estilo.css', '.htaccess', 'docs/Curriculo_Matheus_Renato.pdf', 'servicos/index.html'])
    assert.equal(podePublicar(c), true, c);
});

test('resolver entende caminho simples, relativo e absoluto', () => {
  assert.equal(resolver('index.html', 'css/estilo.css?v=1'), 'css/estilo.css');
  assert.equal(resolver('en/index.html', '../css/estilo.css?v=1'), 'css/estilo.css');
  assert.equal(resolver('ferramentas/pix/index.html', '/assets/js/theme.js?v=1'), 'assets/js/theme.js');
  assert.equal(resolver('en/index.html', '../#contato'), 'index.html');
  assert.equal(resolver('ferramentas/index.html', 'pix/'), 'ferramentas/pix/index.html');
});

const html = `<link rel="stylesheet" href="../css/fontes.css?v=20261111">
<link rel="stylesheet" href="../css/estilo.css?v=20261111">
<script src="../js/site.js?v=20261111" defer></script>`;

test('troca o ?v= só do arquivo que mudou', () => {
  const novo = trocarVersao(html, 'en/index.html', new Set(['css/estilo.css']), '202611120930');
  assert.match(novo, /estilo\.css\?v=202611120930/);
  assert.match(novo, /fontes\.css\?v=20261111"/);
  assert.match(novo, /site\.js\?v=20261111"/);
});

test('sem arquivo alterado, o HTML fica igual', () => {
  assert.equal(trocarVersao(html, 'en/index.html', new Set(['js/tema.js']), '1'), html);
});

test('extrai os endereços com ?v=', () => {
  assert.deepEqual(extrairVersionados(html), ['../css/fontes.css?v=20261111', '../css/estilo.css?v=20261111', '../js/site.js?v=20261111']);
});

test('links locais ignoram externos, âncoras, mailto e data:', () => {
  const pagina = `<a href="#topo">a</a><a href="https://github.com/x">b</a><a href="mailto:a@b.c">c</a>
<img src="data:image/png;base64,AA"><a href="freelamanager.html">d</a><img src="img/matheus.webp" alt="">
<a href="//cdn.exemplo.com/x.js">e</a><a href="tel:+55">f</a>`;
  assert.deepEqual(extrairLinksLocais(pagina), ['freelamanager.html', 'img/matheus.webp']);
});
