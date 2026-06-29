/* ═══════════════════════════════════════════════════════════
   PD Visual — Knapsack com Programação Dinâmica
   Visualizador interativo passo a passo + configuração livre
   ═══════════════════════════════════════════════════════════ */

// ─── Dados padrão ────────────────────────────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 1, name: 'Item 1', weight: 2, value: 3 },
  { id: 2, name: 'Item 2', weight: 3, value: 4 },
  { id: 3, name: 'Item 3', weight: 4, value: 5 },
  { id: 4, name: 'Item 4', weight: 5, value: 8 },
];
const DEFAULT_CAPACITY = 8;

// Limites para manter a tabela legível
const MAX_ITEMS    = 10;
const MAX_CAPACITY = 20;

// ─── Estado da simulação ─────────────────────────────────────────────────────
let currentItems    = DEFAULT_ITEMS.map(it => ({ ...it }));
let currentCapacity = DEFAULT_CAPACITY;
let steps           = [];
let currentStep     = 0;
let autoTimer       = null;

// ─── Estado do painel de configuração ────────────────────────────────────────
let configFormItems = [];   // cópia editável usada dentro do painel
let configOpen      = false;

// ════════════════════════════════════════════════════════════
// ALGORITMO: pré-computação de todos os passos
// ════════════════════════════════════════════════════════════

function computeSteps(items, W) {
  const n        = items.length;
  const allSteps = [];

  // dp[i][w] = maior valor usando os primeiros i itens com capacidade w
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  // ── Passo inicial ──
  allSteps.push({
    phase: 'init',
    row: null, col: null,
    dp: deepCopyDp(dp),
    title: 'Estado Inicial',
    text:
      'A tabela de PD é inicializada com zeros.\n\n' +
      'Cada célula dp[i][w] representa o maior valor possível usando os primeiros i itens ' +
      'com uma mochila de capacidade w.\n\n' +
      'A linha 0 é o caso base: sem nenhum item disponível, o valor é sempre 0.',
    expType: 'init',
    isComplete: false,
    selected: [],
  });

  // ── Preenche a tabela célula a célula ──
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];

    for (let w = 0; w <= W; w++) {
      if (item.weight <= w) {
        const withoutItem = dp[i - 1][w];
        const prevCap     = w - item.weight;
        const withItem    = item.value + dp[i - 1][prevCap];
        dp[i][w] = Math.max(withoutItem, withItem);

        let text, expType;

        if (withItem > withoutItem) {
          expType = 'take';
          text =
            `Analisando ${item.name} (peso ${item.weight}, valor ${item.value}) para capacidade ${w}.\n\n` +
            `O item CABE na mochila! Comparamos as duas opções:\n` +
            `  • Não pegar o item: dp[${i-1}][${w}] = ${withoutItem}\n` +
            `  • Pegar o item:     ${item.value} + dp[${i-1}][${prevCap}] = ${item.value} + ${dp[i-1][prevCap]} = ${withItem}\n\n` +
            `→ Vale a pena PEGAR! Escolhemos o maior valor.\n` +
            `  dp[${i}][${w}] = ${dp[i][w]}`;
        } else if (withItem < withoutItem) {
          expType = 'skip';
          text =
            `Analisando ${item.name} (peso ${item.weight}, valor ${item.value}) para capacidade ${w}.\n\n` +
            `O item CABE na mochila, mas não vale a pena incluí-lo. Comparamos:\n` +
            `  • Não pegar o item: dp[${i-1}][${w}] = ${withoutItem}\n` +
            `  • Pegar o item:     ${item.value} + dp[${i-1}][${prevCap}] = ${item.value} + ${dp[i-1][prevCap]} = ${withItem}\n\n` +
            `→ Melhor NÃO PEGAR. Mantemos o valor anterior.\n` +
            `  dp[${i}][${w}] = ${dp[i][w]}`;
        } else {
          expType = 'skip';
          text =
            `Analisando ${item.name} (peso ${item.weight}, valor ${item.value}) para capacidade ${w}.\n\n` +
            `O item CABE na mochila. Comparamos:\n` +
            `  • Não pegar: dp[${i-1}][${w}] = ${withoutItem}\n` +
            `  • Pegar:     ${item.value} + dp[${i-1}][${prevCap}] = ${withItem}\n\n` +
            `→ Valores iguais — mantemos ${dp[i][w]}.`;
        }

        allSteps.push({
          phase: 'fill', row: i, col: w,
          dp: deepCopyDp(dp),
          title: `Preenchendo dp[${i}][${w}] — ${item.name}, Capacidade ${w}`,
          text, expType, isComplete: false, selected: [],
        });

      } else {
        // Item não cabe: copia linha de cima
        dp[i][w] = dp[i - 1][w];

        allSteps.push({
          phase: 'fill', row: i, col: w,
          dp: deepCopyDp(dp),
          title: `Preenchendo dp[${i}][${w}] — ${item.name}, Capacidade ${w}`,
          text:
            `Analisando ${item.name} (peso ${item.weight}, valor ${item.value}) para capacidade ${w}.\n\n` +
            `O item NÃO CABE na mochila (peso ${item.weight} > capacidade ${w}).\n\n` +
            `→ Copiamos o melhor valor sem este item.\n` +
            `  dp[${i}][${w}] = dp[${i-1}][${w}] = ${dp[i][w]}`,
          expType: 'no-fit', isComplete: false, selected: [],
        });
      }
    }
  }

  // ── Passo final: backtracking ──
  const selectedItems = backtrack(dp, items, n, W);
  const pathCells     = getBacktrackPath(dp, items, n, W);
  const maxValue      = dp[n][W];
  const totalWeight   = selectedItems.reduce((s, it) => s + it.weight, 0);
  const names         = selectedItems.map(it => it.name).join(' + ') || 'Nenhum';

  allSteps.push({
    phase: 'complete', row: null, col: null,
    dp: deepCopyDp(dp),
    title: '🏆 Simulação Completa!',
    text:
      `A tabela está totalmente preenchida.\n\n` +
      `Valor máximo obtido: ${maxValue}\n` +
      `Itens selecionados: ${names}\n` +
      `Peso total utilizado: ${totalWeight} de ${W}\n\n` +
      `O caminho de solução (em verde) mostra as decisões que levaram ao resultado ótimo.\n` +
      `Lemos dp[${n}][${W}] = ${maxValue} como a resposta final.`,
    expType: 'complete', isComplete: true,
    selected: selectedItems.map(it => it.id),
    pathCells,
  });

  return allSteps;
}

function deepCopyDp(dp) {
  return dp.map(row => [...row]);
}

function backtrack(dp, items, n, W) {
  const selected = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.unshift(items[i - 1]);
      w -= items[i - 1].weight;
    }
  }
  return selected;
}

function getBacktrackPath(dp, items, n, W) {
  const cells = new Set();
  let w = W;
  cells.add(`${n},${w}`);
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) w -= items[i - 1].weight;
    cells.add(`${i - 1},${w}`);
  }
  return cells;
}

// ════════════════════════════════════════════════════════════
// RENDERIZAÇÃO DA SIMULAÇÃO
// ════════════════════════════════════════════════════════════

function renderItemsList() {
  const container = document.getElementById('items-list');
  container.innerHTML = currentItems.map(item => `
    <div class="item-card" id="item-card-${item.id}">
      <div class="item-name">${item.name}</div>
      <div class="item-stats">
        <span class="item-weight">⚖ Peso: ${item.weight}</span>
        <span class="item-value">💎 Valor: ${item.value}</span>
      </div>
    </div>
  `).join('');
}

function renderStep(index) {
  const step = steps[index];
  const n    = currentItems.length;
  const W    = currentCapacity;

  document.getElementById('step-counter').textContent =
    `Passo ${index} de ${steps.length - 1}`;

  document.getElementById('btn-prev').disabled = (index === 0);
  document.getElementById('btn-next').disabled = (index === steps.length - 1);

  const expBox = document.getElementById('step-explanation');
  expBox.className = `step-explanation type-${step.expType}`;
  document.getElementById('exp-title').textContent = step.title;
  document.getElementById('exp-text').textContent  = step.text;

  renderTable(step, n, W);

  // Destaca itens selecionados nos cards
  currentItems.forEach(item => {
    const el = document.getElementById(`item-card-${item.id}`);
    if (el) el.classList.toggle('selected',
      step.isComplete && step.selected.includes(item.id));
  });

  const resultPanel = document.getElementById('result-panel');
  if (step.isComplete) {
    resultPanel.style.display = 'block';
    renderResult(step, n, W);
  } else {
    resultPanel.style.display = 'none';
  }
}

