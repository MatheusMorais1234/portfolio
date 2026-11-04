/*
   cinema.js — a rolagem como filme e o carregamento dos vídeos.
   Três modos:
     full  : computador; rolagem normal, com profundidade contínua na abertura e nas cenas
     light : celular ou toque; sem prender nada, só um corte ao entrar na tela
     still : movimento reduzido; tudo parado e sem vídeo
   Sem GSAP o modo full vira light: a página nunca depende dele.
   */
(() => {
'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

const root = document.documentElement;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
const NARROW  = matchMedia('(max-width: 899px)');
const COARSE  = matchMedia('(pointer: coarse)');
const SEM_VIDEO = () => REDUCED.matches || Boolean(navigator.connection && navigator.connection.saveData);
const TEM_GSAP = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

const modoAtual = () => {
  if (REDUCED.matches) return 'still';
  return NARROW.matches || COARSE.matches || !TEM_GSAP() ? 'light' : 'full';
};

let modo = 'still';
let ctx = null;              // contexto do GSAP: desfaz tudo de uma vez
let cenaIO = null;           // observador do modo light
let hud = null;

/*
   Vídeos
   Um vídeo só ganha src perto da tela e só toca enquanto aparece. Ao sair,
   solta o arquivo. Se o arquivo falhar ou o autoplay for negado, fica o poster.
   */
const MAX_TOCANDO = 2;
const estado = new Map();    // vídeo -> { perto, visao, razao }
let videoIO = null;
let videoIOFar = null;

function fonte(v){
  return (NARROW.matches && v.dataset.srcM) || v.dataset.src;
}

function solta(v){
  if (!v.hasAttribute('src')) return;
  v.pause();
  v.removeAttribute('src');
  v.load();                  // sem src o navegador volta a mostrar o poster
}

function carrega(v){
  if (v.hasAttribute('src') || v.dataset.falhou || v.dataset.tocou) return;
  const src = fonte(v);
  if (!src) return;
  v.muted = true;
  v.playsInline = true;
  v.src = src;
}

function sincronizaVideos(){
  const vivos = [];
  estado.forEach((e, v) => {
    if (!v.isConnected) { estado.delete(v); return; }
    const { perto, visao } = e;
    if (SEM_VIDEO() || !perto) { solta(v); return; }
    carrega(v);
    if (visao) vivos.push({ v, razao:e.razao }); else v.pause();
  });

  vivos.sort((a, b) => b.razao - a.razao);
  vivos.forEach(({ v }, i) => {
    if (i >= MAX_TOCANDO) { v.pause(); return; }
    if (!v.hasAttribute('src') || !v.paused || v.ended) return;
    const p = v.play();
    if (p) p.catch(() => {});   // autoplay negado: fica o poster
  });
}

function ligaVideos(){
  if (videoIO) videoIO.disconnect();
  if (videoIOFar) videoIOFar.disconnect();
  estado.clear();

  const lista = $$('video[data-src]');
  lista.forEach(v => {
    estado.set(v, { perto:false, visao:false, razao:0 });
    v.muted = true;
    v.playsInline = true;
    // só a abertura repete, porque a emenda dela é invisível. Os vídeos dos projetos
    // tocam uma vez e param no último quadro: recomeçar trocaria a imagem de repente.
    // O do fim também não volta a tocar, porque o último quadro dele é igual ao poster.
    v.loop = v.matches('.open__video');
    const umaVez = v.matches('.end__video');
    // poster próprio para tela estreita, quando existe
    if (v.dataset.posterM) {
      if (!v.dataset.posterD) v.dataset.posterD = v.getAttribute('poster') || '';
      v.poster = NARROW.matches ? v.dataset.posterM : v.dataset.posterD;
    }
    if (umaVez && !v.dataset.ouveFim) {
      v.dataset.ouveFim = '1';
      v.addEventListener('ended', () => { v.dataset.tocou = '1'; });
    }
    if (!v.dataset.ouve) {
      v.dataset.ouve = '1';
      v.addEventListener('error', () => {
        // falhou uma vez: não insiste e o poster continua
        v.dataset.falhou = '1';
        v.removeAttribute('src');
      });
    }
  });
  if (SEM_VIDEO()) lista.forEach(solta);
  if (!lista.length || SEM_VIDEO() || !('IntersectionObserver' in window)) return;

  videoIOFar = new IntersectionObserver(es => {
    es.forEach(e => { const s = estado.get(e.target); if (s) s.perto = e.isIntersecting; });
    sincronizaVideos();
  }, { rootMargin:'60% 0px' });
  videoIO = new IntersectionObserver(es => {
    es.forEach(e => {
      const s = estado.get(e.target);
      if (s) { s.visao = e.isIntersecting; s.razao = e.intersectionRatio; }
    });
    sincronizaVideos();
  }, { threshold:[0, .2, .5, .8] });
  lista.forEach(v => { videoIOFar.observe(v); videoIO.observe(v); });
}

/* Contador de cenas. Só no modo full. */
function criaHud(){
  const barra = $('.bar--bottom');
  const fixa = barra && getComputedStyle(barra).position === 'fixed';
  hud = document.createElement('div');
  hud.className = 'cine-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = '<i class="cine-hud__line"></i><span class="cine-hud__txt"></span>';
  // a própria cena já escreve "Cena n de 6": aqui fica só a linha
  if ($('.scene__slate')) hud.classList.add('so-linha');
  (fixa ? barra : document.body).appendChild(hud);
}

function pintaHud(i, total, p){
  if (!hud) return;
  const en = root.lang.toLowerCase().startsWith('en');
  const n = i + 1;
  const txt = en ? `Scene ${n} of ${total}` : `Cena ${n} de ${total}`;
  const status = $('[data-scene-status]');
  $('.cine-hud__txt', hud).textContent = txt;
  if (status) status.textContent = txt;
  $('.cine-hud__line', hud).style.transform = `scaleX(${(i + p) / total})`;
}

/*
   Regra de todo o movimento: nada aparece nem some conforme a rolagem. O conteúdo
   fica sempre visível, e quem quer ler só para de rolar. O movimento é profundidade.

   2. Abertura: o nome fica parado e o vídeo se aproxima enquanto a tela sobe.
   */
function montaAbertura(){
  const open = $('.open');
  const video = open && $('.open__video', open);
  if (!video) return;
  gsap.fromTo(video, { scale:1 }, {
    scale:1.08, transformOrigin:'50% 50%', ease:'none',
    scrollTrigger:{ trigger:open, start:'top top', end:'bottom top', scrub:.6 }
  });
}

/*
   3. Cenas: o vídeo se assenta e o texto desliza até o lugar.
   */
function credenciais(cena){
  const c = $('.scene__credits', cena);
  return c ? Array.from(c.children) : [];
}

function montaCenas(){
  const grid = $('#projGrid');
  if (!grid) return;
  const cenas = $$('.scene', grid);
  if (!cenas.length) return;
  criaHud();
  ScrollTrigger.create({
    trigger:grid, start:'top bottom', end:'bottom top',
    onToggle: s => hud.classList.toggle('is-on', s.isActive)
  });

  cenas.forEach((cena, i) => {
    ScrollTrigger.create({
      trigger:cena, start:'top center', end:'bottom center',
      onUpdate: s => pintaHud(i, cenas.length, s.progress)
    });
    const video = $('.scene__video', cena);
    if (video) {
      gsap.fromTo(video, { scale:1.1 }, {
        scale:1, transformOrigin:'50% 0%', ease:'none',
        scrollTrigger:{ trigger:cena, start:'top bottom', end:'bottom top', scrub:.6 }
      });
    }
    // chega ao lugar antes de a cena ocupar a tela; a opacidade nunca muda
    const itens = credenciais(cena);
    if (itens.length) {
      gsap.fromTo(itens, { y:'7vh' }, {
        y:0, ease:'none', stagger:.1,
        scrollTrigger:{ trigger:cena, start:'top bottom', end:'top 25%', scrub:.6 }
      });
    }
  });
  pintaHud(0, cenas.length, 0);
}

/* Modo light: um corte ao entrar na tela, sem tocar na rolagem. */
function montaLeve(){
  if (!('IntersectionObserver' in window)) return;
  const cenas = $$('.scene');
  cenaIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    cenaIO.unobserve(e.target);
  }), { rootMargin:'0px 0px -10% 0px' });
  cenas.forEach(c => {
    // o que já está na tela não pisca
    const r = c.getBoundingClientRect();
    if (r.top < innerHeight) c.classList.add('is-in');
    else cenaIO.observe(c);
  });
}

