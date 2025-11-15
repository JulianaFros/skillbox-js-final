import { catalogState } from './state.js';
import { renderCards } from './renderCards.js';
import { renderPagination } from './pagination.js';
import { initFilters } from './filters.js';

function findLocationRoot() {
  return (
    document.querySelector('[data-location]') ||
    document.querySelector('.header__location') ||
    document.querySelector('.location') ||
    null
  );
}

function findTriggerElement(root) {
  return (
    root.querySelector('[data-location-toggle]') ||
    root.querySelector('.location__city') ||
    root.querySelector('.header__location .location__city') ||
    root
  );
}

function findNameElement(root, trigger) {
  return (
    root.querySelector('[data-location-name]') ||
    root.querySelector('.location__city-name') ||
    root.querySelector('.header__city-name') ||
    trigger
  );
}

function findDropdownElement(root) {
  return (
    root.querySelector('[data-location-list]') ||
    root.querySelector('.location__sublist') ||
    root.querySelector('.location__list') ||
    root.querySelector('.location__dropdown') ||
    null
  );
}

function getLocationElements() {
  const root = findLocationRoot();
  if (!root) return null;

  const trigger = findTriggerElement(root);
  const nameEl = findNameElement(root, trigger);
  const dropdown = findDropdownElement(root);

  return { root, trigger, nameEl, dropdown };
}

function openLocationDropdown(trigger, dropdown) {
  trigger.classList.add('location__city--active');
  trigger.setAttribute('aria-expanded', 'true');
  if (dropdown) {
    dropdown.classList.add('location__sublist--active');
    dropdown.classList.add('location__list--active');
    dropdown.hidden = false;
  }
}

function closeLocationDropdown(trigger, dropdown) {
  trigger.classList.remove('location__city--active');
  trigger.setAttribute('aria-expanded', 'false');
  if (dropdown) {
    dropdown.classList.remove('location__sublist--active');
    dropdown.classList.remove('location__list--active');
    dropdown.hidden = true;
  }
}

function getCityItemSelectors() {
  return [
    '[data-city]',
    '.location__sublink',
    '.location__subitem',
    '.location__subitem a',
    '.location__list a',
    'button[data-city]'
  ].join(',');
}

function extractCityName(element) {
  const rawCity = element.getAttribute('data-city') || element.textContent || '';
  return rawCity.trim().replace(/\s+/g, ' ');
}

function updateCatalogAfterCityChange() {
  catalogState.page = 1;
  renderCards();
  renderPagination();

  try {
    initFilters();
  } catch (error) {
  }
}

function dispatchCityChangedEvent(city) {
  document.dispatchEvent(
    new CustomEvent('catalog:cityChanged', { detail: { city } })
  );
}

function setupCitySelection(dropdown, nameEl, trigger) {
  const itemSelector = getCityItemSelectors();

  dropdown.addEventListener('click', (e) => {
    const cityElement = e.target.closest(itemSelector);
    if (!cityElement) return;

    const city = extractCityName(cityElement);
    if (!city) return;

    nameEl.textContent = city;
    closeLocationDropdown(trigger, dropdown);
    catalogState.city = city;

    updateCatalogAfterCityChange();
    dispatchCityChangedEvent(city);
  });
}

function setupToggleButton(trigger, dropdown) {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    trigger.classList.contains('location__city--active')
      ? closeLocationDropdown(trigger, dropdown)
      : openLocationDropdown(trigger, dropdown);
  });
}

function setupOutsideClickHandler(root, trigger, dropdown) {
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target) && trigger.classList.contains('location__city--active')) {
      closeLocationDropdown(trigger, dropdown);
    }
  });
}

function setupEscapeKeyHandler(trigger, dropdown) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trigger.classList.contains('location__city--active')) {
      closeLocationDropdown(trigger, dropdown);
    }
  });
}

export function initLocationPicker() {
  const context = getLocationElements();
  if (!context) return;

  const { root, trigger, nameEl, dropdown } = context;

  trigger.setAttribute('aria-expanded', 'false');
  if (dropdown && dropdown.hidden === undefined) dropdown.hidden = true;

  setupToggleButton(trigger, dropdown);

  if (dropdown) {
    setupCitySelection(dropdown, nameEl, trigger);
  }

  setupOutsideClickHandler(root, trigger, dropdown);
  setupEscapeKeyHandler(trigger, dropdown);
}
