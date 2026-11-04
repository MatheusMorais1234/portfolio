/*
   render.js — a marcação de cada bloco montado a partir do data.js.

   Funções puras: recebem o idioma e devolvem HTML em texto. Sem DOM.
   O main.js usa no navegador e o _ferramentas/gerar-estatico.mjs usa no
   Node para escrever a versão em português dentro do index.html — por
   isso a marcação existe em um lugar só e as duas saídas nunca divergem.
   */

const RENDER = (() => {
  const esc = v => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const list = arr => arr.map(esc).join(', ');

  /* Experiência em forma de créditos de filme: quando e cargo de um lado do
     eixo central, empresa e o que foi feito do outro. */
  const timeline = lang => TIMELINE.map(it => `
      <li class="credit">
        <div class="credit__side">
          <p class="credit__when">${esc(it.when[lang])}</p>
          <h3 class="credit__role">${esc(it.role[lang])}</h3>
        </div>
        <div class="credit__main">
          <p class="credit__where">${esc(it.where)}</p>
          <p class="credit__org">${esc(it.org[lang])}</p>
          <ul class="credit__pts">${it.points[lang].map(p => `<li>${esc(p)}</li>`).join('')}</ul>${
          it.tags.length ? `
          <p class="credit__tags">${list(it.tags)}</p>` : ''}
        </div>
      </li>`).join('');

  const work = lang => WORK.map(w => `
      <li class="system">
        <h3 class="system__h">${esc(w.title[lang])}</h3>
        <p class="system__p">${esc(w.desc[lang])}</p>
        <p class="system__stack">${list(w.stack)}</p>
      </li>`).join('');

  /* Tecnologias como lista de elenco: o nível, o nome e onde cada uma entrou. */
  const stack = lang => ['solid', 'working', 'early'].map(level => `
      <div class="techs">
        <h3 class="techs__h">${esc(LEVELS[level][lang])}</h3>
        <dl class="techs__list">${STACK.filter(t => t.level === level).map(t => `
          <div class="actor">
            <dt>${esc(t.name)}</dt>
            <dd>${esc(t.use[lang])}</dd>
          </div>`).join('')}
        </dl>
      </div>`).join('');

  /* Certificados como linhas de crédito. A miniatura é a origem da transição
     até o lightbox. */
  const certs = lang => CERTS.map((c, i) => `
      <li>
        <button class="cert" type="button" data-i="${i}">
          <span class="cert__title">${esc(c.title[lang])}</span>
          <span class="cert__meta">${esc(c.meta)}</span>
          <span class="cert__go">${esc(I18N[lang]['certs.enlarge'])}</span>
          <span class="cert__shot"><img src="${esc(c.img)}" alt="" loading="lazy" width="400" height="300"${c.fit === 'top' ? ' class="is-top"' : ''}></span>
        </button>
      </li>`).join('');

  /* O endereço que a cena mostra é a prova: sem protocolo, sem www e sem caminho. */
  const host = href => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');

  /* Projetos: cada um é uma cena. O print fica embaixo do vídeo e segura a
     cena enquanto a filmagem não chega, ou se ela nunca chegar. Link externo
     abre em outra aba; âncora (#contato) fica na página. */
  const projects = lang => PROJECTS.map((p, i) => {
    const pasta = `assets/video/projetos/${esc(p.video)}`;
    const d = I18N[lang];
    const site = p.links.find(l => /^https?:/.test(l.href));
    const cv = lang === 'pt'
      ? 'href="assets/Curriculo_Matheus_Renato.pdf?v=20261028" download="Matheus-Morais-Curriculo.pdf"'
      : 'href="assets/Matheus_Renato_Resume_EN.pdf?v=20261028" download="Matheus-Morais-Resume.pdf"';
    return `
      <li class="scene" data-scene="${esc(p.video)}">
        <div class="scene__frame">
          <img class="scene__still" src="${esc(p.img)}" alt="${esc(p.alt[lang])}" loading="lazy" width="800" height="500">
          <video class="scene__video" muted playsinline loop preload="none" aria-hidden="true" poster="${pasta}.jpg" data-src="${pasta}.mp4" data-src-m="${pasta}-m.mp4" data-poster-m="${pasta}-m.jpg"></video>
          <div class="scene__credits">
            <div class="scene__id">
              <h3 class="scene__name">${esc(p.name)}</h3>
              <p class="scene__kicker">${esc(p.kicker[lang])}</p>
              <p class="scene__tag">${esc(p.tagline[lang])}</p>
            </div>
            <div class="scene__text">
              <p class="scene__desc">${esc(p.desc[lang])}</p>
              <p class="scene__stack">${list(p.stack)}</p>${
              p.live ? `
              <p class="scene__live" data-live="${esc(p.live.repo)}"></p>` : ''}
            </div>
          </div>
        </div>
        <div class="scene__slate">
          <span class="slate__n">${esc(d['scene.of'].replace('{n}', i + 1).replace('{t}', PROJECTS.length))}</span>
          <span class="slate__id">${esc(host(site.href))}${p.footage ? ` · ${esc(p.footage[lang])}` : ''}</span>
          <div class="scene__links">${p.links.map((l, n) => {
            const ext = /^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : '';
            return `<a class="btn ${n === 0 ? 'btn--solid' : 'btn--line'}" href="${esc(l.href)}"${ext}>${esc(l.label[lang])}</a>`;
          }).join('')}</div>
          <a class="slate__cv js-cv" ${cv}>${esc(d['hero.cv'])}</a>
        </div>
      </li>`;
  }).join('');

  /* Serviços: só entram na página com MOSTRAR_SERVICOS = true no data.js. */
  const navServices = lang => !MOSTRAR_SERVICOS ? '' :
    `<a href="#servicos" data-i18n="nav.services">${esc(I18N[lang]['nav.services'])}</a>`;

  const serviceRows = lang => {
    const d = I18N[lang];
    return SERVICES.map((sv, i) => `
          <li class="svc">
            <h3 class="svc__h">${esc(sv.title[lang])}</h3>
            <p class="svc__p">${esc(sv.desc[lang])}</p>
            <ul class="svc__list">${sv.items[lang].map(it => `<li>${esc(it)}</li>`).join('')}</ul>
            <p class="svc__term"><span>${esc(d['services.term'])}:</span> ${esc(sv.term[lang])}</p>
            <button class="btn btn--line svc__cta" type="button" data-svc="${i}">${esc(d['services.cta'])}</button>
          </li>`).join('');
  };

  const services = lang => {
    if (!MOSTRAR_SERVICOS) return '';
    const d = I18N[lang];
    return `
<section class="sec" id="servicos">
  <div class="wrap sec__grid">
    <header class="sec__head">
      <h2 class="sec__h" data-i18n="services.h">${esc(d['services.h'])}</h2>
      <p class="sec__sub" data-i18n="services.sub">${esc(d['services.sub'])}</p>
    </header>
    <div class="sec__body">
      <ul class="svcs" id="svcGrid">${serviceRows(lang)}
      </ul>
      <p class="svcs__note" data-i18n="services.note">${esc(d['services.note'])}</p>
    </div>
  </div>
</section>
`;
  };

  return { esc, timeline, work, stack, certs, projects, navServices, services, serviceRows };
})();
