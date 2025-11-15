export function initTooltips() {
  if (typeof tippy === 'undefined') {
    console.warn('Tippy.js не загружен');
    return;
  }

  function initProductTooltips() {
    const tooltipButtons = document.querySelectorAll('.tooltip__btn');
    
    tooltipButtons.forEach((button) => {
      const tooltipContent = button.nextElementSibling;
      
      if (!tooltipContent || !tooltipContent.classList.contains('tooltip__content')) {
        return;
      }

      tippy(button, {
        content: tooltipContent.innerHTML,
        allowHTML: true,
        theme: 'light',
        placement: 'top',
        interactive: true,
        arrow: true,
        trigger: 'click',
        maxWidth: 300,
        appendTo: () => document.body,
        onShow(instance) {
          tooltipButtons.forEach((btn) => {
            if (btn !== button && btn._tippy) {
              btn._tippy.hide();
            }
          });
        }
      });
    });
  }

  initProductTooltips();

  document.addEventListener('catalog:rendered', () => {
    setTimeout(initProductTooltips, 50);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tooltip__btn') && !e.target.closest('.tippy-box')) {
      const tooltipButtons = document.querySelectorAll('.tooltip__btn');
      tooltipButtons.forEach((btn) => {
        if (btn._tippy) {
          btn._tippy.hide();
        }
      });
    }
  });
}
