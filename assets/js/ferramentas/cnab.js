/* =====================================================================
   cnab.js — leitura do arquivo de retorno de cobrança (CNAB), em funções
   puras.

   - CNAB 240: padrão FEBRABAN, segmentos T e U. É o layout que Sicoob,
     Itaú, Banco do Brasil, Caixa, Bradesco e Santander oferecem para
     cobrança registrada.
   - CNAB 400: cada banco tem o seu. Aqui está o do Itaú.

   Sem DOM e sem rede: a página usa no navegador e o
   _ferramentas/testar-pagamentos.mjs usa no Node. O arquivo nunca sai do
   computador de quem abriu — e ele traz nome e CPF de pagador, então isso
   importa.

   Posições nos mapas abaixo são as dos manuais: começam em 1 e incluem o
   fim. Tipos: 'n' número (fica como texto, para não perder zero à
   esquerda), 'a' texto, 'v' valor em centavos, 'd8' DDMMAAAA, 'd6' DDMMAA.
   ===================================================================== */

const Cnab = (() => {

/* ---------------------------------------------------------------------
   Leitura e escrita de campos
   --------------------------------------------------------------------- */
const corta = (linha, ini, fim) => linha.slice(ini - 1, fim);

function dataIso(dd, mm, aaaa){
  const d = Number(dd), m = Number(mm);
  if (!d || !m || m > 12 || d > 31) return null;
  return `${aaaa}-${mm}-${dd}`;
}

const LER = {
  n: s => s.trim(),
  a: s => s.trim(),
  v: s => (/^\d+$/.test(s) ? Number(s) : 0),
  d8: s => (/^\d{8}$/.test(s) ? dataIso(s.slice(0, 2), s.slice(2, 4), s.slice(4)) : null),
  d6: s => (/^\d{6}$/.test(s) ? dataIso(s.slice(0, 2), s.slice(2, 4), '20' + s.slice(4)) : null)
};

function ler(linha, mapa){
  const r = {};
  for (const [nome, [ini, fim, tipo = 'n']] of Object.entries(mapa))
    r[nome] = LER[tipo](corta(linha, ini, fim));
  return r;
}

// Arquivo bancário é ASCII em maiúsculas: acento vira letra simples.
const ascii = s => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\x20-\x7E]/g, '').toUpperCase();

const ESCREVER = {
  n: (v, t) => String(v ?? '').padStart(t, '0'),
  a: (v, t) => ascii(v).padEnd(t, ' '),
  v: (v, t) => String(Math.round(Number(v || 0))).padStart(t, '0'),
  d8: (v, t) => (v ? v.split('-').reverse().join('') : '').padStart(t, '0'),
  d6: (v, t) => (v ? v.split('-').reverse().join('').slice(0, 4) + v.slice(2, 4) : '').padStart(t, '0')
};

/* Monta uma linha de tamanho fixo. Usado no arquivo de exemplo e nos testes. */
function escrever(tamanho, mapa, dados){
  const l = Array(tamanho).fill(' ');
  for (const [nome, valor] of Object.entries(dados)) {
    const def = mapa[nome];
    if (!def) throw new Error(`Campo desconhecido: ${nome}`);
    const [ini, fim, tipo = 'n'] = def;
    const t = fim - ini + 1;
    const s = ESCREVER[tipo](valor, t);
    if (s.length !== t) throw new Error(`${nome} não cabe em ${t} posições: "${s}"`);
    for (let i = 0; i < t; i++) l[ini - 1 + i] = s[i];
  }
  return l.join('');
}

/* ---------------------------------------------------------------------
   CNAB 240 — FEBRABAN
   --------------------------------------------------------------------- */
