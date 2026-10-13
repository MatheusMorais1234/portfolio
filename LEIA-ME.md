# matheusmorais.com

Portfólio estático — HTML, CSS e JavaScript escritos à mão. Sem framework, sem
CDN externo, sem nada rodando no servidor: é só subir os arquivos.

O único script de apoio é o `_ferramentas/gerar-estatico.mjs`, que roda na sua
máquina antes do upload e é **opcional** — o site funciona sem ele.

---

## 1. O que falta você colocar

| Arquivo | O que é | Obrigatório |
|---|---|---|
| ~~`assets/img/matheus.jpeg`~~ | ✅ Já está lá. Enquadramento ajustado via `object-position` no CSS. | feito |
| ~~`assets/Curriculo_Matheus_Renato.pdf`~~ | ✅ PT e EN no ar. O botão troca de arquivo junto com o idioma. | feito |
| `assets/img/certificados/*.jpg` | ✅ 9 itens no ar: diploma do Senac, inglês B2 e 7 cursos. | feito |
| `assets/img/og.jpg` | Imagem de preview ao compartilhar o link (1200×630). Pode ser um print do site. | recomendado |

**Dica sobre a foto:** ela aparece sempre colorida, com um leve zoom quando o
mouse passa por cima. Foto com fundo simples e luz boa funciona melhor.

**Certificados:** o layout espera imagens deitadas (4:3). Se o certificado for
um PDF, exporte só a página do certificado como JPG. Coloque em
`assets/img/certificados/` e edite a lista em `assets/js/data.js`.

**Certificado em pé (A4 retrato):** marque `fit:'top'` no item em `data.js`.
O card mostra o topo do documento (nome do curso e carga horária) e o clique
abre a imagem inteira.

> ⚠️ **Nunca deixe o PDF original dentro de `assets/`.** Tudo que está em
> `public_html` pode ser baixado por qualquer pessoa que digite a URL direta —
> e certificados costumam ter páginas de histórico com CPF, RG e data de
> nascimento. Todos os PDFs originais estão em `_nao-publicar/`,
> que **não deve ser enviada** para o servidor.
>
> **O que foi retirado antes de publicar:** a assinatura de punho nos 5
> certificados da Cursa; a data de nascimento, o RG e o código de validação no
> diploma do Senac. O **histórico escolar não foi publicado** — traz CPF, RG,
> matrícula e notas.

---

## 2. Como editar o conteúdo

Praticamente tudo mora em **`assets/js/data.js`** — não precisa mexer no HTML:

- `STACK` — as tecnologias e, em cada uma, **onde você usou de verdade**.
  O `level` (`solid`, `working`, `early`) decide em qual grupo ela aparece.
- `TIMELINE` — empresas, cargos e o que você entregou em cada uma.
- `SERVICES` — os pacotes de serviço, com escopo e prazo. **Hoje desligados**
  pela chave `MOSTRAR_SERVICOS` — veja a seção 2.1.
- `WORK` — os sistemas em produção.
- `CERTS` — os certificados.
- `OPEN_SOURCE` — o projeto em destaque na seção "código aberto".
- `FORM` — a chave do formulário de contato e o número do WhatsApp.

Cada campo tem duas versões: `pt` e `en`. Se editar um, edite o outro.

Os textos fixos (hero, títulos de seção, menu, rodapé) ficam em **`assets/js/i18n.js`**.
Qualquer elemento no HTML com `data-i18n="chave"` é traduzido automaticamente.

> ⚠️ A versão em português desses textos também está escrita no `index.html`,
> porque é ela que o preview de link e o robô de ATS leem. Se mudar uma frase
> no `i18n.js`, mude a mesma frase no `index.html`.

A marcação dos blocos gerados (experiência, projetos, tecnologias,
certificados) mora em **`assets/js/render.js`**, usado tanto pelo navegador
quanto pelo `gerar-estatico.mjs`.

Cores, tipografia e espaçamento estão nas variáveis do topo de
**`assets/css/style.css`** (`:root`).

---

## 2.1 A seção de serviços está desligada

O site hoje fala com **recrutador de empresa**, não com cliente de freelance.
A seção de serviços continua pronta no projeto, só não é publicada.

O interruptor é uma linha só, no `assets/js/data.js`:

```js
const MOSTRAR_SERVICOS = false;
```

Para ligar de novo:

1. Troque para `true`.
2. Rode `node _ferramentas/gerar-estatico.mjs`.

Pronto. A seção volta com os 4 pacotes, o link reaparece no menu e no menu do
celular, e os botões "quero um orçamento disso" voltam a levar ao formulário.
Desligado, nada disso é escrito no HTML — não fica marcação morta na página.

O conteúdo dos pacotes está em `SERVICES`, no mesmo arquivo: título, descrição,
o que entra e prazo. **Não há preço** — a ideia é que o valor saia na conversa,
depois de entender o tamanho real do escopo.

