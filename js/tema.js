// Roda no <head>, antes de desenhar a página, para não piscar no tema errado.
(() => {
  let tema = null;
  try { tema = localStorage.getItem('tema'); } catch {}
  if (tema !== 'light' && tema !== 'dark') {
    tema = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = tema;
  document.documentElement.classList.add('js');
})();
