/*
   gravar-projetos.mjs: grava os projetos no ar para as cenas do portfólio.

   A rolagem anda quadro a quadro: cada quadro é uma captura feita com a
   página na posição exata daquele instante. Por isso o vídeo sai liso mesmo
   quando a captura é lenta.

   Só faz leitura: rola, segue link público, usa filtro de tela e o botão de
   demonstração quando o projeto oferece. Nunca envia formulário nem digita nada.

   Uso:
     cd pasta-fora-do-repo && npm i puppeteer-core
     PUPPETEER_CORE_DIR=pasta-fora-do-repo node _ferramentas/gravar-projetos.mjs [--so=desktop|celular] [slug ...]

   Precisa de ffmpeg no PATH. Saída em assets/video/projetos/: <slug>.mp4 e
   <slug>.jpg (tela de computador), <slug>-m.mp4 e <slug>-m.jpg (tela de
   celular de verdade, recortada em 3:4). Esta pasta NÃO vai para o servidor.
   */

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(raiz, 'assets/video/projetos');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dirDeps = process.env.PUPPETEER_CORE_DIR;
if (!dirDeps) throw new Error('Defina PUPPETEER_CORE_DIR com a pasta onde o puppeteer-core foi instalado.');
const puppeteer = createRequire(join(resolve(dirDeps), 'x.js'))('puppeteer-core');

const FPS = 30;
const LARGURA = 1600;
const ALTURA = 900;
const CELULAR = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const UA_CELULAR = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const LIMITE = { desktop: 2.5 * 1024 * 1024, mobile: 1.2 * 1024 * 1024, poster: 120 * 1024, posterM: 70 * 1024 };

const espera = ms => new Promise(r => setTimeout(r, ms));

/* Clica no botão ou link cujo texto bate. Usado só para demo, filtro e menu. */
const clica = texto => async page => {
  const achou = await page.evaluate(t => {
    const el = [...document.querySelectorAll('a,button')].find(e => (e.innerText || '').trim().toLowerCase().includes(t.toLowerCase()) && e.getClientRects().length);
    if (el) { el.click(); return true; }
    return false;
  }, texto);
  if (!achou) throw new Error(`não achei "${texto}"`);
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 20000 }).catch(() => {});
  await espera(1200);
};

const vai = url => async page => {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await espera(1000);
};

const ancora = h => async page => {
  await page.evaluate(v => { location.hash = v; }, h);
  await espera(1200);
};

const em = (...passos) => async page => { for (const p of passos) await p(page); };

/*
   Cada trecho: como chegar, de onde até onde rolar (px) e quanto dura (s).
   deTexto começa no título que contém o texto, menos a folga pedida, e anda
   a distância de "anda".
   Os painéis da pizzaria, do VitaGesta, do Shopilot e da HipocratIA pedem
   login, então aqui ficam os blocos públicos que mais mostram o produto.
   */
const ROTEIROS = {
  shopilot: [
    { chega: vai('https://shopilot.matheusmorais.com/'), de: 470, ate: 560, dur: 11 }
  ],
  studiosports: [
    /* começa abaixo do carrossel: a foto do topo mostra uma atleta com o nome na camisa */
    { chega: vai('https://www.studiosports.com.br/'), de: 780, ate: 1900, dur: 7 },
    { chega: vai('https://www.studiosports.com.br/eventos/desafio-audax'), de: 0, ate: 500, dur: 4 }
  ],
  freelamanager: [
    { chega: vai('https://app.matheusmorais.com/'), de: 0, ate: 120, dur: 2 },
    { chega: clica('Testar a demonstração'), de: 0, ate: 500, dur: 9 }
  ],
  pizzaria: [
    /* o filtro "Pizzas" também tira do quadro a foto errada do refrigerante */
    { chega: em(vai('https://pizzaria.matheusmorais.com/cardapio.php'), clica('Pizzas')), de: 400, ate: 440, dur: 11 }
  ],
  vitagesta: [
    { chega: vai('https://vitagesta.matheusmorais.com/'), de: 1740, ate: 1790, dur: 6 },
    { chega: ancora('#calculadora'), de: 0, ate: 60, dur: 5 }
  ],
  hipocratia: [
    { chega: vai('https://hipocratia.com.br/'), de: 2030, ate: 2090, dur: 7, fecha: '×' },
    { chega: vai('https://hipocratia.com.br/'), de: 0, ate: 20, dur: 4, fecha: '×' }
  ]
};

