import { catalogState } from './state.js';
import { htmlToNode } from './dom.js';

function normalizeImgPath(p) {
  if (!p) return null;
  return String(p).replace(/^(\.\.\/)+/, '');
}

function formatPrice(n) {
  const val = Number(n ?? 0);
  return val.toLocaleString('ru-RU');
}

function findProductById(id) {
  return catalogState.all.find(item => item.id === Number(id));
}

function createBasketItem(item) {
  const img = normalizeImgPath(item.image) || 'images/item-1.png';
  const price = item.price?.new ?? 0;

  return `
    <li class="basket__item" data-basket-id="${item.id}">
      <div class="basket__img">
        <img src="${img}" alt="${item.name}" height="60" width="60">
      </div>
      <span class="basket__name">${item.name}</span>
      <span class="basket__price">${formatPrice(price)} ₽</span>
      <button class="basket__item-close" type="button" data-remove-id="${item.id}">
        <svg class="basket__close-icon" width="24" height="24" aria-hidden="true">
          <use xlink:href="images/sprite.svg#icon-close"></use>
        </svg>
      </button>
    </li>
  `;
}

function updateBasketCounter(itemCount) {
  const counter = document.querySelector('.header__user-count');
  if (counter) {
    counter.textContent = itemCount;
    counter.style.display = itemCount > 0 ? 'flex' : 'none';
  }
}

function showEmptyBasket() {
  const basketList = document.querySelector('.basket__list');
  const emptyBlock = document.querySelector('.basket__empty-block');
  const basketLink = document.querySelector('.basket__link');

  if (basketList) basketList.innerHTML = '';
  if (emptyBlock) emptyBlock.style.display = 'block';
  if (basketLink) basketLink.style.display = 'none';
}

function createCheckoutLink() {
  const basket = document.querySelector('.basket');
  const link = document.createElement('a');
  link.className = 'basket__link btn';
  link.href = '#';
  link.textContent = 'Перейти к оформлению';
  basket?.appendChild(link);
  return link;
}

function showFilledBasket() {
  const basketList = document.querySelector('.basket__list');
  const emptyBlock = document.querySelector('.basket__empty-block');
  let basketLink = document.querySelector('.basket__link');

  if (!basketList) return;

  basketList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  catalogState.basket.forEach(item => {
    fragment.appendChild(htmlToNode(createBasketItem(item)));
  });
  basketList.appendChild(fragment);

  if (emptyBlock) emptyBlock.style.display = 'none';

  if (!basketLink) {
    basketLink = createCheckoutLink();
  } else {
    basketLink.style.display = 'block';
  }
}

function updateBasketUI() {
  const itemCount = catalogState.basket.length;
  updateBasketCounter(itemCount);

  if (itemCount === 0) {
    showEmptyBasket();
  } else {
    showFilledBasket();
  }
}

function addToBasket(productId) {
  const product = findProductById(productId);
  if (!product) return;

  const exists = catalogState.basket.find(item => item.id === product.id);
  if (exists) {
    console.log('Товар уже в корзине');
    return;
  }

  catalogState.basket.push(product);
  updateBasketUI();
  saveBasketToStorage();
}

function removeFromBasket(productId) {
  const index = catalogState.basket.findIndex(item => item.id === Number(productId));
  if (index !== -1) {
    catalogState.basket.splice(index, 1);
    updateBasketUI();
    saveBasketToStorage();
  }
}

function saveBasketToStorage() {
  try {
    localStorage.setItem('basket', JSON.stringify(catalogState.basket.map(item => item.id)));
  } catch (e) {
    console.error('Ошибка сохранения корзины:', e);
  }
}

function loadBasketFromStorage() {
  try {
    const saved = localStorage.getItem('basket');
    if (saved) {
      const ids = JSON.parse(saved);
      catalogState.basket = ids
        .map(id => findProductById(id))
        .filter(item => item !== undefined);
      updateBasketUI();
    }
  } catch (e) {
    console.error('Ошибка загрузки корзины:', e);
  }
}

function toggleBasket() {
  const basketBtn = document.querySelector('.header__user-btn[data-basket-toggle], .header__user-item .header__user-btn');
  const basket = document.querySelector('.basket');

  if (!basketBtn || !basket) return;

  const isActive = basket.classList.contains('basket--active');

  if (isActive) {
    basket.classList.remove('basket--active');
    basketBtn.setAttribute('aria-expanded', 'false');
  } else {
    basket.classList.add('basket--active');
    basketBtn.setAttribute('aria-expanded', 'true');
  }
}

function setupBasketToggle(basketBtn) {
  basketBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBasket();
  });
}

function setupAddToBasketListener() {
  document.addEventListener('click', (e) => {
    const addButton = e.target.closest('[data-action="add-to-basket"]');
    if (addButton) {
      e.preventDefault();
      const productId = addButton.dataset.id;
      if (productId) {
        addToBasket(Number(productId));
      }
    }
  });
}

function setupRemoveFromBasketListener(basket) {
  basket.addEventListener('click', (e) => {
    const removeButton = e.target.closest('[data-remove-id]');
    if (removeButton) {
      e.preventDefault();
      e.stopPropagation();
      const productId = removeButton.dataset.removeId;
      if (productId) {
        removeFromBasket(Number(productId));
      }
    }
  });
}

function setupOutsideClickListener(basket, basketBtn) {
  document.addEventListener('click', (e) => {
    if (!basket.contains(e.target) && !basketBtn.contains(e.target)) {
      basket.classList.remove('basket--active');
      basketBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupEscapeKeyListener(basket, basketBtn) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && basket.classList.contains('basket--active')) {
      basket.classList.remove('basket--active');
      basketBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

export function initBasket() {
  const basketBtn = document.querySelector('.header__user-item .header__user-btn');
  const basket = document.querySelector('.basket');

  if (!basketBtn || !basket) return;

  loadBasketFromStorage();
  updateBasketCounter(catalogState.basket.length);

  setupBasketToggle(basketBtn);
  setupAddToBasketListener();
  setupRemoveFromBasketListener(basket);
  setupOutsideClickListener(basket, basketBtn);
  setupEscapeKeyListener(basket, basketBtn);
}
