/* =====================================================================
   i18n.js — textos fixos em português e inglês.
   Qualquer elemento com data-i18n="chave" é traduzido automaticamente.
   Os textos em português também estão escritos no index.html, para quem
   lê a página sem rodar JavaScript (robô de ATS, preview de link).
   Se editar um aqui, edite o mesmo trecho lá.
   ===================================================================== */

const I18N = {
  pt:{
    /* usados no <head>: title, description e Open Graph acompanham o idioma */
    'meta.title':'Matheus Morais — Desenvolvedor Full-Stack',
    'meta.desc':'Desenvolvedor full-stack júnior em Goiânia. Sistemas de gestão, dashboards financeiros e integrações de pagamento em produção desde 2023, com PHP, TypeScript, React e Next.js.',
    'meta.ogDesc':'Desenvolvedor full-stack júnior em Goiânia. Sistemas de gestão, relatórios financeiros e integrações bancárias em produção desde 2023.',

    'skip':'Pular para o conteúdo',

    'nav.about':'Sobre',
    'nav.path':'Experiência',
    'nav.work':'Projetos',
    'nav.tools':'Ferramentas',
    'nav.stack':'Tecnologias',
    'nav.certs':'Certificados',
    'nav.services':'Serviços',
    'nav.cta':'Contato',
    'nav.cv':'Currículo',

    'hero.status':'Disponível para início imediato em vagas de desenvolvedor júnior',
    'hero.title':'Sistemas de gestão, relatórios financeiros e integrações bancárias em produção desde 2023.',
    'hero.lede':'Sou Matheus Morais, desenvolvedor full-stack em Goiânia. Na ASSEGO, criei e mantive os sistemas de gestão usados por mais de 100 funcionários e o aplicativo de cerca de 9 mil associados, com cobrança integrada ao Sicoob e ao Itaú.',
    'hero.ctaPrimary':'Entrar em contato',
    'hero.ctaSecondary':'Baixar currículo (PDF)',
    'hero.photo':'Matheus Morais',

    'facts.now':'Disponibilidade',
    'facts.nowV':'Imediata, em Goiânia ou remoto',
    'facts.exp':'Experiência',
    'facts.expV':'Desde 2023, em três empresas',
    'facts.edu':'Formação',
    'facts.eduV':'Análise e Desenvolvimento de Sistemas, Senac Goiás',
    'facts.lang':'Idiomas',
    'facts.langV':'Português nativo, inglês B2',

    'about.h':'Sobre',
    'about.p1':'Comecei em 2023 e passei a maior parte desse tempo dentro de sistemas que já existiam: código legado, banco cheio de dado real e usuário esperando do outro lado. Foi assim que aprendi a ler antes de escrever.',
    'about.p2':'Até outubro de 2026 trabalhei na ASSEGO, uma associação com cerca de 9 mil associados, mantendo e criando os sistemas internos usados por mais de 100 funcionários: contratos, financeiro, relatórios, cobrança e o aplicativo dos associados. No último ano lá passei a atuar também em Java corporativo (Java 7/8 em JBoss EAP) e em telas Angular — em nível inicial, mas já entregando manutenção com autonomia.',
    'about.p3':'Sou formado em Análise e Desenvolvimento de Sistemas pelo Senac Goiás e tenho certificado de inglês nível B2 pelo Centro de Línguas da UFG (480 horas), além de vivência na Alemanha. Procuro uma vaga de desenvolvedor júnior onde eu possa aprofundar essa stack e crescer junto com um time que revisa código.',

    'services.h':'Serviços',
    'services.sub':'Escopo e prazo na mesa. O orçamento sai depois da primeira conversa, quando já dá para ver o tamanho real do trabalho.',
    'services.includes':'O que entra',
    'services.term':'Prazo típico',
    'services.cta':'Pedir orçamento',
    'services.note':'Cada projeto é orçado sob medida: o que pesa é o tamanho do escopo e quanta integração externa entra. O valor é fechado antes de começar, não no meio.',

    'path.h':'Experiência',
    'path.sub':'Do mais recente ao mais antigo.',

    'work.h':'Sistemas em produção',
    'work.sub':'São sistemas internos, então não há link público. Aqui está o problema que cada um resolve e com o que foi feito.',

    'tools.h':'Ferramentas',
    'tools.sub':'Utilitários de pagamento que qualquer pessoa pode usar. Rodam no navegador, sem enviar dados, com as mesmas regras das integrações bancárias que faço no trabalho.',
    'tools.pixH':'Gerador de Pix copia e cola e QR Code',
    'tools.pixP':'Monta o código no padrão BR Code do Banco Central, com CRC16, e lê um código recebido para conferir se ele foi alterado.',
    'tools.boletoH':'Validador de boleto',
    'tools.boletoP':'Confere os dígitos verificadores em módulo 10 e 11, identifica banco, valor e vencimento, e desenha o código de barras Intercalado 2 de 5.',
    'tools.cnabH':'Leitor de arquivo de retorno CNAB',
    'tools.cnabP':'Abre o retorno de cobrança do banco e mostra quem pagou, quanto foi creditado e o que foi rejeitado, conferindo os totais do trailer. CNAB 240 e 400 do Itaú.',

    'stack.h':'Tecnologias',
    'stack.sub':'Agrupadas pelo quanto eu uso hoje. Abra qualquer uma para ver onde ela entrou no trabalho.',

    'proj.h':'Projetos',
    'proj.sub':'Três sistemas que construí por conta própria. Todos estão no ar.',
    'proj.more':'Também há repositórios de estudo de POO e princípios SOLID em Java.',
    'code.h':'Código aberto',
    'code.sub':'Os sistemas do trabalho são fechados. Este não é.',
    'code.cta':'Ver o código no GitHub',
    'code.demo':'Abrir a demo',
    'code.builtWith':'Construído com',
    'code.profile':'Todos os repositórios',
    'code.updated':'Último commit em',

    'certs.h':'Certificados',
    'certs.sub':'Formação e cursos. Clique em um certificado para ampliar.',
    'certs.enlarge':'Ampliar',

    'contact.h':'Contato',
    'contact.lead':'Procurando um desenvolvedor júnior que já colocou sistema em produção?',
    'contact.sub':'Posso começar imediatamente, presencial em Goiânia ou remoto. Respondo em até um dia útil.',
    'contact.cv':'Baixar currículo (PDF)',
    'contact.direct':'Contato direto',

    'form.legend':'Enviar mensagem',
    'form.name':'Nome',
    'form.namePh':'Seu nome',
    'form.email':'E-mail',
    'form.emailPh':'nome@empresa.com.br',
    'form.phone':'WhatsApp',
    'form.phonePh':'(62) 90000-0000',
    'form.optional':'opcional',
    'form.subject':'Assunto',
    'form.s1':'Vaga efetiva (CLT)',
    'form.s2':'Vaga PJ ou contrato',
    'form.s3':'Conversar sobre uma oportunidade',
    'form.s4':'Outro assunto',
    'form.msg':'Mensagem',
    'form.msgPh':'A empresa, a vaga e o que você gostaria de saber. Se tiver o link da vaga, cole aqui.',
    'form.send':'Enviar mensagem',
    'form.sending':'Enviando…',
    'form.ok':'Mensagem enviada. Respondo em até um dia útil.',
    'form.err':'A mensagem não foi enviada. Tente de novo ou fale comigo pelo WhatsApp.',
    'form.wa':'O WhatsApp foi aberto com a sua mensagem pronta. É só enviar por lá.',
    'form.privacy':'Seus dados vão direto para o meu e-mail e não são repassados a ninguém.',

    'lbox.label':'Certificado',
    'lbox.close':'Fechar',
    'lbox.prev':'Anterior',
    'lbox.next':'Próximo',

    'foot.top':'Voltar ao topo'
  },

  en:{
    'meta.title':'Matheus Morais — Full-Stack Developer',
    'meta.desc':'Junior full-stack developer in Goiânia, Brazil. Management systems, financial dashboards and payment integrations in production since 2023, with PHP, TypeScript, React and Next.js.',
    'meta.ogDesc':'Junior full-stack developer in Goiânia, Brazil. Management systems, financial reporting and banking integrations in production since 2023.',

    'skip':'Skip to content',

    'nav.about':'About',
    'nav.path':'Experience',
    'nav.work':'Projects',
    'nav.tools':'Tools',
    'nav.stack':'Technologies',
    'nav.certs':'Certificates',
    'nav.services':'Services',
    'nav.cta':'Contact',
    'nav.cv':'Résumé',

    'hero.status':'Available now for junior developer roles',
    'hero.title':'Management systems, financial reporting and banking integrations in production since 2023.',
    'hero.lede':'I am Matheus Morais, a full-stack developer in Goiânia, Brazil. At ASSEGO I built and maintained the management systems used by more than 100 staff and the app used by around 9,000 members, with billing integrated with Sicoob and Itaú.',
    'hero.ctaPrimary':'Get in touch',
    'hero.ctaSecondary':'Download résumé (PDF)',
    'hero.photo':'Matheus Morais',

    'facts.now':'Availability',
    'facts.nowV':'Immediate, in Goiânia or remote',
    'facts.exp':'Experience',
    'facts.expV':'Since 2023, across three companies',
    'facts.edu':'Education',
    'facts.eduV':'Systems Analysis and Development, Senac Goiás',
    'facts.lang':'Languages',
    'facts.langV':'Native Portuguese, English B2',

    'about.h':'About',
    'about.p1':'I started in 2023 and spent most of that time inside systems that already existed: legacy code, a database full of real data and a user waiting on the other side. That is how I learned to read before writing.',
    'about.p2':'Until October 2026 I worked at ASSEGO, an association with around 9,000 members, maintaining and building the internal systems used by more than 100 staff: contracts, finance, reporting, billing and the members’ app. In my last year there I also worked on corporate Java (Java 7/8 on JBoss EAP) and Angular screens — early level, but already handling maintenance on my own.',
    'about.p3':'I hold a degree in Systems Analysis and Development from Senac Goiás and a B2 English certificate from the UFG Language Centre (480 hours), and I have lived in Germany. I am looking for a junior developer role where I can go deeper into this stack and grow with a team that reviews code.',

    'services.h':'Services',
    'services.sub':'Scope and timeline up front. The quote comes after the first conversation, once the real size of the work is clear.',
    'services.includes':'What is included',
    'services.term':'Typical timeline',
    'services.cta':'Request a quote',
    'services.note':'Every project is quoted to fit: what drives it is the size of the scope and how much external integration is involved. The price is fixed before we start, not halfway through.',

    'path.h':'Experience',
    'path.sub':'Most recent first.',

    'work.h':'Systems in production',
    'work.sub':'These are internal systems, so there is no public link. Here is the problem each one solves and what it is built with.',

    'tools.h':'Tools',
    'tools.sub':'Payment utilities anyone can use, in Portuguese since they cover Brazilian payment standards. They run in the browser without sending data, using the same rules as the banking integrations I build at work.',
    'tools.pixH':'Pix payment code and QR generator',
    'tools.pixP':'Builds the code to the Central Bank’s BR Code standard, with CRC16, and reads a received code to check whether it was tampered with.',
    'tools.boletoH':'Boleto validator',
    'tools.boletoP':'Checks the modulo 10 and 11 check digits of Brazilian bank slips, identifies bank, amount and due date, and draws the Interleaved 2 of 5 barcode.',
    'tools.cnabH':'CNAB bank return file reader',
    'tools.cnabP':'Opens the collection return file a Brazilian bank sends back and shows who paid, what was credited and what was rejected, checking the trailer totals. CNAB 240 and Itaú’s CNAB 400.',

    'stack.h':'Technologies',
    'stack.sub':'Grouped by how much I use them today. Open any of them to see where it came into my work.',

    'proj.h':'Projects',
    'proj.sub':'Three systems I built on my own. All of them are live.',
    'proj.more':'There are also study repositories on OOP and SOLID principles in Java.',
    'code.h':'Open source',
    'code.sub':'The systems I build at work are closed. This one is not.',
    'code.cta':'Read the code on GitHub',
    'code.demo':'Open the live demo',
    'code.builtWith':'Built with',
    'code.profile':'All repositories',
    'code.updated':'Last commit',

    'certs.h':'Certificates',
    'certs.sub':'Education and courses. Click a certificate to enlarge it.',
    'certs.enlarge':'Enlarge',

    'contact.h':'Contact',
    'contact.lead':'Looking for a junior developer who has already shipped systems to production?',
    'contact.sub':'I can start right away, on-site in Goiânia or remote. I reply within one business day.',
    'contact.cv':'Download résumé (PDF)',
    'contact.direct':'Direct contact',

    'form.legend':'Send a message',
    'form.name':'Name',
    'form.namePh':'Your name',
    'form.email':'Email',
    'form.emailPh':'name@company.com',
    'form.phone':'WhatsApp',
    'form.phonePh':'+55 62 90000-0000',
    'form.optional':'optional',
    'form.subject':'Subject',
    'form.s1':'Full-time role',
    'form.s2':'Contract role',
    'form.s3':'Discuss an opportunity',
    'form.s4':'Something else',
    'form.msg':'Message',
    'form.msgPh':'The company, the role, and anything you would like to know. Paste the job link if you have one.',
    'form.send':'Send message',
    'form.sending':'Sending…',
    'form.ok':'Message sent. I reply within one business day.',
    'form.err':'The message was not sent. Try again or reach me on WhatsApp.',
    'form.wa':'WhatsApp opened with your message ready. Just send it there.',
    'form.privacy':'Your details go straight to my inbox and are never shared.',

    'lbox.label':'Certificate',
    'lbox.close':'Close',
    'lbox.prev':'Previous',
    'lbox.next':'Next',

    'foot.top':'Back to top'
  }
};
