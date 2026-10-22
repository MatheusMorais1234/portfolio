/*
   testar-pagamentos.mjs — prova as regras do assets/js/ferramentas/pagamentos.js

   Uso:  node _ferramentas/testar-pagamentos.mjs
   Sem dependência: roda no Node puro. Sai com código 1 se algo falhar.
   */

import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
runInNewContext(readFileSync(join(raiz, 'assets/js/ferramentas/pagamentos.js'), 'utf8') + ';globalThis.P = Pagamentos;', ctx);
const P = ctx.P;

let ok = 0, falhas = 0;
function t(nome, fn){
  try { fn(); ok++; }
  catch (e) { falhas++; console.error(`  ✗ ${nome}\n    ${e.message}`); }
}
function igual(a, b, msg = ''){
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error(`${msg} esperado ${B}, veio ${A}`);
}

/* Pix */

t('CRC16 do exemplo do manual do Banco Central', () => {
  const semCrc = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
  igual(P.crc16(semCrc), '1D3D');
});

t('gera exatamente o BR Code do exemplo do manual', () => {
  const r = P.gerarPix({ chave:'123e4567-e12b-12d1-a456-426655440000', nome:'Fulano de Tal', cidade:'BRASILIA' });
  igual(r.codigo, '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D');
});

t('valor, descrição e txid entram nos campos certos', () => {
  const r = P.gerarPix({ chave:'fulano@exemplo.com', nome:'Fulano', cidade:'Goiânia', valor:'1.234,50', txid:'PEDIDO42', descricao:'Pedido 42' });
  const lido = P.lerPix(r.codigo);
  igual(lido.crcValido, true);
  igual(lido.valor, '1234.50');
  igual(lido.txid, 'PEDIDO42');
  igual(lido.descricao, 'Pedido 42');
  igual(lido.cidade, 'Goiania', 'acento removido:');
});

t('detecta cada tipo de chave', () => {
  igual(P.normalizaChave('529.982.247-25').tipo, 'cpf');
  igual(P.normalizaChave('11.222.333/0001-81').tipo, 'cnpj');
  igual(P.normalizaChave('(62) 99201-4463').chave, '+5562992014463');
  igual(P.normalizaChave('+55 62 99201-4463').chave, '+5562992014463');
  igual(P.normalizaChave('Fulano@Exemplo.com').chave, 'fulano@exemplo.com');
  igual(P.normalizaChave('123E4567-E12B-12D1-A456-426655440000').tipo, 'aleatoria');
});

t('recusa CPF e CNPJ com dígito errado', () => {
  igual(Boolean(P.normalizaChave('529.982.247-26').erro), true);
  igual(Boolean(P.normalizaChave('11.222.333/0001-82').erro), true);
});

t('valor: formatos aceitos e recusados', () => {
  igual(P.normalizaValor('150').valor, '150.00');
  igual(P.normalizaValor('R$ 1.234,5').valor, '1234.50');
  igual(P.normalizaValor('10.99').valor, '10.99');
  igual(Boolean(P.normalizaValor('0').erro), true);
  igual(Boolean(P.normalizaValor('12,345').erro), true);
});

t('nome e cidade longos são cortados no limite do padrão', () => {
  const r = P.gerarPix({ chave:'fulano@exemplo.com', nome:'Nome muito comprido para caber no campo', cidade:'Cidade com nome grande demais' });
  const lido = P.lerPix(r.codigo);
  igual(lido.nome.length, 25);
  igual(lido.cidade.length, 15);
  igual(r.nomeCortado, true);
});

t('descrição nunca estoura os 99 caracteres do campo 26', () => {
  const r = P.gerarPix({ chave:'um.email.bem.comprido.para.testar.o.limite@dominio-grande.com.br', nome:'A', cidade:'B', descricao:'x'.repeat(80) });
  const campo26 = P.lerPix(r.codigo).campos.find(c => c.id === '26');
  igual(campo26.valor.length <= 99, true);
  igual(r.descricaoCortada, true);
});