const C240 = {
  header: {
    banco:[1,3], lote:[4,7], tipo:[8,8], tipoInscricao:[18,18], inscricao:[19,32],
    agencia:[53,57], conta:[59,70], empresa:[73,102,'a'], nomeBanco:[103,132,'a'],
    remessaRetorno:[143,143], dataGeracao:[144,151,'d8'], hora:[152,157],
    sequencia:[158,163], versao:[164,166]
  },
  headerLote: {
    banco:[1,3], lote:[4,7], tipo:[8,8], operacao:[9,9,'a'], servico:[10,11], versao:[14,16]
  },
  T: {
    banco:[1,3], lote:[4,7], tipo:[8,8], sequencial:[9,13], segmento:[14,14,'a'],
    movimento:[16,17], agencia:[18,22], conta:[24,35], nossoNumero:[38,57,'a'],
    carteira:[58,58], seuNumero:[59,73,'a'], vencimento:[74,81,'d8'],
    valorTitulo:[82,96,'v'], bancoCobrador:[97,99], agenciaCobradora:[100,104],
    usoEmpresa:[106,130,'a'], moeda:[131,132], tipoInscricaoPagador:[133,133],
    inscricaoPagador:[134,148], pagador:[149,188,'a'], tarifa:[199,213,'v'],
    motivos:[214,223,'a']
  },
  U: {
    banco:[1,3], lote:[4,7], tipo:[8,8], sequencial:[9,13], segmento:[14,14,'a'],
    movimento:[16,17], encargos:[18,32,'v'], desconto:[33,47,'v'], abatimento:[48,62,'v'],
    iof:[63,77,'v'], valorPago:[78,92,'v'], valorLiquido:[93,107,'v'],
    outrasDespesas:[108,122,'v'], outrosCreditos:[123,137,'v'],
    dataOcorrencia:[138,145,'d8'], dataCredito:[146,153,'d8']
  },
  trailerLote: { banco:[1,3], lote:[4,7], tipo:[8,8], registros:[18,23] },
  trailer: { banco:[1,3], lote:[4,7], tipo:[8,8], lotes:[18,23], registros:[24,29] }
};

// Nota C044 do manual FEBRABAN: código de movimento do retorno.
const MOV_240 = {
  '02':'Entrada confirmada', '03':'Entrada rejeitada', '04':'Transferência de carteira (entrada)',
  '05':'Transferência de carteira (baixa)', '06':'Liquidação', '07':'Desconto confirmado',
  '08':'Cancelamento de desconto confirmado', '09':'Baixa', '11':'Título em carteira',
  '12':'Abatimento confirmado', '13':'Cancelamento de abatimento confirmado',
  '14':'Vencimento alterado', '15':'Franco de pagamento', '17':'Liquidação após baixa',
  '19':'Instrução de protesto confirmada', '20':'Sustação de protesto confirmada',
  '23':'Enviado a cartório', '24':'Retirado de cartório', '25':'Protestado e baixado',
  '26':'Instrução rejeitada', '27':'Alteração de dados confirmada',
  '28':'Débito de tarifas e custas', '29':'Ocorrência do pagador', '30':'Alteração de dados rejeitada'
};
const GRUPO_240 = { pago:['06', '17'], entrada:['02'], baixa:['09', '25'], rejeitado:['03', '26', '30'] };

/* ---------------------------------------------------------------------
   CNAB 400 — Itaú
   --------------------------------------------------------------------- */
const I400 = {
  header: {
    tipo:[1,1], remessaRetorno:[2,2], literal:[3,9,'a'], agencia:[27,30], conta:[33,37],
    empresa:[47,76,'a'], banco:[77,79], nomeBanco:[80,94,'a'], dataGeracao:[95,100,'d6'],
    dataCredito:[114,119,'d6'], sequencial:[395,400]
  },
  detalhe: {
    tipo:[1,1], tipoInscricao:[2,3], inscricao:[4,17], agencia:[18,21], conta:[24,28],
    usoEmpresa:[38,62,'a'], nossoNumero:[63,70], carteira:[83,85], ocorrencia:[109,110],
    dataOcorrencia:[111,116,'d6'], seuNumero:[117,126,'a'], vencimento:[147,152,'d6'],
    valorTitulo:[153,165,'v'], bancoCobrador:[166,168], agenciaCobradora:[169,172],
    especie:[174,175], tarifa:[176,188,'v'], iof:[215,227,'v'], abatimento:[228,240,'v'],
    desconto:[241,253,'v'], valorPrincipal:[254,266,'v'], encargos:[267,279,'v'],
    outrosCreditos:[280,292,'v'], dataCredito:[296,301,'d6'], pagador:[325,354,'a'],
    erros:[378,385,'a'], liquidacao:[393,394,'a'], sequencial:[395,400]
  },
  trailer: { tipo:[1,1], remessaRetorno:[2,2], banco:[5,7], sequencial:[395,400] }
};

