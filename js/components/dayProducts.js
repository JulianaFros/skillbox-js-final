import { htmlToNode } from './dom.js';

function normalizeImgPath(p) {
  if (!p) return null;
  return String(p).replace(/^(\.\.\/)+/, '');
}

function formatPrice(n) {
  const val = Number(n ?? 0);
  return val.toLocaleString('ru-RU');
}

function createProductCard(item) {
  const { id, name, price, image, availability } = item;
  const img = normalizeImgPath(image) || 'images/item-1.png';
  const newPrice = price?.new ?? 0;
  const oldPrice = price?.old ?? null;

  return `
    <li class="day-products__item swiper-slide">
      <div class="product-card product-card--small">
        <div class="product-card__visual">
          <img class="product-card__img" src="${img}" height="344" width="290" alt="${name}">
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
        <div class="product-card__info">
          <h2 class="product-card__title">${name}</h2>
          ${oldPrice ? `<span class="product-card__old">
            <span class="product-card__old-number">${formatPrice(oldPrice)}</span>
            <span class="product-card__old-add">₽</span>
          </span>` : ''}
          <span class="product-card__price">
            <span class="product-card__price-number">${formatPrice(newPrice)}</span>
            <span class="product-card__price-add">₽</span>
          </span>
          <div class="product-card__tooltip tooltip">
            <button class="tooltip__btn" aria-label="Показать подсказку">
              <svg class="tooltip__icon" width="5" height="10" aria-hidden="true">
                <use xlink:href="images/sprite.svg#icon-i"></use>
              </svg>
            </button>
            <div class="tooltip__content">
              <span class="tooltip__text">Наличие товара по городам:</span>
              <ul class="tooltip__list">
                <li class="tooltip__item">
                  <span class="tooltip__text">Москва: <span class="tooltip__count">${availability?.moscow || 0}</span></span>
                </li>
                <li class="tooltip__item">
                  <span class="tooltip__text">Оренбург: <span class="tooltip__count">${availability?.orenburg || 0}</span></span>
                </li>
                <li class="tooltip__item">
                  <span class="tooltip__text">Санкт-Петербург: <span class="tooltip__count">${availability?.saintPetersburg || 0}</span></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  `;
}

export function initDayProducts(data) {
  const container = document.querySelector('.day-products__list');
  if (!container) return;

  const dayProducts = Array.isArray(data) 
    ? data.filter(item => item.goodsOfDay === true)
    : [];

  if (dayProducts.length === 0) return;

  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  dayProducts.forEach(item => {
    frag.appendChild(htmlToNode(createProductCard(item)));
  });
  container.appendChild(frag);

  initSwiper();
}

function initSwiper() {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper не загружен');
    return;
  }

  const swiperContainer = document.querySelector('.day-products__slider');
  if (!swiperContainer) return;

  const prevBtn = document.querySelector('.day-products__navigation-btn--prev');
  const nextBtn = document.querySelector('.day-products__navigation-btn--next');

  const swiper = new Swiper(swiperContainer, {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 32,
      },
      1440: {
        slidesPerView: 4,
        spaceBetween: 32,
      },
    },
  });

  swiper.on('slideChange', () => {
    if (prevBtn) {
      prevBtn.disabled = swiper.isBeginning;
    }
    if (nextBtn) {
      nextBtn.disabled = swiper.isEnd;
    }
  });

  if (prevBtn) prevBtn.disabled = swiper.isBeginning;
  if (nextBtn) nextBtn.disabled = swiper.isEnd;
}
