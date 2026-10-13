/* =====================================================================
   data.js — todo o conteúdo do site em um lugar só.
   Para editar o portfólio, mexa AQUI. Não precisa tocar no HTML.
   ===================================================================== */

/* Logos ficam no proprio dominio: sem CDN externo, sem risco de falha. */
const ICON = 'assets/img/logos';

/* ---------------------------------------------------------------------
   1. STACK — cada item mostra ONDE a tecnologia foi usada de verdade.
   level: 'solid' (domínio) | 'working' (uso diário) | 'early' (inicial)
   --------------------------------------------------------------------- */
const STACK = [
  { name:'PHP', icon:`${ICON}/php.svg`, level:'solid',
    use:{ pt:'Base dos sistemas internos da ASSEGO e de todos os projetos de cliente na JHON CODE: gestão de contratos, rotinas de cobrança, geração de PDF e envio de e-mail com PHPMailer.',
          en:'The backbone of ASSEGO’s internal systems and every client project at JHON CODE: contract management, billing routines, PDF generation and email delivery with PHPMailer.' } },

  { name:'TypeScript', icon:`${ICON}/typescript.svg`, level:'solid',
    use:{ pt:'Linguagem padrão do front das aplicações novas. Tipagem dos contratos de API de pagamento evitou boa parte dos erros de integração com Sicoob e Itaú.',
          en:'Default language for new front ends. Typing the payment API contracts removed most of the integration bugs with Sicoob and Itaú.' } },

  { name:'JavaScript', icon:`${ICON}/javascript.svg`, level:'solid',
    use:{ pt:'Front-end desde 2023: painéis administrativos, validação de formulários, tabelas dinâmicas e exportação de relatórios direto no navegador.',
          en:'Front-end work since 2023: admin panels, form validation, dynamic tables and in-browser report exports.' } },

  { name:'React', icon:`${ICON}/react.svg`, level:'working',
    use:{ pt:'Interfaces dos dashboards gerenciais: filtros combinados, tabelas com muitos registros e exportação em PDF/Excel para as áreas administrativa e financeira.',
          en:'The management dashboards: combined filters, large data tables and PDF/Excel export for the admin and finance teams.' } },

  { name:'Next.js', icon:`${ICON}/nextjs.svg`, level:'working',
    use:{ pt:'PWA dos associados — rotas, autenticação, cache offline e foco total em uso no celular, que é onde os associados realmente abrem o sistema.',
          en:'The members’ PWA — routing, auth, offline cache and a mobile-first build, since that is where members actually open the system.' } },

  { name:'MySQL', icon:`${ICON}/mysql.svg`, level:'working',
    use:{ pt:'Modelagem e manutenção das bases dos sistemas internos: histórico de alterações de contratos, conciliação de pagamentos e queries de relatório.',
          en:'Modelling and maintaining the internal system databases: contract change history, payment reconciliation and reporting queries.' } },

  { name:'PostgreSQL', icon:`${ICON}/postgresql.svg`, level:'working',
    use:{ pt:'Base das aplicações mais novas. Uso de views e funções para consolidar relatórios financeiros sem pesar no front.',
          en:'Backing the newer applications. Views and functions consolidate financial reports so the front end stays light.' } },

  { name:'Java', icon:`${ICON}/java.svg`, level:'early',
    use:{ pt:'Java 7 e 8 em sistemas legados: leitura de código existente, correção de rotinas e ajustes pontuais. Nível inicial, com apoio da equipe.',
          en:'Java 7 and 8 in legacy systems: reading existing code, fixing routines and making targeted adjustments. Early level, with team support.' } },

  { name:'Spring Boot', icon:`${ICON}/spring.svg`, level:'early',
    use:{ pt:'Estudo dirigido e projetos próprios de API REST, para chegar preparado nas demandas de back-end Java do time.',
          en:'Self-directed study and personal REST API projects, to arrive prepared for the team’s Java back-end work.' } },

  { name:'Angular', icon:`${ICON}/angular.svg`, level:'early',
    use:{ pt:'Correções em telas de sistemas já existentes: componentes, formulários e chamadas de serviço. Primeiro contato, feito com apoio da equipe.',
          en:'Fixes on screens of existing systems: components, forms and service calls. First contact, done with team support.' } },

  { name:'Flutter', icon:`${ICON}/flutter.svg`, level:'early',
    use:{ pt:'Na FIO GUIA, telas do app de controle financeiro para médicos, consumindo API e integrando com o fluxo de atendimento.',
          en:'At FIO GUIA, screens for a financial-control app for physicians, consuming the API and plugging into the support flow.' } },

  { name:'Docker', icon:`${ICON}/docker.svg`, level:'working',
    use:{ pt:'Padronização dos ambientes de desenvolvimento para que PHP, banco e serviços subam iguais na minha máquina e no servidor.',
          en:'Standardising dev environments so PHP, the database and services come up identically on my machine and on the server.' } },

  { name:'Linux', icon:`${ICON}/linux.svg`, level:'working',
    use:{ pt:'Deploy e operação dos sistemas: permissões, cron, leitura de log, FTP/SFTP e diagnóstico quando algo cai fora do horário.',
          en:'Deploying and operating the systems: permissions, cron, log reading, FTP/SFTP and diagnosis when something goes down off-hours.' } },

  { name:'Git', icon:`${ICON}/git.svg`, level:'working',
    use:{ pt:'Versionamento em todos os projetos, branches por demanda e histórico limpo — inclusive em bases que não tinham controle nenhum antes.',
          en:'Version control on every project, a branch per demand and a clean history — including on codebases that had none before.' } },

  { name:'JBoss EAP', icon:`${ICON}/redhat.svg`, level:'early',
    use:{ pt:'EAP 6 e 7: deploy de WAR, ajuste de datasource e leitura de logs para investigar erro em produção.',
          en:'EAP 6 and 7: WAR deployment, datasource configuration and log reading to investigate production errors.' } },

  { name:'HTML & CSS', icon:`${ICON}/css3.svg`, level:'solid',
    use:{ pt:'Layout responsivo em tudo que entrego, com atenção a acessibilidade básica e a telas de celular — este site inclusive, escrito à mão.',
          en:'Responsive layout in everything I ship, with attention to basic accessibility and mobile screens — including this site, hand-written.' } }
];

