/**
 * Unword — vanilla JS logic
 * Real-time character case classification, pagination, CSV export.
 */

const input = document.getElementById('input-text');
const tbody = document.getElementById('table-body');
const barChart = document.getElementById('bar-chart');
const donut = document.getElementById('donut');
const inputStats = document.getElementById('input-stats');

const palette = {
  LOWER: '#8bd3dd',
  UPPER: '#fe98a3',
  DIGIT: '#faae2b',
  SPECIAL: '#a683dd'
};

const PAGE_SIZE = 20;
let activeFilter = 'all';
let currentPage = 1;
let filteredRows = [];

/* ── Core logic ─────────────────────────────────────────────────── */

function classify(ch) {
  if (/[A-Z]/.test(ch)) return 'UPPER';
  if (/[a-z]/.test(ch)) return 'LOWER';
  if (/[0-9]/.test(ch)) return 'DIGIT';
  return 'SPECIAL';
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function computeRows() {
  const text = input.value;
  const chars = [...text];
  const rows = chars.map((ch, i) => {
    const type = classify(ch);
    const up = type === 'DIGIT' || type === 'SPECIAL' ? ch : ch.toUpperCase();
    const low = type === 'DIGIT' || type === 'SPECIAL' ? ch : ch.toLowerCase();
    return { i: i + 1, ch, type, up, low };
  });
  filteredRows = activeFilter === 'all' ? rows : rows.filter(r => r.type === activeFilter);
  currentPage = 1;
}

function renderTable() {
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const rows = filteredRows.slice(startIdx, startIdx + PAGE_SIZE);

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.i}</td>
      <td style="font-family:var(--font-mono);font-weight:600">${escapeHtml(r.ch)}</td>
      <td><span class="case-pill case-${r.type}">${r.type}</span></td>
      <td style="font-family:var(--font-mono);font-weight:600">${escapeHtml(r.up)}</td>
      <td style="font-family:var(--font-mono);font-weight:600">${escapeHtml(r.low)}</td>
    </tr>
  `).join('');

  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');
  const pageInfo = document.getElementById('page-info');
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 1;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function render() {
  const text = input.value;
  const chars = [...text];

  const counts = { LOWER: 0, UPPER: 0, DIGIT: 0, SPECIAL: 0 };
  chars.forEach(ch => counts[classify(ch)]++);
  const total = chars.length || 1;
  const names = ['LOWER', 'UPPER', 'DIGIT', 'SPECIAL'];

  inputStats.innerHTML = `
    <span class="stat-item">Total chars: <span class="stat-value">${total}</span></span>
    <span class="stat-item">LOWER: <span class="stat-value">${counts.LOWER}</span></span>
    <span class="stat-item">UPPER: <span class="stat-value">${counts.UPPER}</span></span>
    <span class="stat-item">DIGIT: <span class="stat-value">${counts.DIGIT}</span></span>
    <span class="stat-item">SPECIAL: <span class="stat-value">${counts.SPECIAL}</span></span>
  `;

  let bars = '';
  names.forEach(n => {
    const pct = Math.round((counts[n] / total) * 100);
    bars += `
      <div class="bar-row">
        <div class="bar-label">${n}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${palette[n]}"></div></div>
        <div class="bar-value">${counts[n]}</div>
      </div>
    `;
  });
  barChart.innerHTML = bars;

  /* Donut via conic-gradient */
  let current = 0;
  const stops = names.map(n => {
    const pct = (counts[n] / total) * 100;
    const c = `${palette[n]} ${current}% ${current + pct}%`;
    current += pct;
    return c;
  }).join(', ');
  donut.setAttribute('data-count', String(total));
  donut.style.background = `conic-gradient(${stops})`;

  /* Legend */
  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = names.map(n => `
      <div class="legend-item">
        <span class="swatch" style="background:${palette[n]}"></span>
        <span>${n}</span>
        <span style="color:var(--muted)">${counts[n]}</span>
      </div>
    `).join('');
  }

  computeRows();
  renderTable();
}

function changePage(delta) {
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderTable();
  }
}

/* ── Summary expand/collapse ────────────────────────────────────── */
let summaryOpen = true;

function toggleSummary() {
  const content = document.getElementById('summary-content');
  const icon = document.getElementById('summary-toggle-icon');
  if (summaryOpen) {
    content.style.display = 'none';
    icon.setAttribute('points', '18 9 12 15 6 9');
  } else {
    content.style.display = '';
    icon.setAttribute('points', '6 9 12 15 18 9');
  }
  summaryOpen = !summaryOpen;
}

/* ── CSV export ─────────────────────────────────────────────────── */
function downloadCSV() {
  const text = input.value;
  const chars = [...text];
  let csv = 'Position,Character,Case Type,Upper Variant,Lower Variant\n';
  chars.forEach((ch, i) => {
    const type = classify(ch);
    const up = type === 'DIGIT' || type === 'SPECIAL' ? ch : ch.toUpperCase();
    const low = type === 'DIGIT' || type === 'SPECIAL' ? ch : ch.toLowerCase();
    csv += `${i + 1},"${ch.replace(/"/g, '""')}","${type}","${up}","${low}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'unword-analysis.csv';
  a.click();
}

/* ── Filter dropdown ────────────────────────────────────────────── */
function initFilter() {
  const filterTrigger = document.querySelector('.filter-trigger');
  const filterDropdown = document.getElementById('filter-dropdown');

  filterTrigger.addEventListener('click', () => {
    const isOpen = filterDropdown.classList.toggle('open');
    filterTrigger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', e => {
    if (!filterDropdown.contains(e.target) && !filterTrigger.contains(e.target)) {
      filterDropdown.classList.remove('open');
      filterTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      computeRows();
      renderTable();
      filterDropdown.classList.remove('open');
      filterTrigger.setAttribute('aria-expanded', 'false');
      input.focus();
    });
  });
}

/* ── Init ───────────────────────────────────────────────────────── */
input.addEventListener('input', render);

document.getElementById('download-csv').addEventListener('click', downloadCSV);

initFilter();

/* Initial render */
render();
