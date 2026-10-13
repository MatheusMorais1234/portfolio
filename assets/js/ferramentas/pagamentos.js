/* =====================================================================
   pagamentos.js — regras do Pix (BR Code do Banco Central) e do boleto
   (padrão FEBRABAN), em funções puras.

   Sem DOM e sem rede: as páginas das ferramentas usam no navegador e o
   _ferramentas/testar-pagamentos.mjs usa no Node. Nada do que a pessoa
   digita sai do computador dela.
   ===================================================================== */

const Pagamentos = (() => {

/* ---------------------------------------------------------------------
   Utilidades
   --------------------------------------------------------------------- */
const soDigitos = s => String(s || '').replace(/\D/g, '');

// Os bancos leem o BR Code em ASCII. Acento vira letra simples e o que
// sobrar fora da tabela é descartado, para o QR não ser recusado no app.
const semAcento = s => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7E]/g, '');

function cpfValido(v){
  const d = soDigitos(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const n of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const dv = (soma * 10) % 11 % 10;
    if (dv !== Number(d[n])) return false;
  }
  return true;
}

function cnpjValido(v){
  const d = soDigitos(v);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const n of [12, 13]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * pesos[i + 13 - n];
    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    if (dv !== Number(d[n])) return false;
  }
  return true;
}

/* =====================================================================
   PIX
   O BR Code é uma sequência de campos TLV (identificador de 2 dígitos,
   tamanho de 2 dígitos, valor) fechada por um CRC16. Manual de referência:
   "Manual de Padrões para Iniciação do Pix", Banco Central do Brasil.
   ===================================================================== */

// CRC16-CCITT-FALSE: polinômio 0x1021, valor inicial 0xFFFF.
function crc16(texto){
  let crc = 0xFFFF;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;

/* Detecta o tipo da chave e devolve ela no formato que o Pix espera. */
function normalizaChave(bruta){
  const s = String(bruta || '').trim();
  if (!s) return { erro:'Informe a chave Pix.' };

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))
    return { tipo:'aleatoria', chave:s.toLowerCase() };

  if (s.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 77)
      return { erro:'Esse e-mail não parece válido.' };
    return { tipo:'email', chave:s.toLowerCase() };
  }

  const d = soDigitos(s);
  const pareceTelefone = s.startsWith('+') || /[()]/.test(s);
  // 11 dígitos podem ser CPF ou celular. Com a pontuação de CPF, é CPF.
  const pareceCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s);

  if (!pareceTelefone && d.length === 11 && cpfValido(d)) return { tipo:'cpf', chave:d };
  if (pareceCpf) return { erro:'Esse CPF tem dígito verificador inválido.' };
  if (!pareceTelefone && d.length === 14) {
    return cnpjValido(d) ? { tipo:'cnpj', chave:d } : { erro:'Esse CNPJ tem dígito verificador inválido.' };
  }

  // celular: +55 + DDD + número. Aceita com ou sem o 55 na frente.
  let fone = d;
  if (fone.length === 13 && fone.startsWith('55')) fone = fone.slice(2);
  if (fone.length === 11 && fone[2] === '9') return { tipo:'celular', chave:'+55' + fone };

  if (d.length === 11) return { erro:'Esse CPF tem dígito verificador inválido. Se é um celular, escreva com DDD entre parênteses: (62) 99999-9999.' };
  return { erro:'Não reconheci a chave. Use CPF, CNPJ, celular com DDD, e-mail ou chave aleatória.' };
}

/* "1.234,56", "1234,56" e "1234.56" viram "1234.56". Vazio é Pix sem valor. */
function normalizaValor(bruto){
  let s = String(bruto || '').trim().replace(/^R\$\s*/i, '');
  if (!s) return { valor:'' };
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { erro:'Valor inválido. Use o formato 150,00.' };
  const n = Number(s);
  if (n <= 0) return { erro:'O valor precisa ser maior que zero.' };
  if (n > 9999999999.99) return { erro:'Valor alto demais para um Pix.' };
  return { valor:n.toFixed(2) };
}

const LIMITES = { nome:25, cidade:15, txid:25 };

