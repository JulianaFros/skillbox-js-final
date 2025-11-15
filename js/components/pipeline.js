export function filterAndSort(all, state) {
  let items = Array.isArray(all) ? [...all] : [];

  if (state.filters && state.filters.type && state.filters.type.size > 0) {
    const selectedTypes = Array.from(state.filters.type);
    items = items.filter((item) => {
      const itemTypes = Array.isArray(item.type) ? item.type : [];
      return selectedTypes.some(selectedType => itemTypes.includes(selectedType));
    });
  }

  if (state.city) {
    const normalizeCity = (cityName) => String(cityName || '').trim().toLowerCase();
    
    const mapCityKey = (city) => {
      const cityMapping = {
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
      return cityMapping[normalizeCity(city)] || null;
    };

    const cityKey = mapCityKey(state.city);

    if (cityKey) {
      items = items.filter((item) => {
        const availability = item?.availability;
        if (!availability || typeof availability !== 'object') return false;
        
        const quantity = availability[cityKey];
        const parsedQuantity = typeof quantity === 'string' ? Number(quantity) : quantity;
        return typeof parsedQuantity === 'number' ? parsedQuantity > 0 : false;
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