const OCO_ITAU = {
  '02':'Entrada confirmada', '03':'Entrada rejeitada', '04':'Alteração de dados (nova entrada)',
  '05':'Alteração de dados (baixa)', '06':'Liquidação normal', '07':'Liquidação parcial',
  '08':'Liquidação em cartório', '09':'Baixa simples', '10':'Baixa por ter sido liquidado',
  '11':'Em ser', '12':'Abatimento concedido', '13':'Abatimento cancelado', '14':'Vencimento alterado',
  '15':'Baixa rejeitada', '16':'Instrução rejeitada', '17':'Alteração de dados rejeitada',
  '19':'Instrução de protesto confirmada', '20':'Sustação de protesto confirmada',
  '23':'Enviado a cartório', '24':'Instrução de protesto rejeitada', '25':'Alegação do pagador',
  '32':'Baixa por ter sido protestado'
};
const GRUPO_ITAU = { pago:['06', '07', '08'], entrada:['02'], baixa:['09', '10', '32'], rejeitado:['03', '15', '16', '17', '24'] };

function ocorrencia(codigo, textos, grupos){
  const grupo = Object.keys(grupos).find(g => grupos[g].includes(codigo)) || 'outro';
  return { codigo, texto: textos[codigo] || `Código ${codigo}`, grupo };
}

const BANCOS = {
  '001':'Banco do Brasil', '033':'Santander', '041':'Banrisul', '070':'BRB', '077':'Banco Inter',
  '104':'Caixa Econômica Federal', '136':'Unicred', '237':'Bradesco', '341':'Itaú',
  '422':'Safra', '748':'Sicredi', '756':'Sicoob'
};

/* ---------------------------------------------------------------------
   Leitura do arquivo
   --------------------------------------------------------------------- */
function linhasDo(texto){
  const linhas = String(texto || '').split(/\r?\n/);
  while (linhas.length && !linhas[linhas.length - 1].trim()) linhas.pop();
  // ^Z no fim é herança de sistema antigo e aparece em retorno de banco
  if (linhas.length && /^\x1A+$/.test(linhas[linhas.length - 1])) linhas.pop();
  return linhas;
}