function renderTable(step, n, W) {
  const pathCells = step.pathCells || new Set();
  let html = '';

  html += '<thead><tr>';
  html += '<th class="th-corner th-row-header">Item / Cap.</th>';
  for (let w = 0; w <= W; w++) html += `<th>${w}</th>`;
  html += '</tr></thead><tbody>';

  for (let i = 0; i <= n; i++) {
    html += '<tr>';

    if (i === 0) {
      html += '<td class="row-header">∅ <span class="row-sub">(caso base)</span></td>';
    } else {
      const item = currentItems[i - 1];
      html += `<td class="row-header">${item.name} <span class="row-sub">p:${item.weight} v:${item.value}</span></td>`;
    }

    for (let w = 0; w <= W; w++) {
      const isCurrent = step.phase === 'fill' && step.row === i && step.col === w;
      const isInPath  = step.isComplete && pathCells.has(`${i},${w}`);
      const revealed  = isCellRevealed(step, i, w);

      let cls, content;

      if (isCurrent) {
        cls = 'cell-current'; content = step.dp[i][w];
      } else if (isInPath) {
        cls = 'cell-path';    content = step.dp[i][w];
      } else if (!revealed) {
        cls = 'cell-hidden';  content = '·';
      } else if (i === 0 || w === 0) {
        cls = 'cell-base';    content = 0;
      } else {
        cls = 'cell-revealed'; content = step.dp[i][w];
      }

      html += `<td class="${cls}">${content}</td>`;
    }

    html += '</tr>';
  }

  html += '</tbody>';
  document.getElementById('dp-table').innerHTML = html;
}

function isCellRevealed(step, i, w) {
  if (step.phase === 'init')     return i === 0;
  if (step.phase === 'complete') return true;
  if (i === 0)                   return true;
  if (i < step.row)              return true;
  if (i === step.row && w <= step.col) return true;
  return false;
}