/* Monta o Pix copia e cola estático. Devolve { codigo } ou { erros }. */
function gerarPix(dados){
  const erros = {};

  const chave = normalizaChave(dados.chave);
  if (chave.erro) erros.chave = chave.erro;

  const nome = semAcento(dados.nome).trim().slice(0, LIMITES.nome);
  if (!nome) erros.nome = 'Informe o nome de quem recebe.';

  const cidade = semAcento(dados.cidade).trim().slice(0, LIMITES.cidade);
  if (!cidade) erros.cidade = 'Informe a cidade de quem recebe.';

  const valor = normalizaValor(dados.valor);
  if (valor.erro) erros.valor = valor.erro;

  const txidBruto = String(dados.txid || '').trim();
  if (txidBruto && !/^[A-Za-z0-9]{1,25}$/.test(txidBruto))
    erros.txid = 'Use só letras e números, até 25 caracteres, sem espaço.';
  const txid = txidBruto || '***';

  if (Object.keys(erros).length) return { erros };

  // O campo 26 inteiro não pode passar de 99 caracteres: a descrição
  // fica com o espaço que a chave deixar livre.
  const gui = campo('00', 'br.gov.bcb.pix');
  const campoChave = campo('01', chave.chave);
  const folga = 99 - gui.length - campoChave.length - 4;
  const descricao = semAcento(dados.descricao).trim().slice(0, Math.max(0, folga));

  const conta = gui + campoChave + (descricao ? campo('02', descricao) : '');

  const semCrc =
    campo('00', '01') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    (valor.valor ? campo('54', valor.valor) : '') +
    campo('58', 'BR') +
    campo('59', nome) +
    campo('60', cidade) +
    campo('62', campo('05', txid)) +
    '6304';

  return {
    codigo: semCrc + crc16(semCrc),
    tipoChave: chave.tipo,
    chave: chave.chave,
    descricaoCortada: descricao.length < semAcento(dados.descricao).trim().length,
    nomeCortado: semAcento(dados.nome).trim().length > LIMITES.nome,
    cidadeCortada: semAcento(dados.cidade).trim().length > LIMITES.cidade
  };
}

/* Quebra uma sequência TLV. Devolve null se ela não fechar certinho. */
function lerTLV(texto){
  const campos = [];
  let i = 0;
  while (i < texto.length) {
    const id = texto.slice(i, i + 2);
    const tam = Number(texto.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(texto.slice(i + 2, i + 4))) return null;
    const valor = texto.slice(i + 4, i + 4 + tam);
    if (valor.length !== tam) return null;
    campos.push({ id, valor });
    i += 4 + tam;
  }
  return campos;
}

/* Lê um Pix copia e cola e explica o que tem dentro. */
function lerPix(bruto){
  const texto = String(bruto || '').trim().replace(/[\r\n]+/g, '');
  if (!texto) return { erro:'Cole um código Pix copia e cola.' };
  if (!texto.startsWith('000201')) return { erro:'Isso não parece um Pix copia e cola: todo código começa com 000201.' };

  const campos = lerTLV(texto);
  if (!campos) return { erro:'O código está truncado ou tem um campo com tamanho errado. Confira se ele foi copiado inteiro.' };

  const mapa = Object.fromEntries(campos.map(c => [c.id, c.valor]));
  const crcInformado = (mapa['63'] || '').toUpperCase();
  const crcCalculado = crc16(texto.slice(0, texto.length - 4));

  // A conta do recebedor mora em algum campo entre 26 e 51 com o GUI do Pix.
  let conta = null;
  for (const c of campos) {
    const n = Number(c.id);
    if (n < 26 || n > 51) continue;
    const sub = lerTLV(c.valor);
    if (!sub) continue;
    const s = Object.fromEntries(sub.map(x => [x.id, x.valor]));
    if ((s['00'] || '').toLowerCase() === 'br.gov.bcb.pix') { conta = s; break; }
  }

  const adicionais = mapa['62'] ? Object.fromEntries((lerTLV(mapa['62']) || []).map(x => [x.id, x.valor])) : {};
  const chave = conta ? conta['01'] : undefined;

  return {
    crcValido: crcInformado === crcCalculado,
    crcInformado,
    crcCalculado,
    pix: Boolean(conta),
    dinamico: Boolean(conta && conta['25']),
    chave,
    tipoChave: chave ? (normalizaChave(chave).tipo || 'desconhecido') : undefined,
    url: conta ? conta['25'] : undefined,
    descricao: conta ? conta['02'] : undefined,
    valor: mapa['54'],
    moeda: mapa['53'],
    nome: mapa['59'],
    cidade: mapa['60'],
    cep: mapa['61'],
    txid: adicionais['05'],
    usoUnico: mapa['01'] === '12',
    campos
  };
}