function ler240(linhas, verificacoes){
  const L = linhas.map(l => l.padEnd(240, ' '));
  const header = ler(L[0], C240.header);
  const titulos = [];
  let lote = null, lotes = 0, atual = null, trailer = null;

  L.forEach((l, i) => {
    const tipo = l[7];
    if (tipo === '1') {
      lote = { numero: corta(l, 4, 7), inicio: i, ultimoSeq: 0, seqOk: true };
      lotes++;
    } else if (tipo === '3') {
      const seq = Number(corta(l, 9, 13));
      if (lote) {
        if (seq !== lote.ultimoSeq + 1) lote.seqOk = false;
        lote.ultimoSeq = seq;
      }
      const seg = l[13];
      if (seg === 'T') {
        const t = ler(l, C240.T);
        atual = {
          linha: i + 1,
          nossoNumero: t.nossoNumero, seuNumero: t.seuNumero, usoEmpresa: t.usoEmpresa,
          pagador: t.pagador, documentoPagador: t.inscricaoPagador.replace(/^0+(?=\d{11}$)/, ''),
          ocorrencia: ocorrencia(t.movimento, MOV_240, GRUPO_240),
          vencimento: t.vencimento, valorTitulo: t.valorTitulo, tarifa: t.tarifa,
          motivos: t.motivos, valorPago: null, valorLiquido: null,
          encargos: 0, desconto: 0, abatimento: 0, dataOcorrencia: null, dataCredito: null
        };
        titulos.push(atual);
      } else if (seg === 'U' && atual) {
        const u = ler(l, C240.U);
        Object.assign(atual, {
          valorPago: u.valorPago, valorLiquido: u.valorLiquido, encargos: u.encargos,
          desconto: u.desconto, abatimento: u.abatimento,
          dataOcorrencia: u.dataOcorrencia, dataCredito: u.dataCredito
        });
        atual = null;
      }
    } else if (tipo === '5' && lote) {
      const t = ler(l, C240.trailerLote);
      const contados = i - lote.inicio + 1;
      verificacoes.push({ nome:`Quantidade de registros do lote ${Number(lote.numero)}`, ok: Number(t.registros) === contados, esperado:contados, informado:Number(t.registros) });
      verificacoes.push({ nome:`Sequência dos detalhes do lote ${Number(lote.numero)}`, ok: lote.seqOk, esperado:'1, 2, 3…', informado: lote.seqOk ? '1, 2, 3…' : 'fora de ordem' });
      lote = null;
    } else if (tipo === '9') {
      trailer = ler(l, C240.trailer);
    }
  });

  if (trailer) {
    verificacoes.push({ nome:'Quantidade de lotes', ok: Number(trailer.lotes) === lotes, esperado:lotes, informado:Number(trailer.lotes) });
    verificacoes.push({ nome:'Quantidade de registros do arquivo', ok: Number(trailer.registros) === L.length, esperado:L.length, informado:Number(trailer.registros) });
  } else {
    verificacoes.push({ nome:'Trailer do arquivo (registro 9)', ok:false, esperado:'presente', informado:'ausente' });
  }

  return {
    layout: '240',
    banco: { codigo: header.banco, nome: BANCOS[header.banco] || header.nomeBanco || null },
    empresa: header.empresa,
    documentoEmpresa: header.inscricao,
    agencia: header.agencia, conta: header.conta,
    dataGeracao: header.dataGeracao,
    sequencia: header.sequencia,
    versao: header.versao,
    titulos
  };
}

function ler400(linhas, verificacoes){
  const L = linhas.map(l => l.padEnd(400, ' '));
  const header = ler(L[0], I400.header);
  const titulos = [];
  let seqOk = true, trailer = false;

  L.forEach((l, i) => {
    if (Number(corta(l, 395, 400)) !== i + 1) seqOk = false;
    if (l[0] === '1') {
      const d = ler(l, I400.detalhe);
      titulos.push({
        linha: i + 1,
        nossoNumero: d.nossoNumero, seuNumero: d.seuNumero, usoEmpresa: d.usoEmpresa,
        pagador: d.pagador, documentoPagador: null,
        ocorrencia: ocorrencia(d.ocorrencia, OCO_ITAU, GRUPO_ITAU),
        vencimento: d.vencimento, valorTitulo: d.valorTitulo, tarifa: d.tarifa,
        motivos: d.erros,
        // no 400 do Itaú o "valor principal" é o que foi lançado na conta
        valorPago: null, valorLiquido: d.valorPrincipal,
        encargos: d.encargos, desconto: d.desconto, abatimento: d.abatimento,
        dataOcorrencia: d.dataOcorrencia, dataCredito: d.dataCredito
      });
    } else if (l[0] === '9') {
      trailer = true;
    }
  });

  verificacoes.push({ nome:'Numeração sequencial dos registros', ok: seqOk, esperado:'1, 2, 3…', informado: seqOk ? '1, 2, 3…' : 'fora de ordem' });
  verificacoes.push({ nome:'Trailer do arquivo (registro 9)', ok: trailer, esperado:'presente', informado: trailer ? 'presente' : 'ausente' });

  return {
    layout: '400',
    banco: { codigo: header.banco, nome: BANCOS[header.banco] || header.nomeBanco || null },
    empresa: header.empresa,
    documentoEmpresa: null,
    agencia: header.agencia, conta: header.conta,
    dataGeracao: header.dataGeracao,
    sequencia: null,
    versao: null,
    titulos
  };
}

