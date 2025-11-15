export const $ = {
    list: document.querySelector('.catalog__list'),
  };
  
  export function htmlToNode(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }
  