> Se você ligar a seção, revise antes o texto do contato e do hero: eles hoje
> falam de vaga, não de projeto. As duas versões dos textos estão no
> `assets/js/i18n.js`.

---

## 2.2 Formulário de contato — ligue em 2 minutos

O site é estático, então não há servidor para receber o formulário. O envio
passa pelo **Web3Forms**, que é gratuito e não pede backend:

1. Entre em <https://web3forms.com> e informe o seu e-mail.
2. A chave de acesso chega no seu e-mail.
3. Cole a chave em `FORM.key`, no fim do `assets/js/data.js`.

**Enquanto a chave não estiver configurada, o formulário continua funcionando:**
ele monta a mensagem com tudo que a pessoa preencheu e abre o WhatsApp já
pronto para enviar. Dá para publicar hoje e configurar depois — o visitante
nunca fica sem caminho de contato.

O formulário tem um campo-armadilha invisível (`website`) contra robô de spam.
Se ele vier preenchido, o envio é descartado em silêncio.

---

## 2.3 Ferramentas públicas (/ferramentas)

Duas ferramentas que qualquer pessoa pode usar, linkadas na seção
"Ferramentas" do portfólio:

- `matheusmorais.com/ferramentas/pix/` — gera Pix copia e cola e QR Code, e lê
  um código recebido conferindo o CRC16.
- `matheusmorais.com/ferramentas/boleto/` — valida linha digitável e código de
  barras (boleto bancário e conta de consumo), mostra banco, valor e
  vencimento e desenha as barras.
- `matheusmorais.com/ferramentas/cnab/` — lê o arquivo de retorno de cobrança
  (CNAB 240 FEBRABAN e CNAB 400 do Itaú): quem pagou, quanto foi creditado, o
  que foi rejeitado, confere os totais do trailer e exporta CSV.

Tudo roda no navegador: nenhum servidor, nenhum dado enviado. As regras ficam em
`assets/js/ferramentas/pagamentos.js` e `assets/js/ferramentas/cnab.js`,
separadas das telas, e têm testes:

```bash
node _ferramentas/testar-pagamentos.mjs
```

Rode sempre que mexer no `pagamentos.js` ou no `cnab.js`. A suíte inclui o
exemplo oficial do manual do Pix do Banco Central, um boleto real do Banco do
Brasil e segmentos T/U do CNAB 240 montados campo a campo pelo manual.

> **Teste o leitor de CNAB com um retorno de verdade** do Sicoob e do Itaú
> antes de divulgar — cada banco tem particularidades. Faça isso só no seu
> computador (`python -m http.server`): o arquivo tem nome e CPF de pagador.

O QR Code é desenhado com a biblioteca `qrcode-generator` (licença MIT), salva
em `assets/js/vendor/qrcode.js` — hospedada no próprio domínio, como o resto.

---

## 3. Publicar na Hostinger

> Antes de qualquer upload, faça os dois passos da **seção 3.1** logo abaixo.

1. Painel Hostinger → **Arquivos → Gerenciador de arquivos**.
2. Entre em **`public_html`** e apague o `default.php` / `index.html` de exemplo.
3. Envie **o conteúdo desta pasta** (não a pasta em si):
   - `index.html`
   - `404.html`
   - `.htaccess`
   - `robots.txt`
   - `sitemap.xml`
   - a pasta `assets/` inteira
   - a pasta `ferramentas/` inteira

   **Não envie** `_nao-publicar/` nem `_ferramentas/`. As duas já estão
   bloqueadas no `.htaccess` caso subam por engano, mas o certo é não subir.
4. O jeito mais rápido: compacte tudo em um `.zip`, envie o zip e use
   **Extrair** no próprio gerenciador.
5. Abra `https://matheusmorais.com` — deve carregar direto.

### Sobre o `.htaccess`
Já vai configurado com: redirecionamento para HTTPS, remoção do `www`,
compressão gzip, cache de imagens/CSS/JS e os cabeçalhos de segurança.
Se o site der erro 500 depois do upload, o servidor pode não ter algum módulo —
nesse caso apague o `.htaccess` e o site volta a funcionar (só sem essas otimizações).

**Cabeçalhos enviados:** `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`,
`Strict-Transport-Security` e uma `Content-Security-Policy` restritiva.

A CSP libera exatamente o que o site usa: tudo de `'self'`, mais `data:` em
imagens (a textura de grão é um SVG embutido no CSS) e `https://api.github.com`
em `connect-src` (a data do último commit). Não há `'unsafe-inline'` em lugar
nenhum — se um dia você colar um `<script>` inline ou um `style="..."` no HTML,
**ele não vai rodar** até ser movido para um arquivo em `assets/`.

### SSL
Painel → **Segurança → SSL**. Ative o certificado gratuito antes de divulgar o link.

> ⚠️ O `Strict-Transport-Security` só é enviado em respostas HTTPS, mas depois
> que o navegador o recebe ele **passa um ano recusando** carregar o domínio em
> HTTP. Ative o SSL antes de subir o `.htaccess`, não depois.

