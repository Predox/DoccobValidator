/*
  Doccob Validator - UI / fluxo

  - Controla toggle de layout (3.0A / 5.0)
  - Lê arquivo ou valida uma linha
  - Atualiza estatísticas (linhas, erros, avisos)
  - Ações: limpar, expandir/recolher tudo, copiar linha bruta
*/

const APP = {
  version: "3.0A",
  stats: {
    lines: 0,
    errors: 0,
    warnings: 0,
  },
};

function setVersion(is50) {
  APP.version = is50 ? "5.0" : "3.0A";
  const label = document.getElementById("layoutToggleValue");
  if (label) label.textContent = APP.version;
}

function resetStats() {
  APP.stats.lines = 0;
  APP.stats.errors = 0;
  APP.stats.warnings = 0;
  updateStatsUI();
}

function updateStatsUI() {
  const elLines = document.getElementById("statLines");
  const elErrors = document.getElementById("statErrors");
  const elWarnings = document.getElementById("statWarnings");
  // Os rótulos (linhas/erros/avisos) já existem no HTML, então aqui vai só o número
  if (elLines) elLines.textContent = `${APP.stats.lines}`;
  if (elErrors) elErrors.textContent = `${APP.stats.errors}`;
  if (elWarnings) elWarnings.textContent = `${APP.stats.warnings}`;
}

function clearOutputs() {
  const outArq = document.getElementById("responseArqLabel");
  const outLine = document.getElementById("responseLineLabel");
  if (outArq) outArq.innerHTML = "";
  if (outLine) outLine.innerHTML = "";

  const barraBusca = document.getElementById("buscaArq");
  if (barraBusca) barraBusca.style.display = "none";

  const legend = document.getElementById("legend");
  if (legend) legend.classList.add("hidden");

  // remove filtro "apenas erros" se estiver ativo
  const container = document.getElementById("responseArqLabel");
  container?.classList.remove("only-errors");
  const btnErrors = document.getElementById("filterErrorsBtn");
  btnErrors?.classList.remove("biPressed");

  resetStats();
}

function setAllDetails(open) {
  const container = document.getElementById("responseArqLabel");
  if (!container) return;
  container.querySelectorAll("details.result-card").forEach(d => {
    d.open = !!open;
  });
}

function validateLine() {
  const line = document.getElementById("line")?.value ?? "";
  const out = document.getElementById("responseLineLabel");
  if (!out) return;
  if (!line) {
    out.innerHTML = "";
    return;
  }
  const res = renderDoccobLine(line, APP.version, 1);
  out.innerHTML = res.html;
}

function readFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const lines = String(reader.result ?? "").split(/\r?\n/);
    validateFile(lines);
  });
  reader.readAsText(file);
}

async function validateFile(lines) {
  clearOutputs();

  const outArq = document.getElementById("responseArqLabel");
  const barraBusca = document.getElementById("buscaArq");
  const button = document.getElementById("getArq");
  const legend = document.getElementById("legend");
  if (!outArq) return;

  // monta HTML em lote (bem mais rápido que innerHTML += em loop)
  const htmlParts = [];
  let lineCount = 0;
  let errors = 0;
  let warnings = 0;

  const lastIdx = lines.length - 1;
  lines.forEach((ln, idx) => {
    // ignora última linha vazia (muito comum quando o arquivo termina com \n)
    if (idx === lastIdx && !String(ln ?? "").trim()) return;

    const lineNumber = idx + 1;
    const res = renderDoccobLine(ln, APP.version, lineNumber);
    htmlParts.push(res.html);
    lineCount++;
    errors += res.errors;
    warnings += res.warnings;
  });

  outArq.innerHTML = htmlParts.join("\n");

  APP.stats.lines = lineCount;
  APP.stats.errors = errors;
  APP.stats.warnings = warnings;
  updateStatsUI();

  if (button) button.style.justifyContent = "start";
  if (barraBusca) {
    barraBusca.style.display = "flex";
    // animação leve
    await new Promise(r => setTimeout(r, 50));
    barraBusca.style.transform = "translateY(10px)";
  }
  if (legend) legend.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  // toggle layout
  const toggle = document.getElementById("layoutToggle");
  if (toggle) {
    setVersion(toggle.checked);
    toggle.addEventListener("change", () => {
      setVersion(toggle.checked);
      // para evitar confusão, limpamos os resultados ao trocar o layout
      clearOutputs();
    });
  }

  // botões de ação
  document.getElementById("btnClear")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearOutputs();
  });
  document.getElementById("btnExpandAll")?.addEventListener("click", (e) => {
    e.preventDefault();
    setAllDetails(true);
  });
  document.getElementById("btnCollapseAll")?.addEventListener("click", (e) => {
    e.preventDefault();
    setAllDetails(false);
  });

  // validar linha
  document.getElementById("send")?.addEventListener("click", (e) => {
    e.preventDefault();
    validateLine();
  });

  // arquivo: ao selecionar no input, valida automaticamente
  const fileInput = document.getElementById("arquivo");
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) readFile(file);
  });

  // drag & drop na área #getArq
  const dropZone = document.getElementById("getArq");
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });
  dropZone?.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    const file = e.dataTransfer?.files?.[0];
    if (file) readFile(file);
  });

  // copiar linha bruta (delegação)
  const outArq = document.getElementById("responseArqLabel");
  outArq?.addEventListener("click", async (e) => {
    const btn = e.target?.closest?.(".copy-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const raw = btn.getAttribute("data-copy") ?? "";

    const setOk = () => {
      btn.innerHTML = '<i class="bi bi-check2"></i> Copiado';
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar linha';
      }, 1200);
    };

    const fallbackCopy = (text) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    };

    try {
      // Clipboard API (pode falhar em file:// dependendo do navegador)
      await navigator.clipboard.writeText(raw);
      setOk();
    } catch {
      // fallback para ambientes sem Clipboard API
      const ok = fallbackCopy(raw);
      if (ok) {
        setOk();
      } else {
        // último recurso: não bloqueia o usuário com alert
        btn.innerHTML = '<i class="bi bi-x"></i> Falhou';
        setTimeout(() => {
          btn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar linha';
        }, 1200);
      }
    }
  });

  // estado inicial
  clearOutputs();
});

// -------------------- API antiga (mantém compatibilidade) --------------------

// Mantém o nome original para o onclick do HTML.
function LerArquivo() {
  const file = document.querySelector("input[type=file]")?.files?.[0];
  readFile(file);
}

// Mantém o nome original para o onclick do HTML.
function ValidateLine() {
  validateLine();
}