function resumo(titulos){
  const r = { titulos: titulos.length, pagos: 0, rejeitados: 0, entradas: 0, baixas: 0, outros: 0,
              recebido: 0, creditado: 0, tarifas: 0, valorTitulos: 0 };
  for (const t of titulos) {
    r.valorTitulos += t.valorTitulo;
    r.tarifas += t.tarifa;
    const g = t.ocorrencia.grupo;
    if (g === 'pago') {
      r.pagos++;
      r.recebido += t.valorPago ?? t.valorLiquido ?? 0;
      r.creditado += t.valorLiquido ?? 0;
    } else if (g === 'rejeitado') r.rejeitados++;
    else if (g === 'entrada') r.entradas++;
    else if (g === 'baixa') r.baixas++;
    else r.outros++;
  }
  return r;
}

/* Lê o conteúdo de um arquivo de retorno. Devolve { erro } ou o arquivo
   interpretado, com títulos, resumo e verificações de integridade. */
function lerRetorno(texto){
  const linhas = linhasDo(texto);
  if (!linhas.length) return { erro:'O arquivo está vazio.' };

  const tam = linhas[0].replace(/\s+$/, '').length;
  const maior = Math.max(...linhas.map(l => l.length));
  let layout = null;
  if (maior === 240 || (maior < 240 && tam <= 240 && linhas[0][7] === '0')) layout = '240';
  else if (maior === 400 || (maior < 400 && linhas[0][0] === '0' && linhas[0][1] === '2')) layout = '400';

  if (!layout)
    return { erro:`As linhas têm ${maior} caracteres. Um arquivo CNAB tem linhas de 240 ou de 400.` };

  const verificacoes = [];
  const fora = linhas.filter(l => l.length !== Number(layout) && l.length > 0).length;
  verificacoes.push({ nome:`Todas as linhas com ${layout} posições`, ok: fora === 0, esperado:0, informado:`${fora} fora do tamanho` });

  let arq;
  if (layout === '240') {
    if (linhas[0][7] !== '0') return { erro:'A primeira linha não é um header de arquivo CNAB 240 (o registro 0).' };
    const rr = linhas[0][142];
    if (rr === '1') return { erro:'Este é um arquivo de remessa, o que a empresa envia ao banco. A ferramenta lê o retorno, que o banco devolve.' };
    if (rr !== '2') return { erro:'O header não diz se é remessa ou retorno (posição 143). O arquivo pode estar corrompido.' };
    arq = ler240(linhas, verificacoes);
  } else {
    if (linhas[0][0] !== '0') return { erro:'A primeira linha não é um header de arquivo CNAB 400.' };
    if (linhas[0][1] === '1') return { erro:'Este é um arquivo de remessa, o que a empresa envia ao banco. A ferramenta lê o retorno, que o banco devolve.' };
    const banco = corta(linhas[0], 77, 79);
    if (banco !== '341')
      return { erro:`CNAB 400 do banco ${banco}${BANCOS[banco] ? ` (${BANCOS[banco]})` : ''}. No 400 cada banco usa posições diferentes, e por enquanto só o layout do Itaú é interpretado. Se o seu banco oferece o retorno em CNAB 240, use esse.` };
    arq = ler400(linhas, verificacoes);
  }

  return { ...arq, linhas: linhas.length, verificacoes, valido: verificacoes.every(v => v.ok), resumo: resumo(arq.titulos) };
}

/* ---------------------------------------------------------------------
   Exportação
   --------------------------------------------------------------------- */
const reais = c => (c / 100).toFixed(2).replace('.', ',');
const dataBr = iso => (iso ? iso.split('-').reverse().join('/') : '');

/* CSV no jeito que o Excel em português abre direto: ponto e vírgula,
   vírgula decimal e BOM para os acentos. */
function csv(arquivo){
  const cab = ['Nosso número', 'Seu número', 'Pagador', 'Ocorrência', 'Código', 'Vencimento',
               'Valor do título', 'Valor pago', 'Valor creditado', 'Juros e multa', 'Desconto',
               'Tarifa', 'Data da ocorrência', 'Data do crédito'];
  const esc = v => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const linhas = arquivo.titulos.map(t => [
    t.nossoNumero, t.seuNumero, t.pagador, t.ocorrencia.texto, t.ocorrencia.codigo,
    dataBr(t.vencimento), reais(t.valorTitulo),
    t.valorPago === null ? '' : reais(t.valorPago),
    t.valorLiquido === null ? '' : reais(t.valorLiquido),
    reais(t.encargos), reais(t.desconto), reais(t.tarifa),
    dataBr(t.dataOcorrencia), dataBr(t.dataCredito)
  ].map(v => esc(String(v))).join(';'));
  return '﻿' + [cab.join(';'), ...linhas].join('\r\n') + '\r\n';
}