t('leitor aponta CRC adulterado', () => {
  const r = P.gerarPix({ chave:'fulano@exemplo.com', nome:'Fulano', cidade:'Goiania', valor:'10' });
  const adulterado = r.codigo.replace('10.00', '99.00');
  igual(P.lerPix(adulterado).crcValido, false);
});

t('leitor recusa código truncado', () => {
  const r = P.gerarPix({ chave:'fulano@exemplo.com', nome:'Fulano', cidade:'Goiania' });
  igual(Boolean(P.lerPix(r.codigo.slice(0, -10)).erro), true);
});

t('leitor reconhece Pix dinâmico (URL no lugar da chave)', () => {
  const conta = '0014br.gov.bcb.pix2530pix.exemplo.com.br/qr/v2/abc12';
  const semCrc = '000201010212' + '26' + String(conta.length).padStart(2,'0') + conta + '520400005303986' + '5802BR5906Fulano6007Goiania' + '62070503***6304';
  const lido = P.lerPix(semCrc + P.crc16(semCrc));
  igual(lido.dinamico, true);
  igual(lido.usoUnico, true);
  igual(lido.crcValido, true);
});

/* Boleto */

t('módulo 10 e módulo 11 com valores conhecidos', () => {
  igual(P.mod10('001905009'), 5);
  igual(P.mod11Bancario('0019373700000001000500940144816060680935031'), 3);
});

t('boleto bancário real (Banco do Brasil) é válido', () => {
  const r = P.analisarBoleto('00190.50095 40144.816069 06809.350314 3 37370000000100');
  igual(r.valido, true, JSON.stringify(r.verificacoes));
  igual(r.banco.nome, 'Banco do Brasil');
  igual(r.valor, '1.00');
});

t('linha → barras → linha fecha o ciclo', () => {
  const linha = '00190500954014481606906809350314337370000000100';
  const r = P.analisarBoleto(linha);
  igual(P.linhaDasBarrasBancaria(r.barras), linha);
  igual(P.analisarBoleto(r.barras).linha, linha);
});

t('um dígito trocado derruba a validação e diz qual campo', () => {
  const r = P.analisarBoleto('00190500954014481606906809350314337370000000200');
  igual(r.valido, false);
  igual(r.verificacoes.filter(v => !v.ok).map(v => v.nome), ['Dígito verificador geral']);
  const r2 = P.analisarBoleto('00190500964014481606906809350314337370000000100');
  igual(r2.verificacoes.find(v => !v.ok).nome, 'Dígito do campo 1');
});

t('fator de vencimento antes e depois do recomeço de 2025', () => {
  igual(P.dataDoFator(1000, Date.UTC(2000, 0, 1)), '2000-07-03');
  igual(P.dataDoFator(9999, Date.UTC(2025, 1, 1)), '2025-02-21');
  igual(P.dataDoFator(1000, Date.UTC(2025, 5, 1)), '2025-02-22');
  igual(P.dataDoFator(1200, Date.UTC(2026, 8, 17)), '2025-09-10');
  igual(P.dataDoFator(0), null);
  // boleto antigo: o ciclo novo daria 2032, longe demais — é de 2007
  igual(P.dataDoFator(3737, Date.UTC(2026, 8, 17)), '2007-12-31');
});

t('boleto montado a partir de data e valor volta com os mesmos dados', () => {
  const { linha } = P.montarBoletoBancario({ banco:'341', vencimento:'2026-09-24', valor:'250.00', campoLivre:'1090000012345678901234567' });
  const r = P.analisarBoleto(linha, Date.UTC(2026, 8, 17));
  igual(r.valido, true);
  igual(r.vencimento, '2026-09-24');
  igual(r.valor, '250.00');
  igual(r.banco.nome, 'Itaú');
});

// monta um boleto de arrecadação válido a partir das regras, para cada módulo
function arrecadacao(ref){
  const calc = (ref === '6' || ref === '7') ? P.mod10 : P.mod11Arrecadacao;
  const corpo = '8' + '3' + ref + '00000012345' + '0048' + '1234567890123456789012345'.slice(0, 25);
  const barras = corpo.slice(0, 3) + calc(corpo.slice(0, 3) + corpo.slice(3)) + corpo.slice(3);
  return barras;
}

