/*
   servicos.js — página /servicos/.
   Demonstração do hero, comparador antes/depois, abas de ramo,
   calculadora, contadores e o aparecer ao rolar. Sem dependências:
   a CSP do site só aceita script daqui mesmo.
   */
(() => {
'use strict';

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/5562992014463?text=';
const brl = n => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

document.documentElement.classList.add('js');

/* ---------- topo e botão fixo ---------- */
const top = $('#top');
const wafloat = $('#wafloat');
const hero = $('.hero');
function onScroll(){
  top.classList.toggle('is-stuck', scrollY > 20);
  wafloat.classList.toggle('is-on', scrollY > hero.offsetHeight * .6);
}
addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ---------- aparecer ao rolar + contadores ---------- */
function conta(el){
  const alvo = +el.dataset.count;
  const pre = el.dataset.prefix || '';
  const fmt = n => pre + (alvo >= 1000 ? `${Math.round(n / 1000)} mil` : Math.round(n));
  if (calmo) { el.textContent = fmt(alvo); return; }
  const t0 = performance.now(), dur = 1400;
  const passo = t => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = fmt(alvo * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

const io = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    $$('[data-count]', e.target).forEach(conta);
    io.unobserve(e.target);
  });
}, { threshold:.15, rootMargin:'0px 0px -40px 0px' });

// irmãos que aparecem juntos entram em cascata
$$('.rv').forEach(el => {
  const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
  const i = irmaos.indexOf(el);
  if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
  io.observe(el);
});
$$('.hero__proof [data-count]').forEach(el => setTimeout(() => conta(el), 600));

/* ---------- demonstração do hero ----------
   O celular gera um PIX, processa e confirma; quando confirma, o painel
   recebe o valor, a barra de hoje cresce e o pagamento entra no feed.
   Entre um ciclo e outro chegam pedidos e avisos de outros ramos. */
const feed = $('#feed');
const money = $('#dashMoney');
const today = $('#dashToday');
const toast = $('#toast');
const telas = $$('.phone__scr');
let total = 4280;
let barra = 64;

const pagantes = ['Ana Paula', 'Bruno Silva', 'Carla Nunes', 'Diego Ramos', 'Elisa Prado', 'Felipe Couto'];
const extras = [
  { c:'fi--ped', i:'#',  t:n => `Novo pedido #${n}`, d:'Pizza grande + refri', v:72 },
  { c:'fi--ag',  i:'✓',  t:() => 'Consulta agendada', d:'Sex, 9h · confirmada' },
  { c:'fi--bol', i:'R$', t:() => 'Boleto pago', d:'Mensalidade · Rafael C.', v:120 },
  { c:'fi--wa',  i:'✉',  t:() => 'Lembrete enviado', d:'WhatsApp · 32 alunos' },
  { c:'fi--ped', i:'#',  t:n => `Novo pedido #${n}`, d:'2 açaís 500 ml', v:38 }
];
let pedido = 1043, ip = 0, ie = 0;

function item({ c, i, t, d, v }){
  const li = document.createElement('li');
  li.className = 'feed__it is-new';
  const b = document.createElement('b'); b.className = `fi ${c}`; b.textContent = i;
  const s = document.createElement('span');
  const st = document.createElement('strong'); st.textContent = t;
  const em = document.createElement('em'); em.textContent = d;
  s.append(st, em);
  const val = document.createElement('i'); val.textContent = v ? brl(v) : '';
  li.append(b, s, val);
  return li;
}

function entra(dados){
  feed.prepend(item(dados));
  const sobra = $$('.feed__it', feed).slice(3);
  sobra.forEach(el => { el.classList.add('is-out'); setTimeout(() => el.remove(), 350); });
  if (dados.v) soma(dados.v);
}

function soma(v){
  const de = total, ate = total + v;
  total = ate;
  money.classList.add('is-bump');
  setTimeout(() => money.classList.remove('is-bump'), 900);
  barra = Math.min(96, barra + 4);
  today.style.setProperty('--h', `${barra}%`);
  if (calmo) { money.textContent = brl(ate); return; }
  const t0 = performance.now();
  const passo = t => {
    const k = Math.min(1, (t - t0) / 700);
    money.textContent = brl(de + (ate - de) * k);
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

function tela(n){ telas.forEach(t => t.classList.toggle('is-on', +t.dataset.s === n)); }

const espera = ms => new Promise(r => setTimeout(r, ms));
async function ciclo(){
  for (;;) {
    tela(0);                 await espera(2200);
    tela(1);                 await espera(1300);
    tela(2);
    entra({ c:'fi--pix', i:'PIX', t:'PIX recebido', d:`Inscrição · ${pagantes[ip++ % pagantes.length]}`, v:89.9 });
    toast.classList.add('is-on');
    await espera(1800);
    toast.classList.remove('is-on');
    await espera(900);
    const x = extras[ie++ % extras.length];
    entra({ ...x, t:x.t(pedido++) });
    await espera(1600);
  }
}
if (!calmo) setTimeout(ciclo, 1600);

/* ---------- antes e depois ---------- */
const cmp = $('#cmp');
const range = $('#cmpRange');
const poe = v => cmp.style.setProperty('--p', `${v}%`);
range.addEventListener('input', () => poe(range.value));
// a primeira vez que aparece, a alça balança para mostrar que arrasta
new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  cmp.classList.add('is-hint');
  obs.disconnect();
}, { threshold:.5 }).observe(cmp);
range.addEventListener('pointerdown', () => cmp.classList.remove('is-hint'), { once:true });