const LEVELS = {
  solid:   { pt:'Domínio sólido',   en:'Solid command' },
  working: { pt:'Uso diário',       en:'Daily use' },
  early:   { pt:'Nível inicial',    en:'Early level' }
};

/* ---------------------------------------------------------------------
   2. TRAJETÓRIA
   --------------------------------------------------------------------- */
const TIMELINE = [
  {
    when:{ pt:'01/2025 — 10/2026', en:'Jan 2025 — Oct 2026' },
    where:'ASSEGO',
    org:{ pt:'Associação dos Subtenentes e Sargentos do Estado de Goiás', en:'Association of Warrant Officers and Sergeants of Goiás' },
    role:{ pt:'Estagiário de Desenvolvimento', en:'Development Intern' },
    points:{
      pt:[ 'Sistema de gestão de contratos com fluxo de aprovação, geração de PDF e histórico de alterações.',
           'Sistemas de gestão, dashboards e relatórios usados por mais de 100 funcionários do administrativo e do financeiro, com filtros e exportação em PDF/Excel.',
           'Integração com as APIs de pagamento do Sicoob e do Itaú: emissão de boletos, retorno de pagamentos e rotinas de cobrança.',
           'PWA usado por cerca de 9 mil associados, com foco em responsividade e uso no celular.',
           'Manutenção em aplicações Java 7/8 em JBoss EAP 6 e 7 e correções em telas Angular.',
           'Modelagem MySQL/PostgreSQL, versionamento com Git e deploy em Linux.' ],
      en:[ 'Contract management system with approval flow, PDF generation and change history.',
           'Management systems, dashboards and reports used by more than 100 admin and finance staff, with filters and PDF/Excel export.',
           'Integration with Sicoob and Itaú payment APIs: invoice issuing, payment callbacks and billing routines.',
           'A PWA used by around 9,000 members, built mobile-first.',
           'Maintenance on Java 7/8 applications running on JBoss EAP 6 and 7, plus fixes on Angular screens.',
           'MySQL/PostgreSQL modelling, Git versioning and Linux deployment.' ]
    },
    tags:['PHP','TypeScript','React','Next.js','MySQL','PostgreSQL','Java','JBoss','Docker','Linux']
  },
  {
    when:{ pt:'07/2023 — 04/2024', en:'Jul 2023 — Apr 2024' },
    where:'JHON CODE',
    org:{ pt:'Agência de desenvolvimento web', en:'Web development agency' },
    role:{ pt:'Estagiário de Desenvolvimento', en:'Development Intern' },
    points:{
      pt:[ 'Sistemas web sob medida para diversos clientes, do banco ao front.',
           'Painéis administrativos para que o cliente gerenciasse o próprio conteúdo sem depender de dev.',
           'Autenticação segura: hash de senha, sessões e controle de acesso por perfil.',
           'Modelagem de banco e diagramas de sistema antes de escrever código.' ],
      en:[ 'Custom web systems for a range of clients, from database to front end.',
           'Admin panels so clients could manage their own content without a developer.',
           'Secure authentication: password hashing, sessions and role-based access control.',
           'Database modelling and system diagrams before writing code.' ]
    },
    tags:['PHP','JavaScript','HTML','CSS','MySQL','APIs REST']
  },
  {
    when:{ pt:'01/2023 — 06/2023', en:'Jan 2023 — Jun 2023' },
    where:'FIO GUIA',
    org:{ pt:'Controle financeiro para médicos', en:'Financial control for physicians' },
    role:{ pt:'Estagiário de Desenvolvimento', en:'Development Intern' },
    points:{
      pt:[ 'Primeiro contato profissional com desenvolvimento, em produto financeiro real.',
           'SQL, Flutter e integração de APIs no aplicativo dos clientes.',
           'Fluxos de automação de conversas no WhatsApp com Manychat.' ],
      en:[ 'First professional development role, on a real financial product.',
           'SQL, Flutter and API integration in the client-facing app.',
           'WhatsApp conversation automation flows with Manychat.' ]
    },
    tags:['SQL','Flutter','APIs','Manychat']
  },
  {
    when:{ pt:'01/2023 — 06/2025', en:'Jan 2023 — Jun 2025' },
    where:'Faculdade Senac Goiás',
    org:{ pt:'Formação concluída', en:'Degree completed' },
    role:{ pt:'Análise e Desenvolvimento de Sistemas', en:'Systems Analysis and Development' },
    points:{
      pt:[ 'Engenharia de software, qualidade de software, banco de dados e metodologias ágeis.' ],
      en:[ 'Software engineering, software quality, databases and agile methodologies.' ]
    },
    tags:['Scrum','Engenharia de Software','Qualidade de Software']
  },
  {
    when:{ pt:'Concluído em 2026', en:'Completed 2026' },
    where:'UFG',
    org:{ pt:'Centro de Línguas da Universidade Federal de Goiás', en:'Language Centre, Federal University of Goiás' },
    role:{ pt:'Inglês, nível B2', en:'English, CEFR B2' },
    points:{
      pt:[ '480 horas, nível B2 do Quadro Comum Europeu.', 'Vivência na Alemanha.' ],
      en:[ '480 hours, CEFR level B2.', 'Time spent living in Germany.' ]
    },
    tags:[]
  }
];

