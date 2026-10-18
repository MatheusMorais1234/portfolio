/* =====================================================================
   render.js — a marcação de cada bloco montado a partir do data.js.

   Funções puras: recebem o idioma e devolvem HTML em texto. Sem DOM.
   O main.js usa no navegador e o _ferramentas/gerar-estatico.mjs usa no
   Node para escrever a versão em português dentro do index.html — por
   isso a marcação existe em um lugar só e as duas saídas nunca divergem.
   ===================================================================== */

const RENDER = (() => {
  const esc = v => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const list = arr => arr.map(esc).join(', ');

  const timeline = lang => TIMELINE.map(it => `
      <li class="xp">
        <p class="xp__when">${esc(it.when[lang])}</p>
        <div class="xp__body">
          <h3 class="xp__role">${esc(it.role[lang])}</h3>
          <p class="xp__org"><strong>${esc(it.where)}</strong> ${esc(it.org[lang])}</p>
          <ul class="xp__pts">${it.points[lang].map(p => `<li>${esc(p)}</li>`).join('')}</ul>${
          it.tags.length ? `
          <p class="xp__tags">${list(it.tags)}</p>` : ''}
        </div>
      </li>`).join('');

  const work = lang => WORK.map(w => `
      <li class="proj">
        <h3 class="proj__h">${esc(w.title[lang])}</h3>
        <p class="proj__p">${esc(w.desc[lang])}</p>
        <p class="proj__stack">${list(w.stack)}</p>
      </li>`).join('');

  /* Tecnologias agrupadas por nível. <details> abre e fecha sem script
     e já vem com teclado e leitor de tela resolvidos. */
  const stack = lang => ['solid', 'working', 'early'].map(level => `
      <div class="techs">
        <h3 class="techs__h">${esc(LEVELS[level][lang])}</h3>
        <ul class="techs__list">${STACK.filter(t => t.level === level).map(t => `
          <li>
            <details class="tech">
              <summary><img src="${esc(t.icon)}" alt="" width="20" height="20" loading="lazy"><span>${esc(t.name)}</span></summary>
              <p>${esc(t.use[lang])}</p>
            </details>
          </li>`).join('')}
        </ul>
      </div>`).join('');

  const certs = lang => CERTS.map((c, i) => `
      <li>
        <button class="cert" type="button" data-i="${i}">
          <span class="cert__shot"><img src="${esc(c.img)}" alt="" loading="lazy"${c.fit === 'top' ? ' class="is-top"' : ''}></span>
          <span class="cert__title">${esc(c.title[lang])}</span>
          <span class="cert__meta">${esc(c.meta)}</span>
        </button>
      </li>`).join('');

  /* Projetos: cards do mesmo tamanho, imagem em cima e botoes no rodape.
     Link externo abre em outra aba; ancora (#contato) fica na pagina. */
  const projects = lang => PROJECTS.map(p => `
      <li class="pcard">
        <figure class="pcard__shot"><img src="${esc(p.img)}" alt="${esc(p.alt[lang])}" loading="lazy" width="800" height="500"><span class="pcard__stamp" aria-hidden="true">${esc(I18N[lang]['proj.stamp'])}</span></figure>
        <div class="pcard__body">
          <p class="pcard__kicker">${esc(p.kicker[lang])}</p>
          <h3 class="pcard__name">${esc(p.name)}</h3>
          <p class="pcard__tag">${esc(p.tagline[lang])}</p>
          <p class="pcard__desc">${esc(p.desc[lang])}</p>
          <ul class="pcard__stack">${p.stack.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${
          p.live ? `
          <p class="pcard__live" data-live="${esc(p.live.repo)}"></p>` : ''}
          <div class="pcard__links">${p.links.map((l, i) => {
            const ext = /^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : '';
            return `<a class="btn btn--sm ${i === 0 ? 'btn--solid' : 'btn--line'}" href="${esc(l.href)}"${ext}>${esc(l.label[lang])}</a>`;
          }).join('')}</div>
        </div>
      </li>`).join('');

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