---

## 3.1 Antes de subir: dois passos de um minuto

**a) Troque a versão dos arquivos.** O `index.html` carrega o CSS e o JS com
`?v=20261014` no fim do endereço, e o servidor manda o navegador guardar esses
arquivos por um ano (os currículos em PDF, por 30 dias). Se você editar o
`style.css` ou gerar um currículo novo e não trocar a versão, quem já visitou o
site **continua vendo o arquivo antigo**. Troque todos os `?v=` para a data do
dia — inclusive no `main.js`, que monta o link do currículo:

```bash
sed -i 's/?v=[0-9]\{8\}/?v=20261014/g' index.html 404.html ferramentas/index.html ferramentas/*/index.html assets/js/main.js
```

Se publicar duas vezes no mesmo dia, use a data do dia seguinte: o número só
precisa mudar, não precisa ser a data exata.

**Currículo:** o texto mora em `_ferramentas/gerar-curriculo.mjs`. Edite lá e
rode `node _ferramentas/gerar-curriculo.mjs` — ele gera os dois PDFs em
`assets/` usando o Chrome ou o Edge.

**b) Gere o conteúdo estático.**

```bash
node _ferramentas/gerar-estatico.mjs
```

Stack, trajetória, entregas e certificados são montados por JavaScript. Robô de
ATS, preview de link e leitor que não roda script veem um HTML vazio nessas
seções. O script escreve a versão em português direto no `index.html`, entre
marcadores `<!--g:nome-->`.

O site **não depende dele**: sem rodar nada, tudo funciona igual, porque o
`main.js` reescreve esses blocos ao carregar. Rodar só melhora o que os robôs
enxergam. Rodar duas vezes dá o mesmo resultado.

> A marcação vem do `render.js`, o mesmo arquivo que o navegador usa — o HTML
> gerado e o renderizado nunca divergem.

---

## 4. Rodar localmente

```bash
# dentro desta pasta
python -m http.server 5173
# abra http://127.0.0.1:5173
```

Abrir o `index.html` com dois cliques também funciona, mas usar um servidor
evita diferenças de caminho.

---

## 5. Currículo em PDF

São dois arquivos em `assets/`:

- `Curriculo_Matheus_Renato.pdf` — servido quando o site está em português
- `Matheus_Renato_Resume_EN.pdf` — servido quando está em inglês

O botão troca sozinho conforme o idioma. Nos dois, o e-mail, o telefone, o
LinkedIn, o GitHub e o site viraram links clicáveis (antes eram texto morto) e
o endereço do portfólio foi trocado de `matheusmorais1234.github.io` para
`matheusmorais.com`. Os arquivos que você enviou estão preservados em
`_nao-publicar/curriculos-originais/`.

Se você gerar um currículo novo, sobrescreva o arquivo com o mesmo nome — ou
troque o caminho em `assets/js/main.js`, na função `applyStrings`.

---

## 6. Detalhes técnicos

- **Design:** perfil institucional — fundo branco, texto azul-marinho, um azul
  de destaque e uma só família tipográfica. Cada seção tem o título na coluna
  da esquerda e o conteúdo na da direita. Cores e medidas nas variáveis do
  `:root` em `style.css`. O design anterior (escuro com verde-limão, GSAP,
  Lenis, loader) está guardado em `_nao-publicar/design-antigo/`.
- **Sem bibliotecas:** nenhum JavaScript de terceiros. O único movimento
  automático é a entrada do hero, em CSS. Tecnologias abrem e fecham com
  `<details>`, que funciona sem script.
- **Fonte:** Schibsted Grotesk (variável, 400–900), hospedada em
  `assets/fonts/` nos subconjuntos latin e latin-ext. O `<link rel="preload">`
  do `index.html` aponta para o arquivo latin — se trocar a fonte, atualize-o.
- **Sem JavaScript:** com o `gerar-estatico.mjs` rodado, todo o conteúdo em
  português já está no HTML e nada depende de animação para aparecer.
- **Impressão:** bloco `@media print` no fim do `style.css` — sem nav, sem
  formulário, links externos com o endereço escrito ao lado.
- **Acessibilidade:** foco visível, link "pular para o conteúdo",
  `prefers-reduced-motion` respeitado, e com o lightbox ou o menu abertos o
  resto da página fica `inert` e o foco volta para quem abriu.
- **Contraste:** todos os tokens de texto passam no WCAG AA sobre o branco
  (o menor, `--quiet`, está em 4,9:1).
- **SEO:** Open Graph, `sitemap.xml`, `robots.txt`, `hreflang` e dados
  estruturados schema.org do tipo `Person`.
- **Idioma na URL:** `matheusmorais.com/?lang=en` abre em inglês. A URL vence a
  escolha salva e o idioma do navegador.
- **Único recurso externo:** a API do GitHub, para a data do último commit,
  com cache de 6 horas no `localStorage` e data fixa do `data.js` como reserva.
- **Página 404:** `404.html`, própria, com `noindex`.