/* ---------------------------------------------------------------------
   3. ENTREGAS
   --------------------------------------------------------------------- */
const WORK = [
  { title:{ pt:'Gestão de contratos', en:'Contract management' },
    desc:{ pt:'Cadastro, fluxo de aprovação em etapas, geração de documento em PDF e histórico completo de alterações. Substituiu um processo que vivia em planilha e e-mail.',
           en:'Registration, staged approval flow, PDF document generation and a full change history. It replaced a process that lived in spreadsheets and email.' },
    stack:['PHP','MySQL','JavaScript','PDF'] },

  { title:{ pt:'Dashboards gerenciais', en:'Management dashboards' },
    desc:{ pt:'Relatórios para o administrativo e o financeiro com filtros combinados e exportação em PDF e Excel — o que antes exigia pedir número para o TI.',
           en:'Reports for admin and finance with combined filters and PDF/Excel export — numbers that used to require asking IT.' },
    stack:['React','TypeScript','PostgreSQL'] },

  { title:{ pt:'Integração Sicoob e Itaú', en:'Sicoob and Itaú integration' },
    desc:{ pt:'Emissão de boletos, leitura do retorno de pagamento e rotinas automáticas de cobrança. A parte do sistema que não pode errar valor nem data.',
           en:'Invoice issuing, payment callback processing and automated billing routines. The part of the system that cannot get an amount or a date wrong.' },
    stack:['PHP','APIs REST','Webhooks','MySQL'] },

  { title:{ pt:'PWA do associado', en:'Members’ PWA' },
    desc:{ pt:'Aplicativo instalável usado por cerca de 9 mil associados para acessar seus dados pelo celular, com layout pensado primeiro para tela pequena.',
           en:'An installable app used by around 9,000 members to reach their data from a phone, laid out for the small screen first.' },
    stack:['Next.js','TypeScript','PWA'] },

  { title:{ pt:'Automação de rotinas internas', en:'Internal routine automation' },
    desc:{ pt:'Importação de arquivos, geração de relatórios agendada e disparo de e-mail com PHPMailer. Horas de trabalho manual por mês que deixaram de existir.',
           en:'File imports, scheduled report generation and email delivery with PHPMailer. Hours of manual work per month that simply stopped existing.' },
    stack:['PHP','Cron','PHPMailer','Linux'] },

  { title:{ pt:'Manutenção de legado Java', en:'Java legacy maintenance' },
    desc:{ pt:'Deploy de WAR, ajuste de datasource e investigação de erro por log em Java 7/8 sobre JBoss EAP 6 e 7, além de correções em telas Angular.',
           en:'WAR deployment, datasource configuration and log-driven debugging on Java 7/8 over JBoss EAP 6 and 7, plus fixes on Angular screens.' },
    stack:['Java 7/8','JBoss EAP','Angular'] }
];