/* ---------- seu ramo ---------- */
// ícones das notificações do celular (Lucide, ISC)
const ICONES = {
  'user-plus':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  'banknote':'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  'bell':'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'calendar':'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'circle-check':'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'receipt':'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  'truck':'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  'star':'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  'chart-column':'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'id-card':'<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
  'landmark':'<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  'file-text':'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'package':'<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>'
};
const icone = nome => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome]}</svg>`;

const RAMOS = {
  academia:{
    h:'Academia que cobra sozinha', app:'FitStudio', cta:'Quero isso na minha academia', quem:'uma academia',
    l:['Matrícula online, pelo celular', 'Mensalidade no PIX com lembrete automático de vencimento', 'Lista de alunos ativos, atrasados e novos no mês'],
    n:[['user-plus','Nova matrícula: Lucas'], ['banknote','Mensalidade paga · R$ 99'], ['bell','Lembrete enviado a 12 alunos']]
  },
  clinica:{
    h:'Agenda cheia, sem falta', app:'Clínica Vida', cta:'Quero isso na minha clínica', quem:'uma clínica',
    l:['Paciente marca a consulta pelo site, a qualquer hora', 'Lembrete no WhatsApp um dia antes, com confirmação', 'Ficha do paciente e histórico organizados'],
    n:[['calendar','Consulta marcada · Qui 14h'], ['circle-check','Paciente confirmou pelo WhatsApp'], ['bell','8 lembretes enviados para amanhã']]
  },
  restaurante:{
    h:'Delivery próprio, sem taxa de app', app:'Cantina da Praça', cta:'Quero isso no meu restaurante', quem:'um restaurante',
    l:['Cardápio e pedido pelo celular, com PIX', 'Painel de pedidos na cozinha, do preparo à entrega', 'Cupom e programa de fidelidade para o cliente voltar'],
    n:[['receipt','Pedido #218 · R$ 84,00'], ['truck','Pedido #217 saiu para entrega'], ['star','Cliente ganhou 1 pizza grátis']]
  },
  eventos:{
    h:'Inscrição paga e confirmada na hora', app:'Corrida da Cidade', cta:'Quero isso no meu evento', quem:'um evento',
    l:['Página do evento com inscrição online', 'Pagamento por PIX com confirmação automática', 'Lista de inscritos e relatório financeiro em tempo real'],
    n:[['circle-check','Inscrição confirmada · Kit M'], ['banknote','PIX recebido · R$ 89,90'], ['chart-column','312 inscritos · lote 2 aberto']]
  },
  associacao:{
    h:'Associado atendido pelo celular', app:'Minha Associação', cta:'Quero isso na minha associação', quem:'uma associação',
    l:['Aplicativo com os dados e a carteirinha do associado', 'Mensalidade por boleto ou PIX, com baixa automática', 'Cadastros, contratos e relatórios para a equipe'],
    n:[['id-card','Carteirinha digital emitida'], ['landmark','Boleto pago · baixa automática'], ['file-text','Relatório do mês gerado']]
  },
  loja:{
    h:'Vendas e financeiro na mão', app:'Loja Bella', cta:'Quero isso na minha loja', quem:'uma loja',
    l:['Site com catálogo e botão de WhatsApp', 'Controle de clientes, vendas e estoque', 'Quanto entrou, quanto falta receber e o que está acabando'],
    n:[['receipt','Venda registrada · R$ 249'], ['package','Estoque baixo: camiseta M'], ['banknote','Fechamento do dia pronto']]
  }
};

const painel = $('#ramoPanel');
const abas = $$('.ramo__tabs [role="tab"]');
const ctaRamo = $('.js-ramo-cta');

function mostra(chave){
  const r = RAMOS[chave];
  abas.forEach(a => a.setAttribute('aria-selected', String(a.dataset.r === chave)));
  $('#ramoH').textContent = r.h;
  $('#ramoApp').textContent = r.app;
  $('#ramoCta').textContent = r.cta;
  $('#ramoList').replaceChildren(...r.l.map(t => { const li = document.createElement('li'); li.textContent = t; return li; }));
  $('#ramoNotes').replaceChildren(...r.n.map(([ic, t]) => {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.innerHTML = icone(ic);
    const s = document.createElement('span'); s.textContent = t;
    li.append(b, s); return li;
  }));
  ctaRamo.href = WA + encodeURIComponent(`Olá! Vim pelo site da Novum Digital. Tenho ${r.quem} e quero conversar sobre um sistema.`);
  painel.classList.remove('is-swap'); void painel.offsetWidth; painel.classList.add('is-swap');
}
abas.forEach((a, i) => {
  a.addEventListener('click', () => mostra(a.dataset.r));
  // setas trocam de aba, como em qualquer tablist
  a.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const prox = abas[(i + d + abas.length) % abas.length];
    prox.focus(); mostra(prox.dataset.r);
  });
});

/* ---------- calculadora ---------- */
const cP = $('#cPessoas'), cH = $('#cHoras'), cC = $('#cCusto');
const calcCta = $('#calcCta');
function pinta(inp){ inp.style.setProperty('--v', `${(inp.value - inp.min) / (inp.max - inp.min) * 100}%`); }
function calcula(){
  const p = +cP.value, h = +cH.value, c = +cC.value;
  const mes = Math.round(p * h * 52 / 12);
  const ano = p * h * 52 * c;
  $('#oPessoas').textContent = p;
  $('#oHoras').textContent = `${h} h`;
  $('#oCusto').textContent = `R$ ${c}`;
  $('#rHoras').textContent = `${mes} h`;
  $('#rAno').textContent = ano.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
  [cP, cH, cC].forEach(pinta);
  calcCta.href = WA + encodeURIComponent(`Olá! Fiz a conta no site da Novum Digital: perco cerca de ${mes} horas por mês com trabalho manual. Quero ver como resolver.`);
}
[cP, cH, cC].forEach(i => i.addEventListener('input', calcula));
calcula();
})();