function renderResult(step, n, W) {
  const maxValue     = step.dp[n][W];
  const selectedList = currentItems.filter(it => step.selected.includes(it.id));
  const totalWeight  = selectedList.reduce((s, it) => s + it.weight, 0);

  document.getElementById('result-content').innerHTML = `
    <div class="result-stat">
      <div class="result-stat-label">Valor Máximo</div>
      <div class="result-stat-value">${maxValue}</div>
    </div>
    <div class="result-stat">
      <div class="result-stat-label">Peso Utilizado</div>
      <div class="result-stat-value">${totalWeight} / ${W}</div>
    </div>
    <div class="result-stat">
      <div class="result-stat-label">Itens na Mochila</div>
      <div class="result-stat-value">${selectedList.length}</div>
    </div>
    <div class="result-items">
      <div class="result-items-label">Itens Selecionados</div>
      ${selectedList.map(it =>
        `<span class="result-item-tag">${it.name} &nbsp;(peso ${it.weight}, valor ${it.value})</span>`
      ).join('')}
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// PAINEL DE CONFIGURAÇÃO
// ════════════════════════════════════════════════════════════

function toggleConfigPanel() {
  configOpen ? closeConfigPanel() : openConfigPanel();
}

function openConfigPanel() {
  // Inicializa o formulário com os itens e capacidade atuais
  configFormItems = currentItems.map(it => ({ ...it }));

  renderConfigItemsList();
  document.getElementById('input-capacity').value = currentCapacity;
  document.getElementById('config-error').hidden  = true;
  document.getElementById('config-panel').hidden  = false;

  const btn = document.getElementById('btn-config-toggle');
  btn.textContent = '✕ Fechar';
  btn.classList.add('active-config');

  configOpen = true;
}

function closeConfigPanel() {
  document.getElementById('config-panel').hidden = true;

  const btn = document.getElementById('btn-config-toggle');
  btn.textContent = '⚙ Personalizar';
  btn.classList.remove('active-config');

  configOpen = false;
}

function renderConfigItemsList() {
  const container = document.getElementById('config-items-list');
  const canRemove = configFormItems.length > 1;

  container.innerHTML = configFormItems.map((item, idx) => `
    <div class="config-item-row">
      <input
        type="text"
        class="config-input config-name"
        data-idx="${idx}"
        data-field="name"
        value="${escapeHtml(item.name)}"
        placeholder="Item ${idx + 1}"
        maxlength="20"
      />
      <input
        type="number"
        class="config-input config-weight"
        data-idx="${idx}"
        data-field="weight"
        value="${item.weight}"
        min="1"
        max="99"
      />
      <input
        type="number"
        class="config-input config-value"
        data-idx="${idx}"
        data-field="value"
        value="${item.value}"
        min="1"
        max="999"
      />
      <button
        class="btn-remove-item"
        data-idx="${idx}"
        ${canRemove ? '' : 'disabled'}
        title="Remover item"
      >✕</button>
    </div>
  `).join('');
}

// Lê os valores atuais dos inputs para configFormItems sem perder o foco
function syncFormValues() {
  document.querySelectorAll('.config-item-row').forEach((row, idx) => {
    configFormItems[idx] = {
      id:     configFormItems[idx]?.id ?? (idx + 1),
      name:   row.querySelector('.config-name').value.trim(),
      weight: parseInt(row.querySelector('.config-weight').value) || 1,
      value:  parseInt(row.querySelector('.config-value').value)  || 1,
    };
  });
}

function addConfigItem() {
  if (configFormItems.length >= MAX_ITEMS) {
    showConfigError(`Máximo de ${MAX_ITEMS} itens permitido.`);
    return;
  }
  syncFormValues();
  const nextId = Math.max(...configFormItems.map(it => it.id), 0) + 1;
  configFormItems.push({
    id:     nextId,
    name:   `Item ${configFormItems.length + 1}`,
    weight: 1,
    value:  1,
  });
  renderConfigItemsList();
  hideConfigError();
}

function removeConfigItem(idx) {
  if (configFormItems.length <= 1) return;
  syncFormValues();
  configFormItems.splice(idx, 1);
  renderConfigItemsList();
  hideConfigError();
}

function applyConfig() {
  syncFormValues();

  const rawCapacity = parseInt(document.getElementById('input-capacity').value);

  // ── Validações ──
  if (configFormItems.length === 0) {
    return showConfigError('Adicione pelo menos um item.');
  }
  if (!rawCapacity || rawCapacity < 1) {
    return showConfigError('A capacidade deve ser um número maior que zero.');
  }
  if (rawCapacity > MAX_CAPACITY) {
    return showConfigError(`Capacidade máxima permitida: ${MAX_CAPACITY}.`);
  }

  for (let i = 0; i < configFormItems.length; i++) {
    const it = configFormItems[i];
    const label = it.name || `Item ${i + 1}`;
    if (!it.weight || it.weight < 1) {
      return showConfigError(`"${label}": peso deve ser maior que zero.`);
    }
    if (!it.value || it.value < 1) {
      return showConfigError(`"${label}": valor deve ser maior que zero.`);
    }
  }

  hideConfigError();

  // ── Aplica ──
  currentItems = configFormItems.map((it, idx) => ({
    id:     idx + 1,
    name:   it.name || `Item ${idx + 1}`,
    weight: it.weight,
    value:  it.value,
  }));
  currentCapacity = rawCapacity;

  closeConfigPanel();
  resetWithNewConfig();
}

function showConfigError(msg) {
  const el = document.getElementById('config-error');
  el.textContent = msg;
  el.hidden = false;
}

function hideConfigError() {
  document.getElementById('config-error').hidden = true;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ════════════════════════════════════════════════════════════
// CONTROLES DA SIMULAÇÃO
// ════════════════════════════════════════════════════════════

function nextStep() {
  if (currentStep >= steps.length - 1) return;
  currentStep++;
  renderStep(currentStep);
  if (currentStep === steps.length - 1) stopAuto();
}

function prevStep() {
  if (currentStep <= 0) return;
  currentStep--;
  renderStep(currentStep);
}

function resetSimulation() {
  stopAuto();
  currentStep = 0;
  renderStep(currentStep);
}

function resetWithNewConfig() {
  stopAuto();
  currentStep = 0;
  steps = computeSteps(currentItems, currentCapacity);
  document.getElementById('capacity-display').textContent = currentCapacity;
  renderItemsList();
  renderStep(currentStep);
}

function toggleAuto() {
  autoTimer ? stopAuto() : startAuto();
}

function startAuto() {
  if (currentStep === steps.length - 1) {
    currentStep = 0;
    renderStep(currentStep);
  }
  const btn = document.getElementById('btn-auto');
  btn.textContent = '⏸ Pausar';
  btn.classList.add('playing');

  autoTimer = setInterval(() => {
    if (currentStep >= steps.length - 1) { stopAuto(); return; }
    nextStep();
  }, 850);
}

function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  const btn = document.getElementById('btn-auto');
  if (btn) { btn.textContent = '▶ Automático'; btn.classList.remove('playing'); }
}

function scrollToKnapsack() {
  document.getElementById('knapsack').scrollIntoView({ behavior: 'smooth' });
}

// ════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
// LIS — Maior Subsequência Crescente
// ════════════════════════════════════════════════════════════

const lisViz = {
  sequence: [3, 1, 4, 1, 5, 9, 2, 6],
  steps: [], currentStep: 0, autoTimer: null, configOpen: false,
};

function computeLISSteps(sequence) {
  const n = sequence.length;
  const dp = Array(n).fill(1);
  const all = [];

  all.push({
    phase: 'init', j: null, i: null, dp: [...dp],
    title: 'Estado Inicial',
    text: 'dp[j] = comprimento da maior subsequência crescente terminando no índice j.\n\nTodos iniciam com 1: qualquer elemento sozinho é uma subsequência de tamanho 1.',
    expType: 'init', isComplete: false, lisIndices: [],
  });

  for (let j = 1; j < n; j++) {
    for (let i = 0; i < j; i++) {
      const fits     = sequence[i] < sequence[j];
      const newVal   = dp[i] + 1;
      const improves = newVal > dp[j];
      let text, expType;

      if (!fits) {
        expType = 'no-fit';
        text = `Comparando i=${i} (seq[i]=${sequence[i]}) com j=${j} (seq[j]=${sequence[j]}).\n\n${sequence[i]} ≥ ${sequence[j]} — não é crescente, não podemos estender.\n\n→ dp[${j}] continua ${dp[j]}`;
      } else if (improves) {
        expType = 'take';
        text = `Comparando i=${i} (seq[i]=${sequence[i]}) com j=${j} (seq[j]=${sequence[j]}).\n\n${sequence[i]} < ${sequence[j]} ✓ — crescente!\nEstender LIS que termina em i: dp[${i}]=${dp[i]} → ${newVal}\n${newVal} > dp[${j}]=${dp[j]}, atualizamos!\n\n→ dp[${j}] = ${newVal}`;
        dp[j] = newVal;
      } else {
        expType = 'skip';
        text = `Comparando i=${i} (seq[i]=${sequence[i]}) com j=${j} (seq[j]=${sequence[j]}).\n\n${sequence[i]} < ${sequence[j]} ✓ — crescente!\nEstender daria ${newVal}, mas dp[${j}]=${dp[j]} já é maior.\n\n→ Mantemos dp[${j}] = ${dp[j]}`;
      }

      all.push({
        phase: 'compare', j, i, dp: [...dp],
        title: `dp[${j}] ← comparando com i=${i}`,
        text, expType, isComplete: false, lisIndices: [],
      });
    }

    all.push({
      phase: 'settled', j, i: null, dp: [...dp],
      title: `dp[${j}] = ${dp[j]} — elemento ${sequence[j]}`,
      text: `Todas as comparações para j=${j} (valor ${sequence[j]}) avaliadas.\ndp[${j}] = ${dp[j]}: maior subsequência crescente terminando aqui tem comprimento ${dp[j]}.`,
      expType: 'skip', isComplete: false, lisIndices: [],
    });
  }

  const maxLen = Math.max(...dp);
  const lisIdx = lisReconstruct(sequence, dp);

  all.push({
    phase: 'complete', j: null, i: null, dp: [...dp],
    title: '🏆 Simulação Completa!',
    text: `Tabela dp totalmente preenchida!\n\nComprimento da maior subsequência crescente: ${maxLen}\nSubsequência: ${lisIdx.map(k => sequence[k]).join(' → ')}\n\nO maior valor em dp[] é a resposta final.`,
    expType: 'complete', isComplete: true, lisIndices: lisIdx, maxLen,
  });

  return all;
}

function lisReconstruct(seq, dp) {
  const maxLen = Math.max(...dp);
  const idx = []; let curLen = maxLen, curVal = Infinity;
  for (let i = seq.length - 1; i >= 0 && curLen > 0; i--) {
    if (dp[i] === curLen && seq[i] < curVal) {
      idx.unshift(i); curVal = seq[i]; curLen--;
    }
  }
  return idx;
}

function renderLISStep(index) {
  const step = lisViz.steps[index];
  const seq  = lisViz.sequence;

  document.getElementById('lis-step-counter').textContent = `Passo ${index} de ${lisViz.steps.length - 1}`;
  document.getElementById('lis-btn-prev').disabled = index === 0;
  document.getElementById('lis-btn-next').disabled = index === lisViz.steps.length - 1;

  const expBox = document.getElementById('lis-step-explanation');
  expBox.className = `step-explanation type-${step.expType}`;
  document.getElementById('lis-exp-title').textContent = step.title;
  document.getElementById('lis-exp-text').textContent  = step.text;

  document.getElementById('lis-seq-boxes').innerHTML = seq.map((v, k) => {
    let cls = 'seq-box';
    if      (step.isComplete && step.lisIndices.includes(k)) cls += ' lis-path';
    else if (step.phase === 'compare' && k === step.j)       cls += ' lis-j';
    else if (step.phase === 'compare' && k === step.i)       cls += ' lis-i';
    else if (step.phase === 'settled' && k === step.j)       cls += ' lis-settled';
    return `<div class="${cls}"><span class="seq-val">${v}</span><span class="seq-idx">[${k}]</span></div>`;
  }).join('');

  document.getElementById('lis-dp-boxes').innerHTML = step.dp.map((v, k) => {
    let cls = 'dp-box';
    if      (step.isComplete && step.lisIndices.includes(k)) cls += ' lis-path';
    else if (step.phase === 'compare' && k === step.j)       cls += ' dp-j-active';
    else if (step.phase === 'settled' && k === step.j)       cls += ' dp-settled';
    else if (k === 0 || (step.j !== null && k < step.j))    cls += ' dp-revealed';
    return `<div class="${cls}"><span class="dp-box-label">dp[${k}]</span>${v}</div>`;
  }).join('');

  const rp = document.getElementById('lis-result-panel');
  if (step.isComplete) {
    rp.style.display = 'block';
    document.getElementById('lis-result-content').innerHTML = `
      <div class="result-stat"><div class="result-stat-label">Comprimento LIS</div><div class="result-stat-value">${step.maxLen}</div></div>
      <div class="result-items"><div class="result-items-label">Subsequência Encontrada</div>
      ${step.lisIndices.map(k => `<span class="result-item-tag">${seq[k]}</span>`).join(' <span style="color:#15803d;font-weight:700">→</span> ')}</div>`;
  } else { rp.style.display = 'none'; }
}

function lisNext()   { if (lisViz.currentStep < lisViz.steps.length - 1) { lisViz.currentStep++; renderLISStep(lisViz.currentStep); if (lisViz.currentStep === lisViz.steps.length - 1) lisStopAuto(); } }
function lisPrev()   { if (lisViz.currentStep > 0) { lisViz.currentStep--; renderLISStep(lisViz.currentStep); } }
function lisReset()  { lisStopAuto(); lisViz.currentStep = 0; renderLISStep(0); }
function lisToggleAuto() { lisViz.autoTimer ? lisStopAuto() : lisStartAuto(); }
function lisStartAuto() {
  if (lisViz.currentStep === lisViz.steps.length - 1) { lisViz.currentStep = 0; renderLISStep(0); }
  const b = document.getElementById('lis-btn-auto');
  b.textContent = '⏸ Pausar'; b.classList.add('playing');
  lisViz.autoTimer = setInterval(() => { if (lisViz.currentStep >= lisViz.steps.length - 1) { lisStopAuto(); return; } lisNext(); }, 800);
}
function lisStopAuto() {
  if (lisViz.autoTimer) { clearInterval(lisViz.autoTimer); lisViz.autoTimer = null; }
  const b = document.getElementById('lis-btn-auto');
  if (b) { b.textContent = '▶ Automático'; b.classList.remove('playing'); }
}
function lisToggleConfig() { lisViz.configOpen ? lisCloseConfig() : lisOpenConfig(); }
function lisOpenConfig() {
  document.getElementById('lis-input-sequence').value = lisViz.sequence.join(', ');
  document.getElementById('lis-config-error').hidden = true;
  document.getElementById('lis-config-panel').hidden = false;
  document.getElementById('lis-btn-config-toggle').textContent = '✕ Fechar';
  document.getElementById('lis-btn-config-toggle').classList.add('active-config');
  lisViz.configOpen = true;
}
function lisCloseConfig() {
  document.getElementById('lis-config-panel').hidden = true;
  document.getElementById('lis-btn-config-toggle').textContent = '⚙ Personalizar';
  document.getElementById('lis-btn-config-toggle').classList.remove('active-config');
  lisViz.configOpen = false;
}
function lisApplyConfig() {
  const nums = document.getElementById('lis-input-sequence').value
    .split(/[,\s]+/).filter(Boolean).map(s => parseInt(s, 10));
  const err = document.getElementById('lis-config-error');
  if (nums.some(isNaN))  { err.textContent = 'Use apenas inteiros separados por vírgula.'; err.hidden = false; return; }
  if (nums.length < 2)   { err.textContent = 'Sequência precisa ter pelo menos 2 elementos.'; err.hidden = false; return; }
  if (nums.length > 12)  { err.textContent = 'Máximo de 12 elementos para boa visualização.'; err.hidden = false; return; }
  err.hidden = true;
  lisViz.sequence = nums;
  lisCloseConfig();
  lisViz.steps = computeLISSteps(lisViz.sequence);
  lisViz.currentStep = 0;
  renderLISStep(0);
}

// ════════════════════════════════════════════════════════════
// WIS — Weighted Interval Scheduling
// ════════════════════════════════════════════════════════════

const wisViz = {
  intervals: [
    { id: 1, start: 0, finish: 3, weight: 3 },
    { id: 2, start: 1, finish: 4, weight: 2 },
    { id: 3, start: 2, finish: 5, weight: 4 },
    { id: 4, start: 3, finish: 7, weight: 6 },
    { id: 5, start: 5, finish: 8, weight: 3 },
  ],
  steps: [], currentStep: 0, autoTimer: null, configOpen: false,
  configFormItems: [],
};

function computeWISSteps(intervals) {
  const sorted = [...intervals].sort((a, b) => a.finish - b.finish);
  const n = sorted.length;

  const prev = sorted.map((curr, j) => {
    for (let k = j - 1; k >= 0; k--) {
      if (sorted[k].finish <= curr.start) return k;
    }
    return -1;
  });

  const dp = Array(n + 1).fill(0);
  const all = [];

  all.push({
    phase: 'init', j: null, dp: [...dp], sorted, prev,
    title: 'Estado Inicial',
    text: 'Intervalos ordenados por tempo de término.\n\np(j) = índice do último intervalo compatível com j (sem sobreposição). -1 se não existir.\n\ndp[0] = 0 (caso base: sem intervalos, peso total = 0).',
    expType: 'init', isComplete: false, selected: [],
  });

  for (let j = 1; j <= n; j++) {
    const intv    = sorted[j - 1];
    const pj      = prev[j - 1];
    const prevDp  = pj >= 0 ? dp[pj + 1] : 0;
    const include = intv.weight + prevDp;
    const exclude = dp[j - 1];
    const takes   = include > exclude;
    dp[j] = Math.max(include, exclude);

    all.push({
      phase: 'fill', j, dp: [...dp], sorted, prev,
      title: `dp[${j}] — Intervalo [${intv.start}, ${intv.finish}), peso ${intv.weight}`,
      text: takes
        ? `j=${j}: [${intv.start}, ${intv.finish}), peso=${intv.weight}\np(${j})=${pj >= 0 ? pj + 1 : 0}\n\n• Incluir: ${intv.weight} + dp[${pj >= 0 ? pj + 1 : 0}] = ${intv.weight} + ${prevDp} = ${include}\n• Excluir: dp[${j - 1}] = ${exclude}\n\n→ Vale INCLUIR! dp[${j}] = ${dp[j]}`
        : `j=${j}: [${intv.start}, ${intv.finish}), peso=${intv.weight}\np(${j})=${pj >= 0 ? pj + 1 : 0}\n\n• Incluir: ${intv.weight} + dp[${pj >= 0 ? pj + 1 : 0}] = ${include}\n• Excluir: dp[${j - 1}] = ${exclude}\n\n→ Melhor EXCLUIR. dp[${j}] = ${dp[j]}`,
      expType: takes ? 'take' : 'no-fit',
      isComplete: false, selected: [],
    });
  }

  const selected = wisBacktrack(dp, sorted, prev, n);

  all.push({
    phase: 'complete', j: null, dp: [...dp], sorted, prev,
    title: '🏆 Simulação Completa!',
    text: `Tabela dp preenchida!\n\nPeso máximo: ${dp[n]}\nIntervalos selecionados: ${selected.length > 0 ? selected.map(s => `[${s.start}, ${s.finish})`).join(', ') : 'Nenhum'}\n\ndp[${n}] = ${dp[n]} é a resposta final.`,
    expType: 'complete', isComplete: true,
    selected: selected.map(s => s.id),
  });

  return all;
}

function wisBacktrack(dp, sorted, prev, n) {
  const res = []; let j = n;
  while (j > 0) {
    const intv = sorted[j - 1]; const pj = prev[j - 1];
    const include = intv.weight + (pj >= 0 ? dp[pj + 1] : 0);
    if (dp[j] === include) { res.unshift(intv); j = pj >= 0 ? pj + 1 : 0; }
    else { j--; }
  }
  return res;
}

function renderWISStep(index) {
  const step    = wisViz.steps[index];
  const sorted  = step.sorted;
  const n       = sorted.length;
  const maxTime = Math.max(...sorted.map(s => s.finish));
  const pct     = v => `${(v / maxTime * 100).toFixed(1)}%`;

  document.getElementById('wis-step-counter').textContent = `Passo ${index} de ${wisViz.steps.length - 1}`;
  document.getElementById('wis-btn-prev').disabled = index === 0;
  document.getElementById('wis-btn-next').disabled = index === wisViz.steps.length - 1;

  const expBox = document.getElementById('wis-step-explanation');
  expBox.className = `step-explanation type-${step.expType}`;
  document.getElementById('wis-exp-title').textContent = step.title;
  document.getElementById('wis-exp-text').textContent  = step.text;

  document.getElementById('wis-timeline').innerHTML = sorted.map((intv, idx) => {
    const j = idx + 1;
    let cls = 'wis-interval';
    if      (step.isComplete && step.selected.includes(intv.id)) cls += ' wis-selected';
    else if (step.phase === 'fill' && step.j === j)              cls += ' wis-current';
    else if (step.j !== null && j < step.j)                      cls += ' wis-done';
    return `
      <div class="wis-row">
        <div class="wis-row-label">I${j} <span class="wis-pval">p=${step.prev[idx] >= 0 ? step.prev[idx] + 1 : 0}</span></div>
        <div class="wis-track">
          <div class="${cls}" style="left:${pct(intv.start)};width:${pct(intv.finish - intv.start)}">w=${intv.weight}</div>
        </div>
        <div class="wis-time-range">[${intv.start},${intv.finish})</div>
      </div>`;
  }).join('');

  document.getElementById('wis-dp-array').innerHTML = step.dp.map((v, k) => {
    let cls = 'dp-box';
    if      (step.phase === 'fill' && k === step.j)                                   cls += ' dp-j-active';
    else if (k === 0 || (step.j !== null && k <= step.j - 1) || step.isComplete)      cls += ' dp-revealed';
    return `<div class="${cls}"><span class="dp-box-label">dp[${k}]</span>${v}</div>`;
  }).join('');

  const rp = document.getElementById('wis-result-panel');
  if (step.isComplete) {
    rp.style.display = 'block';
    const sel = sorted.filter(s => step.selected.includes(s.id));
    document.getElementById('wis-result-content').innerHTML = `
      <div class="result-stat"><div class="result-stat-label">Peso Máximo</div><div class="result-stat-value">${step.dp[n]}</div></div>
      <div class="result-stat"><div class="result-stat-label">Intervalos Selecionados</div><div class="result-stat-value">${sel.length}</div></div>
      <div class="result-items"><div class="result-items-label">Intervalos na Solução</div>
      ${sel.map(s => `<span class="result-item-tag">[${s.start}, ${s.finish}) w=${s.weight}</span>`).join('')}</div>`;
  } else { rp.style.display = 'none'; }
}

function wisNext()   { if (wisViz.currentStep < wisViz.steps.length - 1) { wisViz.currentStep++; renderWISStep(wisViz.currentStep); if (wisViz.currentStep === wisViz.steps.length - 1) wisStopAuto(); } }
function wisPrev()   { if (wisViz.currentStep > 0) { wisViz.currentStep--; renderWISStep(wisViz.currentStep); } }
function wisReset()  { wisStopAuto(); wisViz.currentStep = 0; renderWISStep(0); }
function wisToggleAuto() { wisViz.autoTimer ? wisStopAuto() : wisStartAuto(); }
function wisStartAuto() {
  if (wisViz.currentStep === wisViz.steps.length - 1) { wisViz.currentStep = 0; renderWISStep(0); }
  const b = document.getElementById('wis-btn-auto');
  b.textContent = '⏸ Pausar'; b.classList.add('playing');
  wisViz.autoTimer = setInterval(() => { if (wisViz.currentStep >= wisViz.steps.length - 1) { wisStopAuto(); return; } wisNext(); }, 1000);
}
function wisStopAuto() {
  if (wisViz.autoTimer) { clearInterval(wisViz.autoTimer); wisViz.autoTimer = null; }
  const b = document.getElementById('wis-btn-auto');
  if (b) { b.textContent = '▶ Automático'; b.classList.remove('playing'); }
}
function wisToggleConfig() { wisViz.configOpen ? wisCloseConfig() : wisOpenConfig(); }
function wisOpenConfig() {
  wisViz.configFormItems = wisViz.intervals.map(it => ({ ...it }));
  renderWISConfigList();
  document.getElementById('wis-config-error').hidden = true;
  document.getElementById('wis-config-panel').hidden = false;
  document.getElementById('wis-btn-config-toggle').textContent = '✕ Fechar';
  document.getElementById('wis-btn-config-toggle').classList.add('active-config');
  wisViz.configOpen = true;
}
function wisCloseConfig() {
  document.getElementById('wis-config-panel').hidden = true;
  document.getElementById('wis-btn-config-toggle').textContent = '⚙ Personalizar';
  document.getElementById('wis-btn-config-toggle').classList.remove('active-config');
  wisViz.configOpen = false;
}
function renderWISConfigList() {
  const canRemove = wisViz.configFormItems.length > 1;
  document.getElementById('wis-config-items-list').innerHTML = wisViz.configFormItems.map((it, idx) => `
    <div class="config-item-row">
      <input type="number" class="config-input" data-field="start"  value="${it.start}"  min="0" max="99" />
      <input type="number" class="config-input" data-field="finish" value="${it.finish}" min="1" max="99" />
      <input type="number" class="config-input" data-field="weight" value="${it.weight}" min="1" max="99" />
      <button class="btn-remove-item" data-idx="${idx}" ${canRemove ? '' : 'disabled'}>✕</button>
    </div>`).join('');
}
function wisSync() {
  document.querySelectorAll('#wis-config-items-list .config-item-row').forEach((row, idx) => {
    wisViz.configFormItems[idx] = {
      id:     wisViz.configFormItems[idx]?.id ?? (idx + 1),
      start:  parseInt(row.querySelector('[data-field="start"]').value)  || 0,
      finish: parseInt(row.querySelector('[data-field="finish"]').value) || 1,
      weight: parseInt(row.querySelector('[data-field="weight"]').value) || 1,
    };
  });
}
function wisAddInterval() {
  if (wisViz.configFormItems.length >= 8) {
    const err = document.getElementById('wis-config-error');
    err.textContent = 'Máximo de 8 intervalos.'; err.hidden = false; return;
  }
  wisSync();
  const nextId = Math.max(...wisViz.configFormItems.map(it => it.id), 0) + 1;
  wisViz.configFormItems.push({ id: nextId, start: 0, finish: 5, weight: 1 });
  renderWISConfigList();
}
function wisRemoveInterval(idx) {
  if (wisViz.configFormItems.length <= 1) return;
  wisSync();
  wisViz.configFormItems.splice(idx, 1);
  renderWISConfigList();
}
function wisApplyConfig() {
  wisSync();
  const err = document.getElementById('wis-config-error');
  for (const it of wisViz.configFormItems) {
    if (it.finish <= it.start) {
      err.textContent = `Intervalo [${it.start}, ${it.finish}): fim deve ser maior que início.`; err.hidden = false; return;
    }
  }
  err.hidden = true;
  wisViz.intervals = wisViz.configFormItems.map((it, idx) => ({ ...it, id: idx + 1 }));
  wisCloseConfig();
  wisViz.steps = computeWISSteps(wisViz.intervals);
  wisViz.currentStep = 0;
  renderWISStep(0);
}

// ════════════════════════════════════════════════════════════
// SA — Sequence Alignment
// ════════════════════════════════════════════════════════════

const saViz = {
  seq1: 'ATCG', seq2: 'TCG',
  matchScore: 1, mismatchPenalty: -1, gapPenalty: -2,
  steps: [], currentStep: 0, autoTimer: null, configOpen: false,
};

function computeSASteps(seq1, seq2, match, mismatch, gap) {
  const rows = seq1.length, cols = seq2.length;
  const dp   = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  const all  = [];

  all.push({
    phase: 'init', row: null, col: null, dp: deepCopyDp(dp),
    title: 'Estado Inicial',
    text: `Tabela dp (${rows + 1})×(${cols + 1}) inicializada.\n\ndp[i][j] = pontuação ótima alinhando os primeiros i chars de "${seq1}" com os primeiros j chars de "${seq2}".\n\nParâmetros: match=${match}, mismatch=${mismatch}, gap=${gap}`,
    expType: 'init', isComplete: false,
  });

  for (let i = 1; i <= rows; i++) {
    dp[i][0] = i * gap;
    all.push({
      phase: 'base-col', row: i, col: 0, dp: deepCopyDp(dp),
      title: `Caso base: dp[${i}][0] = ${dp[i][0]}`,
      text: `Alinhar ${i} char(s) de "${seq1}" com string vazia = ${i} gaps.\ndp[${i}][0] = ${i} × ${gap} = ${dp[i][0]}`,
      expType: 'no-fit', isComplete: false,
    });
  }
  for (let j = 1; j <= cols; j++) {
    dp[0][j] = j * gap;
    all.push({
      phase: 'base-row', row: 0, col: j, dp: deepCopyDp(dp),
      title: `Caso base: dp[0][${j}] = ${dp[0][j]}`,
      text: `Alinhar string vazia com ${j} char(s) de "${seq2}" = ${j} gaps.\ndp[0][${j}] = ${j} × ${gap} = ${dp[0][j]}`,
      expType: 'no-fit', isComplete: false,
    });
  }

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      const c1 = seq1[i - 1], c2 = seq2[j - 1];
      const isMatch = c1 === c2;
      const diag   = dp[i - 1][j - 1] + (isMatch ? match : mismatch);
      const up     = dp[i - 1][j] + gap;
      const left   = dp[i][j - 1] + gap;
      dp[i][j]     = Math.max(diag, up, left);
      const choice = dp[i][j] === diag ? 'diagonal' : (dp[i][j] === up ? 'cima' : 'esquerda');

      all.push({
        phase: 'fill', row: i, col: j, dp: deepCopyDp(dp),
        title: `dp[${i}][${j}] — "${c1}" vs "${c2}"`,
        text: `Alinhando "${c1}" (seq1[${i-1}]) com "${c2}" (seq2[${j-1}]).\n\n${isMatch ? '✓ Match!' : '✗ Mismatch.'} Opções:\n  • Diagonal (${isMatch ? 'match' : 'mismatch'}): dp[${i-1}][${j-1}] + ${isMatch ? match : mismatch} = ${diag}\n  • Cima    (gap em seq2): dp[${i-1}][${j}] + ${gap} = ${up}\n  • Esquerda (gap em seq1): dp[${i}][${j-1}] + ${gap} = ${left}\n\n→ Melhor: ${choice}. dp[${i}][${j}] = ${dp[i][j]}`,
        expType: isMatch ? 'take' : (dp[i][j] === diag ? 'no-fit' : 'skip'),
        isComplete: false,
      });
    }
  }

  all.push({
    phase: 'complete', row: null, col: null, dp: deepCopyDp(dp),
    title: '🏆 Simulação Completa!',
    text: `Tabela totalmente preenchida!\n\nPontuação ótima de alinhamento: ${dp[rows][cols]}\n\nA resposta final está em dp[${rows}][${cols}].`,
    expType: 'complete', isComplete: true,
  });

  return all;
}

function isSARevealed(step, i, j, rows) {
  if (step.phase === 'init')     return false;
  if (step.phase === 'complete') return true;
  if (i === 0 && j === 0)        return true;
  if (step.phase === 'base-col') return (j === 0 && i <= step.row) || i === 0;
  if (step.phase === 'base-row') return j === 0 || (i === 0 && j <= step.col);
  if (j === 0 || i === 0)        return true;
  if (i < step.row)              return true;
  if (i === step.row && j <= step.col) return true;
  return false;
}

function renderSAStep(index) {
  const step = saViz.steps[index];
  const seq1 = saViz.seq1, seq2 = saViz.seq2;
  const rows = seq1.length, cols = seq2.length;

  document.getElementById('sa-step-counter').textContent = `Passo ${index} de ${saViz.steps.length - 1}`;
  document.getElementById('sa-btn-prev').disabled = index === 0;
  document.getElementById('sa-btn-next').disabled = index === saViz.steps.length - 1;

  const expBox = document.getElementById('sa-step-explanation');
  expBox.className = `step-explanation type-${step.expType}`;
  document.getElementById('sa-exp-title').textContent = step.title;
  document.getElementById('sa-exp-text').textContent  = step.text;

  let html = '<thead><tr><th class="th-corner th-row-header">seq1 \\ seq2</th><th>∅</th>';
  for (let j = 0; j < cols; j++) html += `<th>${seq2[j]}</th>`;
  html += '</tr></thead><tbody>';

  for (let i = 0; i <= rows; i++) {
    html += '<tr>';
    html += i === 0
      ? '<td class="row-header">∅ <span class="row-sub">(base)</span></td>'
      : `<td class="row-header">${seq1[i-1]} <span class="row-sub">i=${i}</span></td>`;

    for (let j = 0; j <= cols; j++) {
      const isCurrent = step.row === i && step.col === j && step.row !== null;
      const revealed  = isSARevealed(step, i, j, rows);
      let cls, content;
      if      (isCurrent)  { cls = 'cell-current';  content = step.dp[i][j]; }
      else if (!revealed)  { cls = 'cell-hidden';   content = '·'; }
      else if (i === 0 || j === 0) { cls = 'cell-base'; content = step.dp[i][j]; }
      else                 { cls = 'cell-revealed'; content = step.dp[i][j]; }
      html += `<td class="${cls}">${content}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody>';
  document.getElementById('sa-dp-table').innerHTML = html;

  const rp = document.getElementById('sa-result-panel');
  if (step.isComplete) {
    rp.style.display = 'block';
    document.getElementById('sa-result-content').innerHTML = `
      <div class="result-stat"><div class="result-stat-label">Pontuação do Alinhamento</div><div class="result-stat-value">${step.dp[rows][cols]}</div></div>
      <div class="result-stat"><div class="result-stat-label">Tamanho da Tabela</div><div class="result-stat-value">${rows}×${cols}</div></div>`;
  } else { rp.style.display = 'none'; }
}

