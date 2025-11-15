export function initAccordion() {
  const accordion = document.querySelector('.accordion');
  if (!accordion) return;

  const elements = accordion.querySelectorAll('.accordion__element');

  elements.forEach((element) => {
    const btn = element.querySelector('.accordion__btn');
    const content = element.querySelector('.accordion__content');

    if (!btn || !content) return;

    content.style.maxHeight = '0';
    content.style.overflow = 'hidden';

    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('accordion__btn--active');

      elements.forEach((el) => {
        const elBtn = el.querySelector('.accordion__btn');
        const elContent = el.querySelector('.accordion__content');
        if (elBtn) {
          elBtn.classList.remove('accordion__btn--active');
        }
        if (elContent) {
          elContent.style.maxHeight = '0';
        }
      });

      if (!isActive) {
        btn.classList.add('accordion__btn--active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}
