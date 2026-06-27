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

  // ── Navegação por teclado ──
  document.addEventListener('keydown', (e) => {
    if (configOpen) return; // Não interfere com edição de inputs
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextStep();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevStep();
    if (e.key === 'r' || e.key === 'R')                  resetSimulation();
    if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
  });
});