function saNext()   { if (saViz.currentStep < saViz.steps.length - 1) { saViz.currentStep++; renderSAStep(saViz.currentStep); if (saViz.currentStep === saViz.steps.length - 1) saStopAuto(); } }
function saPrev()   { if (saViz.currentStep > 0) { saViz.currentStep--; renderSAStep(saViz.currentStep); } }
function saReset()  { saStopAuto(); saViz.currentStep = 0; renderSAStep(0); }
function saToggleAuto() { saViz.autoTimer ? saStopAuto() : saStartAuto(); }
function saStartAuto() {
  if (saViz.currentStep === saViz.steps.length - 1) { saViz.currentStep = 0; renderSAStep(0); }
  const b = document.getElementById('sa-btn-auto');
  b.textContent = '⏸ Pausar'; b.classList.add('playing');
  saViz.autoTimer = setInterval(() => { if (saViz.currentStep >= saViz.steps.length - 1) { saStopAuto(); return; } saNext(); }, 850);
}
function saStopAuto() {
  if (saViz.autoTimer) { clearInterval(saViz.autoTimer); saViz.autoTimer = null; }
  const b = document.getElementById('sa-btn-auto');
  if (b) { b.textContent = '▶ Automático'; b.classList.remove('playing'); }
}
function saToggleConfig() { saViz.configOpen ? saCloseConfig() : saOpenConfig(); }
function saOpenConfig() {
  document.getElementById('sa-input-seq1').value   = saViz.seq1;
  document.getElementById('sa-input-seq2').value   = saViz.seq2;
  document.getElementById('sa-input-match').value   = saViz.matchScore;
  document.getElementById('sa-input-mismatch').value = saViz.mismatchPenalty;
  document.getElementById('sa-input-gap').value     = saViz.gapPenalty;
  document.getElementById('sa-config-error').hidden = true;
  document.getElementById('sa-config-panel').hidden = false;
  document.getElementById('sa-btn-config-toggle').textContent = '✕ Fechar';
  document.getElementById('sa-btn-config-toggle').classList.add('active-config');
  saViz.configOpen = true;
}
function saCloseConfig() {
  document.getElementById('sa-config-panel').hidden = true;
  document.getElementById('sa-btn-config-toggle').textContent = '⚙ Personalizar';
  document.getElementById('sa-btn-config-toggle').classList.remove('active-config');
  saViz.configOpen = false;
}
function saApplyConfig() {
  const seq1 = document.getElementById('sa-input-seq1').value.trim().toUpperCase();
  const seq2 = document.getElementById('sa-input-seq2').value.trim().toUpperCase();
  const match    = parseInt(document.getElementById('sa-input-match').value);
  const mismatch = parseInt(document.getElementById('sa-input-mismatch').value);
  const gap      = parseInt(document.getElementById('sa-input-gap').value);
  const err = document.getElementById('sa-config-error');
  if (!seq1 || !seq2) { err.textContent = 'As duas sequências não podem ser vazias.'; err.hidden = false; return; }
  if (seq1.length > 10 || seq2.length > 10) { err.textContent = 'Máximo de 10 caracteres por sequência.'; err.hidden = false; return; }
  if (isNaN(match) || isNaN(mismatch) || isNaN(gap)) { err.textContent = 'Scores devem ser números inteiros.'; err.hidden = false; return; }
  err.hidden = true;
  saViz.seq1 = seq1; saViz.seq2 = seq2;
  saViz.matchScore = match; saViz.mismatchPenalty = mismatch; saViz.gapPenalty = gap;
  saCloseConfig();
  saViz.steps = computeSASteps(seq1, seq2, match, mismatch, gap);
  saViz.currentStep = 0;
  renderSAStep(0);
}