/* ---------------------------------------------------------------------
   4. CERTIFICADOS
   Coloque as imagens em assets/img/certificados/ e adicione aqui.
   Se o arquivo não existir, o card mostra um placeholder — sem quebrar.
   fit:'top' -> para certificado em pé (A4 retrato), o card mostra o topo,
   onde ficam o nome do curso e a carga horária. O clique abre a imagem inteira.
   --------------------------------------------------------------------- */
const CERTS = [
  { img:'assets/img/certificados/diploma-ads-senac.webp',
    title:{ pt:'Tecnólogo em Análise e Desenvolvimento de Sistemas', en:'Technologist in Systems Analysis and Development' },
    meta:'Faculdade Senac Goiás, diploma, 2025' },

  { img:'assets/img/certificados/ingles-b2-ufg.webp',
    title:{ pt:'Inglês — nível B2', en:'English — CEFR B2' },
    meta:'UFG, Centro de Línguas, 480h, 2026' },

  { img:'assets/img/certificados/ifro-web.webp', fit:'top',
    title:{ pt:'Programação para Web', en:'Web Programming' },
    meta:'Cursa, IFRO, 14h37, 2025' },

  { img:'assets/img/certificados/ifro-analise-projeto.webp', fit:'top',
    title:{ pt:'Análise e projeto de sistemas', en:'Systems Analysis and Design' },
    meta:'Cursa, IFRO, 11h02, 2025' },

  { img:'assets/img/certificados/ifro-logica.webp', fit:'top',
    title:{ pt:'Linguagem e lógica de programação', en:'Programming Logic and Languages' },
    meta:'Cursa, IFRO, 09h32, 2025' },

  { img:'assets/img/certificados/ifro-banco-de-dados.webp', fit:'top',
    title:{ pt:'Banco de dados completo', en:'Complete Database Course' },
    meta:'Cursa, IFRO, 06h16, 2025' },

  { img:'assets/img/certificados/ifro-estrutura-dados.webp', fit:'top',
    title:{ pt:'Estrutura de dados', en:'Data Structures' },
    meta:'Cursa, IFRO, 04h27, 2025' },

  { img:'assets/img/certificados/ev-seguranca-ti.webp',
    title:{ pt:'Segurança em Tecnologia da Informação', en:'Information Technology Security' },
    meta:'Fundação Bradesco, Escola Virtual, 12h, 2025' },

  { img:'assets/img/certificados/ev-hardware-software.webp',
    title:{ pt:'Fundamentos de TI: hardware e software', en:'IT Fundamentals: Hardware and Software' },
    meta:'Fundação Bradesco, Escola Virtual, 7h, 2025' },

  { img:'assets/img/certificados/ev-sharepoint.webp',
    title:{ pt:'SharePoint', en:'SharePoint' },
    meta:'Fundação Bradesco, Escola Virtual, 2h, 2025' }
];