/* ---------------------------------------------------------------------
   Arquivo de exemplo — CNAB 240 fictício, com uma ocorrência de cada tipo.
   --------------------------------------------------------------------- */
function exemplo240(hoje = Date.now()){
  const dia = n => {
    const d = new Date(hoje + n * 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const banco = '756';
  const conta = { agencia:'4321', conta:'123456' };
  const titulos = [
    { mov:'06', nn:'1000001', seu:'NF 1021', nome:'Cliente Exemplo Um',    venc:-3, valor:35000, pago:35000, enc:0,   tarifa:250, credito:-1 },
    { mov:'06', nn:'1000002', seu:'NF 1022', nome:'Cliente Exemplo Dois',  venc:-9, valor:120000, pago:122640, enc:2640, tarifa:250, credito:-1 },
    { mov:'17', nn:'1000003', seu:'NF 1023', nome:'Cliente Exemplo Três',  venc:-20, valor:8990, pago:8990, enc:0,    tarifa:250, credito:-1 },
    { mov:'02', nn:'1000004', seu:'NF 1024', nome:'Cliente Exemplo Quatro', venc:15, valor:54000, pago:0, enc:0,      tarifa:0,   credito:null },
    { mov:'03', nn:'1000005', seu:'NF 1025', nome:'Cliente Exemplo Cinco', venc:15, valor:21000, pago:0, enc:0,       tarifa:0,   credito:null, motivos:'45' },
    { mov:'09', nn:'1000006', seu:'NF 0998', nome:'Cliente Exemplo Seis',  venc:-40, valor:15000, pago:0, enc:0,      tarifa:0,   credito:null }
  ];

  const L = [];
  L.push(escrever(240, C240.header, {
    banco, lote:'0000', tipo:'0', tipoInscricao:'2', inscricao:'11222333000181',
    agencia:conta.agencia, conta:conta.conta, empresa:'Empresa Exemplo Ltda', nomeBanco:'Sicoob',
    remessaRetorno:'2', dataGeracao:dia(0), hora:'063000', sequencia:'42', versao:'081'
  }));
  L.push(escrever(240, C240.headerLote, { banco, lote:'0001', tipo:'1', operacao:'T', servico:'01', versao:'040' }));

  let seq = 0;
  for (const t of titulos) {
    L.push(escrever(240, C240.T, {
      banco, lote:'0001', tipo:'3', sequencial:++seq, segmento:'T', movimento:t.mov,
      agencia:conta.agencia, conta:conta.conta, nossoNumero:t.nn, carteira:'1', seuNumero:t.seu,
      vencimento:dia(t.venc), valorTitulo:t.valor, bancoCobrador:banco, agenciaCobradora:conta.agencia,
      moeda:'09', tipoInscricaoPagador:'1', inscricaoPagador:'0', pagador:t.nome,
      tarifa:t.tarifa, motivos:t.motivos || ''
    }));
    L.push(escrever(240, C240.U, {
      banco, lote:'0001', tipo:'3', sequencial:++seq, segmento:'U', movimento:t.mov,
      encargos:t.enc, valorPago:t.pago, valorLiquido:t.pago ? t.pago - t.tarifa : 0,
      dataOcorrencia:dia(t.credito === null ? 0 : t.credito - 1),
      dataCredito:t.credito === null ? null : dia(t.credito)
    }));
  }

  L.push(escrever(240, C240.trailerLote, { banco, lote:'0001', tipo:'5', registros: seq + 2 }));
  L.push(escrever(240, C240.trailer, { banco, lote:'9999', tipo:'9', lotes:1, registros: L.length + 1 }));
  return L.join('\r\n') + '\r\n';
}

return { lerRetorno, csv, exemplo240, escrever, C240, I400, BANCOS };
})();
