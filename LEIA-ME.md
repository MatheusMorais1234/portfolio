# matheusmorais.com

Meu portfólio. HTML, CSS e JavaScript, sem framework e sem build: é só subir os arquivos.

## Estrutura

- `index.html` e `en/index.html`: a página em português e em inglês.
- `freelamanager.html` e `en/freelamanager.html`: estudo de caso do FreelaManager.
- `css/estilo.css`: todo o visual. As cores ficam nas variáveis do `:root`, com o tema escuro logo abaixo.
- `js/tema.js`: aplica o tema salvo antes de desenhar a página (fica no `<head>`).
- `js/site.js`: menu do celular, troca de tema, data do último commit (API do GitHub) e o formulário.
- `img/`, `fontes/` e `docs/` (os currículos em PDF).
- `ferramentas/`: Pix, boleto e CNAB (mais abaixo).
- `servicos/`: página para clientes, com marca própria.
- `_ferramentas/`: scripts que rodam só na minha máquina e não vão para o servidor.

O formulário de contato envia pelo Web3Forms. O `.htaccess` tem uma CSP que bloqueia script inline, então todo JavaScript fica em arquivo.

## Rodar local

```bash
python -m http.server 5173
```

## Ferramentas

- `/ferramentas/pix/`: gera Pix copia e cola com QR Code e confere o CRC16 de um código.
- `/ferramentas/boleto/`: valida linha digitável e código de barras.
- `/ferramentas/cnab/`: lê retorno CNAB 240 (FEBRABAN) e CNAB 400 (Itaú), confere os totais e exporta CSV.

Tudo roda no navegador. As regras ficam em `assets/js/ferramentas/`, separadas das telas. Testes:

```bash
node _ferramentas/testar-pagamentos.mjs
```

## Currículos

O texto fica em `_ferramentas/gerar-curriculo.mjs`. Para gerar os PDFs em `docs/` (precisa do Chrome ou do Edge):

```bash
node _ferramentas/gerar-curriculo.mjs
```

## Publicar

O `.htaccess` guarda CSS e JS em cache por um ano, por isso cada referência leva `?v=`. A tag `publicado` marca o último commit que está no servidor.

```bash
node _ferramentas/publicar.mjs --aplicar   # troca o ?v= do que mudou e lista o que subir
git commit -am "Versão nova dos arquivos"
# subir a lista na Hostinger (HTML por último)
node _ferramentas/verificar-no-ar.mjs       # páginas, ?v= e pastas privadas, no ar
node _ferramentas/publicar.mjs --marcar
```

O script nunca lista `_nao-publicar/`, `_gravacoes/`, `_ferramentas/` nem `.github/`.

## Testes

Rodam no GitHub Actions a cada push (`.github/workflows/testes.yml`):

```bash
node _ferramentas/testar-pagamentos.mjs
node --test "_ferramentas/*.test.mjs"
node _ferramentas/checar-links.mjs
```
