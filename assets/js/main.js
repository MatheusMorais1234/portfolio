/* =====================================================================
   main.js — idioma, render, navegação, lightbox e formulário.
   Sem biblioteca: a marcação vem do render.js e o movimento é só CSS.
   ===================================================================== */
(() => {
'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   Idioma
   Ordem de decisao: ?lang= na URL > escolha salva > idioma do navegador.
   A URL manda porque e ela que torna a versao em ingles compartilhavel:
   matheusmorais.com/?lang=en abre em ingles para qualquer pessoa.
   --------------------------------------------------------------------- */
const SITE = 'https://matheusmorais.com/';

const store = {
  get(k){ try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch { /* modo privado */ } }
};

let lang = (() => {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'pt' || fromUrl === 'en') { store.set('mm-lang', fromUrl); return fromUrl; }
  const saved = store.get('mm-lang');
  if (saved === 'pt' || saved === 'en') return saved;
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
})();

const langUrl = l => (l === 'pt' ? SITE : `${SITE}?lang=en`);

function setMeta(sel, value){
  const el = $(sel);
  if (el) el.setAttribute('content', value);
}

function applyStrings(){
  const dict = I18N[lang];
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  $$('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  $$('[data-i18n-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-label');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  // o <head> acompanha o idioma: titulo da aba, description e Open Graph
  document.title = dict['meta.title'];
  setMeta('#docDesc',  dict['meta.desc']);
  setMeta('#ogTitle',  dict['meta.title']);
  setMeta('#ogDesc',   dict['meta.ogDesc']);
  setMeta('#ogUrl',    langUrl(lang));
  setMeta('#ogLocale', lang === 'pt' ? 'pt_BR' : 'en_US');
  const canon = $('#docCanonical');
  if (canon) canon.href = langUrl(lang);
  $('#lbox').setAttribute('aria-label', dict['lbox.label']);

  // o curriculo acompanha o idioma: todos os links marcados com .js-cv
  const pt = lang === 'pt';
  $$('.js-cv').forEach(cv => {
    cv.href = pt ? 'assets/Curriculo_Matheus_Renato.pdf?v=20261015' : 'assets/Matheus_Renato_Resume_EN.pdf?v=20261015';
    cv.setAttribute('download', pt ? 'Matheus-Morais-Curriculo.pdf' : 'Matheus-Morais-Resume.pdf');
  });
  $$('.lang__opt').forEach(o => o.classList.toggle('is-on', o.dataset.lang === lang));
}

function setLang(next){
  if (next === lang) return;
  lang = next;
  store.set('mm-lang', lang);

  // ?lang=en na barra de enderecos; o portugues fica na URL limpa
  const url = new URL(location.href);
  if (lang === 'pt') url.searchParams.delete('lang');
  else url.searchParams.set('lang', 'en');
  history.replaceState(null, '', url.pathname + url.search + url.hash);

  applyStrings();
  renderAll();
  remeasureNav();
}

/* ---------------------------------------------------------------------
   Render
   --------------------------------------------------------------------- */
function renderStack(){
  // quem estava aberto continua aberto depois de trocar o idioma
  const open = $$('#stackGrid details[open] summary span').map(s => s.textContent);
  $('#stackGrid').innerHTML = RENDER.stack(lang);
  $$('#stackGrid details').forEach(d => {
    if (open.includes($('summary span', d).textContent)) d.open = true;
  });
}

function renderServices(){
  const grid = $('#svcGrid');
  if (!grid) return;
  grid.innerHTML = RENDER.serviceRows(lang);
  $$('.svc__cta', grid).forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = $('#f-assunto');
      if (sel) sel.value = 's3';
      $('#contato').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      const f = $('#f-nome');
      if (f) f.focus({ preventScroll:true });
    });
  });
}

function renderOpenSource(){
  const o = OPEN_SOURCE;
  $('#ossName').textContent    = o.title;
  $('#ossTagline').textContent = o.tagline[lang];
  $('#ossDesc').textContent    = o.desc[lang];
  $('#ossCta').href            = o.url;
  $('#ossMore').textContent    = OTHER_REPOS[lang];
  $('#ossStack').innerHTML     = RENDER.ossStack();
  mostraData(ultimoCommit || o.fallbackDate);
}

function renderCerts(){
  $('#certsGrid').innerHTML = RENDER.certs(lang);
  $$('#certsGrid .cert').forEach(el => {
    const img = $('img', el);
    const hide = () => el.classList.add('is-empty');
    img.addEventListener('error', hide, { once:true });
    if (img.complete && img.naturalWidth === 0) hide();
    el.addEventListener('click', () => { lboxOpener = el; openLbox(Number(el.dataset.i)); });
  });
}

function renderAll(){
  $('#timeline').innerHTML = RENDER.timeline(lang);
  $('#workGrid').innerHTML = RENDER.work(lang);
  renderStack();
  renderServices();
  renderOpenSource();
  renderCerts();
}

