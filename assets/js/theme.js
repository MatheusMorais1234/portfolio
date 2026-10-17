/* =====================================================================
   theme.js — tema escuro (padrão) ou claro.
   Carregado no <head> sem defer: aplica a escolha salva antes da página
   pintar, para não piscar o tema errado. Qualquer botão .theme alterna.
   ===================================================================== */
(() => {
'use strict';

const KEY = 'mm-theme';
const COR = { dark:'#0b1220', light:'#ffffff' };   // barra do navegador no celular
const root = document.documentElement;

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
    tema = tema === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, tema); } catch { /* modo privado */ }
    aplica();
  }));
});
})();
