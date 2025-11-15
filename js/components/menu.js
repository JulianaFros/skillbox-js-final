function getEls() {
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
  
  function closeAll({ menu }) {
    if (menu) {
      menu.classList.remove('main-menu--active');
      menu.setAttribute('aria-hidden', 'true');
    }

    const activeBtn = document.querySelector('.header__catalog-btn--active');
    if (activeBtn) activeBtn.classList.remove('header__catalog-btn--active');
  }
  
  export function initMainMenu() {
    const { btn, menu } = getEls();
    console.log('btn:', btn);
    console.log('menu:', menu);
    if (!btn || !menu) return;
  
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  
    function close() {
      console.log('Закрываем меню');
      menu.classList.remove('main-menu--active');
      btn.classList.remove('header__catalog-btn--active');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    }
  
    function toggle() {
      const isOpen = menu.classList.toggle('main-menu--active');
      console.log('Toggle меню, isOpen:', isOpen);
      btn.classList.toggle('header__catalog-btn--active', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    }
  
    btn.addEventListener('click', (e) => {
      console.log('Клик по кнопке');
      e.stopPropagation(); 
      toggle();
    });
    
    const closeIcon = menu.querySelector('.main-menu__icon');
    if (closeIcon) {
      closeIcon.addEventListener('click', (e) => {
        console.log('Клик по иконке закрытия');
        e.stopPropagation();
        close();
      });
    }

    document.addEventListener('click', (e) => {
      console.log('Клик по документу, target:', e.target);
      if (!menu.classList.contains('main-menu--active')) return;
      
      const menuWrapper = menu.querySelector('.main-menu__wrapper');
      const isClickOnOverlay = e.target === menu;
      const isClickOutsideMenu = !menu.contains(e.target);
      const isClickInsideWrapper = menuWrapper && menuWrapper.contains(e.target);
      
      console.log('isClickOnOverlay:', isClickOnOverlay);
      console.log('isClickInsideWrapper:', isClickInsideWrapper);
      
      if (isClickOnOverlay || (!isClickInsideWrapper && !btn.contains(e.target))) {
        close();
      }
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('main-menu--active')) {
        console.log('ESC нажат');
        close();
      }
    });
  }