import { fetchCatalog } from './components/fetchData.js';
import { catalogState } from './components/state.js';
import { renderCards } from './components/renderCards.js';
import { initMainMenu } from './components/menu.js';
import { initLocationPicker } from './components/location.js';
import { renderPagination } from './components/pagination.js';
import { initFilters } from './components/filters.js';

async function init() {
    try {
        const data = await fetchCatalog();
        catalogState.all = Array.isArray(data) ? data : (data?.items ?? []);
        catalogState.page = 1;
        renderCards();
        catalogState.all = Array.isArray(data) ? data : (data?.items ?? []);
        catalogState.page = 1;
        renderCards();
        renderPagination();
        initFilters();
    } catch (e) {
        console.error(e);
        const list = document.querySelector('.catalog__list');
        if (list) list.innerHTML = '<li class="catalog__error">Ошибка загрузки каталога</li>';
    }
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', () => {
    initMainMenu();
    initLocationPicker();
});

