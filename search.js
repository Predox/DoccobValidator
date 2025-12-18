document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("responseArqLabel");
  const inputBusca = document.querySelector(".inputBusca");
  const upArrow = document.getElementById("upArrow");
  const downArrow = document.getElementById("downArrow");
  const btnCase = document.getElementById("differAa");            // Aa
  const btnWhole = document.getElementById("searchWholeWord");     // { }
  const btnErrors = document.getElementById("filterErrorsBtn");    // ⚠️
  const counter = document.getElementById("searchCounter");

  let marks = [];
  let current = -1;

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function updateCounter() {
    counter.textContent = marks.length ? `${current + 1}/${marks.length}` : "0/0";
  }

  // desfaz marcações preservando ícones (desembrulha se <mark> contém elementos)
  function clearHighlights() {
    for (let i = marks.length - 1; i >= 0; i--) {
      const m = marks[i];
      const p = m?.parentNode;
      if (!p) continue;

      let replacement;
      if (m.childNodes.length === 1 && m.firstChild.nodeType === Node.TEXT_NODE) {
        replacement = document.createTextNode(m.firstChild.nodeValue);
      } else {
        const frag = document.createDocumentFragment();
        while (m.firstChild) frag.appendChild(m.firstChild);
        replacement = frag;
      }
      p.replaceChild(replacement, m);
      p.normalize();
    }
    marks = [];
    current = -1;
    updateCounter();
  }

  function buildRegex(q) {
    if (!q) return null;
    const caseSensitive = btnCase.classList.contains("biPressed");
    const wholeWord     = btnWhole.classList.contains("biPressed");
    const escaped = escapeRegExp(q);
    const flags = (caseSensitive ? "g" : "gi") + "u";
    const src = wholeWord
      ? `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`
      : escaped;
    try { return new RegExp(src, flags); } catch { return null; }
  }

  function highlightAll(regex) {
    if (!regex) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const txt = node.nodeValue;
        if (!txt || !txt.trim()) return NodeFilter.FILTER_REJECT;
        const tag = node.parentElement?.tagName;
        if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(node => {
      const text = node.nodeValue;
      let last = 0, found = false, m;
      const frag = document.createDocumentFragment();
      regex.lastIndex = 0;

      while ((m = regex.exec(text)) !== null) {
        found = true;
        const before = text.slice(last, m.index);
        if (before) frag.appendChild(document.createTextNode(before));

        const mark = document.createElement("mark");
        mark.className = "hl";
        mark.textContent = m[0];
        frag.appendChild(mark);
        marks.push(mark);

        last = m.index + m[0].length;
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }

      if (found) {
        const after = text.slice(last);
        if (after) frag.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  // destaca todos os problemas (qualquer erro renderizado com .problem)
  function highlightErrors() {
    const problems = container.querySelectorAll(".problem");
    problems.forEach(problem => {
      const mark = document.createElement("mark");
      mark.className = "hl";
      problem.parentNode.insertBefore(mark, problem);
      mark.appendChild(problem);
      marks.push(mark);
    });
  }

  function select(i) {
    if (!marks.length) { current = -1; updateCounter(); return; }
    if (current >= 0 && marks[current]) marks[current].classList.remove("active");
    current = (i + marks.length) % marks.length;
    const el = marks[current];
    el.classList.add("active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    updateCounter();
  }

  function debounce(fn, ms = 200) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  const observer = new MutationObserver(() => {
    if (!inputBusca?.value && !btnErrors.classList.contains("biPressed")) {
      clearHighlights();
      return;
    }
    debouncedRunSearch();
  });

  function observe() {
    observer.observe(container, { childList: true, subtree: true });
  }

  function runSearch() {
    observer.disconnect();
    clearHighlights();

    if (btnErrors.classList.contains("biPressed")) {
      // modo "apenas erros"
      highlightErrors();
      if (marks.length) select(0); else updateCounter();
      observe();
      return;
    }

    const q = inputBusca?.value ?? "";
    const rx = buildRegex(q);
    if (rx) {
      highlightAll(rx);
      if (marks.length) select(0); else updateCounter();
    } else {
      updateCounter();
    }
    observe();
  }

  const debouncedRunSearch = debounce(runSearch, 160);

  // eventos
  inputBusca?.addEventListener("input", debouncedRunSearch);

  upArrow?.addEventListener("click", () => {
    if (!marks.length) runSearch();
    if (marks.length) select(current - 1);
  });
  downArrow?.addEventListener("click", () => {
    if (!marks.length) runSearch();
    if (marks.length) select(current + 1);
  });

  // toggles
  btnCase?.addEventListener("click", (e) => {
    e.preventDefault();
    btnCase.classList.toggle("biPressed");
    if (!btnErrors.classList.contains("biPressed")) debouncedRunSearch();
  });
  btnWhole?.addEventListener("click", (e) => {
    e.preventDefault();
    btnWhole.classList.toggle("biPressed");
    if (!btnErrors.classList.contains("biPressed")) debouncedRunSearch();
  });

  // NOVO: liga/desliga modo “erros”
  btnErrors?.addEventListener("click", (e) => {
    e.preventDefault();
    btnErrors.classList.toggle("biPressed");
    // filtra visualmente para só mostrar blocos com erro
    container.classList.toggle("only-errors", btnErrors.classList.contains("biPressed"));
    debouncedRunSearch();
  });

  observe();
  updateCounter();
});
