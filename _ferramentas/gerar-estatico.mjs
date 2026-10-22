/*
   gerar-estatico.mjs — "assa" o conteudo do data.js dentro do index.html.

   Por que existe: tecnologias, experiencia, projetos e certificados sao montados
   por JavaScript. Quem le o HTML cru — varios robos de ATS, o preview de
   alguns apps, e o proprio visitante se o data.js falhar — nao ve nada
   disso. Este script escreve a versao em portugues direto no HTML.

   O site NAO depende dele: sem rodar nada, o index.html funciona igual,
   porque o main.js reescreve esses blocos assim que carrega. Rodar so
   melhora o que os robos enxergam.

   Uso:  node _ferramentas/gerar-estatico.mjs
   Rode depois de editar o assets/js/data.js e antes de subir para o servidor.
   Esta pasta NAO deve ir para o servidor.
   */

import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const arq  = n => join(raiz, n);

/* data.js, i18n.js e render.js sao JavaScript puro, sem imports e sem DOM:
   basta avaliar os tres no mesmo contexto. A marcacao vem do render.js, o
   mesmo arquivo que o navegador usa — as duas saidas nunca divergem. */
const ctx = {};
const FONTES = ['assets/js/data.js', 'assets/js/i18n.js', 'assets/js/render.js'];

// as constantes sao `const`: nao entram sozinhas no objeto global do vm,
// entao a ultima linha avaliada as recolhe em __saida
const COLETA = 'globalThis.__saida = { STACK, TIMELINE, SERVICES, MOSTRAR_SERVICOS, WORK, CERTS, PROJECTS, RENDER };';

runInNewContext(
  FONTES.map(f => readFileSync(arq(f), 'utf8')).concat(COLETA).join(String.fromCharCode(10)),
  ctx
);
const { STACK, TIMELINE, SERVICES, MOSTRAR_SERVICOS, WORK, CERTS, PROJECTS, RENDER } = ctx.__saida;

const PT = 'pt';
const { esc } = RENDER;

const blocos = {
  navServices:  RENDER.navServices(PT),
  menuServices: RENDER.navServices(PT),
  secServices:  RENDER.services(PT),
  timeline:     RENDER.timeline(PT),
  work:         RENDER.work(PT),
  stack:        RENDER.stack(PT),
  certs:        RENDER.certs(PT),
  projects:     RENDER.projects(PT),
};

let html = readFileSync(arq('index.html'), 'utf8');
let trocas = 0;

for (const [nome, conteudo] of Object.entries(blocos)) {
  // reescreve sempre entre os marcadores: rodar duas vezes da o mesmo resultado
  const re = new RegExp('(<!--g:' + nome + '-->)[^]*?(<!--/g:' + nome + '-->)');
  if (!re.test(html)) {
    console.error(`  ! marcador <!--g:${nome}--> nao encontrado no index.html`);
    continue;
  }
  html = html.replace(re, (_, abre, fecha) => abre + conteudo + fecha);
  trocas++;
}

writeFileSync(arq('index.html'), html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`index.html gerado — ${trocas}/${Object.keys(blocos).length} blocos, ${kb} KB`);
console.log(`  ${STACK.length} tecnologias · ${TIMELINE.length} experiencias · ${WORK.length} sistemas · ${CERTS.length} certificados`);
console.log(`  secao de servicos: ${MOSTRAR_SERVICOS ? 'LIGADA (' + SERVICES.length + ' itens)' : 'desligada'}`);
