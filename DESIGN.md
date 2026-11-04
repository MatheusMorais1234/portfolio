---
name: Matheus Morais — Portfólio
description: A página inicial como abertura de filme, com projetos reais em cartaz.
colors:
  amber: "#e8b339"
  on-amber: "#0a0700"
  black: "#050505"
  bar-black: "#000000"
  ground: "#0b0a08"
  paper: "#f2efe6"
  dim: "#c7c2b5"
  quiet: "#9a968a"
  hint: "#8a867b"
  rule: "#25231f"
  rule-strong: "#3f3c34"
  status-error: "#ff8a75"
  status-ok: "#8fd6a0"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "min(20.1vw, 32svh)"
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(3.5rem, 2rem + 6.2vw, 7.5rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "0"
  title:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.5rem, 1.8rem + 2.6vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.005em"
  body:
    fontFamily: "'Barlow', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Barlow', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.03em"
rounded:
  none: "0"
spacing:
  gutter: "clamp(1.25rem, 3.4vw, 3rem)"
  bar: "clamp(60px, 10.2vh, 92px)"
  section: "clamp(5.5rem, 11vw, 10rem)"
components:
  button-solid:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem"
    height: "48px"
  button-solid-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-amber}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem"
    height: "48px"
  button-line-hover:
    textColor: "{colors.amber}"
  field:
    backgroundColor: "{colors.black}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.7rem 0.8rem"
    height: "48px"
  letterbox-bar:
    backgroundColor: "{colors.bar-black}"
    textColor: "{colors.dim}"
    height: "{spacing.bar}"
    padding: "0 {spacing.gutter}"
---

# Design System: Matheus Morais — Portfólio

Vale só para a página inicial (`index.html`, com `assets/css/cinema.css`, `assets/css/cinema-motion.css` e `assets/js/cinema.js`). `/ferramentas/`, `/servicos/` (marca Novum Digital) e `404.html` têm folhas próprias e ficam fora deste sistema de propósito.

## Overview

**Creative North Star: "A Sala de Projeção"**

A página abre como um filme: o nome do Matheus é o letreiro, cada projeto no ar é uma cena com filmagem real, a carreira vem como créditos, as tecnologias viram lista de elenco e o contato é o letreiro final. A sala fica às escuras para a filmagem aparecer. O visual existe para levar um tech lead até um projeto no ar ou até o código, sem nunca esconder cargo, disponibilidade e contato.

A densidade alterna de propósito. Títulos enormes ocupam a tela com poucas palavras, e os blocos de leitura logo ao lado são contidos, em Barlow, com linha curta. Não há cartões, sombras de interface nem cantos arredondados: a estrutura vem das tarjas pretas, de fios finos e do tamanho da letra.

**Key Characteristics:**
- Quase preto de cinema, branco quente e um único âmbar.
- Tarjas pretas de letterbox carregam navegação e ações.
- Letreiro condensado em tamanho enorme, leitura em Barlow.
- Filmagem real dos projetos no lugar de ilustração.
- Rolagem normal com profundidade contínua, e a página continua completa sem JavaScript, sem vídeo e sem movimento.

## Colors

Uma sala escura com texto em tom de papel e uma só luz acesa.

### Primary
- **Âmbar de Projetor:** preenche a ação principal e marca o que está ativo agora: item do menu, idioma selecionado, foco, hover e progresso das cenas. O cargo na abertura também usa esta cor.

### Neutral
- **Preto de Sala:** fundo geral da página e dos painéis de créditos.
- **Preto de Tarja:** tarjas, menu e seções que encostam nelas. O preto puro separa a moldura da sala.
- **Fundo de Formulário:** painel do formulário e reserva por trás de fotos e filmagens.
- **Papel:** texto principal e letreiros, com contraste de 17:1 sobre o preto.
- **Papel Apagado:** texto corrido secundário, 11:1.
- **Legenda:** datas, metadados e pilhas de tecnologia, 7:1.
- **Placeholder:** só dentro de campos, 5.6:1 sobre o fundo de formulário.
- **Fio e Fio Forte:** divisórias de lista e bordas de campo e de botão.

### Tertiary
- **Vermelho e Verde de Status:** só nas mensagens de erro e de sucesso do formulário.

### Named Rules
**The Uma Luz Acesa Rule.** O âmbar marca o que está ativo ou a próxima ação. Nunca é decoração, fundo de seção ou segundo destaque de texto corrido.

## Typography

**Display Font:** Big Shoulders Display (com Arial Narrow)
**Body Font:** Barlow (com a fonte de sistema)

**Character:** Letreiro de cinema condensado, sempre em caixa alta, contra uma sans técnica e calma. As fontes são locais, e os números são tabulares em toda a página.

### Hierarchy
- **Display** (900, até 20vw, 0.85): o nome na abertura.
- **Headline** (900, 3.5–7.5rem, 0.96): títulos de seção. Seções de apoio usam a escala menor de 3–5.5rem.
- **Title** (800, 2.5–4.25rem, 0.95): empresa nos créditos, nome de sistema, ferramenta e tecnologia, em tamanhos proporcionais.
- **Body** (400, 1.0625rem, 1.6): leitura corrida, com 58 a 70 caracteres por linha.
- **Label** (500, 0.875–0.9375rem): datas, metadados e rótulos, em caixa normal.

### Named Rules
**The Letreiro ou Leitura Rule.** Uma frase é letreiro ou é leitura. Parágrafos nunca vão em Big Shoulders, e títulos nunca vão em Barlow.

