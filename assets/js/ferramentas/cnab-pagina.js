/*
   cnab-pagina.js — tela do leitor de arquivo de retorno.
   As regras moram no cnab.js; aqui é só entrada e desenho.
   */
(() => {
'use strict';

const $ = s => document.querySelector(s);

const el = (tag, cls, texto) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined) e.textContent = texto;
  return e;
};

const brl = c => (c / 100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const dataBr = iso => (iso ? iso.split('-').reverse().join('/') : '—');

let arquivo = null;
let nomeArquivo = 'retorno';
let filtro = 'todos';

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

function linha(dl, rotulo, valor){
  if (!valor) return;
  const div = el('div');
  div.append(el('dt', '', rotulo), el('dd', '', valor));
  dl.append(div);
}

function numero(rotulo, valor, sub){
  const d = el('div', 'kpi');
  d.append(el('span', 'kpi__l', rotulo), el('strong', 'kpi__v', valor));
  if (sub) d.append(el('span', 'kpi__s', sub));
  return d;
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

const FILTROS = [
  ['todos', 'Todos'], ['pago', 'Pagos'], ['entrada', 'Entradas'],
  ['rejeitado', 'Rejeitados'], ['baixa', 'Baixas'], ['outro', 'Outros']
];

function tabela(){
  const lista = filtro === 'todos' ? arquivo.titulos : arquivo.titulos.filter(t => t.ocorrencia.grupo === filtro);
  const wrap = el('div', 'tablewrap');
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Títulos do arquivo');

  const tb = el('table', 'rtable');
  const head = el('tr');
  ['Nosso número', 'Pagador', 'Ocorrência', 'Vencimento', 'Valor', 'Pago', 'Crédito'].forEach((h, i) => {
    const th = el('th', i >= 4 && i <= 5 ? 'num' : '', h);
    th.scope = 'col';
    head.append(th);
  });
  const thead = el('thead');
  thead.append(head);

  const tbody = el('tbody');
  for (const t of lista) {
    const tr = el('tr');
    const nn = el('td', 'code', t.nossoNumero || '—');
    if (t.seuNumero) nn.append(el('span', 'sub', t.seuNumero));
    const pag = el('td', '', t.pagador || '—');
    const oco = el('td');
    oco.append(el('span', `tag tag--${t.ocorrencia.grupo}`, t.ocorrencia.texto));
    if (t.ocorrencia.grupo === 'rejeitado' && t.motivos) oco.append(el('span', 'sub', `Motivo ${t.motivos}`));
    const pago = t.valorPago ?? (t.ocorrencia.grupo === 'pago' ? t.valorLiquido : null);
    tr.append(
      nn, pag, oco,
      el('td', '', dataBr(t.vencimento)),
      el('td', 'num', brl(t.valorTitulo)),
      el('td', 'num', pago ? brl(pago) : '—'),
      el('td', '', dataBr(t.dataCredito))
    );
    tbody.append(tr);
  }
  if (!lista.length) {
    const tr = el('tr');
    const td = el('td', 'none', 'Nenhum título nesse filtro.');
    td.colSpan = 7;
    tr.append(td);
    tbody.append(tr);
  }

  tb.append(thead, tbody);
  wrap.append(tb);
  return wrap;
}

function desenhaTabela(){
  $('#rTabela').replaceChildren(tabela());
  document.querySelectorAll('#rFiltros button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === filtro)));
}

function mostra(texto, nome){
  const alvo = $('#rPronto');
  alvo.replaceChildren();
  $('#rVazio').hidden = true;
  alvo.hidden = false;

  const r = Cnab.lerRetorno(texto);
  if (r.erro) {
    arquivo = null;
    alvo.append(selo(false, 'Não deu para ler este arquivo', r.erro));
    return;
  }
  arquivo = r;
  nomeArquivo = (nome || 'retorno').replace(/\.[^.]+$/, '');
  filtro = 'todos';

  const falhas = r.verificacoes.filter(v => !v.ok);
  alvo.append(r.valido
    ? selo(true, 'Arquivo íntegro', `${plural(r.linhas, 'linha', 'linhas')} em CNAB ${r.layout}, e os totais do trailer batem com o conteúdo.`)
    : selo(false, 'O arquivo tem inconsistências', `${falhas.map(f => f.nome.toLowerCase()).join('; ')}. Ele pode ter sido cortado ou editado à mão. Os títulos abaixo foram lidos mesmo assim.`));

  const s = r.resumo;
  const kpis = el('div', 'kpis');
  kpis.append(
    numero('Títulos', String(s.titulos), `${brl(s.valorTitulos)} no total`),
    numero('Pagos', String(s.pagos), `${brl(s.recebido)} recebidos`),
    numero('Creditado na conta', brl(s.creditado), s.tarifas ? `${brl(s.tarifas)} de tarifas` : 'sem tarifas'),
    numero('Rejeitados', String(s.rejeitados), s.rejeitados ? 'precisam de correção' : 'nenhum problema')
  );
  alvo.append(kpis);

  const dl = el('dl', 'facts-list');
  linha(dl, 'Banco', r.banco.nome ? `${r.banco.nome} (${r.banco.codigo})` : r.banco.codigo);
  linha(dl, 'Empresa', r.empresa);
  linha(dl, 'Agência e conta', [r.agencia, r.conta].filter(Boolean).map(x => x.replace(/^0+(?=\d)/, '')).join(' / '));
  linha(dl, 'Gerado em', r.dataGeracao ? dataBr(r.dataGeracao) : '');
  linha(dl, 'Layout', r.versao ? `CNAB ${r.layout}, versão ${r.versao}` : `CNAB ${r.layout}`);
  linha(dl, 'Número do arquivo', r.sequencia ? String(Number(r.sequencia)) : '');
  alvo.append(dl);

  const barra = el('div', 'rbar');
  const filtros = el('div', 'chips');
  filtros.id = 'rFiltros';
  filtros.setAttribute('role', 'group');
  filtros.setAttribute('aria-label', 'Filtrar por ocorrência');
  for (const [f, rot] of FILTROS) {
    const n = f === 'todos' ? r.titulos.length : r.titulos.filter(t => t.ocorrencia.grupo === f).length;
    if (f !== 'todos' && !n) continue;
    const b = el('button', 'chip', `${rot} (${n})`);
    b.type = 'button';
    b.dataset.f = f;
    b.addEventListener('click', () => { filtro = f; desenhaTabela(); });
    filtros.append(b);
  }
  const baixar = el('button', 'btn btn--line btn--sm', 'Baixar planilha (CSV)');
  baixar.type = 'button';
  baixar.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([Cnab.csv(arquivo)], { type:'text/csv;charset=utf-8' }));
    const a = el('a');
    a.href = url;
    a.download = `${nomeArquivo}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  barra.append(filtros, baixar);
  alvo.append(barra);

  const t = el('div');
  t.id = 'rTabela';
  alvo.append(t);
  desenhaTabela();

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

  alvo.append(el('p', 'caveat', 'A leitura segue os manuais de layout, mas cada banco tem as suas particularidades. Para conciliação, confira sempre com o extrato da conta.'));
}

function abre(file){
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) {
    mostra('', file.name);
    $('#rPronto').replaceChildren(selo(false, 'Arquivo grande demais', 'Um retorno de cobrança costuma ter alguns kB. Confira se escolheu o arquivo certo.'));
    return;
  }
  const leitor = new FileReader();
  // arquivo de banco é ASCII/ISO-8859-1: lido assim, cada caractere é uma posição
  leitor.onload = () => mostra(leitor.result, file.name);
  leitor.readAsText(file, 'ISO-8859-1');
}

$('#r-arquivo').addEventListener('change', e => abre(e.target.files[0]));

const zona = $('#rZona');
['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.add('is-over'); }));
['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, () => zona.classList.remove('is-over')));
zona.addEventListener('drop', e => { e.preventDefault(); abre(e.dataTransfer.files[0]); });

$('#rExemplo').addEventListener('click', () => mostra(Cnab.exemplo240(), 'retorno-exemplo-sicoob.ret'));

})();
