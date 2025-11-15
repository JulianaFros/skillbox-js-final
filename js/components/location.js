import { catalogState } from './state.js';
import { renderCards } from './renderCards.js';
import { renderPagination } from './pagination.js';
import { initFilters } from './filters.js';

function getRoot() {
  const root =
    document.querySelector('[data-location]') ||
    document.querySelector('.header__location') ||
    document.querySelector('.location') ||
    null;

  if (!root) return null;

  const trigger =
    root.querySelector('[data-location-toggle]') ||
    root.querySelector('.location__city') ||
    root.querySelector('.header__location .location__city') ||
    root;

  const nameEl =
    root.querySelector('[data-location-name]') ||
    root.querySelector('.location__city-name') ||
    root.querySelector('.header__city-name') ||
    trigger;

  const dropdown =
    root.querySelector('[data-location-list]') ||
    root.querySelector('.location__sublist') ||
    root.querySelector('.location__list') ||
    root.querySelector('.location__dropdown') ||
    null;

  return { root, trigger, nameEl, dropdown };
}

function open(trigger, dropdown) {
  trigger.classList.add('location__city--active');
  trigger.setAttribute('aria-expanded', 'true');
  if (dropdown) {
    dropdown.classList.add('location__sublist--active');
    dropdown.classList.add('location__list--active');
    dropdown.hidden = false;
  }
}

function close(trigger, dropdown) {
  trigger.classList.remove('location__city--active');
  trigger.setAttribute('aria-expanded', 'false');
  if (dropdown) {
    dropdown.classList.remove('location__sublist--active');
    dropdown.classList.remove('location__list--active');
    dropdown.hidden = true;
  }
}

export function initLocationPicker() {
  const ctx = getRoot();
  if (!ctx) return;
  const { root, trigger, nameEl, dropdown } = ctx;

  trigger.setAttribute('aria-expanded', 'false');
  if (dropdown && dropdown.hidden === undefined) dropdown.hidden = true;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    trigger.classList.contains('location__city--active')
      ? close(trigger, dropdown)
      : open(trigger, dropdown);
  });

  const itemSelector = [
    '[data-city]',
    '.location__sublink',
    '.location__subitem',
    '.location__subitem a',
    '.location__list a',
    'button[data-city]'
  ].join(',');

  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      const el = e.target.closest(itemSelector);
      if (!el) return;

      const raw = el.getAttribute('data-city') || el.textContent || '';
      const city = raw.trim().replace(/\s+/g, ' ');
      if (!city) return;

      nameEl.textContent = city;
      close(trigger, dropdown);

      catalogState.city = city;

      catalogState.page = 1;
      renderCards();
      renderPagination();

      try { initFilters(); } catch { /* уже проинициализировано */ }

      document.dispatchEvent(new CustomEvent('catalog:cityChanged', { detail: { city } }));
    });
  }

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target) && trigger.classList.contains('location__city--active')) {
      close(trigger, dropdown);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trigger.classList.contains('location__city--active')) {
      close(trigger, dropdown);
    }
  });
}