/* ---------------------------------------------------------------------
   4.5 CÓDIGO ABERTO
   O projeto pessoal que qualquer pessoa pode abrir e ler.
   `repo` é usado para buscar a data do último commit na API do GitHub.
   --------------------------------------------------------------------- */
const GITHUB_USER = 'MatheusMorais1234';

const OPEN_SOURCE = {
  repo: 'freelamanager',
  url: 'https://github.com/MatheusMorais1234/freelamanager',
  title: 'freelamanager',
  tagline:{ pt:'Gestor de clientes e contratos para freelancers',
            en:'Client and contract manager for freelancers' },
  desc:{ pt:'Projeto pessoal full-stack: cadastro de clientes, contratos e acompanhamento de trabalhos. Autenticação com JWT, API em Express, banco modelado no Prisma sobre PostgreSQL e front em React com Vite. É o mesmo tipo de sistema que eu construo no trabalho — só que este dá para abrir e ler.',
         en:'A personal full-stack project: client records, contracts and job tracking. JWT authentication, an Express API, a Prisma-modelled PostgreSQL database and a React front end on Vite. It is the same kind of system I build at work — except this one you can open and read.' },
  stack:['React','Vite','Express','Node.js','Prisma','PostgreSQL','JWT'],
  fallbackDate:'2026-08-18'
};

const OTHER_REPOS = {
  pt:'Também há repositórios de estudo de POO e princípios SOLID em Java, do período em que comecei na stack.',
  en:'There are also study repositories on OOP and SOLID principles in Java, from when I started with that stack.'
};

/* ---------------------------------------------------------------------
   6. SERVIÇOS  —  DESLIGADOS NO MOMENTO

   O site está apontado para recrutador de empresa, não para cliente de
   freelance. Com a chave abaixo em `false`, a seção de serviços e o link
   dela no menu simplesmente não são escritos na página.

   Para ligar de novo: troque para `true` e rode
       node _ferramentas/gerar-estatico.mjs
   Nada mais precisa ser mexido — o conteúdo continua todo aqui embaixo.
   --------------------------------------------------------------------- */
const MOSTRAR_SERVICOS = false;

/* ---------------------------------------------------------------------
   6.1 SERVIÇOS
   O que dá para contratar, com escopo, prazo e ponto de partida de preço.

   Não há preço aqui de propósito: o valor sai na conversa, depois que dá
   para entender o tamanho real do escopo. O que a página promete é escopo
   e prazo — isso sim precisa estar certo.

   items: o que entra no pacote (3 a 5 itens, curtos).
   term:  prazo típico, já contando revisão.
   --------------------------------------------------------------------- */
