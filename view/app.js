const state = { cities: [], filtered: [], sortKey: 'Population', sortDirection: 'desc' };
const numberFormat = new Intl.NumberFormat('en-US');

const elements = {
  rows: document.querySelector('#cityRows'),
  search: document.querySelector('#searchInput'),
  result: document.querySelector('#resultText'),
  empty: document.querySelector('#emptyState'),
  error: document.querySelector('#errorState'),
  status: document.querySelector('.status'),
  statusText: document.querySelector('#statusText')
};

function render() {
  const query = elements.search.value.trim().toLowerCase();
  state.filtered = state.cities.filter((city) =>
    [city.Name, city.CountryCode, city.District].some((value) =>
      String(value ?? '').toLowerCase().includes(query)
    )
  );
  state.filtered.sort((a, b) => {
    const first = a[state.sortKey];
    const second = b[state.sortKey];
    const comparison = typeof first === 'number'
      ? first - second
      : String(first ?? '').localeCompare(String(second ?? ''));
    return state.sortDirection === 'asc' ? comparison : -comparison;
  });

  elements.rows.innerHTML = state.filtered.map((city) => `
    <tr>
      <td>${escapeHtml(city.ID)}</td>
      <td>${escapeHtml(city.Name)}</td>
      <td>${escapeHtml(city.CountryCode)}</td>
      <td>${escapeHtml(city.District)}</td>
      <td class="population">${numberFormat.format(city.Population || 0)}</td>
    </tr>
  `).join('');
  elements.result.textContent = `${numberFormat.format(state.filtered.length)} of ${numberFormat.format(state.cities.length)} cities`;
  elements.empty.hidden = state.filtered.length !== 0 || state.cities.length === 0;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function updateSummary() {
  document.querySelector('#cityCount').textContent = numberFormat.format(state.cities.length);
  document.querySelector('#countryCount').textContent = numberFormat.format(new Set(state.cities.map((city) => city.CountryCode)).size);
  document.querySelector('#populationTotal').textContent = numberFormat.format(state.cities.reduce((total, city) => total + (Number(city.Population) || 0), 0));
}

document.querySelectorAll('th[data-key]').forEach((header) => {
  header.querySelector('.sort').addEventListener('click', () => {
    const key = header.dataset.key;
    state.sortDirection = state.sortKey === key && state.sortDirection === 'desc' ? 'asc' : 'desc';
    state.sortKey = key;
    render();
  });
});
elements.search.addEventListener('input', render);

fetch('/api/cities')
  .then((response) => {
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  })
  .then((cities) => {
    state.cities = cities;
    updateSummary();
    elements.status.classList.add('online');
    elements.statusText.textContent = 'SQL connected';
    render();
  })
  .catch((error) => {
    console.error('Could not load city data:', error);
    elements.statusText.textContent = 'SQL not connected';
    elements.error.hidden = false;
    elements.result.textContent = 'No data available';
  });
