/*
  Doccob Validator

  - Suporta layouts DOCCOB 3.0A (guia DOCCO31.pdf) e DOCCOB 5.0 (guia DOCCOB-50.pdf)
  - Renderiza cada linha como um "card" (details/summary) com campos + indicadores de erro/aviso
  - Regra extra: valida datas/horas e sinaliza quando não representam valores reais
*/

// -------------------------- Utilitários --------------------------

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(str = "") {
  // para atributos (data-*)
  return escapeHtml(str).replace(/\n/g, " ");
}

function isAllSpaces(str = "") {
  return /^[ ]*$/.test(String(str));
}

function isAllZeros(str = "") {
  return /^[0]*$/.test(String(str));
}

function onlyDigits(str = "") {
  return /^\d+$/.test(String(str));
}

function toIntSafe(str) {
  const n = parseInt(str, 10);
  return Number.isFinite(n) ? n : NaN;
}

function issueLabel(kind, icon, message) {
  const cls = kind === "error" ? "problem" : "warn";
  const msg = escapeHtml(message);
  return `<label class="${cls}"><i class="bi ${icon}"><span class="alert">${msg}</span></i></label>`;
}

function formatMoney(raw, intDigits, decDigits) {
  const s = String(raw ?? "");
  if (!onlyDigits(s)) return escapeHtml(s);
  const total = intDigits + decDigits;
  const padded = s.padStart(total, "0");
  const ints = padded.slice(0, intDigits);
  const decs = padded.slice(intDigits);
  const intsClean = ints.replace(/^0+(?=\d)/, "");
  const pretty = `${intsClean || "0"},${decs}`;
  const mini = `${ints},${decs}`;
  return `${escapeHtml(pretty)} <span class="muted">(${escapeHtml(mini)})</span>`;
}

function formatDecimal(raw, intDigits, decDigits) {
  // igual money, mas sem mini se quiser (mantemos mini por consistência)
  return formatMoney(raw, intDigits, decDigits);
}