const ROTEIROS_CELULAR = {
  shopilot: [
    { chega: vai('https://shopilot.matheusmorais.com/'), de: 600, ate: 1140, dur: 11 }
  ],
  studiosports: [
    /* também abaixo do carrossel, pelo mesmo motivo */
    { chega: vai('https://www.studiosports.com.br/'), deTexto: ['EVIDÊNCIA', 90], anda: 1100, dur: 11 }
  ],
  freelamanager: [
    { chega: vai('https://app.matheusmorais.com/'), de: 0, ate: 60, dur: 2 },
    { chega: clica('Testar a demonstração'), de: 0, ate: 700, dur: 9 }
  ],
  pizzaria: [
    { chega: em(vai('https://pizzaria.matheusmorais.com/cardapio.php'), clica('Pizzas')), de: 430, ate: 1500, dur: 11 }
  ],
  vitagesta: [
    { chega: vai('https://vitagesta.matheusmorais.com/'), deTexto: ['Para a gestante', 70], anda: 800, dur: 11 }
  ],
  hipocratia: [
    { chega: vai('https://hipocratia.com.br/'), deTexto: ['Questões Comentadas', 90], anda: 620, dur: 11, fecha: '×' }
  ]
};

/* Sem rolagem suave do próprio site, e com tudo que é preguiçoso já carregado. */
async function prepara(page, trecho) {
  await page.addStyleTag({ content: 'html,body{scroll-behavior:auto!important}::-webkit-scrollbar{display:none}' }).catch(() => {});
  if (trecho.fecha) {
    await page.evaluate(t => { const b = [...document.querySelectorAll('button')].find(e => (e.innerText || '').trim() === t && e.getClientRects().length); if (b) b.click(); }, trecho.fecha);
    await espera(500);
  }
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < altura; y += 500) {
    await page.evaluate(v => window.scrollTo({ top: v, behavior: 'instant' }), y);
    await espera(180);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await espera(900);
}

/* Parado no início e no fim do trecho, com aceleração suave no meio. */
function posicao(t, de, ate) {
  const pausa = 0.1;
  const u = Math.min(1, Math.max(0, (t - pausa) / (1 - pausa * 2)));
  return de + (ate - de) * (u * u * (3 - 2 * u));
}

