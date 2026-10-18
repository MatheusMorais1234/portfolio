/* =====================================================================
   theme.js — tema escuro (padrão) ou claro.
   Carregado no <head> sem defer: aplica a escolha salva antes da página
   pintar, para não piscar o tema errado. Qualquer botão .theme alterna.
   ===================================================================== */
(() => {
'use strict';

const KEY = 'mm-theme';
const COR = { dark:'#0d1b17', light:'#f3f7f3' };   // barra do navegador no celular
const root = document.documentElement;

root.classList.add('js');

let tema = 'dark';
try { if (localStorage.getItem(KEY) === 'light') tema = 'light'; } catch { /* modo privado */ }

function aplica(){
  if (tema === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', COR[tema]);
  document.querySelectorAll('.theme').forEach(b => b.setAttribute('aria-pressed', String(tema === 'light')));
}

aplica();

document.addEventListener('DOMContentLoaded', () => {
  aplica();
  document.querySelectorAll('.theme').forEach(b => b.addEventListener('click', () => {
    const troca = () => {
      tema = tema === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, tema); } catch { /* modo privado */ }
      aplica();
    };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return troca();

    // o tema novo cresce em círculo a partir do botão até cobrir a tela
    const r = b.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    root.classList.add('is-theming');
    document.startViewTransition(troca).finished.finally(() => root.classList.remove('is-theming'));
  }));
});
})();
