import { catalogState } from './state.js';
import { renderCards } from './renderCards.js';
import { filterAndSort } from './pipeline.js';

const VISIBLE = 5;

function makeBtn(num, current) {
  const li = document.createElement('li');
  li.className = 'catalog__pagination-item';
  li.innerHTML = `<button class="catalog__pagination-link ${num === current ? 'catalog__pagination-link--active' : ''}" type="button" data-page="${num}">${num}</button>`;
  return li;
}
function addArrow(container, to, dir) {
  const li = document.createElement('li');
  li.className = 'catalog__pagination-item';
  li.innerHTML = `<button class="catalog__pagination-link catalog__pagination-link--${dir}" type="button" data-page="${to}" aria-label="${dir==='prev'?'Назад':'Вперёд'}">${dir==='prev'?'←':'→'}</button>`;
  container.appendChild(li);
}

export function renderPagination() {
  const container = document.querySelector('.catalog__pagination');
  if (!container) return;

  const filtered = filterAndSort(catalogState.all, catalogState);
  const totalPages = Math.max(1, Math.ceil(filtered.length / catalogState.perPage));

  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const page = catalogState.page;
  container.innerHTML = '';
  if (page > 1) addArrow(container, page - 1, 'prev');

  const start = Math.max(1, page - Math.floor(VISIBLE/2));
  const end = Math.min(totalPages, start + VISIBLE - 1);
  for (let i = start; i <= end; i++) container.appendChild(makeBtn(i, page));

  if (page < totalPages) addArrow(container, page + 1, 'next');

  if (!container.dataset.bound) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;
      const newPage = parseInt(btn.dataset.page, 10);
      if (!Number.isFinite(newPage) || newPage === catalogState.page) return;
      catalogState.page = newPage;
      renderCards();
      renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    container.dataset.bound = '1';
  }
}
