function getMenuElements() {
  const btn =
    document.querySelector('[data-menu-toggle]') ||
    document.querySelector('.header__catalog-btn') ||
    document.querySelector('.catalog-burger') ||
    null;

  const menu =
    document.querySelector('[data-menu]') ||
    document.querySelector('.main-menu') ||
    null;

  return { btn, menu };
}

function setInitialAttributes(btn, menu) {
  btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}

function closeMenu(btn, menu) {
  menu.classList.remove('main-menu--active');
  btn.classList.remove('header__catalog-btn--active');
  btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}

function toggleMenu(btn, menu) {
  const isOpen = menu.classList.toggle('main-menu--active');
  btn.classList.toggle('header__catalog-btn--active', isOpen);
  btn.setAttribute('aria-expanded', String(isOpen));
  menu.setAttribute('aria-hidden', String(!isOpen));
}

function setupToggleButton(btn, menu) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(btn, menu);
  });
}

function setupCloseIcon(menu, btn) {
  const closeIcon = menu.querySelector('.main-menu__icon');
  if (closeIcon) {
    closeIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu(btn, menu);
    });
  }
}

function isClickOutsideMenu(event, menu, btn) {
  const menuWrapper = menu.querySelector('.main-menu__wrapper');
  const isOverlayClick = event.target === menu;
  const isWrapperClick = menuWrapper && menuWrapper.contains(event.target);

  return isOverlayClick || (!isWrapperClick && !btn.contains(event.target));
}

function setupOutsideClick(btn, menu) {
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('main-menu--active')) return;

    if (isClickOutsideMenu(e, menu, btn)) {
      closeMenu(btn, menu);
    }
  });
}

function setupEscapeKey(btn, menu) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('main-menu--active')) {
      closeMenu(btn, menu);
    }
  });
}

export function initMainMenu() {
  const { btn, menu } = getMenuElements();
  if (!btn || !menu) return;

  setInitialAttributes(btn, menu);
  setupToggleButton(btn, menu);
  setupCloseIcon(menu, btn);
  setupOutsideClick(btn, menu);
  setupEscapeKey(btn, menu);
}