function rodaFfmpeg(args) {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args]);
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`);
}

function codifica(master, destino, largura, limite) {
  for (const crf of [25, 27, 29, 31, 33, 35, 38]) {
    rodaFfmpeg(['-i', master, '-an', '-vf', `scale=${largura}:-2:flags=lanczos:out_range=tv,format=yuv420p`, '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-movflags', '+faststart', destino]);
    if (statSync(destino).size <= limite) return crf;
  }
  throw new Error(`${destino} passou do limite`);
}

function poster(master, destino, largura, limite) {
  for (const q of [3, 4, 6, 8, 10, 13]) {
    rodaFfmpeg(['-ss', '0.15', '-i', master, '-frames:v', '1', '-vf', `scale=${largura}:-2:flags=lanczos`, '-q:v', String(q), destino]);
    if (statSync(destino).size <= limite) return;
  }
  throw new Error(`${destino} passou do limite`);
}

async function grava(browser, slug, celular) {
  const roteiro = (celular ? ROTEIROS_CELULAR : ROTEIROS)[slug];
  if (!roteiro) return;
  const page = await browser.newPage();
  if (celular) {
    await page.setUserAgent(UA_CELULAR);
    await page.setViewport(CELULAR);
  } else {
    await page.setViewport({ width: LARGURA, height: ALTURA, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  }

  const tmp = mkdtempSync(join(tmpdir(), `gravar-${slug}-`));
  const master = join(tmp, 'master.mp4');
  /* no celular fica o topo da tela, em 3:4, para o quadro de cerca de 60svh */
  const filtro = `${celular ? 'crop=iw:trunc(iw*4/3/2)*2:0:0,' : ''}scale=out_range=tv,format=yuv420p`;
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-vf', filtro, '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', master], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((ok, erro) => ff.on('close', c => (c === 0 ? ok() : erro(new Error(`ffmpeg saiu com ${c}`)))));

  try {
    for (const trecho of roteiro) {
      await trecho.chega(page);
      await prepara(page, trecho);
      const total = Math.round(trecho.dur * FPS);
      const maximo = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
      let de = trecho.de;
      let alvo = trecho.ate;
      if (trecho.deTexto) {
        de = await page.evaluate(([t, folga]) => {
          const el = [...document.querySelectorAll('h1,h2,h3,h4')].find(e => e.innerText.includes(t) && e.getClientRects().length);
          if (!el) return null;
          return Math.max(0, el.getBoundingClientRect().top + scrollY - folga);
        }, trecho.deTexto);
        if (de === null) throw new Error(`não achei o título "${trecho.deTexto[0]}"`);
        alvo = de + trecho.anda;
      }
      const ate = Math.min(alvo, maximo);
      for (let i = 0; i < total; i++) {
        const y = Math.round(posicao(i / (total - 1), de, ate));
        await page.evaluate(v => window.scrollTo({ top: v, behavior: 'instant' }), y);
        const quadro = await page.screenshot({ type: 'jpeg', quality: 92 });
        if (!ff.stdin.write(quadro)) await new Promise(r => ff.stdin.once('drain', r));
      }
    }
  } finally {
    ff.stdin.end();
    await fim;
    await page.close();
  }

  const kb = n => `${Math.round(statSync(join(SAIDA, n)).size / 1024)} KB`;
  if (celular) {
    const crf = codifica(master, join(SAIDA, `${slug}-m.mp4`), 720, LIMITE.mobile);
    poster(master, join(SAIDA, `${slug}-m.jpg`), 720, LIMITE.posterM);
    console.log(`${slug} celular: ${kb(`${slug}-m.mp4`)} (crf ${crf}), poster ${kb(`${slug}-m.jpg`)}`);
  } else {
    const crf = codifica(master, join(SAIDA, `${slug}.mp4`), 1280, LIMITE.desktop);
    poster(master, join(SAIDA, `${slug}.jpg`), 1280, LIMITE.poster);
    console.log(`${slug}: ${kb(`${slug}.mp4`)} (crf ${crf}), poster ${kb(`${slug}.jpg`)}`);
  }
  rmSync(tmp, { recursive: true, force: true });
}

mkdirSync(SAIDA, { recursive: true });
const args = process.argv.slice(2);
const so = (args.find(a => a.startsWith('--so=')) || '').slice(5);
const nomes = args.filter(a => !a.startsWith('--'));
const pedidos = nomes.length ? nomes : Object.keys(ROTEIROS);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', userDataDir: mkdtempSync(join(tmpdir(), 'gravar-perfil-')) });
try {
  for (const slug of pedidos) {
    for (const celular of [false, true]) {
      if ((so === 'desktop' && celular) || (so === 'celular' && !celular)) continue;
      try { await grava(browser, slug, celular); }
      catch (e) { console.error(`${slug}${celular ? ' celular' : ''}: FALHOU: ${e.message}`); process.exitCode = 1; }
    }
  }
} finally {
  await browser.close();
}