t('arrecadação com módulo 10 e com módulo 11', () => {
  for (const ref of ['6', '8']) {
    const barras = arrecadacao(ref);
    igual(barras.length, 44);
    const r = P.analisarBoleto(barras);
    igual(r.valido, true, `ref ${ref}`);
    igual(r.valor, '123.45');
    igual(r.segmento.nome, 'Energia elétrica e gás');
    const pelaLinha = P.analisarBoleto(r.linha);
    igual(pelaLinha.valido, true, `linha ref ${ref}`);
    igual(pelaLinha.barras, barras);
  }
});

t('arrecadação com bloco adulterado aponta o bloco', () => {
  const r = P.analisarBoleto(arrecadacao('6'));
  const l = r.linha.split('');
  l[14] = String((Number(l[14]) + 1) % 10);
  const ruim = P.analisarBoleto(l.join(''));
  igual(ruim.valido, false);
  igual(ruim.verificacoes.find(v => !v.ok).nome, 'Dígito do bloco 2');
});

t('quantidade de dígitos errada tem mensagem clara', () => {
  igual(/46 dígitos/.test(P.analisarBoleto('1'.repeat(46)).erro), true);
});

t('ITF: 44 dígitos geram 4 + 22×10 + 3 larguras', () => {
  igual(P.larguraItf('0'.repeat(44)).length, 227);
});

/* CNAB (retorno de cobrança) */

const ctxC = {};
runInNewContext(readFileSync(join(raiz, 'assets/js/ferramentas/cnab.js'), 'utf8') + ';globalThis.C = Cnab;', ctxC);
const C = ctxC.C;
const HOJE = Date.UTC(2026, 9, 13, 12);

t('CNAB 240: arquivo de exemplo é lido inteiro e íntegro', () => {
  const r = C.lerRetorno(C.exemplo240(HOJE));
  igual(r.erro, undefined);
  igual(r.layout, '240');
  igual(r.valido, true, JSON.stringify(r.verificacoes.filter(v => !v.ok)));
  igual(r.banco.nome, 'Sicoob');
  igual(r.titulos.length, 6);
  igual(r.resumo.pagos, 3);
  igual(r.resumo.rejeitados, 1);
  igual(r.resumo.recebido, 35000 + 122640 + 8990);
  igual(r.resumo.creditado, 35000 + 122640 + 8990 - 750);
});

t('CNAB 240: segmentos T e U montados à mão, campo por campo do manual', () => {
  const T = '756' + '0001' + '3' + '00001' + 'T' + ' ' + '06'
    + '04321' + '0' + '000000123456' + '7' + ' '
    + '1000001'.padEnd(20) + '1' + 'NF 1021'.padEnd(15) + '15092026' + '000000000035000'
    + '756' + '04321' + '0' + ' '.repeat(25) + '09' + '1' + '000052998224725'
    + 'FULANO DE TAL'.padEnd(40) + '0000000000' + '000000000000250' + ' '.repeat(10);
  igual(T.length, 223);
  const U = '756' + '0001' + '3' + '00002' + 'U' + ' ' + '06'
    + '000000000000500' + '0'.repeat(15) + '0'.repeat(15) + '0'.repeat(15)
    + '000000000035500' + '000000000035250' + '0'.repeat(15) + '0'.repeat(15)
    + '16092026' + '17092026';
  igual(U.length, 153);
  const head = C.escrever(240, C.C240.header, { banco:'756', lote:'0000', tipo:'0', remessaRetorno:'2' });
  const hl = C.escrever(240, C.C240.headerLote, { banco:'756', lote:'0001', tipo:'1' });
  const tl = C.escrever(240, C.C240.trailerLote, { banco:'756', lote:'0001', tipo:'5', registros:4 });
  const ta = C.escrever(240, C.C240.trailer, { banco:'756', lote:'9999', tipo:'9', lotes:1, registros:6 });
  const r = C.lerRetorno([head, hl, T.padEnd(240), U.padEnd(240), tl, ta].join('\n'));
  igual(r.valido, true);
  const x = r.titulos[0];
  igual(x.nossoNumero, '1000001');
  igual(x.seuNumero, 'NF 1021');
  igual(x.pagador, 'FULANO DE TAL');
  igual(x.documentoPagador, '52998224725');
  igual(x.vencimento, '2026-09-15');
  igual(x.valorTitulo, 35000);
  igual(x.tarifa, 250);
  igual(x.ocorrencia.grupo, 'pago');
  igual(x.encargos, 500);
  igual(x.valorPago, 35500);
  igual(x.valorLiquido, 35250);
  igual(x.dataOcorrencia, '2026-09-16');
  igual(x.dataCredito, '2026-09-17');
});

