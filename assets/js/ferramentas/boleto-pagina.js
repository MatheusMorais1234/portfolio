/* =====================================================================
   boleto-pagina.js — tela do validador de boleto.
   As regras moram no pagamentos.js; aqui é só entrada e desenho.
   ===================================================================== */
(() => {
'use strict';

const $ = s => document.querySelector(s);
const P = Pagamentos;
const SVG = 'http://www.w3.org/2000/svg';

const el = (tag, cls, texto) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined) e.textContent = texto;
  return e;
};

const brl = v => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

function dataBr(iso){
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// dias entre hoje e o vencimento, contando pelo calendário local
function diasAte(iso){
  const [a, m, d] = iso.split('-').map(Number);
  const hoje = new Date();
  const alvo = Date.UTC(a, m - 1, d);
  const base = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((alvo - base) / 86400000);
}

function textoVencimento(iso){
  const dias = diasAte(iso);
  const data = dataBr(iso);
  if (dias === 0) return `${data} (vence hoje)`;
  if (dias === 1) return `${data} (vence amanhã)`;
  if (dias > 1) return `${data} (em ${dias} dias)`;
  if (dias === -1) return `${data} (venceu ontem)`;
  return `${data} (venceu há ${-dias} dias)`;
}

function selo(ok, titulo, texto){
  const box = el('div', `status ${ok ? 'status--ok' : 'status--bad'}`);
  box.innerHTML = ok
    ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6M12 16.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const txt = el('div');
  txt.append(el('strong', '', titulo), el('span', '', texto));
  box.append(txt);
  return box;
}

function linha(dl, rotulo, valor, mono = false){
  if (valor === undefined || valor === null || valor === '') return;
  const div = el('div');
  div.append(el('dt', '', rotulo), el('dd', mono ? 'code' : '', valor));
  dl.append(div);
}

function desenhaBarras(digitos){
  const larguras = P.larguraItf(digitos);
  const total = larguras.reduce((a, b) => a + b, 0);
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${total} 50`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Código de barras do boleto');
  let x = 0, d = '';
  larguras.forEach((w, i) => {
    if (i % 2 === 0) d += `M${x} 0h${w}v50h-${w}z`;
    x += w;
  });
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', '#000');
  svg.append(path);
  return svg;
}

function atualiza(){
  const bruto = $('#b-codigo').value;
  const alvo = $('#bPronto');

  if (!P.soDigitos(bruto)) {
    $('#bVazio').hidden = false;
    alvo.hidden = true;
    return;
  }

  const r = P.analisarBoleto(bruto);
  alvo.replaceChildren();

  if (r.erro) {
    alvo.append(selo(false, 'Número incompleto ou com dígitos a mais', r.erro));
  } else {
    const falhas = r.verificacoes.filter(v => !v.ok);
    alvo.append(r.valido
      ? selo(true, 'Dígitos verificadores corretos', 'O número está bem formado e nenhum dígito foi digitado errado.')
      : selo(false, 'Número inválido', `${falhas.map(f => f.nome.toLowerCase()).join(', ').replace(/^./, c => c.toUpperCase())} não confere. Provavelmente algum número foi digitado ou copiado errado.`));

    const dl = el('dl', 'facts-list');
    if (r.tipo === 'bancario') {
      linha(dl, 'Tipo', 'Boleto bancário');
      linha(dl, 'Banco emissor', r.banco.nome ? `${r.banco.nome} (${r.banco.codigo})` : `${r.banco.codigo} (banco não listado)`);
      linha(dl, 'Valor', r.valor ? brl(r.valor) : 'Não informado no código');
      linha(dl, 'Vencimento', r.vencimento ? textoVencimento(r.vencimento) : 'Sem vencimento definido');
      linha(dl, 'Moeda', r.moeda);
    } else {
      linha(dl, 'Tipo', 'Conta de consumo ou tributo');
      linha(dl, 'Segmento', r.segmento.nome || `Código ${r.segmento.codigo}`);
      linha(dl, 'Valor', r.valor ? brl(r.valor) : (r.valorReferencia ? 'O código traz uma referência, não o valor em reais' : 'Não informado no código'));
      linha(dl, 'Empresa ou órgão', r.empresa, true);
      linha(dl, 'Cálculo dos dígitos', `Módulo ${r.modulo}`);
    }
    linha(dl, 'Linha digitável', r.linhaFormatada, true);
    linha(dl, 'Código de barras', r.barras, true);
    alvo.append(dl);

    const checks = el('div', 'checks');
    checks.append(el('h3', '', 'Verificações'));
    const ul = el('ul');
    r.verificacoes.forEach(v => {
      const li = el('li');
      li.append(el('span', '', v.nome));
      li.append(el('span', v.ok ? 'ok' : 'bad', v.ok ? 'Confere' : `Esperado ${v.esperado}, veio ${v.informado}`));
      ul.append(li);
    });
    checks.append(ul);
    alvo.append(checks);

    if (r.valido) {
      const barras = el('div', 'barcode');
      barras.append(desenhaBarras(r.barras), el('p', 'note code', r.barras));
      alvo.append(barras);
    }

    alvo.append(el('p', 'caveat', 'Dígitos corretos provam que o número está bem formado, não que o boleto é legítimo. Golpes usam boletos válidos de outro beneficiário: antes de pagar, confira o nome que o aplicativo do banco mostrar.'));
  }

  $('#bVazio').hidden = true;
  alvo.hidden = false;
}

$('#b-codigo').addEventListener('input', atualiza);
// exemplo sempre atual: um boleto fictício do Itaú que vence daqui a 7 dias
$('#bExemplo').addEventListener('click', () => {
  const d = new Date(Date.now() + 7 * 86400000);
  const vencimento = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const { linha } = P.montarBoletoBancario({ banco:'341', vencimento, valor:'250.00', campoLivre:'1090000012345678901234567' });
  $('#b-codigo').value = linha.replace(/^(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d)(\d{14})$/, '$1.$2 $3.$4 $5.$6 $7 $8');
  atualiza();
});

// link vindo do portfólio: ?codigo= já abre conferido
const doLink = new URLSearchParams(location.search).get('codigo');
if (doLink) { $('#b-codigo').value = doLink; atualiza(); }

})();
