/* =====================================================================
   gerar-curriculo.mjs — monta os dois currículos em PDF (PT e EN).

   Uso:  node _ferramentas/gerar-curriculo.mjs
   Precisa do Chrome ou do Edge instalado: o PDF é a impressão de uma
   página HTML. Saída:
     assets/Curriculo_Matheus_Renato.pdf
     assets/Matheus_Renato_Resume_EN.pdf

   Para mudar o currículo, edite o texto em CV logo abaixo — as duas
   línguas lado a lado, como no data.js.
   ===================================================================== */

import { writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------------------------------------------------------------
   Conteúdo
   --------------------------------------------------------------------- */
const CONTATO = {
  local: { pt:'Goiânia - GO, Brasil', en:'Goiânia - GO, Brazil' },
  fone: ['+55 62 99201-4463', 'https://wa.me/5562992014463'],
  email: ['matheusrenatoam@gmail.com', 'mailto:matheusrenatoam@gmail.com'],
  links: [
    ['linkedin.com/in/arantes-matheus', 'https://www.linkedin.com/in/arantes-matheus'],
    ['github.com/MatheusMorais1234', 'https://github.com/MatheusMorais1234'],
    ['matheusmorais.com', 'https://matheusmorais.com']
  ]
};

const CV = {
  pt: {
    arquivo: 'Curriculo_Matheus_Renato.pdf',
    lang: 'pt-BR',
    titulo: 'Desenvolvedor Full-Stack | disponível para início imediato',
    secoes: { resumo:'Resumo', skills:'Competências técnicas', exp:'Experiência profissional', projetos:'Projetos (no ar)', edu:'Formação e idiomas' },
    resumo: 'Desenvolvedor full-stack com quase dois anos mantendo sistemas de gestão em produção na ASSEGO, usados por mais de 100 funcionários e por cerca de 9 mil associados: contratos, cobrança integrada ao Sicoob e ao Itaú, relatórios e aplicativo. PHP, TypeScript, React e Next.js do banco ao front-end. Inglês B2. Disponível de imediato, presencial em Goiânia ou remoto.',
    skills: [
      ['Principais', 'PHP, TypeScript, JavaScript, React, Next.js, HTML, CSS.'],
      ['Banco e back-end', 'MySQL, PostgreSQL, Node.js, Express, Prisma, APIs REST, Webhooks, JWT, CNAB 240/400.'],
      ['Infra e ferramentas', 'Linux, Docker, Git, GitHub Actions (CI), Cron.'],
      ['Em evolução', 'Java 7/8, Spring Boot, Angular, JBoss EAP 6/7, Flutter.']
    ],
    exp: [
      { org:'ASSEGO - Associação dos Subtenentes e Sargentos do Estado de Goiás',
        cargo:'Estagiário de Desenvolvimento | Jan 2025 - Out 2026 | Goiânia, GO',
        pts:[
          'Integrou as APIs de pagamento do Sicoob e do Itaú: emissão de boletos, leitura do retorno, baixa automática e régua de cobrança, com contratos de API tipados em TypeScript.',
          'Criou o sistema de gestão de contratos (aprovação em etapas, PDF e histórico) e dashboards com exportação PDF/Excel usados por mais de 100 funcionários.',
          'Construiu a PWA mobile-first usada por cerca de 9 mil associados, em Next.js e TypeScript.',
          'Automatizou importações, relatórios e e-mails (PHPMailer/Cron) e manteve aplicações Java 7/8 em JBoss EAP e telas Angular.'
        ] },
      { org:'JHON CODE - agência de desenvolvimento web',
        cargo:'Estagiário de Desenvolvimento | Jul 2023 - Abr 2024',
        pts:[
          'Desenvolveu sistemas web sob medida para clientes, do banco MySQL ao front-end em PHP e JavaScript.',
          'Criou painéis administrativos e autenticação com hash de senha, sessões e controle de acesso por perfil.',
          'Modelou bancos e diagramas antes da implementação e integrou APIs REST.'
        ] },
      { org:'FIO GUIA - produto financeiro para médicos',
        cargo:'Estagiário de Desenvolvimento | Jan 2023 - Jun 2023',
        pts:[
          'Primeira experiência profissional: consultas SQL, integrações de API e telas em Flutter num produto financeiro real.'
        ] }
    ],
    projetos: [
      { nome:'HipocratIA', link:['hipocratia.com.br', 'https://hipocratia.com.br'],
        texto:'Produto próprio de estudo para concursos da saúde: questões comentadas por IA (API do Claude), simulados e assinatura pelo Mercado Pago, sobre um MVC próprio em PHP 8.1 com cerca de 30 mil linhas.' },
      { nome:'FreelaManager', link:['app.matheusmorais.com', 'https://app.matheusmorais.com'],
        texto:'Gestão de clientes, contratos e recebimentos: React, Express, PostgreSQL e Prisma, com 95 testes no CI e demonstração no ar.' },
      { nome:'Bella Napoli', link:['pizzaria.matheusmorais.com', 'https://pizzaria.matheusmorais.com'],
        texto:'Delivery para pizzaria em PHP e MySQL, com painel kanban e QR Code de mesa. Fiz revisão de segurança antes de publicar (XSS, CSRF e acesso indevido a pedidos).' },
      { nome:'Ferramentas de pagamento', link:['matheusmorais.com/ferramentas', 'https://matheusmorais.com/ferramentas/'],
        texto:'Gerador de Pix com QR Code, validador de boleto e leitor de retorno CNAB, em JavaScript com testes automatizados.' }
    ],
    edu: [
      ['Tecnólogo em Análise e Desenvolvimento de Sistemas', 'Faculdade Senac Goiás, concluído em 2025.'],
      ['Inglês B2', 'Centro de Línguas da UFG, 480 horas, concluído em 2026; vivência na Alemanha.']
    ],
    rodape: 'Outros cursos e certificados em matheusmorais.com'
  },

  en: {
    arquivo: 'Matheus_Renato_Resume_EN.pdf',
    lang: 'en',
    titulo: 'Full-Stack Developer | available immediately',
    secoes: { resumo:'Summary', skills:'Technical skills', exp:'Professional experience', projetos:'Projects (live)', edu:'Education and languages' },
    resumo: 'Full-stack developer with almost two years maintaining production management systems at ASSEGO, used by more than 100 staff and around 9,000 members: contracts, billing integrated with Sicoob and Itaú banks, reporting and a member app. PHP, TypeScript, React and Next.js from database to front end. B2 English. Available immediately, on-site in Goiânia (Brazil) or remote.',
    skills: [
      ['Core', 'PHP, TypeScript, JavaScript, React, Next.js, HTML, CSS.'],
      ['Data and back end', 'MySQL, PostgreSQL, Node.js, Express, Prisma, REST APIs, Webhooks, JWT, CNAB 240/400.'],
      ['Infra and tools', 'Linux, Docker, Git, GitHub Actions (CI), Cron.'],
      ['Developing', 'Java 7/8, Spring Boot, Angular, JBoss EAP 6/7, Flutter.']
    ],
    exp: [
      { org:'ASSEGO - Association of Warrant Officers and Sergeants of Goiás',
        cargo:'Development Intern | Jan 2025 - Oct 2026 | Goiânia, Brazil',
        pts:[
          'Integrated the Sicoob and Itaú payment APIs: boleto issuance, payment return processing, automatic settlement and collection workflows, with API contracts typed in TypeScript.',
          'Built the contract management system (multi-step approval, PDF, change history) and dashboards with PDF/Excel export used by more than 100 staff.',
          'Built the mobile-first PWA used by around 9,000 members, in Next.js and TypeScript.',
          'Automated imports, reports and emails (PHPMailer/Cron) and maintained Java 7/8 apps on JBoss EAP and Angular screens.'
        ] },
      { org:'JHON CODE - web development agency',
        cargo:'Development Intern | Jul 2023 - Apr 2024',
        pts:[
          'Developed custom web systems for clients, from MySQL to PHP and JavaScript front ends.',
          'Built admin panels and authentication with password hashing, sessions and role-based access control.',
          'Designed databases and system diagrams before implementation and integrated REST APIs.'
        ] },
      { org:'FIO GUIA - financial product for physicians',
        cargo:'Development Intern | Jan 2023 - Jun 2023',
        pts:[
          'First professional role: SQL queries, API integrations and Flutter screens on a real financial product.'
        ] }
    ],
    projetos: [
      { nome:'HipocratIA', link:['hipocratia.com.br', 'https://hipocratia.com.br'],
        texto:'My own exam-prep product for health-sector civil service: AI-explained questions (Claude API), mock exams and Mercado Pago subscriptions, on a hand-rolled PHP 8.1 MVC of about 30,000 lines.' },
      { nome:'FreelaManager', link:['app.matheusmorais.com', 'https://app.matheusmorais.com'],
        texto:'Client, contract and payment management: React, Express, PostgreSQL and Prisma, with 95 tests in CI and a live demo.' },
      { nome:'Bella Napoli', link:['pizzaria.matheusmorais.com', 'https://pizzaria.matheusmorais.com'],
        texto:'Pizzeria delivery system in PHP and MySQL with a kanban dashboard and table QR codes. Security-reviewed before launch (XSS, CSRF, unauthorized order access).' },
      { nome:'Payment tools', link:['matheusmorais.com/ferramentas', 'https://matheusmorais.com/ferramentas/'],
        texto:'Pix QR code generator, boleto validator and CNAB bank return file reader, in JavaScript with automated tests.' }
    ],
    edu: [
      ['Technology Degree in Systems Analysis and Development', 'Faculdade Senac Goiás (Brazilian college), completed 2025.'],
      ['English B2 (CEFR)', 'UFG Language Center, 480 hours, completed 2026; lived in Germany.']
    ],
    rodape: 'Other courses and certificates at matheusmorais.com'
  }
};

/* ---------------------------------------------------------------------
   HTML
   --------------------------------------------------------------------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = ([texto, href]) => `<a href="${esc(href)}">${esc(texto)}</a>`;
const lista = pts => `<ul>${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`;

const CSS = `
@page{ size:A4; margin:13mm 15mm 12mm 15mm; }
*{ box-sizing:border-box; margin:0; padding:0; }
body{ font-family:Arial, Helvetica, sans-serif; font-size:9.4pt; line-height:1.3; color:#1a1a1a; }
a{ color:inherit; text-decoration:none; }
h1{ font-size:21pt; line-height:1.1; color:#111; }
.tit{ font-size:11pt; color:#555; margin-top:2pt; }
.ct{ margin-top:2pt; color:#222; }
h2{ font-size:11.5pt; text-transform:uppercase; color:#1f4e66; letter-spacing:.01em;
    border-bottom:.8pt solid #9fb3c0; padding-bottom:1.5pt; margin:9pt 0 3.5pt; break-after:avoid; }
.org{ font-weight:bold; margin-top:5pt; break-after:avoid; }
.cargo{ color:#555; break-after:avoid; }
ul{ list-style:none; }
li{ padding-left:9pt; text-indent:-6pt; margin-top:1.2pt; }
li::before{ content:'- '; }
.job, .proj{ break-inside:avoid; }
.proj{ margin-top:2.5pt; }
.rod{ margin-top:8pt; font-size:8.5pt; color:#666; }
p + p{ margin-top:1pt; }
`;

function html(c){
  const s = c.secoes;
  return `<!DOCTYPE html><html lang="${c.lang}"><head><meta charset="utf-8">
<title>Matheus Renato Arantes de Morais</title><style>${CSS}</style></head><body>
<h1>Matheus Renato Arantes de Morais</h1>
<p class="tit">${esc(c.titulo)}</p>
<p class="ct">${esc(CONTATO.local[c.lang === 'en' ? 'en' : 'pt'])} | ${a(CONTATO.fone)} | ${a(CONTATO.email)}</p>
<p>${CONTATO.links.map(a).join(' | ')}</p>

<h2>${s.resumo}</h2>
<p>${esc(c.resumo)}</p>

<h2>${s.skills}</h2>
${c.skills.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('')}

<h2>${s.exp}</h2>
${c.exp.map(e => `<div class="job"><p class="org">${esc(e.org)}</p><p class="cargo">${esc(e.cargo)}</p>${lista(e.pts)}</div>`).join('')}

<h2>${s.projetos}</h2>
${c.projetos.map(p => `<p class="proj"><b>${esc(p.nome)}</b> (${a(p.link)}): ${esc(p.texto)}</p>`).join('')}

<h2>${s.edu}</h2>
${c.edu.map(([k, v]) => `<p><b>${esc(k)}</b> - ${esc(v)}</p>`).join('')}

<p class="rod">${a([c.rodape, 'https://matheusmorais.com/#certificados'])}</p>
</body></html>`;
}

/* ---------------------------------------------------------------------
   Impressão
   --------------------------------------------------------------------- */
const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];
const navegador = NAVEGADORES.find(p => existsSync(p));
if (!navegador) {
  console.error('Não achei Chrome nem Edge. Instale um deles ou ajuste NAVEGADORES.');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'cv-'));
try {
  for (const c of Object.values(CV)) {
    const fonte = join(tmp, c.arquivo.replace(/\.pdf$/, '.html'));
    writeFileSync(fonte, html(c));
    const saida = join(raiz, 'assets', c.arquivo);
    execFileSync(navegador, [
      '--headless', '--disable-gpu', '--no-pdf-header-footer',
      `--user-data-dir=${join(tmp, 'perfil')}`,
      `--print-to-pdf=${saida}`, pathToFileURL(fonte).href
    ], { stdio:'ignore' });
    console.log(`  ${c.arquivo}`);
  }
} finally {
  rmSync(tmp, { recursive:true, force:true });
}
console.log('\nCurrículos gerados em assets/. Abra os dois e confira antes de publicar.\n');