/* Monta ou remonta tudo. Chamado de novo ao trocar o idioma. */
function monta(){
  const y = window.scrollY;
  if (ctx) { ctx.revert(); ctx = null; }
  if (cenaIO) { cenaIO.disconnect(); cenaIO = null; }
  $$('.scene.is-in').forEach(c => c.classList.remove('is-in'));
  if (hud) { hud.remove(); hud = null; }

  modo = modoAtual();
  root.classList.toggle('is-motion', modo !== 'still');
  root.classList.toggle('is-full', modo === 'full');
  root.classList.toggle('is-light', modo === 'light');

  if (modo === 'full') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize:true });
    ctx = gsap.context(() => {
      montaAbertura();
      montaCenas();
    });
    ScrollTrigger.refresh();
    if (y) window.scrollTo({ top:y, behavior:'instant' });
  } else if (modo === 'light') {
    montaLeve();
  }

  ligaVideos();
}

let espera = 0;
const remonta = () => { clearTimeout(espera); espera = setTimeout(monta, 200); };

function boot(){
  monta();
  document.addEventListener('mm:rendered', monta);   // o main.js refez as cenas ao trocar de idioma

  // a fonte e as imagens mudam as alturas: as medidas precisam ser refeitas
  const remede = () => { if (modo === 'full') monta(); };
  window.addEventListener('load', remede);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remede);

  [REDUCED, NARROW, COARSE].forEach(m => m.addEventListener('change', remonta));
  window.addEventListener('resize', () => {
    if (modo === 'full' && !NARROW.matches) remonta();
  });
}

window.CINEMA = { refresh:monta };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