## Layout

A página é uma sequência de planos, cada um ocupando a altura da tela entre duas tarjas, e todos sobem em rolagem normal. A medida base é a tarja, com altura proporcional à tela, e as margens laterais usam um único recuo fluido. O conteúdo vai até 1520 px; créditos e elenco ficam em 1180 px, alinhados a um eixo central com lado direito e lado esquerdo.

As seis cenas têm enquadramentos próprios: filmagem e créditos lado a lado nas cenas 1, 2, 4 e 6, e faixa de créditos embaixo nas cenas 3 e 5. A filmagem e o texto nunca se sobrepõem. Nada de texto sobre a filmagem nas cenas.

Abaixo de 860 px, o menu vira um painel de tela cheia e as colunas viram uma só. A filmagem ocupa 60% da altura da tela, os créditos vêm logo abaixo, e a tarja com as ações gruda na base da tela enquanto a cena está visível. As ações principais nunca ficam mais de uma tela distantes.

**Movimento.** O `cinema.js` tem três modos: completo em telas grandes com ponteiro fino, leve (corte simples ao entrar na tela) em telas estreitas ou de toque, e parado sob `prefers-reduced-motion`. Nada fica preso à rolagem. No modo completo, o vídeo da abertura se aproxima de 1 para 1.08 enquanto a tela sobe, com o nome parado. Nas cenas, o vídeo se assenta de 1.1 para 1 e o texto desliza 7% da altura da tela até o lugar, sem mudar de opacidade. Os vídeos dos projetos são trechos contínuos, tocam uma vez e param no último quadro; só o da abertura repete, porque tem emenda invisível. As saídas usam desaceleração exponencial (`cubic-bezier(.16,1,.3,1)`).

## Elevation & Depth

O sistema é plano. Não há sombra de interface: a profundidade vem da filmagem atrás das tarjas e dos véus escuros sobre ela.

### Named Rules
**The Sala Escura Rule.** Superfícies não flutuam. Para separar duas coisas, use uma tarja, um fio ou o tom do fundo.

## Shapes

Todo canto é reto, inclusive botões e campos. O desenho vem de retângulos de letreiro e de fios de 1 px. Fotos e miniaturas são recortes retos, com o retrato e os certificados em tons tratados, e os certificados ganham cor no hover.

## Components

### Buttons
Retângulos de letreiro, diretos e sem ornamento.
- **Shape:** cantos retos, altura de 48 px. Na tarja da cena ficam com 40 px no desktop e 44 px no celular.
- **Primary:** fundo âmbar, texto quase preto, letreiro em caixa alta.
- **Hover / Focus:** o fundo vai para o papel. Foco com contorno âmbar de 2 px e afastamento de 3 px. Toque reduz a escala para .97.
- **Secondary:** só o fio forte, que fica âmbar no hover junto com o texto.

### Inputs / Fields
- **Style:** fundo de sala, fio forte, sem arredondamento, altura mínima de 48 px.
- **Focus:** borda e anel de 1 px em âmbar.
- **Error / Disabled:** o status do formulário usa vermelho ou verde; botão desativado fica com opacidade .6.

### Navigation
- **Top bar:** fixa, em preto puro, com o nome em letreiro à esquerda e links em Barlow à direita. Link ativo em âmbar, idioma ativo com filete âmbar embaixo.
- **Mobile:** botão de duas barras (44 px) abre painel de tela cheia com links em letreiro de 2.75rem. Sem JavaScript, os links ficam na própria tarja.

### Tarja de Cena
A faixa de baixo de cada projeto: número da cena, endereço no ar, ações e currículo, sempre na mesma posição. Quando a filmagem é uma maquete, a tarja diz isso ("maquete com números de exemplo"). No celular ficam só as ações e o currículo.

### Linha de Crédito
Empresa em letreiro e detalhes à direita; cargo e datas à esquerda, alinhados ao eixo. Certificados e tecnologias usam a mesma lógica de linhas com fio, em vez de cartões.

## Do's and Don'ts

### Do:
- **Do** mostrar filmagem real do projeto no ar e identificar como maquete o que for maquete.
- **Do** manter cargo, disponibilidade, contato e currículo ao alcance em qualquer ponto da rolagem.
- **Do** deixar a pessoa ler no próprio ritmo: conteúdo que se lê fica na tela enquanto ela não rolar para longe.
- **Do** manter a página completa sem JavaScript, sem vídeo e sob `prefers-reduced-motion`.
- **Do** usar âmbar só no que está ativo ou na próxima ação.
- **Do** manter botões, links e campos com pelo menos 44 px de área de toque no celular.

### Don't:
- **Don't** usar grade de cartões, fantasia de terminal ou hero de título com cartões: a direção escolhida rejeita os três.
- **Don't** voltar à identidade bancária e de boleto, aposentada como identidade visual.
- **Don't** usar tema claro nesta página: o escuro é decisão de marca.
- **Don't** arredondar cantos nem pôr sombra em superfícies.
- **Don't** pôr texto corrido sobre a filmagem.
- **Don't** fazer conteúdo aparecer e sumir conforme a rolagem, prender seções na tela ou trocar a tela em corte seco: o Matheus testou e reprovou porque não dava para ver nem ler.
- **Don't** usar vídeo com salto de imagem nem repetição visível.
- **Don't** apresentar depoimentos, logos de clientes ou métricas que não existem, nem apresentar o Matheus como sênior.