/* =====================================================================
   BOLETO
   Dois mundos com regras diferentes:
   - bancário: 47 dígitos na linha digitável, começa com o código do banco;
   - arrecadação (contas de consumo, tributos): 48 dígitos, começa com 8.
   Os dois têm um código de barras de 44 dígitos por trás.
   ===================================================================== */

// Módulo 10: da direita para a esquerda, pesos 2,1,2,1... somando os
// algarismos de cada produto.
function mod10(numero){
  let soma = 0, peso = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    let p = Number(numero[i]) * peso;
    if (p > 9) p = Math.floor(p / 10) + (p % 10);
    soma += p;
    peso = peso === 2 ? 1 : 2;
  }
  return (10 - (soma % 10)) % 10;
}

// Módulo 11 com pesos 2 a 9, da direita para a esquerda.
function mod11Soma(numero){
  let soma = 0, peso = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    soma += Number(numero[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  return soma;
}

// DV geral do boleto bancário: resultado 0, 10 ou 11 vira 1.
function mod11Bancario(numero){
  const dv = 11 - (mod11Soma(numero) % 11);
  return (dv === 0 || dv === 10 || dv === 11) ? 1 : dv;
}

// Arrecadação: resto 0 ou 1 vira 0.
function mod11Arrecadacao(numero){
  const dv = 11 - (mod11Soma(numero) % 11);
  return dv >= 10 ? 0 : dv;
}

const BANCOS = {
  '001':'Banco do Brasil', '004':'Banco do Nordeste', '021':'Banestes', '033':'Santander',
  '037':'Banpará', '041':'Banrisul', '047':'Banese', '070':'BRB', '077':'Banco Inter',
  '082':'Topázio', '085':'Ailos', '104':'Caixa Econômica Federal', '133':'Cresol',
  '136':'Unicred', '197':'Stone', '208':'BTG Pactual', '212':'Banco Original',
  '237':'Bradesco', '260':'Nubank', '290':'PagBank', '323':'Mercado Pago', '336':'C6 Bank',
  '341':'Itaú', '364':'Efí (Gerencianet)', '380':'PicPay', '389':'Mercantil do Brasil',
  '403':'Cora', '422':'Safra', '623':'Banco Pan', '633':'Rendimento', '655':'Banco Votorantim',
  '707':'Daycoval', '745':'Citibank', '748':'Sicredi', '756':'Sicoob'
};

const SEGMENTOS = {
  '1':'Prefeituras', '2':'Saneamento', '3':'Energia elétrica e gás', '4':'Telecomunicações',
  '5':'Órgãos governamentais', '6':'Carnês e empresas identificadas por CNPJ',
  '7':'Multas de trânsito', '9':'Uso exclusivo do banco'
};

/* O fator de vencimento conta dias a partir de 07/10/1997 e chegou a 9999
   em 21/02/2025. No dia seguinte a contagem recomeçou em 1000, então o
   mesmo fator aponta para duas datas com 25 anos de distância.
   Vale a data do ciclo novo enquanto ela não passar de 3 anos à frente de
   hoje — boleto não é emitido com vencimento tão distante. Depois disso,
   é um boleto antigo, do primeiro ciclo. */
const DIA = 86400000;
const BASE_1 = Date.UTC(1997, 9, 7);
const BASE_2 = Date.UTC(2025, 1, 22);
const JANELA_FUTURO = 3 * 365 * DIA;

const iso = t => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

function dataDoFator(fator, hoje = Date.now()){
  if (fator === 0) return null;
  const ciclo1 = BASE_1 + fator * DIA;
  if (fator < 1000) return iso(ciclo1);
  const ciclo2 = BASE_2 + (fator - 1000) * DIA;
  return iso(ciclo2 <= hoje + JANELA_FUTURO ? ciclo2 : ciclo1);
}

/* Fator de uma data (AAAA-MM-DD), sempre no ciclo atual. */
function fatorDaData(dataIso){
  const [a, m, d] = dataIso.split('-').map(Number);
  const t = Date.UTC(a, m - 1, d);
  return t >= BASE_2 ? 1000 + Math.round((t - BASE_2) / DIA) : Math.round((t - BASE_1) / DIA);
}

/* Monta um boleto bancário válido — usado nos exemplos e nos testes. */
function montarBoletoBancario({ banco, vencimento, valor, campoLivre }){
  const fator = String(fatorDaData(vencimento)).padStart(4, '0');
  const cents = String(Math.round(Number(valor) * 100)).padStart(10, '0');
  const semDv = banco + '9' + fator + cents + campoLivre;
  const barras = semDv.slice(0, 4) + mod11Bancario(semDv) + semDv.slice(4);
  return { barras, linha: linhaDasBarrasBancaria(barras) };
}

const centavos = s => (Number(s) / 100).toFixed(2);

/* --- bancário --- */
function barrasDaLinhaBancaria(l){
  return l.slice(0, 4) + l[32] + l.slice(33, 47) + l.slice(4, 9) + l.slice(10, 20) + l.slice(21, 31);
}

function linhaDasBarrasBancaria(b){
  const c1 = b.slice(0, 4) + b.slice(19, 24);
  const c2 = b.slice(24, 34);
  const c3 = b.slice(34, 44);
  return c1 + mod10(c1) + c2 + mod10(c2) + c3 + mod10(c3) + b[4] + b.slice(5, 19);
}

function formataLinhaBancaria(l){
  return `${l.slice(0,5)}.${l.slice(5,10)} ${l.slice(10,15)}.${l.slice(15,21)} ${l.slice(21,26)}.${l.slice(26,32)} ${l[32]} ${l.slice(33)}`;
}

function analisaBancario(barras, linha, hoje){
  const verificacoes = [];

  if (linha) {
    const blocos = [[0, 9, 9], [10, 20, 20], [21, 31, 31]];
    blocos.forEach(([ini, fim, pos], i) => {
      const esperado = mod10(linha.slice(ini, fim));
      verificacoes.push({
        nome:`Dígito do campo ${i + 1}`,
        ok: esperado === Number(linha[pos]),
        esperado, informado:Number(linha[pos])
      });
    });
  }

  const dvGeral = mod11Bancario(barras.slice(0, 4) + barras.slice(5));
  verificacoes.push({ nome:'Dígito verificador geral', ok: dvGeral === Number(barras[4]), esperado:dvGeral, informado:Number(barras[4]) });

  const fator = Number(barras.slice(5, 9));
  const valor = centavos(barras.slice(9, 19));
  const codBanco = barras.slice(0, 3);

  return {
    tipo:'bancario',
    valido: verificacoes.every(v => v.ok),
    verificacoes,
    banco: { codigo:codBanco, nome:BANCOS[codBanco] || null },
    moeda: barras[3] === '9' ? 'Real' : `Código ${barras[3]}`,
    vencimento: dataDoFator(fator, hoje),
    fator,
    valor: Number(valor) > 0 ? valor : null,
    campoLivre: barras.slice(19),
    barras,
    linha: linha || linhaDasBarrasBancaria(barras),
    linhaFormatada: formataLinhaBancaria(linha || linhaDasBarrasBancaria(barras))
  };
}

/* --- arrecadação --- */
function analisaArrecadacao(barras, linha){
  const referencia = barras[2];
  const usaMod10 = referencia === '6' || referencia === '7';
  const calcula = usaMod10 ? mod10 : mod11Arrecadacao;
  const verificacoes = [];

  if (linha) {
    for (let i = 0; i < 4; i++) {
      const bloco = linha.slice(i * 12, i * 12 + 11);
      const esperado = calcula(bloco);
      const informado = Number(linha[i * 12 + 11]);
      verificacoes.push({ nome:`Dígito do bloco ${i + 1}`, ok: esperado === informado, esperado, informado });
    }
  }

  const dvGeral = calcula(barras.slice(0, 3) + barras.slice(4));
  verificacoes.push({ nome:'Dígito verificador geral', ok: dvGeral === Number(barras[3]), esperado:dvGeral, informado:Number(barras[3]) });

  if (!['6', '7', '8', '9'].includes(referencia))
    verificacoes.push({ nome:'Identificador de valor', ok:false, esperado:'6, 7, 8 ou 9', informado:referencia });

  const efetivo = referencia === '6' || referencia === '8';
  const linhaFinal = linha || [0, 11, 22, 33].map(i => {
    const bloco = barras.slice(i, i + 11);
    return bloco + calcula(bloco);
  }).join('');

  return {
    tipo:'arrecadacao',
    valido: verificacoes.every(v => v.ok),
    verificacoes,
    segmento: { codigo:barras[1], nome:SEGMENTOS[barras[1]] || null },
    valor: efetivo && Number(barras.slice(4, 15)) > 0 ? centavos(barras.slice(4, 15)) : null,
    valorReferencia: !efetivo,
    modulo: usaMod10 ? 10 : 11,
    // segmento 6 identifica a empresa pelo CNPJ (8 dígitos); os outros, por 4
    empresa: barras[1] === '6' ? barras.slice(15, 23) : barras.slice(15, 19),
    barras,
    linha: linhaFinal,
    linhaFormatada: [0, 12, 24, 36].map(i => `${linhaFinal.slice(i, i + 11)}-${linhaFinal[i + 11]}`).join(' ')
  };
}

/* Aceita linha digitável ou código de barras, com ou sem pontuação. */
function analisarBoleto(bruto, hoje = Date.now()){
  const d = soDigitos(bruto);
  if (!d) return { erro:'Cole a linha digitável ou o código de barras do boleto.' };

  if (d.length === 47) {
    if (d[0] === '8') return { erro:'Boletos de 47 dígitos não começam com 8. Confira se algum número ficou de fora.' };
    return analisaBancario(barrasDaLinhaBancaria(d), d, hoje);
  }
  if (d.length === 48) {
    if (d[0] !== '8') return { erro:'Contas de consumo e tributos (48 dígitos) começam sempre com 8.' };
    const barras = d.slice(0, 11) + d.slice(12, 23) + d.slice(24, 35) + d.slice(36, 47);
    return analisaArrecadacao(barras, d);
  }
  if (d.length === 44) {
    return d[0] === '8' ? analisaArrecadacao(d, null) : analisaBancario(d, null, hoje);
  }
  return { erro:`Foram encontrados ${d.length} dígitos. A linha digitável tem 47 (boleto bancário) ou 48 (conta de consumo), e o código de barras tem 44.` };
}

/* Código de barras Interleaved 2 of 5, o padrão impresso no boleto.
   Devolve a lista de larguras alternando barra e espaço, começando por
   barra, em módulos (estreito = 1, largo = 3). */
const ITF = ['00110', '10001', '01001', '11000', '00101', '10100', '01100', '00011', '10010', '01010'];

function larguraItf(digitos){
  const L = b => (b === '1' ? 3 : 1);
  const w = [1, 1, 1, 1]; // início: barra, espaço, barra, espaço estreitos
  for (let i = 0; i < digitos.length; i += 2) {
    const barras = ITF[Number(digitos[i])];
    const espacos = ITF[Number(digitos[i + 1])];
    for (let k = 0; k < 5; k++) w.push(L(barras[k]), L(espacos[k]));
  }
  w.push(3, 1, 1); // fim: barra larga, espaço estreito, barra estreita
  return w;
}

return {
  soDigitos, cpfValido, cnpjValido,
  crc16, normalizaChave, normalizaValor, gerarPix, lerPix, LIMITES,
  mod10, mod11Bancario, mod11Arrecadacao, dataDoFator, fatorDaData, montarBoletoBancario,
  analisarBoleto, linhaDasBarrasBancaria, larguraItf, BANCOS
};
})();
