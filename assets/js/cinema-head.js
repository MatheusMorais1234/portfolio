/*
   cinema-head.js — decide, antes da página pintar, se a abertura toca.
   Arquivo separado porque o CSP do .htaccess bloqueia script inline.
   A abertura é só CSS: sem esta classe, a página aparece pronta.
   */
(() => {
const root = document.documentElement;
root.classList.add('js');
try {
  if (!sessionStorage.getItem('mm-abertura')) {
    root.classList.add('is-intro');
    sessionStorage.setItem('mm-abertura', '1');
  }
} catch { /* modo privado: fica sem a abertura */ }
})();
