import { catalogState } from './state.js';
import { renderCards } from './renderCards.js';
import { renderPagination } from './pagination.js';
import { filterAndSort } from './pipeline.js';

function ensureFiltersSet(state, key) {
  if (!state[key] || !(state[key] instanceof Set)) {
    state[key] = new Set();
  }
  return state[key];
}

function findCounterInLabel(input) {
  const label = input.closest('label');
  if (label) {
    return label.querySelector('[data-count]');
  }
  return null;
}

function findCounterInWrapper(input) {
  const wrapper = input.closest('[data-filter-item], .filters__item, .catalog__filters-item');
  if (wrapper) {
    return wrapper.querySelector('[data-count]');
  }
  return null;
}

function findCounterByDataAttributes(input) {
  const filterKey = input.dataset.filter;
  const filterValue = input.dataset.value;
  if (filterKey && filterValue) {
    return document.querySelector(`[data-count][data-filter="${filterKey}"][data-value="${filterValue}"]`);
  }
  return null;
}

function findCounterForInput(input) {
  return (
    findCounterInLabel(input) ||
    findCounterInWrapper(input) ||
    findCounterByDataAttributes(input) ||
    null
  );
}

function createTemporaryState(catalogState, key, value, isChecked) {
  const temporaryState = {
    city: catalogState.city,
    sort: catalogState.sort,
    perPage: catalogState.perPage,
    filters: {}
  };

  for (const filterKey in catalogState.filters) {
    temporaryState.filters[filterKey] = new Set([...catalogState.filters[filterKey]]);
  }

  ensureFiltersSet(temporaryState.filters, key);

  if (isChecked) {
    temporaryState.filters[key].delete(String(value));
  } else {
    temporaryState.filters[key].add(String(value));
  }

  return temporaryState;
}

function computeCountFor(key, value, isChecked) {
  const temporaryState = createTemporaryState(catalogState, key, value, isChecked);
  return filterAndSort(catalogState.all, temporaryState).length;
}

function updateFilterCounts(root = document) {
  const checkboxes = root.querySelectorAll('input[type="checkbox"][data-filter][data-value]');
  
  checkboxes.forEach((checkbox) => {
    const key = checkbox.dataset.filter;
    const value = String(checkbox.dataset.value);
    const counter = findCounterForInput(checkbox);
    
    if (!key || !value || !counter) return;

    const count = computeCountFor(key, value, checkbox.checked);
    counter.textContent = String(count);
  });
}

function handleCheckboxChange(checkbox) {
  const key = checkbox.dataset.filter;
  const value = checkbox.dataset.value;
  if (!key || !value) return;

  ensureFiltersSet(catalogState.filters, key);

  if (checkbox.checked) {
    catalogState.filters[key].add(String(value));
  } else {
    catalogState.filters[key].delete(String(value));
  }

  catalogState.page = 1;
  renderCards();
  renderPagination();
}

function setupCheckboxListeners(form) {
  form.addEventListener('change', (e) => {
    const checkbox = e.target;
    if (checkbox.type !== 'checkbox') return;

    handleCheckboxChange(checkbox);
    updateFilterCounts(form);
  });
}

function handleSortChange(sortSelect) {
  catalogState.sort = sortSelect.value;
  catalogState.page = 1;
  renderCards();
  renderPagination();
  updateFilterCounts();
}

function setupSortListener() {
  const sortSelect = document.querySelector('[data-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      handleSortChange(sortSelect);
    });
  }
}

function setupCatalogEventListeners() {
  document.addEventListener('catalog:rendered', () => updateFilterCounts());
  
  document.addEventListener('catalog:cityChanged', () => {
    catalogState.page = 1;
    renderCards();
    renderPagination();
    updateFilterCounts();
  });
}

export function initFilters() {
  const form = document.querySelector('.catalog-form');
  if (!form) return;

  updateFilterCounts(form);
  setupCheckboxListeners(form);
  setupSortListener();
  setupCatalogEventListeners();
}
