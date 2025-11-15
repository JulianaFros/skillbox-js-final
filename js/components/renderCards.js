import { $, htmlToNode } from './dom.js';
import { catalogState } from './state.js';
import { filterAndSort } from './pipeline.js';

function normalizeImgPath(p) {
  if (!p) return null;
  return String(p).replace(/^(\.\.\/)+/, '');
}



function mapCityKey(city) {
  const m = {
    'москва': 'moscow',
    'moscow': 'moscow',
    'санкт-петербург': 'saintPetersburg',
    'петербург': 'saintPetersburg',
    'spb': 'saintPetersburg',
    'saintpetersburg': 'saintPetersburg',
    'оренбург': 'orenburg',
    'orenburg': 'orenburg',
  };
  return map[String(city || '').trim().toLowerCase()] || null;
}

function formatPrice(n) {
  const val = Number(n ?? 0);
  return val.toLocaleString('ru-RU');
}

function cardTemplate(item) {
  const {
    id, name, title, price, rating, availability, type, image
  } = item;

  const displayTitle = title || name || 'Товар';
  const img = normalizeImgPath(image) || images[0] || 'images/item-1.png';

  const newPrice = price?.new ?? 0;
  const oldPrice = price?.old ?? null;

  let availText = 'Нет на складе';
  if (availability && typeof availability === 'object') {
    const ck = mapCityKey(catalogState.city);
    if (ck && typeof availability[ck] === 'number') {
      const qty = availability[ck];
      availText = qty > 0 ? `В наличии: ${qty}` : 'Нет на складе';
    } else {
      const total = Object.values(availability).reduce((s, n) => s + (Number(n) || 0), 0);
      availText = total > 0 ? `В наличии: ${total}` : 'Нет на складе';
    }
  }

  return `
    <li class="catalog__item" data-id="${id}" data-type="${Array.isArray(type) ? type.join(',') : (type || '')}">
      <div class="product-card">
        <div class="product-card__visual">
          <img class="product-card__img" src="${img}" height="436" width="290" alt="${displayTitle}">
          <div class="product-card__more">
            <button class="product-card__link btn btn--icon" data-action="add-to-basket" data-id="${id}">
              <span class="btn__text">В корзину</span>
              <svg width="24" height="24" aria-hidden="true">
                <use xlink:href="images/sprite.svg#icon-basket"></use>
              </svg>
            </button>
            <a href="#" class="product-card__link btn btn--secondary">
              <span class="btn__text">Подробнее</span>
            </a>
          </div>
        </div>

        <div class="product-card__content">
          <h3 class="product-card__title">${displayTitle}</h3>

          <div class="product-card__row">
            <span class="product-card__price product-card__price--new">${formatPrice(newPrice)} ₽</span>
            ${oldPrice ? `<span class="product-card__price product-card__price--old">${formatPrice(oldPrice)} ₽</span>` : ''}
            <span class="product-card__rating" aria-label="Рейтинг">${Number(rating ?? 0)}</span>
          </div>

          <div class="product-card__avail ${/В наличии/.test(availText) ? 'is-available' : 'is-out'}">
            ${availText}
          </div>
        </div>
      </div>
    </li>
  `;
}

function sliceByPage(arr, page, perPage) {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
}

export function renderCards() {
  if (!$.list) return;

  const filtered = filterAndSort(catalogState.all, catalogState);

  const totalPages = Math.max(1, Math.ceil(filtered.length / catalogState.perPage));
  if (catalogState.page > totalPages) catalogState.page = 1;

  const pageItems = sliceByPage(filtered, catalogState.page, catalogState.perPage);

  $.list.innerHTML = '';
  const frag = document.createDocumentFragment();
  pageItems.forEach(item => frag.appendChild(htmlToNode(cardTemplate(item))));
  $.list.appendChild(frag);

  document.dispatchEvent(new CustomEvent('catalog:rendered', {
    detail: { total: filtered.length, page: catalogState.page, totalPages }
  }));
}