// ════════════════════════════════════════════════════════════
// BF — Bellman-Ford
// ════════════════════════════════════════════════════════════

const bfViz = {
  vertices: 4,
  source: 0,
  edges: [
    { id: 1, src: 0, dst: 1, weight: 1 },
    { id: 2, src: 0, dst: 2, weight: 4 },
    { id: 3, src: 1, dst: 2, weight: 3 },
    { id: 4, src: 1, dst: 3, weight: 2 },
    { id: 5, src: 3, dst: 2, weight: -5 },
  ],
  steps: [], currentStep: 0, autoTimer: null, configOpen: false,
  configFormEdges: [],
};

function computeBFSteps(vertices, source, edges) {
  const INF  = Infinity;
  const dist = Array(vertices).fill(INF);
  dist[source] = 0;
  const all = [];
  const fmtDist = d => d === INF ? '∞' : String(d);

  all.push({
    phase: 'init', dist: [...dist], activeEdge: null, iter: 0, negativeCycle: false,
    title: 'Estado Inicial',
    text: `Distâncias inicializadas: vértice fonte (${source}) = 0, demais = ∞.\n\nO algoritmo relaxa todas as arestas |V|-1 = ${vertices - 1} vezes.\nSe ainda houver melhoria após isso, há ciclo negativo.`,
    expType: 'init', isComplete: false,
  });

  let stopped = false;
  for (let iter = 1; iter <= vertices - 1 && !stopped; iter++) {
    let updated = false;

    for (const edge of edges) {
      if (dist[edge.src] === INF) {
        all.push({
          phase: 'check', dist: [...dist], activeEdge: edge, iter,
          title: `Iteração ${iter}: aresta ${edge.src}→${edge.dst} (peso ${edge.weight})`,
          text: `Verificando aresta ${edge.src}→${edge.dst} (peso ${edge.weight}).\n\ndist[${edge.src}] = ∞ — vértice fonte ainda não alcançado.\n\n→ Sem atualização.`,
          expType: 'no-fit', isComplete: false, negativeCycle: false,
        });
        continue;
      }

      const candidate = dist[edge.src] + edge.weight;
      if (candidate < dist[edge.dst]) {
        dist[edge.dst] = candidate;
        updated = true;
        all.push({
          phase: 'relax', dist: [...dist], activeEdge: edge, iter,
          title: `Iteração ${iter}: aresta ${edge.src}→${edge.dst} atualizada!`,
          text: `Aresta ${edge.src}→${edge.dst} (peso ${edge.weight}).\n\ndist[${edge.src}] + ${edge.weight} = ${candidate} < dist[${edge.dst}] anterior\n\n→ Atualizado! dist[${edge.dst}] = ${candidate}`,
          expType: 'take', isComplete: false, negativeCycle: false,
        });
      } else {
        all.push({
          phase: 'check', dist: [...dist], activeEdge: edge, iter,
          title: `Iteração ${iter}: aresta ${edge.src}→${edge.dst} (peso ${edge.weight})`,
          text: `Aresta ${edge.src}→${edge.dst} (peso ${edge.weight}).\n\ndist[${edge.src}] + ${edge.weight} = ${candidate} ≥ dist[${edge.dst}] = ${fmtDist(dist[edge.dst])}\n\n→ Sem melhoria.`,
          expType: 'skip', isComplete: false, negativeCycle: false,
        });
      }
    }

    if (!updated) {
      stopped = true;
      all.push({
        phase: 'early-stop', dist: [...dist], activeEdge: null, iter,
        title: `Parada antecipada na iteração ${iter}`,
        text: `Nenhuma distância foi atualizada nesta iteração.\n\nO algoritmo pode parar — a solução já convergiu.\n\n→ Pulamos as iterações restantes.`,
        expType: 'skip', isComplete: false, negativeCycle: false,
      });
    }
  }

  // Check negative cycle
  let negCycle = false;
  for (const edge of edges) {
    if (dist[edge.src] !== INF && dist[edge.src] + edge.weight < dist[edge.dst]) {
      negCycle = true; break;
    }
  }

  all.push({
    phase: 'complete', dist: [...dist], activeEdge: null, iter: vertices - 1,
    title: negCycle ? '⚠ Ciclo Negativo Detectado!' : '🏆 Simulação Completa!',
    text: negCycle
      ? `Após ${vertices - 1} iterações, ainda é possível relaxar arestas.\n\nIsso indica a presença de um ciclo de peso negativo — as distâncias não convergem.`
      : `Distâncias finais a partir do vértice ${source}:\n${dist.map((d, i) => `  v${i}: ${fmtDist(d)}`).join('\n')}\n\nNenhum ciclo negativo detectado.`,
    expType: negCycle ? 'no-fit' : 'complete',
    isComplete: true, negativeCycle: negCycle,
  });

  return all;
}

