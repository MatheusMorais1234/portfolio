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
    secoes: {
      resumo:'Resumo profissional', skills:'Competências técnicas', exp:'Experiência profissional',
      edu:'Formação acadêmica', idiomas:'Idiomas', projetos:'Projetos pessoais / código aberto', certs:'Certificações'
    },
    resumo: 'Desenvolvedor full-stack formado em Análise e Desenvolvimento de Sistemas, com quase dois anos mantendo sistemas de gestão em produção usados por mais de 100 funcionários e por um aplicativo de cerca de 9 mil associados: contratos, cobrança, relatórios gerenciais e integrações com as APIs do Sicoob e do Itaú. Atua do banco de dados ao front-end com PHP, TypeScript, React e Next.js, além de automações, deploy em Linux e manutenção de legado Java/JBoss. Inglês B2. Disponível para início imediato em vaga júnior CLT ou PJ, presencial em Goiânia ou remota.',
    skills: [
      ['Domínio sólido', 'PHP, TypeScript, JavaScript, HTML, CSS.'],
      ['Uso diário', 'React, Next.js, MySQL, PostgreSQL, Docker, Linux, Git.'],
      ['Back-end e integrações', 'APIs REST, Webhooks, Node.js, Express, JWT, PHPMailer, Cron, Prisma, CNAB 240/400.'],
      ['Em evolução', 'Java 7/8, Spring Boot, Angular, Flutter, JBoss EAP 6/7.'],
      ['Outros', 'PWA, Scrum.']
    ],
    exp: [
      { org:'ASSEGO - Associação dos Subtenentes e Sargentos do Estado de Goiás',
        cargo:'Estagiário de Desenvolvimento | Jan 2025 - Out 2026 | Goiânia, GO',
        pts:[
          'Desenvolveu um sistema de gestão de contratos com aprovação em etapas, modelagem de dados, geração de PDF e histórico de alterações, substituindo um processo baseado em planilhas e e-mail.',
          'Criou sistemas de gestão, dashboards e relatórios usados por mais de 100 funcionários das áreas administrativa e financeira, com filtros combinados e exportação em PDF/Excel, dando autonomia para consultas que antes dependiam do TI.',
          'Integrou as APIs de pagamento do Sicoob e do Itaú para emissão de boletos, retorno de pagamento, baixa automática e régua de cobrança, usando TypeScript para tipar contratos de integração e reduzir erros.',
          'Construiu a PWA mobile-first usada por cerca de 9 mil associados, com Next.js e TypeScript, cobrindo rotas, autenticação, interface responsiva e cache offline.',
          'Automatizou importações, relatórios agendados e e-mails com PHPMailer/Cron, eliminando horas de trabalho manual por mês; também manteve aplicações Java 7/8 em JBoss EAP 6/7, corrigiu telas Angular e realizou deploy/versionamento em Linux e Git.'
        ] },
      { org:'JHON CODE - agência de desenvolvimento web',
        cargo:'Estagiário de Desenvolvimento | Jul 2023 - Abr 2024',
        pts:[
          'Desenvolveu sistemas web sob medida para clientes, do banco MySQL ao front-end em PHP, JavaScript, HTML e CSS.',
          'Criou painéis administrativos para que clientes gerenciassem conteúdo e rotinas do próprio sistema sem depender de desenvolvedor.',
          'Implementou autenticação com hash de senha, sessões e controle de acesso por perfil, conectando regras de negócio à interface.',
          'Modelou bancos e diagramas de sistema antes da implementação e integrou APIs REST nos projetos entregues.'
        ] },
      { org:'FIO GUIA - produto de controle financeiro para médicos',
        cargo:'Estagiário de Desenvolvimento | Jan 2023 - Jun 2023',
        pts:[
          'Contribuiu para um produto financeiro real voltado a médicos, no primeiro papel profissional em desenvolvimento.',
          'Implementou consultas e rotinas SQL e apoiou integrações de APIs no aplicativo dos clientes.',
          'Colaborou em telas e fluxos em Flutter, conectando a interface às integrações e aos dados da aplicação.'
        ] }
    ],
    edu: { titulo:'Tecnólogo em Análise e Desenvolvimento de Sistemas - Faculdade Senac Goiás', quando:'Jan 2023 - Jun 2025 (concluído)',
           desc:'Engenharia de software, qualidade de software, banco de dados e metodologias ágeis.' },
    idiomas: [
      ['Português', 'nativo.'],
      ['Inglês', 'B2 (Quadro Comum Europeu), 480 horas no Centro de Línguas da UFG, concluído em 2026; com vivência na Alemanha.']
    ],
    projetos: [
      { nome:'Ferramentas de pagamento', link:['matheusmorais.com/ferramentas', 'https://matheusmorais.com/ferramentas/'],
        pts:[
          'Gerador de Pix copia e cola com QR Code (BR Code e CRC16), validador de boleto (módulo 10/11, FEBRABAN) e leitor de arquivo de retorno CNAB 240/400, que mostra pagos, créditos e rejeições e confere os totais do arquivo.',
          'JavaScript puro rodando no navegador, sem enviar dados, com suíte de testes automatizados.'
        ] },
      { nome:'freelamanager', link:['github.com/MatheusMorais1234/freelamanager', 'https://github.com/MatheusMorais1234/freelamanager'],
        pts:[
          'Gestor full-stack de clientes e contratos para freelancers, com autenticação JWT, API em Express, Prisma sobre PostgreSQL e front-end React com Vite.',
          'Mantém também repositórios de estudo de orientação a objetos e princípios SOLID em Java.'
        ] }
    ],
    certs: [
      'Tecnólogo em ADS - Faculdade Senac Goiás - diploma, 2025.',
      'Inglês nível B2 - UFG, Centro de Línguas - 480h, 2026.',
      'Programação para Web - Cursa/IFRO - 14h37, 2025.',
      'Análise e projeto de sistemas - Cursa/IFRO - 11h02, 2025.',
      'Linguagem e lógica de programação - Cursa/IFRO - 09h32, 2025.',
      'Banco de dados completo - Cursa/IFRO - 06h16, 2025.',
      'Estrutura de dados - Cursa/IFRO - 04h27, 2025.',
      'Segurança em Tecnologia da Informação - Fundação Bradesco/Escola Virtual - 12h, 2025.',
      'Fundamentos de TI: hardware e software - Fundação Bradesco/Escola Virtual - 7h, 2025.',
      'SharePoint - Fundação Bradesco/Escola Virtual - 2h, 2025.'
    ]
  },

  en: {
    arquivo: 'Matheus_Renato_Resume_EN.pdf',
    lang: 'en',
    titulo: 'Full-Stack Developer | available immediately',
    secoes: {
      resumo:'Professional summary', skills:'Technical skills', exp:'Professional experience',
      edu:'Education', idiomas:'Languages', projetos:'Personal / open-source projects', certs:'Certifications'
    },
    resumo: 'Full-stack developer with almost two years maintaining production management systems used by more than 100 staff and a member app used by around 9,000 people: contract management, billing, management reporting and integrations with the Sicoob and Itaú banking APIs. Works across the full stack, from MySQL/PostgreSQL data modeling to React/Next.js interfaces, with PHP and TypeScript at the core, plus Linux deployment, automation and maintenance of Java/JBoss legacy applications. B2 English. Available to start immediately in a junior full-time or contractor role, on-site in Goiânia or remote.',
    skills: [
      ['Core', 'PHP, TypeScript, JavaScript, HTML, CSS.'],
      ['Daily use', 'React, Next.js, MySQL, PostgreSQL, Docker, Linux, Git.'],
      ['Back end & integrations', 'REST APIs, Webhooks, Node.js, Express, JWT, PHPMailer, Cron, Prisma, CNAB 240/400.'],
      ['Developing proficiency', 'Java 7/8, Spring Boot, Angular, Flutter, JBoss EAP 6/7.'],
      ['Other', 'PWA, Scrum.']
    ],
    exp: [
      { org:'ASSEGO - Associação dos Subtenentes e Sargentos do Estado de Goiás',
        cargo:'Development Intern | Jan 2025 - Oct 2026 | Goiânia, GO, Brazil',
        pts:[
          'Built a contract management system with multi-step approvals, data modeling, PDF generation and full change history, replacing a workflow previously handled through spreadsheets and email.',
          'Delivered management systems, dashboards and reports used by more than 100 administrative and finance staff, with combined filters and PDF/Excel exports, so teams no longer had to request figures from IT.',
          'Integrated the Sicoob and Itaú payment APIs for boleto issuance, payment return processing, automatic settlement and collection workflows; typed API contracts in TypeScript to reduce integration errors.',
          'Developed the mobile-first PWA used by around 9,000 members, with Next.js and TypeScript, covering routing, authentication, responsive UI and offline caching.',
          'Automated file imports, scheduled reporting and email delivery with PHPMailer/Cron, removing hours of manual work each month; also maintained Java 7/8 applications on JBoss EAP 6/7, fixed Angular screens and handled Git/Linux deployment.'
        ] },
      { org:'JHON CODE - web development agency',
        cargo:'Development Intern | Jul 2023 - Apr 2024',
        pts:[
          'Developed custom web systems for multiple clients, covering MySQL data modeling, PHP back-end logic and JavaScript/HTML/CSS front-end delivery.',
          'Built admin panels that let clients manage their own content and system routines without developer assistance.',
          'Implemented password hashing, session-based authentication and role-based access control, connecting security rules to the application UI.',
          'Designed database structures and system diagrams before implementation and integrated REST APIs across delivered projects.'
        ] },
      { org:'FIO GUIA - financial management product for physicians',
        cargo:'Development Intern | Jan 2023 - Jun 2023',
        pts:[
          'Contributed to a real financial software product for physicians in a first professional development role.',
          'Implemented SQL queries and data routines and supported API integrations used by the client application.',
          'Worked on Flutter screens and application flows, connecting the user interface with integrations and application data.'
        ] }
    ],
    edu: { titulo:'Technology Degree in Systems Analysis and Development - Faculdade Senac Goiás (Brazilian college)', quando:'Jan 2023 - Jun 2025, completed',
           desc:'Coursework included software engineering, software quality, databases and agile methodologies.' },
    idiomas: [
      ['Portuguese', 'Native.'],
      ['English', 'B2 (CEFR), 480 hours at Centro de Línguas da UFG (Brazilian university language center), completed in 2026; lived experience in Germany.']
    ],
    projetos: [
      { nome:'Payment tools', link:['matheusmorais.com/ferramentas', 'https://matheusmorais.com/ferramentas/'],
        pts:[
          'Pix payment code and QR generator (BR Code, CRC16), boleto validator (modulo 10/11, FEBRABAN standard) and a CNAB 240/400 bank return file reader that lists payments, credits and rejections and checks the file totals.',
          'Plain JavaScript running in the browser without sending any data, backed by an automated test suite.'
        ] },
      { nome:'freelamanager', link:['github.com/MatheusMorais1234/freelamanager', 'https://github.com/MatheusMorais1234/freelamanager'],
        pts:[
          'Full-stack client and contract manager for freelancers with JWT authentication, an Express API, Prisma on PostgreSQL and a React/Vite front end.',
          'Also maintains Java repositories focused on object-oriented programming and SOLID principles.'
        ] }
    ],
    certs: [
      'Technology Degree in Systems Analysis and Development - Faculdade Senac Goiás - diploma, 2025.',
      'B2 English - UFG, Centro de Línguas (university language center) - 480h, 2026.',
      'Web Programming - Cursa/IFRO - 14h37, 2025.',
      'Systems Analysis and Design - Cursa/IFRO - 11h02, 2025.',
      'Programming Language and Logic - Cursa/IFRO - 09h32, 2025.',
      'Complete Databases - Cursa/IFRO - 06h16, 2025.',
      'Data Structures - Cursa/IFRO - 04h27, 2025.',
      'Information Technology Security - Fundação Bradesco/Escola Virtual - 12h, 2025.',
      'IT Fundamentals: Hardware and Software - Fundação Bradesco/Escola Virtual - 7h, 2025.',
      'SharePoint - Fundação Bradesco/Escola Virtual - 2h, 2025.'
    ]
  }
};

