export async function fetchCatalog() {
    const res = await fetch('data/data.json');
    if (!res.ok) throw new Error('Не удалось загрузить data.json');
    return res.json();
  }
  