function renderBFStep(index) {
  const step  = bfViz.steps[index];
  const INF   = Infinity;
  const fmtD  = d => d === INF ? '∞' : String(d);

  document.getElementById('bf-step-counter').textContent = `Passo ${index} de ${bfViz.steps.length - 1}`;
  document.getElementById('bf-btn-prev').disabled = index === 0;
  document.getElementById('bf-btn-next').disabled = index === bfViz.steps.length - 1;

  const expBox = document.getElementById('bf-step-explanation');
  expBox.className = `step-explanation type-${step.expType}`;
  document.getElementById('bf-exp-title').textContent = step.title;
  document.getElementById('bf-exp-text').textContent  = step.text;

  // Distance boxes
  document.getElementById('bf-dist-array').innerHTML = step.dist.map((d, v) => {
    let cls = 'dp-box';
    if      (step.activeEdge && v === step.activeEdge.dst && step.phase === 'relax') cls += ' dp-j-active';
    else if (d !== INF) cls += ' dp-revealed';
    return `<div class="${cls}"><span class="dp-box-label">v${v}</span>${fmtD(d)}</div>`;
  }).join('');

  // Edges table
  document.getElementById('bf-edges-table').innerHTML = bfViz.edges.map(edge => {
    const isActive = step.activeEdge && step.activeEdge.id === edge.id;
    const cls = isActive
      ? (step.phase === 'relax' ? 'bf-edge-row bf-edge-updated' : 'bf-edge-row bf-edge-active')
      : 'bf-edge-row';
    return `<div class="${cls}">
      <span class="bf-edge-cell">${edge.src} → ${edge.dst}</span>
      <span class="bf-edge-cell">${edge.weight}</span>
      <span class="bf-edge-cell">${fmtD(step.dist[edge.src])}</span>
      <span class="bf-edge-cell">${fmtD(step.dist[edge.dst])}</span>
    </div>`;
  }).join('');

  const rp = document.getElementById('bf-result-panel');
  if (step.isComplete) {
    rp.style.display = 'block';
    document.getElementById('bf-result-content').innerHTML = step.negativeCycle
      ? `<div class="result-stat" style="border-color:#fca5a5;background:#fef2f2"><div class="result-stat-label">Resultado</div><div class="result-stat-value" style="color:#dc2626;font-size:1.1rem">Ciclo Negativo</div></div>`
      : `${step.dist.map((d, v) => `
        <div class="result-stat">
          <div class="result-stat-label">Vértice ${v}${v === bfViz.source ? ' (fonte)' : ''}</div>
          <div class="result-stat-value" style="font-size:1.4rem">${fmtD(d)}</div>
        </div>`).join('')}`;
  } else { rp.style.display = 'none'; }
}