/* ---------------------------------------------------------------------
   Data do ultimo commit
   A API publica do GitHub da 60 requisicoes por hora por IP — em rede
   compartilhada isso estoura. A resposta fica guardada por 6h; se tudo
   falhar, vale a data fixa do data.js.
   --------------------------------------------------------------------- */
let ultimoCommit = null;
const COMMIT_CACHE = 'mm-commit';
const COMMIT_TTL = 6 * 60 * 60 * 1000;

function mostraData(iso){
  if (!iso) return;
  const fmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-GB',
    { day:'numeric', month:'long', year:'numeric' }).format(new Date(iso));
  $('#ossLive').textContent = `${I18N[lang]['code.updated']} ${fmt}`;
}

function lerCache(){
  try {
    const raw = localStorage.getItem(COMMIT_CACHE);
    if (!raw) return null;
    const { iso, at } = JSON.parse(raw);
    return (iso && Date.now() - at < COMMIT_TTL) ? iso : null;
  } catch { return null; }
}

async function buscaUltimoCommit(){
  const cache = lerCache();
  if (cache) { ultimoCommit = cache; return mostraData(cache); }

  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${OPEN_SOURCE.repo}`,
                          { headers:{ Accept:'application/vnd.github+json' } });
    if (!r.ok) return;
    const j = await r.json();
    if (!j.pushed_at) return;
    ultimoCommit = j.pushed_at;
    mostraData(ultimoCommit);
    try { localStorage.setItem(COMMIT_CACHE, JSON.stringify({ iso:ultimoCommit, at:Date.now() })); }
    catch { /* modo privado */ }
  } catch { /* mantém a data do data.js */ }
}

/* ---------------------------------------------------------------------
   Foco preso em camadas sobrepostas
   Enquanto o lightbox ou o menu estao abertos, o resto da pagina fica
   inerte: o Tab nao escapa para os links atras deles.
   --------------------------------------------------------------------- */
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

function trapFocus(zones){
  const all = [$('.skip'), $('#nav'), $('#menu'), $('#main'), $('.foot'), $('#lbox')].filter(Boolean);
  const outside = all.filter(el => !zones.includes(el));

  outside.forEach(el => { el.inert = true; el.setAttribute('aria-hidden', 'true'); });

  // inert ainda nao existe em navegadores antigos — o ciclo manual cobre esses
  const onKey = e => {
    if (e.key !== 'Tab') return;
    const items = zones.flatMap(z => $$(FOCUSABLE, z)).filter(el => el.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0];
    const last  = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);

  return () => {
    document.removeEventListener('keydown', onKey);
    outside.forEach(el => { el.inert = false; el.removeAttribute('aria-hidden'); });
  };
}

/* ---------------------------------------------------------------------
   Lightbox dos certificados
   --------------------------------------------------------------------- */
let lboxIndex = 0;
let lboxOpener = null;   // o certificado clicado, para devolver o foco no fim
let lboxRelease = null;

function openLbox(i){
  const c = CERTS[i];
  const img = $('#lboxImg');
  lboxIndex = i;
  img.hidden = false;
  img.onerror = () => { img.hidden = true; };
  img.src = c.img;
  img.alt = c.title[lang];
  $('#lboxCap').textContent = `${c.title[lang]} — ${c.meta}`;
  const box = $('#lbox');
  box.hidden = false;
  requestAnimationFrame(() => box.classList.add('is-open'));
  document.body.classList.add('is-locked');
  if (!lboxRelease) lboxRelease = trapFocus([box]);
  $('#lboxClose').focus();
}

function closeLbox(){
  const box = $('#lbox');
  box.classList.remove('is-open');
  document.body.classList.remove('is-locked');
  if (lboxRelease) { lboxRelease(); lboxRelease = null; }
  if (lboxOpener) { lboxOpener.focus(); lboxOpener = null; }
  setTimeout(() => { box.hidden = true; }, REDUCED ? 0 : 200);
}

function stepLbox(dir){
  openLbox((lboxIndex + dir + CERTS.length) % CERTS.length);
}

/* ---------------------------------------------------------------------
   Nav: sombra ao rolar e secao ativa
   --------------------------------------------------------------------- */
let remeasureNav = () => {};   // redefinido por initNav

function initNav(){
  const nav = $('#nav');
  const links = $$('.nav__links a');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // medir uma vez e guardar evita forcar layout a cada evento de scroll
  let tops = [];
  let mark = 0;
  let lastHeight = 0;
  const measure = () => {
    const y = window.scrollY;
    tops = sections.map(sec => sec.getBoundingClientRect().top + y);
    mark = window.innerHeight * 0.3;
  };

  let queued = false;
  const paint = () => {
    queued = false;
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 8);

    // imagem preguicosa que chega muda a altura da pagina e invalida as medidas
    const height = document.documentElement.scrollHeight;
    if (height !== lastHeight) { lastHeight = height; measure(); }

    let current = -1;
    for (let i = 0; i < tops.length; i++) if (tops[i] - y <= mark) current = i;
    links.forEach((a, i) => {
      const on = i === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  remeasureNav = () => { measure(); paint(); };

  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };

  measure();
  paint();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
  window.addEventListener('load', remeasureNav);
}

/* ---------------------------------------------------------------------
   Menu mobile
   --------------------------------------------------------------------- */
function initMenu(){
  const burger = $('#burger');
  const menu = $('#menu');
  const nav = $('#nav');
  let open = false;
  let release = null;

  const set = state => {
    open = state;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      // a nav continua ativa junto com o menu: e nela que fica o botao de fechar
      release = trapFocus([nav, menu]);
      requestAnimationFrame(() => $('a', menu).focus());
    } else {
      menu.classList.remove('is-open');
      if (release) { release(); release = null; }
      if (document.activeElement === document.body || menu.contains(document.activeElement)) burger.focus();
      setTimeout(() => { if (!open) menu.hidden = true; }, REDUCED ? 0 : 200);
    }
  };

  burger.addEventListener('click', () => set(!open));
  $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) set(false); });
  window.addEventListener('resize', () => { if (open && window.innerWidth > 960) set(false); });
}

/* ---------------------------------------------------------------------
   FORMULÁRIO DE CONTATO
   Caminho principal: POST no Web3Forms (ver FORM no data.js).
   Caminho reserva: enquanto a chave nao estiver configurada, a mensagem
   e montada e aberta no WhatsApp. O visitante nunca fica sem saida.
   --------------------------------------------------------------------- */
const CHAVE_VAZIA = 'SUA-CHAVE-WEB3FORMS-AQUI';

function rotuloOpcao(sel){
  const op = sel.options[sel.selectedIndex];
  return op ? op.textContent.trim() : '';
}

function montaTexto(f){
  const d = I18N[lang];
  return [
    `${d['form.name']}: ${f.nome.value.trim()}`,
    `${d['form.email']}: ${f.email.value.trim()}`,
    f.whatsapp.value.trim() ? `${d['form.phone']}: ${f.whatsapp.value.trim()}` : null,
    `${d['form.subject']}: ${rotuloOpcao(f.assunto)}`,
    '',
    f.mensagem.value.trim()
  ].filter(l => l !== null).join(String.fromCharCode(10));
}

function initForm(){
  const f = $('#contactForm');
  if (!f) return;
  const status = $('#formStatus');
  const send   = $('#formSend');

  const diz = (chave, tipo) => {
    status.textContent = I18N[lang][chave];
    status.className = `form__status is-${tipo}`;
  };

  f.addEventListener('submit', async e => {
    e.preventDefault();

    // robo de spam preenche o campo escondido; humano nao
    if (f.website.value) return;
    if (!f.checkValidity()) { f.reportValidity(); return; }

    if (!FORM.key || FORM.key === CHAVE_VAZIA) {
      window.open(`https://wa.me/${FORM.whatsapp}?text=${encodeURIComponent(montaTexto(f))}`, '_blank', 'noopener');
      diz('form.wa', 'ok');
      return;
    }

    send.disabled = true;
    diz('form.sending', 'wait');
    try {
      const r = await fetch(FORM.endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Accept:'application/json' },
        body: JSON.stringify({
          access_key: FORM.key,
          subject: `Site — ${rotuloOpcao(f.assunto)} — ${f.nome.value.trim()}`,
          from_name: f.nome.value.trim(),
          replyto: f.email.value.trim(),
          nome: f.nome.value.trim(),
          email: f.email.value.trim(),
          whatsapp: f.whatsapp.value.trim(),
          assunto: rotuloOpcao(f.assunto),
          mensagem: f.mensagem.value.trim(),
          idioma: lang
        })
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success !== false) { f.reset(); diz('form.ok', 'ok'); }
      else diz('form.err', 'err');
    } catch {
      diz('form.err', 'err');
    }
    send.disabled = false;
  });
}

/* ---------------------------------------------------------------------
   Boot
   --------------------------------------------------------------------- */
function boot(){
  $('#year').textContent = new Date().getFullYear();
  applyStrings();
  renderAll();

  $('#langToggle').addEventListener('click', () => setLang(lang === 'pt' ? 'en' : 'pt'));

  $('#lboxClose').addEventListener('click', closeLbox);
  $('#lboxPrev').addEventListener('click', () => stepLbox(-1));
  $('#lboxNext').addEventListener('click', () => stepLbox(1));
  $('#lbox').addEventListener('click', e => { if (e.target.id === 'lbox') closeLbox(); });
  document.addEventListener('keydown', e => {
    if ($('#lbox').hidden) return;
    if (e.key === 'Escape') closeLbox();
    if (e.key === 'ArrowLeft') stepLbox(-1);
    if (e.key === 'ArrowRight') stepLbox(1);
  });

  initNav();
  initMenu();
  initForm();
  buscaUltimoCommit();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
