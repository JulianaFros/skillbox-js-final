export function filterAndSort(all, state) {
  let items = Array.isArray(all) ? [...all] : [];

  if (state.city) {
    const norm = (s) => String(s || '').trim().toLowerCase();
    const mapCityKey = (city) => {
      const m = {
        'москва': 'moscow',
        'moscow': 'moscow',
        'санкт-петербург': 'saintPetersburg',
        'петербург': 'saintPetersburg',
        'спб': 'saintPetersburg',
        'spb': 'saintPetersburg',
        'saint petersburg': 'saintPetersburg',
        'saintpetersburg': 'saintPetersburg',
        'оренбург': 'orenburg',
        'orenburg': 'orenburg',
      };
      return m[norm(city)] || null;
    };

    const key = mapCityKey(state.city);

    if (key) {
      items = items.filter((it) => {
        const av = it?.availability;
        if (!av || typeof av !== 'object') return false;
        const n = av[key];
        const qty = typeof n === 'string' ? Number(n) : n;
        return typeof qty === 'number' ? qty > 0 : false;
      });
    }
  }


  switch (state.sort) {
    case 'price-asc':
      items.sort((a, b) => (+(a.price?.new ?? 0)) - (+(b.price?.new ?? 0)));
      break;
    case 'price-desc':
      items.sort((a, b) => (+(b.price?.new ?? 0)) - (+(a.price?.new ?? 0)));
      break;
    case 'rating-desc':
      items.sort((a, b) => (+(b.rating ?? 0)) - (+(a.rating ?? 0)));
      break;
    case 'popular':
      items.sort((a, b) => (+(b.sales ?? 0)) - (+(a.sales ?? 0)));
      break;
    default:
      break;
  }

  return items;
}