function bfNext()   { if (bfViz.currentStep < bfViz.steps.length - 1) { bfViz.currentStep++; renderBFStep(bfViz.currentStep); if (bfViz.currentStep === bfViz.steps.length - 1) bfStopAuto(); } }
function bfPrev()   { if (bfViz.currentStep > 0) { bfViz.currentStep--; renderBFStep(bfViz.currentStep); } }
function bfReset()  { bfStopAuto(); bfViz.currentStep = 0; renderBFStep(0); }
function bfToggleAuto() { bfViz.autoTimer ? bfStopAuto() : bfStartAuto(); }
function bfStartAuto() {
  if (bfViz.currentStep === bfViz.steps.length - 1) { bfViz.currentStep = 0; renderBFStep(0); }
  const b = document.getElementById('bf-btn-auto');
  b.textContent = '⏸ Pausar'; b.classList.add('playing');
  bfViz.autoTimer = setInterval(() => { if (bfViz.currentStep >= bfViz.steps.length - 1) { bfStopAuto(); return; } bfNext(); }, 900);
}
function bfStopAuto() {
  if (bfViz.autoTimer) { clearInterval(bfViz.autoTimer); bfViz.autoTimer = null; }
  const b = document.getElementById('bf-btn-auto');
  if (b) { b.textContent = '▶ Automático'; b.classList.remove('playing'); }
}
function bfToggleConfig() { bfViz.configOpen ? bfCloseConfig() : bfOpenConfig(); }
function bfOpenConfig() {
  bfViz.configFormEdges = bfViz.edges.map(e => ({ ...e }));
  document.getElementById('bf-input-vertices').value = bfViz.vertices;
  document.getElementById('bf-input-source').value   = bfViz.source;
  renderBFConfigEdges();
  document.getElementById('bf-config-error').hidden = true;
  document.getElementById('bf-config-panel').hidden = false;
  document.getElementById('bf-btn-config-toggle').textContent = '✕ Fechar';
  document.getElementById('bf-btn-config-toggle').classList.add('active-config');
  bfViz.configOpen = true;
}
function bfCloseConfig() {
  document.getElementById('bf-config-panel').hidden = true;
  document.getElementById('bf-btn-config-toggle').textContent = '⚙ Personalizar';
  document.getElementById('bf-btn-config-toggle').classList.remove('active-config');
  bfViz.configOpen = false;
}
function renderBFConfigEdges() {
  const canRemove = bfViz.configFormEdges.length > 1;
  document.getElementById('bf-config-edges-list').innerHTML = bfViz.configFormEdges.map((e, idx) => `
    <div class="config-item-row">
      <input type="number" class="config-input" data-field="src"    value="${e.src}"    min="0" max="19" />
      <input type="number" class="config-input" data-field="dst"    value="${e.dst}"    min="0" max="19" />
      <input type="number" class="config-input" data-field="weight" value="${e.weight}" min="-99" max="99" />
      <button class="btn-remove-item" data-idx="${idx}" ${canRemove ? '' : 'disabled'}>✕</button>
    </div>`).join('');
}
function bfSync() {
  const v = parseInt(document.getElementById('bf-input-vertices').value) || 2;
  const s = parseInt(document.getElementById('bf-input-source').value)   || 0;
  document.querySelectorAll('#bf-config-edges-list .config-item-row').forEach((row, idx) => {
    bfViz.configFormEdges[idx] = {
      id:     bfViz.configFormEdges[idx]?.id ?? (idx + 1),
      src:    parseInt(row.querySelector('[data-field="src"]').value)    ?? 0,
      dst:    parseInt(row.querySelector('[data-field="dst"]').value)    ?? 1,
      weight: parseInt(row.querySelector('[data-field="weight"]').value) ?? 0,
    };
  });
  return { v, s };
}
function bfAddEdge() {
  if (bfViz.configFormEdges.length >= 15) {
    const err = document.getElementById('bf-config-error');
    err.textContent = 'Máximo de 15 arestas.'; err.hidden = false; return;
  }
  bfSync();
  const nextId = Math.max(...bfViz.configFormEdges.map(e => e.id), 0) + 1;
  bfViz.configFormEdges.push({ id: nextId, src: 0, dst: 1, weight: 1 });
  renderBFConfigEdges();
}
function bfRemoveEdge(idx) {
  if (bfViz.configFormEdges.length <= 1) return;
  bfSync();
  bfViz.configFormEdges.splice(idx, 1);
  renderBFConfigEdges();
}
function bfApplyConfig() {
  const { v, s } = bfSync();
  const err = document.getElementById('bf-config-error');
  if (v < 2 || v > 20) { err.textContent = 'Número de vértices: entre 2 e 20.'; err.hidden = false; return; }
  if (s < 0 || s >= v) { err.textContent = `Vértice fonte deve estar entre 0 e ${v - 1}.`; err.hidden = false; return; }
  for (const e of bfViz.configFormEdges) {
    if (e.src < 0 || e.src >= v || e.dst < 0 || e.dst >= v) {
      err.textContent = `Aresta ${e.src}→${e.dst}: vértices devem estar entre 0 e ${v - 1}.`; err.hidden = false; return;
    }
  }
  err.hidden = true;
  bfViz.vertices = v; bfViz.source = s;
  bfViz.edges = bfViz.configFormEdges.map((e, idx) => ({ ...e, id: idx + 1 }));
  bfCloseConfig();
  bfViz.steps = computeBFSteps(bfViz.vertices, bfViz.source, bfViz.edges);
  bfViz.currentStep = 0;
  renderBFStep(0);
}