t('CNAB 240: trailer com quantidade errada é apontado', () => {
  const linhas = C.exemplo240(HOJE).trim().split('\r\n');
  linhas.splice(3, 1); // some um segmento U, como num download cortado
  const r = C.lerRetorno(linhas.join('\r\n'));
  igual(r.valido, false);
  const falhas = r.verificacoes.filter(v => !v.ok).map(v => v.nome);
  igual(falhas.includes('Quantidade de registros do arquivo'), true);
  igual(falhas.includes('Quantidade de registros do lote 1'), true);
});

t('CNAB 240: remessa é recusada com explicação', () => {
  const linhas = C.exemplo240(HOJE).split('\r\n');
  linhas[0] = linhas[0].slice(0, 142) + '1' + linhas[0].slice(143);
  igual(/remessa/.test(C.lerRetorno(linhas.join('\r\n')).erro), true);
});

t('CNAB 240: linha sem os espaços finais ainda é lida', () => {
  const texto = C.exemplo240(HOJE).split('\r\n').map(l => l.replace(/\s+$/, '')).join('\n');
  const r = C.lerRetorno(texto);
  igual(r.layout, '240');
  igual(r.titulos.length, 6);
});

t('CNAB 400 Itaú: detalhe e trailer', () => {
  const H = C.escrever(400, C.I400.header, { tipo:'0', remessaRetorno:'2', literal:'RETORNO', banco:'341', nomeBanco:'BANCO ITAU SA', dataGeracao:'2026-10-10', sequencial:1 });
  const D = C.escrever(400, C.I400.detalhe, { tipo:'1', nossoNumero:'12345678', ocorrencia:'06', dataOcorrencia:'2026-10-09', seuNumero:'PED 77', vencimento:'2026-10-05', valorTitulo:10000, tarifa:190, valorPrincipal:10310, encargos:500, dataCredito:'2026-10-10', pagador:'Fulano de Tal', sequencial:2 });
  const T = C.escrever(400, C.I400.trailer, { tipo:'9', remessaRetorno:'2', banco:'341', sequencial:3 });
  const r = C.lerRetorno([H, D, T].join('\r\n'));
  igual(r.layout, '400');
  igual(r.valido, true);
  igual(r.dataGeracao, '2026-10-10');
  const x = r.titulos[0];
  igual(x.ocorrencia.texto, 'Liquidação normal');
  igual(x.vencimento, '2026-10-05');
  igual(x.valorLiquido, 10310);
  igual(x.pagador, 'FULANO DE TAL');
  igual(r.resumo.recebido, 10310);
});

t('CNAB 400 de outro banco tem mensagem clara', () => {
  const H = C.escrever(400, C.I400.header, { tipo:'0', remessaRetorno:'2', banco:'237', sequencial:1 });
  igual(/Bradesco/.test(C.lerRetorno(H).erro), true);
});

t('CNAB: arquivo que não é CNAB', () => {
  igual(/240 ou de 400/.test(C.lerRetorno('nome;valor\nfulano;10').erro), true);
});

t('CNAB: CSV abre no Excel em português', () => {
  const csv = C.csv(C.lerRetorno(C.exemplo240(HOJE)));
  igual(csv.charCodeAt(0), 0xFEFF);
  igual(csv.split('\r\n')[1].includes('350,00'), true);
  igual(csv.trim().split('\r\n').length, 7);
});

console.log(`\n  ${ok} passaram, ${falhas} falharam\n`);
if (falhas) process.exit(1);