const SERVICES = [
  {
    title:{ pt:'Site institucional', en:'Business website' },
    desc:{ pt:'Site de uma ou várias páginas para quem precisa ser encontrado e passar confiança: rápido, responsivo e preparado para o Google.',
           en:'A one-page or multi-page site for businesses that need to be found and to look trustworthy: fast, responsive and search-ready.' },
    items:{ pt:['Layout sob medida, sem tema pronto','Responsivo do celular ao desktop','SEO técnico e Google Analytics','Formulário de contato e WhatsApp','Publicação no domínio e hospedagem'],
            en:['Custom layout, no off-the-shelf theme','Responsive from phone to desktop','Technical SEO and Google Analytics','Contact form and WhatsApp','Domain and hosting setup'] },
    term:{ pt:'2 a 4 semanas', en:'2 to 4 weeks' },
    stack:['HTML','CSS','JavaScript','PHP']
  },
  {
    title:{ pt:'Sistema de gestão sob medida', en:'Custom management system' },
    desc:{ pt:'O sistema que a sua operação precisa e que nenhum software de prateleira faz do jeito certo: cadastro, fluxo de aprovação, relatório e histórico.',
           en:'The system your operation actually needs and no off-the-shelf tool gets right: records, approval flows, reporting and full history.' },
    items:{ pt:['Levantamento do processo antes de codar','Login por usuário e nível de acesso','Cadastros, fluxos e histórico de alterações','Relatórios em PDF e Excel','Treinamento da equipe na entrega'],
            en:['Process mapping before any code','Per-user login and access levels','Records, workflows and change history','PDF and Excel reporting','Team training at handover'] },
    term:{ pt:'6 a 12 semanas', en:'6 to 12 weeks' },
    stack:['PHP','TypeScript','React','MySQL','PostgreSQL']
  },
  {
    title:{ pt:'Integração de pagamento', en:'Payment integration' },
    desc:{ pt:'Boleto, Pix e retorno de pagamento conectados ao seu sistema. É a parte que não pode errar valor nem data — e é exatamente o que eu faço todo dia.',
           en:'Bank slips, Pix and payment callbacks wired into your system. This is the part that cannot get an amount or a date wrong — and it is what I do every day.' },
    items:{ pt:['Emissão de boleto e Pix pela API do banco','Leitura automática do retorno de pagamento','Baixa automática e régua de cobrança','Log de cada chamada para auditoria','Homologação junto ao banco'],
            en:['Bank slip and Pix issuing through the bank API','Automatic reading of payment callbacks','Automatic reconciliation and dunning','Full call logging for auditing','Bank homologation support'] },
    term:{ pt:'3 a 6 semanas', en:'3 to 6 weeks' },
    stack:['PHP','APIs REST','Webhooks','Sicoob','Itaú']
  },
  {
    title:{ pt:'Automação de rotinas', en:'Routine automation' },
    desc:{ pt:'Aquela planilha que alguém preenche toda segunda, o relatório que é montado na mão, o e-mail que é enviado um a um. Isso vira rotina agendada.',
           en:'That spreadsheet someone fills in every Monday, the report assembled by hand, the email sent one by one. All of it becomes a scheduled routine.' },
    items:{ pt:['Importação e tratamento de arquivos','Relatório gerado e enviado no horário','Disparo de e-mail automático','Alerta quando algo falha'],
            en:['File import and processing','Reports generated and delivered on schedule','Automated email delivery','Alerts when something fails'] },
    term:{ pt:'1 a 3 semanas', en:'1 to 3 weeks' },
    stack:['PHP','Node.js','Cron','Linux']
  }
];

/* ---------------------------------------------------------------------
   7. FORMULÁRIO DE CONTATO
   O site é estático — não há servidor para receber o POST. Então o envio
   passa pelo Web3Forms, que é gratuito e não exige backend.

   COMO LIGAR (2 minutos):
     1. Vá em https://web3forms.com e informe seu e-mail.
     2. A chave chega no seu e-mail. Cole no `key` abaixo.
   Enquanto a chave for a string 'SUA-CHAVE-WEB3FORMS-AQUI', o formulário
   continua funcionando: ele monta a mensagem e abre o WhatsApp já
   preenchido. Ou seja, o site nunca fica sem caminho de contato.
   --------------------------------------------------------------------- */
const FORM = {
  key: 'eb64cdc3-0d64-4e1b-a908-3bdfc20db800',
  endpoint: 'https://api.web3forms.com/submit',
  whatsapp: '5562992014463'
};