function formatCnpj(raw) {
  const s = String(raw ?? "");
  if (!onlyDigits(s) || s.length !== 14) return escapeHtml(s.trimEnd());
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12, 14)}`;
}

function isValidDateParts(day, month, year) {
  const d = toIntSafe(day);
  const m = toIntSafe(month);
  const y = toIntSafe(year);
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return false;
  if (y < 1000 || y > 9999) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === (m - 1) && dt.getDate() === d;
}

function parseDate6(raw) {
  const s = String(raw ?? "");
  if (isAllSpaces(s) || isAllZeros(s)) return { empty: true, valid: false, pretty: "" };
  if (!onlyDigits(s) || s.length !== 6) return { empty: false, valid: false, pretty: escapeHtml(s) };
  const dd = s.slice(0, 2);
  const mm = s.slice(2, 4);
  const yy = s.slice(4, 6);
  const yyyy = 2000 + toIntSafe(yy);
  const valid = isValidDateParts(dd, mm, String(yyyy));
  return { empty: false, valid, pretty: `${dd}/${mm}/${yy}` };
}

function parseDate8(raw) {
  const s = String(raw ?? "");
  if (isAllSpaces(s) || isAllZeros(s)) return { empty: true, valid: false, pretty: "" };
  if (!onlyDigits(s) || s.length !== 8) return { empty: false, valid: false, pretty: escapeHtml(s) };
  const dd = s.slice(0, 2);
  const mm = s.slice(2, 4);
  const yyyy = s.slice(4, 8);
  const valid = isValidDateParts(dd, mm, yyyy);
  return { empty: false, valid, pretty: `${dd}/${mm}/${yyyy}` };
}

function parseTime4(raw) {
  const s = String(raw ?? "");
  if (isAllSpaces(s)) return { empty: true, valid: false, pretty: "" };
  if (!onlyDigits(s) || s.length !== 4) return { empty: false, valid: false, pretty: escapeHtml(s) };
  const hh = toIntSafe(s.slice(0, 2));
  const mm = toIntSafe(s.slice(2, 4));
  const valid = Number.isFinite(hh) && Number.isFinite(mm) && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  return { empty: false, valid, pretty: `${s.slice(0, 2)}:${s.slice(2, 4)}` };
}

const UF_LIST = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
]);

// -------------------------- Schemas --------------------------

// Observação: posição (pos) aqui é 1-based (como nos guias). O slice interno converte.
const DOCCOB_LAYOUTS = {
  "3.0A": {
    label: "3.0A",
    recordLength: 170,
    records: {
      "000": {
        title: "CABEÇALHO DE INTERCÂMBIO (UNB)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "000" },
          { key: "idRem", label: "IDENTIFICAÇÃO DO REMETENTE", pos: 4, len: 35, format: "A", status: "M" },
          { key: "idDes", label: "IDENTIFICAÇÃO DO DESTINATÁRIO", pos: 39, len: 35, format: "A", status: "M" },
          { key: "data", label: "DATA", pos: 74, len: 6, format: "N", status: "M", kind: "date6" },
          { key: "hora", label: "HORA", pos: 80, len: 4, format: "N", status: "M", kind: "time4" },
          { key: "idInter", label: "IDENTIFICAÇÃO DO INTERCÂMBIO", pos: 84, len: 12, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 96, len: 75, format: "A", status: "C", hidden: true }
        ]
      },
      "350": {
        title: "CABEÇALHO DE DOCUMENTO (UNH)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "350" },
          { key: "idDoc", label: "IDENTIFICAÇÃO DO DOCUMENTO", pos: 4, len: 14, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 18, len: 153, format: "A", status: "C", hidden: true }
        ]
      },
      "351": {
        title: "DADOS DA TRANSPORTADORA (TRA)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "351" },
          { key: "cnpj", label: "C.G.C. (CNPJ)", pos: 4, len: 14, format: "N", status: "M", kind: "cnpj" },
          { key: "razao", label: "RAZÃO SOCIAL", pos: 18, len: 40, format: "A", status: "C" },
          { key: "filler", label: "FILLER", pos: 58, len: 113, format: "A", status: "C", hidden: true }
        ]
      },
      "352": {
        title: "DOCUMENTO DE COBRANÇA (DCO)",
        allowedLengths: [170, 340],
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "352" },
          { key: "filial", label: "FILIAL EMISSORA DO DOCUMENTO", pos: 4, len: 10, format: "A", status: "M" },
          { key: "tipoDoc", label: "TIPO DO DOCUMENTO DE COBRANÇA", pos: 14, len: 1, format: "N", status: "M", allowed: ["0","1"], allowedHint: "0 = NF Fatura; 1 = Romaneio" },
          { key: "serie", label: "SÉRIE DO DOCUMENTO DE COBRANÇA", pos: 15, len: 3, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DO DOCUMENTO DE COBRANÇA", pos: 18, len: 10, format: "N", status: "M" },
          { key: "dataEmi", label: "DATA DE EMISSÃO", pos: 28, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "dataVen", label: "DATA DE VENCIMENTO", pos: 36, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "valor", label: "VALOR DO DOCUMENTO DE COBRANÇA", pos: 44, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "tipoCob", label: "TIPO DE COBRANÇA", pos: 59, len: 3, format: "A", status: "M", allowed: ["BCO","CAR"], severityOnAllowed: "warn", allowedHint: "BCO = bancária; CAR = carteira" },
          { key: "icms", label: "VALOR TOTAL DO ICMS", pos: 62, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "juros", label: "VALOR – JUROS POR DIA DE ATRASO", pos: 77, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "dataLim", label: "DATA LIMITE P/ PAGTO C/ DESCONTO", pos: 92, len: 8, format: "N", status: "C", kind: "date8" },
          { key: "desconto", label: "VALOR DO DESCONTO", pos: 100, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "agente", label: "IDENTIFICAÇÃO DO AGENTE DE COBRANÇA", pos: 115, len: 35, format: "A", status: "M" },
          { key: "agencia", label: "NÚMERO DA AGÊNCIA BANCÁRIA", pos: 150, len: 4, format: "N", status: "C" },
          { key: "agenciaDV", label: "DÍGITO VERIFICADOR NUM. DA AGÊNCIA", pos: 154, len: 1, format: "A", status: "C" },
          { key: "conta", label: "NÚMERO DA CONTA CORRENTE", pos: 155, len: 10, format: "N", status: "C" },
          { key: "contaDV", label: "DÍGITO VERIFICADOR CONTA CORRENTE", pos: 165, len: 2, format: "A", status: "C" },
          { key: "acao", label: "AÇÃO DO DOCUMENTO", pos: 167, len: 1, format: "A", status: "C", allowed: ["I","E"], severityOnAllowed: "warn", allowedHint: "I = incluir; E = excluir/cancelar" },
          { key: "filler", label: "FILLER", pos: 168, len: 3, format: "A", status: "C", hidden: true }
        ]
      },
      "353": {
        title: "CONHECIMENTOS EM COBRANÇA (CCO)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "353" },
          { key: "filial", label: "FILIAL EMISSORA DO DOCUMENTO", pos: 4, len: 10, format: "A", status: "M" },
          { key: "serie", label: "SÉRIE DO CONHECIMENTO", pos: 14, len: 5, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DO CONHECIMENTO", pos: 19, len: 12, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 31, len: 140, format: "A", status: "C", hidden: true }
        ]
      },
      "354": {
        title: "NOTAS FISCAIS EM COBRANÇA NO CONHECIMENTO (CNF)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "354" },
          { key: "serie", label: "SÉRIE", pos: 4, len: 3, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DA NOTA FISCAL", pos: 7, len: 8, format: "N", status: "M" },
          { key: "data", label: "DATA DE EMISSÃO DA NOTA FISCAL", pos: 15, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "peso", label: "PESO DA NOTA FISCAL", pos: 23, len: 7, format: "N", status: "M", kind: "decimal", int: 5, dec: 2 },
          { key: "valor", label: "VALOR DA MERCADORIA NA NOTA FISCAL", pos: 30, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "cnpj", label: "CGC DO EMISSOR DA NOTA FISCAL", pos: 45, len: 14, format: "N", status: "C", kind: "cnpj" },
          { key: "filler", label: "FILLER", pos: 59, len: 112, format: "A", status: "C", hidden: true }
        ]
      },
      "355": {
        title: "TOTAL DE DOCUMENTOS DE COBRANÇA (TDC)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "355" },
          { key: "qtd", label: "QTDE. TOTAL DOCTOS. DE COBRANÇA", pos: 4, len: 4, format: "N", status: "M" },
          { key: "valor", label: "VALOR TOTAL DOCTOS. DE COBRANÇA", pos: 8, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "filler", label: "FILLER", pos: 23, len: 148, format: "A", status: "C", hidden: true }
        ]
      }
    }
  },
  "5.0": {
    label: "5.0",
    recordLength: 280,
    records: {
      "000": {
        title: "CABEÇALHO DE INTERCÂMBIO (UNB)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "000" },
          { key: "idRem", label: "IDENTIFICAÇÃO DO REMETENTE", pos: 4, len: 35, format: "A", status: "M" },
          { key: "idDes", label: "IDENTIFICAÇÃO DO DESTINATÁRIO", pos: 39, len: 35, format: "A", status: "M" },
          { key: "data", label: "DATA", pos: 74, len: 6, format: "N", status: "M", kind: "date6" },
          { key: "hora", label: "HORA", pos: 80, len: 4, format: "N", status: "M", kind: "time4" },
          { key: "idInter", label: "IDENTIFICAÇÃO DO INTERCÂMBIO", pos: 84, len: 12, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 96, len: 185, format: "A", status: "C", hidden: true }
        ]
      },
      "550": {
        title: "CABEÇALHO DE DOCUMENTO (UNH)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "550" },
          { key: "idDoc", label: "IDENTIFICAÇÃO DO DOCUMENTO", pos: 4, len: 14, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 18, len: 263, format: "A", status: "C", hidden: true }
        ]
      },
      "551": {
        title: "DADOS DA TRANSPORTADORA (TRA)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "551" },
          { key: "cnpj", label: "CNPJ", pos: 4, len: 14, format: "N", status: "M", kind: "cnpj" },
          { key: "razao", label: "RAZÃO SOCIAL", pos: 18, len: 50, format: "A", status: "M" },
          { key: "filler", label: "FILLER", pos: 68, len: 213, format: "A", status: "C", hidden: true }
        ]
      },
      "552": {
        title: "DOCUMENTO DE COBRANÇA (DCO)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "552" },
          { key: "filial", label: "FILIAL EMISSORA DO DOCUMENTO", pos: 4, len: 10, format: "A", status: "M" },
          { key: "tipoDoc", label: "TIPO DO DOCUMENTO DE COBRANÇA", pos: 14, len: 1, format: "N", status: "M", allowed: ["0","1"], allowedHint: "0 = NF Fatura; 1 = Romaneio" },
          { key: "serie", label: "SÉRIE DO DOCUMENTO DE COBRANÇA", pos: 15, len: 3, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DO DOCUMENTO DE COBRANÇA", pos: 18, len: 10, format: "N", status: "M" },
          { key: "dataEmi", label: "DATA DE EMISSÃO", pos: 28, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "dataVen", label: "DATA DE VENCIMENTO", pos: 36, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "valor", label: "VALOR DO DOCUMENTO DE COBRANÇA", pos: 44, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "tipoCob", label: "TIPO DE COBRANÇA", pos: 59, len: 3, format: "A", status: "M", allowed: ["BCO","CAR"], severityOnAllowed: "warn", allowedHint: "BCO = bancária; CAR = carteira" },
          { key: "pctMulta", label: "PERCENTUAL MULTA", pos: 62, len: 4, format: "N", status: "C", kind: "decimal", int: 2, dec: 2 },
          { key: "juros", label: "VALOR – JUROS POR DIA DE ATRASO", pos: 66, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "dataLim", label: "DATA LIMITE P/ PAGTO C/ DESCONTO", pos: 81, len: 8, format: "N", status: "C", kind: "date8" },
          { key: "desconto", label: "VALOR DO DESCONTO", pos: 89, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "codAgente", label: "CÓDIGO DO AGENTE DE COBRANÇA", pos: 104, len: 5, format: "N", status: "C" },
          { key: "nomeAgente", label: "NOME DO AGENTE DE COBRANÇA", pos: 109, len: 30, format: "A", status: "C" },
          { key: "agencia", label: "NÚMERO DA AGÊNCIA BANCÁRIA", pos: 139, len: 4, format: "N", status: "C" },
          { key: "agenciaDV", label: "DÍGITO VERIFICADOR NUM. DA AGÊNCIA", pos: 143, len: 1, format: "A", status: "C" },
          { key: "conta", label: "NÚMERO DA CONTA CORRENTE", pos: 144, len: 10, format: "N", status: "C" },
          { key: "contaDV", label: "DÍGITO VERIFICADOR CONTA CORRENTE", pos: 154, len: 2, format: "A", status: "C" },
          { key: "acao", label: "AÇÃO DO DOCUMENTO", pos: 156, len: 1, format: "A", status: "C", allowed: ["I","E"], severityOnAllowed: "warn", allowedHint: "I = incluir; E = excluir/cancelar" },
          { key: "preFatura", label: "IDENTIFICAÇÃO PRÉ-FATURA CLIENTE", pos: 157, len: 10, format: "N", status: "C" },
          { key: "preFaturaComp", label: "IDENTIFICAÇÃO COMPLEMENTAR PRÉ-FATURA", pos: 167, len: 20, format: "A", status: "C" },
          { key: "cfop", label: "CFOP", pos: 187, len: 5, format: "A", status: "C" },
          { key: "chaveCod", label: "CÓDIGO NUMÉRICO (CHAVE ACESSO)", pos: 192, len: 9, format: "N", status: "C" },
          { key: "chave", label: "CHAVE ACESSO NF-e COM DV", pos: 201, len: 45, format: "A", status: "C" },
          { key: "protocolo", label: "NÚMERO PROTOCOLO NF-e", pos: 246, len: 15, format: "A", status: "C" },
          { key: "filler", label: "FILLER", pos: 261, len: 20, format: "A", status: "C", hidden: true }
        ]
      },
      "553": {
        title: "IMPOSTOS DO DOCUMENTO DE COBRANÇA (IMP)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "553" },
          { key: "icms", label: "VALOR TOTAL DO ICMS", pos: 4, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "aliqIcms", label: "ALÍQUOTA ICMS", pos: 19, len: 5, format: "N", status: "C", kind: "decimal", int: 3, dec: 2 },
          { key: "baseIcms", label: "BASE CÁLCULO ICMS", pos: 24, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "iss", label: "VALOR TOTAL ISS", pos: 39, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "aliqIss", label: "ALÍQUOTA ISS", pos: 54, len: 5, format: "N", status: "C", kind: "decimal", int: 3, dec: 2 },
          { key: "baseIss", label: "BASE CÁLCULO ISS", pos: 59, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "icmsSt", label: "VALOR TOTAL ICMS ST", pos: 74, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "aliqSt", label: "ALÍQUOTA ICMS ST", pos: 89, len: 5, format: "N", status: "C", kind: "decimal", int: 3, dec: 2 },
          { key: "baseSt", label: "BASE CÁLCULO ICMS ST", pos: 94, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "ir", label: "VALOR TOTAL IR", pos: 109, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "filler", label: "FILLER", pos: 124, len: 157, format: "A", status: "C", hidden: true }
        ]
      },
      "555": {
        title: "CONHECIMENTOS EM COBRANÇA (CCO)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "555" },
          { key: "filial", label: "FILIAL EMISSORA DO DOCUMENTO", pos: 4, len: 10, format: "A", status: "M" },
          { key: "serie", label: "SÉRIE DO CONHECIMENTO", pos: 14, len: 5, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DO CONHECIMENTO", pos: 19, len: 12, format: "A", status: "M" },
          { key: "valorFrete", label: "VALOR DO FRETE", pos: 31, len: 15, format: "N", status: "C", kind: "money", int: 13, dec: 2 },
          { key: "dataEmi", label: "DATA EMISSÃO DO CONHECIMENTO", pos: 46, len: 8, format: "N", status: "C", kind: "date8" },
          { key: "cnpjRem", label: "CNPJ REMETENTE", pos: 54, len: 14, format: "N", status: "C", kind: "cnpj" },
          { key: "cnpjDes", label: "CNPJ DESTINATÁRIO", pos: 68, len: 14, format: "N", status: "C", kind: "cnpj" },
          { key: "cnpjEmi", label: "CNPJ EMISSOR CONHECIMENTO", pos: 82, len: 14, format: "N", status: "C", kind: "cnpj" },
          { key: "ufEmb", label: "UF EMBARCADOR", pos: 96, len: 2, format: "A", status: "C", kind: "uf" },
          { key: "ufUni", label: "UF UNIDADE EMISSORA", pos: 98, len: 2, format: "A", status: "C", kind: "uf" },
          { key: "ufDes", label: "UF DESTINATÁRIO", pos: 100, len: 2, format: "A", status: "C", kind: "uf" },
          { key: "contaRazao", label: "CONTA DO RAZÃO", pos: 102, len: 10, format: "A", status: "C" },
          { key: "codIva", label: "CÓDIGO IVA", pos: 112, len: 2, format: "A", status: "C" },
          { key: "romaneio", label: "NÚMERO DO ROMANEIO", pos: 114, len: 20, format: "A", status: "C" },
          { key: "sap1", label: "NÚMERO SAP #1", pos: 134, len: 20, format: "A", status: "C" },
          { key: "sap2", label: "OUTRO NÚMERO #2", pos: 154, len: 20, format: "A", status: "C" },
          { key: "sap3", label: "OUTRO NÚMERO #3", pos: 174, len: 20, format: "A", status: "C" },
          { key: "devol", label: "CONHECIMENTO DE DEVOLUÇÃO?", pos: 194, len: 1, format: "A", status: "M", allowed: ["S","N"], allowedHint: "S = sim; N = não" },
          { key: "filler", label: "FILLER", pos: 195, len: 86, format: "A", status: "C", hidden: true }
        ]
      },
      "556": {
        title: "NOTAS FISCAIS EM COBRANÇA NO CONHECIMENTO (CNF)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "556" },
          { key: "serie", label: "SÉRIE", pos: 4, len: 3, format: "A", status: "C" },
          { key: "numero", label: "NÚMERO DA NOTA FISCAL", pos: 7, len: 9, format: "N", status: "M" },
          { key: "data", label: "DATA DE EMISSÃO DA NOTA FISCAL", pos: 16, len: 8, format: "N", status: "M", kind: "date8" },
          { key: "peso", label: "PESO DA NOTA FISCAL", pos: 24, len: 7, format: "N", status: "M", kind: "decimal", int: 5, dec: 2 },
          { key: "valor", label: "VALOR DA MERCADORIA NA NOTA FISCAL", pos: 31, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "cnpj", label: "CNPJ DO EMISSOR DA NOTA FISCAL", pos: 46, len: 14, format: "N", status: "C", kind: "cnpj" },
          { key: "romaneio", label: "NÚMERO DO ROMANEIO", pos: 60, len: 20, format: "A", status: "C" },
          { key: "sap1", label: "NÚMERO SAP #1", pos: 80, len: 20, format: "A", status: "C" },
          { key: "sap2", label: "OUTRO NÚMERO #2", pos: 100, len: 20, format: "A", status: "C" },
          { key: "sap3", label: "OUTRO NÚMERO #3", pos: 120, len: 20, format: "A", status: "C" },
          { key: "devol", label: "NOTA FISCAL DE DEVOLUÇÃO?", pos: 140, len: 1, format: "A", status: "M", allowed: ["S","N"], allowedHint: "S = sim; N = não" },
          { key: "filler", label: "FILLER", pos: 141, len: 140, format: "A", status: "C", hidden: true }
        ]
      },
      "559": {
        title: "TOTAL DE DOCUMENTOS DE COBRANÇA (TDC)",
        fields: [
          { key: "idReg", label: "IDENTIFICADOR DE REGISTRO", pos: 1, len: 3, format: "N", status: "M", fixed: "559" },
          { key: "qtd", label: "QTDE. TOTAL DOCTOS. DE COBRANÇA", pos: 4, len: 4, format: "N", status: "M" },
          { key: "valor", label: "VALOR TOTAL DOCTOS. DE COBRANÇA", pos: 8, len: 15, format: "N", status: "M", kind: "money", int: 13, dec: 2 },
          { key: "filler", label: "FILLER", pos: 23, len: 258, format: "A", status: "C", hidden: true }
        ]
      }
    }
  }
};

// -------------------------- Render/Validação --------------------------

function getLayout(version) {
  return DOCCOB_LAYOUTS[version] || DOCCOB_LAYOUTS["3.0A"];
}

function getRecordDef(version, recordId) {
  const layout = getLayout(version);
  return layout.records?.[recordId] || null;
}

function sliceField(line, pos1, len) {
  const start = Math.max(0, (pos1 || 1) - 1);
  const end = start + (len || 0);
  return String(line ?? "").slice(start, end);
}

function validateAndFormatField(def, raw) {
  const issues = [];
  const trimmed = String(raw ?? "");
  const rawTrimmed = trimmed.trim();

  // regra: valor fixo
  if (def.fixed && rawTrimmed !== def.fixed) {
    issues.push({ kind: "error", icon: "bi-slash-circle-fill", message: `Valor fixo esperado: ${def.fixed}` });
  }

  // obrigatoriedade (só detecta vazio por espaços)
  if (def.status === "M") {
    if (def.format === "A" && isAllSpaces(trimmed)) {
      issues.push({ kind: "error", icon: "bi-exclamation-triangle-fill", message: "Campo obrigatório em branco" });
    }
    if (def.format === "N" && isAllSpaces(trimmed)) {
      issues.push({ kind: "error", icon: "bi-exclamation-triangle-fill", message: "Campo numérico obrigatório em branco" });
    }
  }

  // validação de formatos especiais
  let display = escapeHtml(trimmed.trimEnd());

  if (def.kind === "date6") {
    const r = parseDate6(trimmed);
    if (r.empty) {
      display = `<span class="muted">(vazio)</span>`;
      if (def.status === "M") {
        // data obrigatória não pode ser zero
        issues.push({ kind: "error", icon: "bi-calendar-x-fill", message: "Data obrigatória não informada (000000)" });
      }
    } else {
      display = escapeHtml(r.pretty);
      if (!r.valid) {
        issues.push({ kind: "error", icon: "bi-calendar-x-fill", message: "Data inválida" });
      }
    }
  }

  if (def.kind === "date8") {
    const r = parseDate8(trimmed);
    if (r.empty) {
      display = `<span class="muted">(vazio)</span>`;
      if (def.status === "M") {
        issues.push({ kind: "error", icon: "bi-calendar-x-fill", message: "Data obrigatória não informada (00000000)" });
      }
    } else {
      display = escapeHtml(r.pretty);
      if (!r.valid) {
        // campo com data preenchida mas inválida
        const kind = def.status === "M" ? "error" : "warn";
        issues.push({ kind, icon: "bi-calendar-x-fill", message: "Data inválida" });
      }
    }
  }

  if (def.kind === "time4") {
    const r = parseTime4(trimmed);
    if (r.empty) {
      display = `<span class="muted">(vazio)</span>`;
      if (def.status === "M") {
        issues.push({ kind: "error", icon: "bi-clock-history", message: "Hora obrigatória não informada" });
      }
    } else {
      display = escapeHtml(r.pretty);
      if (!r.valid) {
        issues.push({ kind: "error", icon: "bi-clock-history", message: "Hora inválida" });
      }
    }
  }

  if (def.kind === "money") {
    display = formatMoney(rawTrimmed, def.int || 13, def.dec || 2);
  }

  if (def.kind === "decimal") {
    display = formatDecimal(rawTrimmed, def.int || 3, def.dec || 2);
  }

  if (def.kind === "cnpj") {
    // mostra formatado, e valida
    if (rawTrimmed === "") {
      if (def.status === "M") issues.push({ kind: "error", icon: "bi-exclamation-triangle-fill", message: "CNPJ obrigatório em branco" });
      display = `<span class="muted">(vazio)</span>`;
    } else {
      if (!onlyDigits(rawTrimmed) || rawTrimmed.length !== 14 || isAllZeros(rawTrimmed)) {
        const kind = def.status === "M" ? "error" : "warn";
        issues.push({ kind, icon: "bi-question-circle-fill", message: "CNPJ fora do padrão (14 dígitos)" });
      }
      display = escapeHtml(formatCnpj(rawTrimmed));
    }
  }

  if (def.kind === "uf") {
    if (rawTrimmed) {
      const uf = rawTrimmed.toUpperCase();
      display = escapeHtml(uf);
      if (!UF_LIST.has(uf)) {
        issues.push({ kind: "warn", icon: "bi-question-circle-fill", message: "UF fora da lista oficial" });
      }
    } else {
      display = `<span class="muted">(vazio)</span>`;
    }
  }

  // validação de enum (allowed)
  if (def.allowed && rawTrimmed) {
    if (!def.allowed.includes(rawTrimmed)) {
      const defaultKind = def.status === "M" ? "error" : "warn";
      const kind = def.severityOnAllowed
        ? (def.severityOnAllowed === "error" ? "error" : "warn")
        : defaultKind;
      const hint = def.allowedHint ? ` (${def.allowedHint})` : "";
      issues.push({ kind, icon: "bi-question-circle-fill", message: `Valor fora do padrão: ${rawTrimmed}. Esperado: ${def.allowed.join(", ")}${hint}` });
    }
  }

  // validação básica para campos numéricos
  if (def.format === "N" && rawTrimmed) {
    if (!onlyDigits(rawTrimmed)) {
      const kind = def.status === "M" ? "error" : "warn";
      issues.push({ kind, icon: "bi-exclamation-triangle-fill", message: "Campo numérico contém caracteres não numéricos" });
    }
  }

  // Se for obrigatório alfanumérico e vazio, substitui display por ícone principal
  const missingRequired = issues.some(i => i.kind === "error" && i.icon === "bi-exclamation-triangle-fill");
  if (missingRequired && def.format === "A" && isAllSpaces(trimmed)) {
    display = issueLabel("error", "bi-exclamation-triangle-fill", "Campo obrigatório em branco");
  }

  // adiciona ícones inline (se necessário)
  const errorCount = issues.filter(i => i.kind === "error").length;
  const warnCount = issues.filter(i => i.kind === "warn").length;

  const inlineIcons = issues
    .filter(i => !(missingRequired && i.icon === "bi-exclamation-triangle-fill" && def.format === "A" && isAllSpaces(trimmed)))
    .map(i => issueLabel(i.kind, i.icon, i.message))
    .join(" ");

  if (inlineIcons) {
    display = `<span class="value">${display} <span class="issues-inline">${inlineIcons}</span></span>`;
  } else {
    display = `<span class="value">${display}</span>`;
  }

  return {
    display,
    errorCount,
    warnCount,
  };
}

function renderRecord(line, version, lineNumber) {
  const layout = getLayout(version);
  const recordId = String(line ?? "").slice(0, 3);
  const rec = getRecordDef(version, recordId);

  // Linha vazia
  if (!String(line ?? "").trim()) {
    const warn = issueLabel("warn", "bi-exclamation-triangle-fill", "Linha vazia");
    const html = `
      <details class="result-card" open data-has-error="false" data-has-warning="true">
        <summary class="result-summary">
          <div class="result-left">
            <span class="badge badge--record"><i class="bi bi-hash"></i> ---</span>
            <span class="badge badge--line"><i class="bi bi-list-ol"></i> Linha ${lineNumber}</span>
            <span class="badge badge--title">Linha vazia</span>
          </div>
          <div class="result-right">
            <span class="pill pill--error"><i class="bi bi-exclamation-triangle-fill"></i> 0</span>
            <span class="pill pill--warn"><i class="bi bi-info-circle-fill"></i> 1</span>
          </div>
        </summary>
        <div class="result-body">
          <table>
            <tr class="row-warn"><td><span class="field-label">AVISO</span></td><td>${warn}</td></tr>
          </table>
        </div>
      </details>
    `;
    return { html, errors: 0, warnings: 1 };
  }

  if (!rec) {
    // tenta sugerir o layout correto
    const otherVersion = version === "5.0" ? "3.0A" : "5.0";
    const otherRec = getRecordDef(otherVersion, recordId);
    const suggestion = otherRec
      ? `Registro ${recordId} pertence ao layout ${otherVersion}. Use o toggle para alternar.`
      : `Registro ${recordId} não é reconhecido no layout ${version}.`;

    const w = issueLabel("warn", "bi-question-circle-fill", suggestion);
    const html = `
      <details class="result-card" open data-has-error="false" data-has-warning="true">
        <summary class="result-summary">
          <div class="result-left">
            <span class="badge badge--record"><i class="bi bi-hash"></i> ${escapeHtml(recordId || "???")}</span>
            <span class="badge badge--line"><i class="bi bi-list-ol"></i> Linha ${lineNumber}</span>
            <span class="badge badge--title">Registro desconhecido</span>
          </div>
          <div class="result-right">
            <span class="pill pill--error"><i class="bi bi-exclamation-triangle-fill"></i> 0</span>
            <span class="pill pill--warn"><i class="bi bi-info-circle-fill"></i> 1</span>
          </div>
        </summary>
        <div class="result-body">
          <table>
            <tr class="row-warn"><td><span class="field-label">AVISO</span></td><td>${w}</td></tr>
            <tr><td><span class="field-label">LINHA BRUTA</span></td><td><div class="raw-box">${escapeHtml(line)}</div></td></tr>
          </table>
        </div>
      </details>
    `;
    return { html, errors: 0, warnings: 1 };
  }

  let errors = 0;
  let warnings = 0;

  const rows = [];
  for (const f of rec.fields) {
    if (f.hidden) continue;
    const raw = sliceField(line, f.pos, f.len);
    const r = validateAndFormatField(f, raw);
    errors += r.errorCount;
    warnings += r.warnCount;
    const hasErr = r.errorCount > 0;
    const hasWarn = !hasErr && r.warnCount > 0;
    const rowCls = hasErr ? "row-error" : hasWarn ? "row-warn" : "";
    const posEnd = (f.pos + f.len - 1);
    const meta = `<span class="field-meta">[${f.pos}-${posEnd}]</span>`;
    rows.push(`<tr class="${rowCls}"><td><span class="field-label">${escapeHtml(f.label)}</span>${meta}</td><td>${r.display}</td></tr>`);
  }

  // valida tamanho da linha
  const allowed = rec.allowedLengths || [layout.recordLength];
  const lenOk = allowed.includes(String(line ?? "").length);
  if (!lenOk) {
    warnings += 1;
  }
  const expectedText = allowed.length === 1 ? `${allowed[0]}` : `${allowed.join(" ou ")}`;
  const lenIcon = lenOk
    ? ""
    : ` <span class="issues-inline">${issueLabel("warn", "bi-rulers", `Tamanho esperado: ${expectedText}`)}</span>`;
  rows.push(
    `<tr class="${lenOk ? "" : "row-warn"}"><td><span class="field-label">TAMANHO DA LINHA</span><span class="field-meta">[1-${String(line ?? "").length}]</span></td><td><span class="value">${String(line ?? "").length} <span class="muted">(esperado: ${expectedText})</span>${lenIcon}</span></td></tr>`
  );

  const hasError = errors > 0;
  const hasWarn = warnings > 0;
  const open = hasError || hasWarn;

  const html = `
    <details class="result-card" ${open ? "open" : ""} data-has-error="${hasError}" data-has-warning="${hasWarn}" data-record="${escapeHtmlAttr(recordId)}" data-line="${lineNumber}">
      <summary class="result-summary">
        <div class="result-left">
          <span class="badge badge--record"><i class="bi bi-hash"></i> ${escapeHtml(recordId)}</span>
          <span class="badge badge--line"><i class="bi bi-list-ol"></i> Linha ${lineNumber}</span>
          <span class="badge badge--title">${escapeHtml(rec.title)}</span>
        </div>
        <div class="result-right">
          <span class="pill pill--error"><i class="bi bi-exclamation-triangle-fill"></i> ${errors}</span>
          <span class="pill pill--warn"><i class="bi bi-info-circle-fill"></i> ${warnings}</span>
        </div>
      </summary>
      <div class="result-body">
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 10px;">
          <button type="button" class="icon-btn copy-btn" data-copy="${escapeHtmlAttr(line)}"><i class="bi bi-clipboard"></i> Copiar linha</button>
          <span class="muted" style="align-self:center;">Layout: <b>${escapeHtml(layout.label)}</b></span>
        </div>
        <table>
          ${rows.join("\n")}
        </table>
        <div class="raw-box" aria-label="Linha bruta">${escapeHtml(line)}</div>
      </div>
    </details>
  `;

  return { html, errors, warnings };
}

// Função pública usada pelo script.js
function renderDoccobLine(line, version, lineNumber) {
  return renderRecord(line, version, lineNumber);
}