document.addEventListener('DOMContentLoaded', () => {
  // Simulação inicial com dados padrão
  renderItemsList();
  steps = computeSteps(currentItems, currentCapacity);
  renderStep(currentStep);

  // ── Botões da simulação ──
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-reset').addEventListener('click', resetSimulation);
  document.getElementById('btn-auto').addEventListener('click', toggleAuto);

  // ── Painel de configuração ──
  document.getElementById('btn-config-toggle').addEventListener('click', toggleConfigPanel);
  document.getElementById('btn-cancel-config').addEventListener('click', closeConfigPanel);
  document.getElementById('btn-apply-config').addEventListener('click', applyConfig);
  document.getElementById('btn-add-item').addEventListener('click', addConfigItem);

  // Delegação para botões de remover (renderizados dinamicamente)
  document.getElementById('config-items-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove-item');
    if (btn) removeConfigItem(parseInt(btn.dataset.idx));
  });

  // Card do Knapsack rola para a seção
  document.getElementById('knapsack-card').addEventListener('click', scrollToKnapsack);

  // ── LIS ──
  lisViz.steps = computeLISSteps(lisViz.sequence);
  renderLISStep(0);
  document.getElementById('lis-btn-next').addEventListener('click', lisNext);
  document.getElementById('lis-btn-prev').addEventListener('click', lisPrev);
  document.getElementById('lis-btn-reset').addEventListener('click', lisReset);
  document.getElementById('lis-btn-auto').addEventListener('click', lisToggleAuto);
  document.getElementById('lis-btn-config-toggle').addEventListener('click', lisToggleConfig);
  document.getElementById('lis-btn-cancel-config').addEventListener('click', lisCloseConfig);
  document.getElementById('lis-btn-apply-config').addEventListener('click', lisApplyConfig);
  document.getElementById('lis-card').addEventListener('click', () => document.getElementById('lis').scrollIntoView({ behavior: 'smooth' }));

  // ── WIS ──
  wisViz.steps = computeWISSteps(wisViz.intervals);
  renderWISStep(0);
  document.getElementById('wis-btn-next').addEventListener('click', wisNext);
  document.getElementById('wis-btn-prev').addEventListener('click', wisPrev);
  document.getElementById('wis-btn-reset').addEventListener('click', wisReset);
  document.getElementById('wis-btn-auto').addEventListener('click', wisToggleAuto);
  document.getElementById('wis-btn-config-toggle').addEventListener('click', wisToggleConfig);
  document.getElementById('wis-btn-cancel-config').addEventListener('click', wisCloseConfig);
  document.getElementById('wis-btn-apply-config').addEventListener('click', wisApplyConfig);
  document.getElementById('wis-btn-add-interval').addEventListener('click', wisAddInterval);
  document.getElementById('wis-config-items-list').addEventListener('click', e => {
    const btn = e.target.closest('.btn-remove-item');
    if (btn) wisRemoveInterval(parseInt(btn.dataset.idx));
  });
  document.getElementById('wis-card').addEventListener('click', () => document.getElementById('wis').scrollIntoView({ behavior: 'smooth' }));

  // ── Sequence Alignment ──
  saViz.steps = computeSASteps(saViz.seq1, saViz.seq2, saViz.matchScore, saViz.mismatchPenalty, saViz.gapPenalty);
  renderSAStep(0);
  document.getElementById('sa-btn-next').addEventListener('click', saNext);
  document.getElementById('sa-btn-prev').addEventListener('click', saPrev);
  document.getElementById('sa-btn-reset').addEventListener('click', saReset);
  document.getElementById('sa-btn-auto').addEventListener('click', saToggleAuto);
  document.getElementById('sa-btn-config-toggle').addEventListener('click', saToggleConfig);
  document.getElementById('sa-btn-cancel-config').addEventListener('click', saCloseConfig);
  document.getElementById('sa-btn-apply-config').addEventListener('click', saApplyConfig);
  document.getElementById('sa-card').addEventListener('click', () => document.getElementById('seq-align').scrollIntoView({ behavior: 'smooth' }));

  // ── Bellman-Ford ──
  bfViz.steps = computeBFSteps(bfViz.vertices, bfViz.source, bfViz.edges);
  renderBFStep(0);
  document.getElementById('bf-btn-next').addEventListener('click', bfNext);
  document.getElementById('bf-btn-prev').addEventListener('click', bfPrev);
  document.getElementById('bf-btn-reset').addEventListener('click', bfReset);
  document.getElementById('bf-btn-auto').addEventListener('click', bfToggleAuto);
  document.getElementById('bf-btn-config-toggle').addEventListener('click', bfToggleConfig);
  document.getElementById('bf-btn-cancel-config').addEventListener('click', bfCloseConfig);
  document.getElementById('bf-btn-apply-config').addEventListener('click', bfApplyConfig);
  document.getElementById('bf-btn-add-edge').addEventListener('click', bfAddEdge);
  document.getElementById('bf-config-edges-list').addEventListener('click', e => {
    const btn = e.target.closest('.btn-remove-item');
    if (btn) bfRemoveEdge(parseInt(btn.dataset.idx));
  });
  document.getElementById('bf-card').addEventListener('click', () => document.getElementById('bellman').scrollIntoView({ behavior: 'smooth' }));

  // ── Navegação por teclado ──
  document.addEventListener('keydown', (e) => {
    if (configOpen) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextStep();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevStep();
    if (e.key === 'r' || e.key === 'R')                  resetSimulation();
    if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
  });
});