/* ---------------------------------------------------------------------
   HTML
   --------------------------------------------------------------------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = ([texto, href]) => `<a href="${esc(href)}">${esc(texto)}</a>`;
const lista = pts => `<ul>${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`;

const CSS = `
@page{ size:A4; margin:16mm 17mm 16mm 17mm; }
*{ box-sizing:border-box; margin:0; padding:0; }
body{ font-family:Arial, Helvetica, sans-serif; font-size:9.6pt; line-height:1.32; color:#1a1a1a; }
a{ color:inherit; text-decoration:none; }
h1{ font-size:21pt; line-height:1.1; color:#111; }
.tit{ font-size:11pt; color:#555; margin-top:2pt; }
.ct{ margin-top:2pt; color:#222; }
h2{ font-size:11.5pt; text-transform:uppercase; color:#1f4e66; letter-spacing:.01em;
    border-bottom:.8pt solid #9fb3c0; padding-bottom:1.5pt; margin:11pt 0 4pt; break-after:avoid; }
.org{ font-weight:bold; margin-top:5pt; break-after:avoid; }
.cargo{ color:#555; break-after:avoid; }
ul{ list-style:none; }
li{ padding-left:9pt; text-indent:-6pt; margin-top:1.2pt; }
li::before{ content:'- '; }
.job, .proj{ break-inside:avoid; }
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

<h2>${s.edu}</h2>
<p><b>${esc(c.edu.titulo)}</b> | ${esc(c.edu.quando)}</p>
<p>${esc(c.edu.desc)}</p>

<h2>${s.idiomas}</h2>
${c.idiomas.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('')}

<h2>${s.projetos}</h2>
${c.projetos.map(p => `<div class="proj"><p class="org"><b>${esc(p.nome)}</b> <span style="font-weight:normal">- ${a(p.link)}</span></p>${lista(p.pts)}</div>`).join('')}

<h2>${s.certs}</h2>
${c.certs.map(x => `<p>${esc(x)}</p>`).join('')}
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
