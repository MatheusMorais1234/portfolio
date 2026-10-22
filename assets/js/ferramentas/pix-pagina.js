/*
   pix-pagina.js — tela do gerador e leitor de Pix.
   As regras moram no pagamentos.js; aqui é só formulário e desenho.
   */
(() => {
'use strict';

const $ = s => document.querySelector(s);
const P = Pagamentos;

/*
   Abas (padrão WAI-ARIA: setas trocam de aba, Tab entra no painel)
   */
const abas = [...document.querySelectorAll('[role="tab"]')];

function ativa(aba, foco = false){
  abas.forEach(a => {
    const on = a === aba;
    a.setAttribute('aria-selected', String(on));
    a.tabIndex = on ? 0 : -1;
    document.getElementById(a.getAttribute('aria-controls')).hidden = !on;
  });
  if (foco) aba.focus();
}

abas.forEach((aba, i) => {
  aba.addEventListener('click', () => ativa(aba));
  aba.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length];
    ativa(prox, true);
  });
});

/* QR Code em SVG — um único <path>, nítido em qualquer tamanho */
const SVG = 'http://www.w3.org/2000/svg';
const MARGEM = 2;

function matrizQr(texto){
  const qr = qrcode(0, 'M');
  qr.addData(texto, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  const m = [];
  for (let r = 0; r < n; r++) { m.push([]); for (let c = 0; c < n; c++) m[r].push(qr.isDark(r, c)); }
  return m;
}

function desenhaSvg(matriz, alvo){
  const n = matriz.length + MARGEM * 2;
  let d = '';
  matriz.forEach((linha, r) => linha.forEach((escuro, c) => {
    if (escuro) d += `M${c + MARGEM} ${r + MARGEM}h1v1h-1z`;
  }));
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${n} ${n}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'QR Code do Pix');
  const fundo = document.createElementNS(SVG, 'rect');
  fundo.setAttribute('width', n); fundo.setAttribute('height', n); fundo.setAttribute('fill', '#fff');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', d); path.setAttribute('fill', '#0e1a2b');
  svg.append(fundo, path);
  alvo.replaceChildren(svg);
}

function baixaPng(matriz, nome){
  const escala = 12;
  const n = matriz.length + MARGEM * 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = n * escala;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  matriz.forEach((linha, r) => linha.forEach((escuro, c) => {
    if (escuro) ctx.fillRect((c + MARGEM) * escala, (r + MARGEM) * escala, escala, escala);
  }));
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, 'image/png');
}

async function copia(texto, campo){
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // clipboard bloqueado (http, iframe, navegador antigo): seleciona para Ctrl+C
    campo.focus();
    campo.select();
    return false;
  }
  return true;
}

/* Gerar */
const form = $('#formPix');
const CAMPOS = ['chave', 'nome', 'cidade', 'valor', 'descricao', 'txid'];
const tocado = new Set();   // só mostra erro de campo que a pessoa já mexeu
let matrizAtual = null;

