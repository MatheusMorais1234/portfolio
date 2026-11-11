const raiz = document.documentElement;
const ingles = raiz.lang === 'en';

const textos = ingles ? {
  temaClaro: 'Use light theme',
  temaEscuro: 'Use dark theme',
  erros: {
    name: 'Write your name.',
    email: 'Write an email address with an @, like name@company.com.',
    message: 'Write your message, for example the role and a link to it.',
  },
  confira: 'Please check the highlighted fields.',
  enviando: 'Sending...',
  enviado: 'Message sent. I will reply to the email you gave.',
  falhou: 'It could not be sent right now. Try again or write to matheusrenatoam@gmail.com.',
} : {
  temaClaro: 'Usar tema claro',
  temaEscuro: 'Usar tema escuro',
  erros: {
    name: 'Escreva seu nome.',
    email: 'Escreva um e-mail com @, como nome@empresa.com.',
    message: 'Escreva a mensagem, por exemplo a vaga e o link dela.',
  },
  confira: 'Confira os campos marcados.',
  enviando: 'Enviando...',
  enviado: 'Mensagem enviada. Eu respondo no e-mail que você informou.',
  falhou: 'Não consegui enviar agora. Tente de novo ou escreva para matheusrenatoam@gmail.com.',
};

// Tema claro/escuro. A escolha inicial é feita em tema.js, no <head>.
const corDoTopo = document.querySelector('meta[name="theme-color"]');
const botoesTema = document.querySelectorAll('[data-tema]');

function mostrarTema() {
  const escuro = raiz.dataset.theme === 'dark';
  const texto = escuro ? textos.temaClaro : textos.temaEscuro;
  corDoTopo.content = escuro ? '#0e0f11' : '#ffffff';
  for (const botao of botoesTema) {
    if (botao.classList.contains('btn-icone')) botao.setAttribute('aria-label', texto);
    else botao.textContent = texto;
  }
}

for (const botao of botoesTema) {
  botao.addEventListener('click', () => {
    raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tema', raiz.dataset.theme); } catch {}
    mostrarTema();
  });
}
mostrarTema();

// Menu no celular
const topo = document.querySelector('.topo');
const abrirMenu = document.querySelector('.abrir-menu');

function fecharMenu() {
  topo.classList.remove('aberto');
  abrirMenu.setAttribute('aria-expanded', 'false');
}

if (abrirMenu) {
  abrirMenu.addEventListener('click', () => {
    const aberto = topo.classList.toggle('aberto');
    abrirMenu.setAttribute('aria-expanded', aberto);
  });
  topo.querySelector('.menu').addEventListener('click', (e) => {
    if (e.target.closest('a')) fecharMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && topo.classList.contains('aberto')) {
      fecharMenu();
      abrirMenu.focus();
    }
  });
}

// Print do FreelaManager revela uma vez quando aparece na tela
const print = document.querySelector('.print-grande');
if (print && 'IntersectionObserver' in window) {
  const observador = new IntersectionObserver(([item]) => {
    if (item.isIntersecting) {
      print.classList.add('revelado');
      observador.disconnect();
    }
  }, { threshold: 0.35 });
  observador.observe(print);
} else if (print) {
  print.classList.add('revelado');
}

// Data do último commit pela API do GitHub. O HTML já traz uma data, caso a API falhe.
async function atualizarCommits(elementos) {
  for (const el of elementos) {
    const chave = 'commit:' + el.dataset.repo;
    let data = null;
    try { data = sessionStorage.getItem(chave); } catch {}

    if (!data) {
      try {
        const resp = await fetch(`https://api.github.com/repos/MatheusMorais1234/${el.dataset.repo}/commits?per_page=1`);
        if (!resp.ok) continue;
        const [commit] = await resp.json();
        data = commit.commit.committer.date.slice(0, 10);
        try { sessionStorage.setItem(chave, data); } catch {}
      } catch {
        continue;
      }
    }

    const [ano, mes, dia] = data.split('-');
    el.dateTime = data;
    el.textContent = ingles ? `${mes}/${dia}/${ano}` : `${dia}/${mes}/${ano}`;
  }
}

const datas = document.querySelectorAll('time[data-repo]');
if (datas.length) atualizarCommits(datas);

// Formulário de contato (Web3Forms)
const form = document.querySelector('.formulario');

function validar() {
  let primeiroErro = null;
  for (const campo of form.querySelectorAll('[required]')) {
    const erro = document.getElementById(campo.getAttribute('aria-describedby'));
    const invalido = !campo.value.trim() || (campo.type === 'email' && !campo.value.includes('@'));
    campo.setAttribute('aria-invalid', invalido);
    erro.textContent = invalido ? textos.erros[campo.name] : '';
    erro.hidden = !invalido;
    if (invalido && !primeiroErro) primeiroErro = campo;
  }
  return primeiroErro;
}

if (form) {
  const status = form.querySelector('.status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const campoComErro = validar();
    if (campoComErro) {
      campoComErro.focus();
      status.textContent = textos.confira;
      return;
    }

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    status.textContent = textos.enviando;

    try {
      const resposta = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const dados = await resposta.json();
      if (!dados.success) throw new Error(dados.message);
      form.reset();
      status.textContent = textos.enviado;
    } catch {
      status.textContent = textos.falhou;
    } finally {
      botao.disabled = false;
    }
  });
}
