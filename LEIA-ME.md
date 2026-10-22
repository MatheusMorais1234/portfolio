# matheusmorais.com

Meu portfólio. HTML, CSS e JavaScript puro, sem framework e sem CDN: é só subir os arquivos.

## Estrutura

- `index.html`: a página. A versão em português do conteúdo fica escrita direto aqui, pra preview de link e ATS lerem sem rodar JS.
- `assets/js/data.js`: quase todo o conteúdo (stack, experiência, projetos, certificados, contato), em `pt` e `en`.
- `assets/js/i18n.js`: textos fixos (hero, menu, títulos). Elementos com `data-i18n="chave"` são traduzidos. Se mudar uma frase aqui, mudar também no `index.html`.
- `assets/js/render.js`: monta os blocos gerados. É usado pelo navegador e pelo `gerar-estatico.mjs`, então os dois nunca divergem.
- `assets/css/style.css`: cores, fonte e espaçamentos nas variáveis do `:root`.
- `ferramentas/`: ferramentas de Pix, boleto e CNAB (abaixo).
- `_ferramentas/`: scripts que rodam só na minha máquina. Não vão pro servidor.

A seção de serviços existe mas está desligada (`MOSTRAR_SERVICOS = false` no `data.js`). Pra ligar: muda pra `true` e roda o `gerar-estatico.mjs`.

O formulário de contato usa o Web3Forms (chave em `FORM.key` no `data.js`). Sem a chave ele abre o WhatsApp com a mensagem pronta. Tem um campo escondido `website` como armadilha pra bot.

## Ferramentas

- `/ferramentas/pix/`: gera Pix copia e cola + QR Code e lê um código conferindo o CRC16.
- `/ferramentas/boleto/`: valida linha digitável e código de barras (bancário e convênio).
- `/ferramentas/cnab/`: lê retorno de cobrança CNAB 240 (FEBRABAN) e CNAB 400 (Itaú), confere os totais do trailer e exporta CSV.

Tudo roda no navegador, nada é enviado pra servidor. As regras ficam em `assets/js/ferramentas/pagamentos.js` e `cnab.js`, separadas das telas. Testes:

```bash
node _ferramentas/testar-pagamentos.mjs
```

Tem o exemplo do manual do Pix do BC, um boleto real do BB e segmentos T/U do CNAB 240 montados pelo manual.

O QR Code usa a `qrcode-generator` (MIT), salva em `assets/js/vendor/`.

## Rodar local

```bash
python -m http.server 5173
```

## Antes de publicar

1. Trocar a versão dos assets (o `.htaccess` manda cachear CSS/JS por 1 ano):

   ```bash
   sed -i 's/?v=[0-9]\{8\}/?v=AAAAMMDD/g' index.html 404.html ferramentas/index.html ferramentas/*/index.html assets/js/main.js
   ```

2. Gerar o HTML estático das seções montadas por JS:

   ```bash
   node _ferramentas/gerar-estatico.mjs
   ```

   Escreve entre os marcadores `<!--g:nome-->` no `index.html`. O site funciona sem isso, só melhora o que os robôs enxergam.

3. Se mexer no currículo: editar `_ferramentas/gerar-curriculo.mjs` e rodar. Gera os PDFs PT e EN em `assets/` usando o Chrome/Edge.

## Deploy

Hostinger, upload direto no `public_html`: `index.html`, `404.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `assets/` e `ferramentas/`. Não subir `_ferramentas/` (o `.htaccess` bloqueia mesmo assim).

O `.htaccess` faz: HTTPS, remove `www`, gzip, cache e cabeçalhos de segurança, incluindo HSTS e uma CSP sem `'unsafe-inline'`. Ou seja, script ou `style="..."` inline não rodam, tem que ir pra um arquivo em `assets/`. A CSP só libera `data:` em imagem e `api.github.com` (data do último commit).

## Outros detalhes

- Fonte Schibsted Grotesk hospedada em `assets/fonts/` (latin e latin-ext). O preload no `index.html` aponta pro arquivo latin.
- `?lang=en` na URL abre em inglês e tem prioridade sobre o idioma salvo e o do navegador.
- A data do último commit vem da API do GitHub com cache de 6h no `localStorage`, e uma data fixa do `data.js` como reserva.
- Acessibilidade: foco visível, "pular para o conteúdo", `prefers-reduced-motion`, e lightbox/menu deixam o resto da página `inert`. Os textos passam WCAG AA (o menor contraste é 4,9:1).
- `@media print` no fim do `style.css`: sem nav e com o endereço dos links escrito do lado.