function mostraErro(nome, msg){
  const input = form.elements[nome];
  const alvo = document.getElementById(`p-${nome}-err`);
  const visivel = msg && tocado.has(nome);
  if (alvo) alvo.textContent = visivel ? msg : '';
  if (visivel) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function atualizaPix(){
  const dados = Object.fromEntries(CAMPOS.map(c => [c, form.elements[c].value]));
  const r = P.gerarPix(dados);

  CAMPOS.forEach(c => mostraErro(c, r.erros && r.erros[c]));
  $('#pixCopiado').textContent = '';

  if (r.erros) {
    $('#pixVazio').hidden = false;
    $('#pixPronto').hidden = true;
    matrizAtual = null;
    return;
  }

  matrizAtual = matrizQr(r.codigo);
  desenhaSvg(matrizAtual, $('#pixQr'));
  $('#pixCodigo').value = r.codigo;

  const avisos = [];
  if (r.nomeCortado) avisos.push(`o nome foi encurtado para ${P.LIMITES.nome} caracteres`);
  if (r.cidadeCortada) avisos.push(`a cidade foi encurtada para ${P.LIMITES.cidade} caracteres`);
  if (r.descricaoCortada) avisos.push('a mensagem foi encurtada para caber junto com a chave');
  const aviso = $('#pixAviso');
  aviso.textContent = avisos.length ? `Atenção: ${avisos.join(', ')}. É um limite do padrão do Pix.` : '';
  aviso.classList.toggle('note--warn', avisos.length > 0);

  $('#pixVazio').hidden = true;
  $('#pixPronto').hidden = false;
}

form.addEventListener('input', e => {
  if (e.target.name) tocado.add(e.target.name);
  atualizaPix();
});
form.addEventListener('focusout', e => {
  if (e.target.name && e.target.value) { tocado.add(e.target.name); atualizaPix(); }
});
form.addEventListener('submit', e => e.preventDefault());

$('#pixExemplo').addEventListener('click', () => {
  const ex = { chave:'fulano@exemplo.com', nome:'Fulano de Tal', cidade:'Goiânia', valor:'150,00', descricao:'Pedido 42', txid:'PEDIDO42' };
  CAMPOS.forEach(c => { form.elements[c].value = ex[c]; });
  tocado.clear();
  atualizaPix();
});

$('#pixCopiar').addEventListener('click', async () => {
  const ok = await copia($('#pixCodigo').value, $('#pixCodigo'));
  $('#pixCopiado').textContent = ok
    ? 'Código copiado. Cole no aplicativo do banco, em Pix copia e cola.'
    : 'Não foi possível copiar automaticamente. O código está selecionado: use Ctrl+C.';
});

$('#pixBaixar').addEventListener('click', () => {
  if (!matrizAtual) return;
  const txid = form.elements.txid.value.trim();
  baixaPng(matrizAtual, `pix${txid ? '-' + txid : ''}.png`);
});

/* Ler */
const TIPOS = { cpf:'CPF', cnpj:'CNPJ', celular:'Celular', email:'E-mail', aleatoria:'Chave aleatória', desconhecido:'Não reconhecido' };

const brl = v => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

function linhaDl(dl, rotulo, valor, mono = false){
  if (valor === undefined || valor === null || valor === '') return;
  const div = document.createElement('div');
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = rotulo;
  dd.textContent = valor;
  if (mono) dd.className = 'code';
  div.append(dt, dd);
  dl.append(div);
}

function selo(ok, titulo, texto){
  const box = document.createElement('div');
  box.className = `status ${ok ? 'status--ok' : 'status--bad'}`;
  box.innerHTML = ok
    ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6M12 16.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const txt = document.createElement('div');
  const s = document.createElement('strong');
  const p = document.createElement('span');
  s.textContent = titulo;
  p.textContent = texto;
  txt.append(s, p);
  box.append(txt);
  return box;
}

function atualizaLeitura(){
  const bruto = $('#l-codigo').value;
  const alvo = $('#lerPronto');

  if (!bruto.trim()) {
    $('#lerVazio').hidden = false;
    alvo.hidden = true;
    return;
  }

  const r = P.lerPix(bruto);
  alvo.replaceChildren();

  if (r.erro) {
    alvo.append(selo(false, 'Não foi possível ler', r.erro));
  } else {
    if (!r.pix) alvo.append(selo(false, 'Não é um Pix', 'O código segue o padrão BR Code, mas não traz uma conta Pix dentro.'));
    else if (r.crcValido) alvo.append(selo(true, 'Código íntegro', 'O CRC confere: o código não foi alterado depois de gerado.'));
    else alvo.append(selo(false, 'Código alterado ou corrompido', `O CRC informado é ${r.crcInformado}, mas o conteúdo pede ${r.crcCalculado}. O banco vai recusar este código.`));

    const dl = document.createElement('dl');
    dl.className = 'facts-list';
    linhaDl(dl, 'Tipo', r.pix ? (r.dinamico ? 'Pix dinâmico (dados buscados no banco na hora do pagamento)' : 'Pix estático') : undefined);
    linhaDl(dl, 'Recebedor', r.nome);
    linhaDl(dl, 'Cidade', r.cidade);
    if (r.chave) linhaDl(dl, `Chave (${TIPOS[r.tipoChave] || 'Não reconhecido'})`, r.chave, true);
    linhaDl(dl, 'Endereço do Pix dinâmico', r.url, true);
    linhaDl(dl, 'Valor', r.valor ? brl(r.valor) : (r.pix && !r.dinamico ? 'Livre: quem paga digita' : undefined));
    linhaDl(dl, 'Mensagem', r.descricao);
    linhaDl(dl, 'Identificador', r.txid && r.txid !== '***' ? r.txid : undefined);
    linhaDl(dl, 'Uso', r.usoUnico ? 'Pagamento único' : undefined);
    if (r.moeda && r.moeda !== '986') linhaDl(dl, 'Moeda', `Código ${r.moeda} (não é real)`);
    alvo.append(dl);

    if (r.pix && r.crcValido) {
      const aviso = document.createElement('p');
      aviso.className = 'caveat';
      aviso.textContent = 'Código íntegro não quer dizer que o recebedor é quem você espera. Antes de confirmar, confira o nome que o aplicativo do banco mostrar.';
      alvo.append(aviso);
    }
  }

  $('#lerVazio').hidden = true;
  alvo.hidden = false;
}

$('#l-codigo').addEventListener('input', atualizaLeitura);

})();
