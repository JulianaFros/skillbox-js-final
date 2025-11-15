import { catalogState } from './state.js';
import { renderCards } from './renderCards.js';
import { renderPagination } from './pagination.js';
import { filterAndSort } from './pipeline.js';

function ensureSet(obj, key) {
  if (!obj[key] || !(obj[key] instanceof Set)) obj[key] = new Set();
  return obj[key];
}

function findCounterForInput(input) {
  let label = input.closest('label');
  if (label) {
    const c1 = label.querySelector('[data-count]');
    if (c1) return c1;
  }
  const wrap = input.closest('[data-filter-item], .filters__item, .catalog__filters-item');
  if (wrap) {
    const c2 = wrap.querySelector('[data-count]');
    if (c2) return c2;
  }
  const k = input.dataset.filter;
  const v = input.dataset.value;
  if (k && v) {
    const c3 = document.querySelector(`[data-count][data-filter="${k}"][data-value="${v}"]`);
    if (c3) return c3;
  }
  return null;
}

function computeCountFor(key, val, isChecked) {
  const tmp = {
    city: catalogState.city,
    sort: catalogState.sort,
    perPage: catalogState.perPage,
    filters: {}
  };

  // Копируем текущие фильтры
  for (const k in catalogState.filters) {
    tmp.filters[k] = new Set([...catalogState.filters[k]]);
  }
  
  ensureSet(tmp.filters, key);
  
  // Если чекбокс УЖЕ включен - считаем БЕЗ него
  // Если выключен - считаем С ним
  if (isChecked) {
    tmp.filters[key].delete(String(val));
  } else {
    tmp.filters[key].add(String(val));
  }

  return filterAndSort(catalogState.all, tmp).length;
}

function updateCounts(root = document) {
  const inputs = root.querySelectorAll('input[type="checkbox"][data-filter][data-value]');
  inputs.forEach((inp) => {
    const key = inp.dataset.filter;
    const val = String(inp.dataset.value);
    const counter = findCounterForInput(inp);
    if (!key || !val || !counter) return;

    const count = computeCountFor(key, val, inp.checked);
    counter.textContent = String(count);
  });
}

export function initFilters() {
  const form = document.querySelector('.catalog-form');
  if (!form) return;

  updateCounts(form);

  form.addEventListener('change', (e) => {
    const inp = e.target;
    if (inp.type !== 'checkbox') return;

    const key = inp.dataset.filter;
    const val = inp.dataset.value;
    if (!key || !val) return;

    ensureSet(catalogState.filters, key);

    if (inp.checked) {
      catalogState.filters[key].add(String(val));
    } else {
      catalogState.filters[key].delete(String(val));
    }

    catalogState.page = 1;
    renderCards();
    renderPagination();
    updateCounts(form);
  });

  const sortSel = document.querySelector('[data-sort]');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      catalogState.sort = sortSel.value;
      catalogState.page = 1;
      renderCards();
      renderPagination();
      updateCounts(form);
    });
  }

  document.addEventListener('catalog:rendered', () => updateCounts(form));
  document.addEventListener('catalog:cityChanged', () => {
    catalogState.page = 1;
    renderCards();
    renderPagination();
    updateCounts(form);
  });
}
