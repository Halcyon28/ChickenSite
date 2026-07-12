const apodCard = document.getElementById('apod-card');
const randomBtn = document.getElementById('random-apod-btn');
const apiKey = import.meta.env?.VITE_NASA_API_KEY;

function randomDate() {
  const start = new Date('1995-06-16');
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const date = new Date(randomTime);
  return date.toISOString().split('T')[0];
}

async function loadApod(date = '') {
  if (!apiKey) {
    apodCard.innerHTML = '<p class="apod-error">API key not found. Make sure your .env file contains VITE_NASA_API_KEY and that you are serving the page with Vite.</p>';
    return;
  }

  apodCard.innerHTML = '<div class="apod-loading">Loading cosmic image...</div>';

  try {
    const url = date
      ? `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${encodeURIComponent(date)}`
      : `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Unable to load APOD data: ${response.status} ${message}`);
    }

    const data = await response.json();

    apodCard.innerHTML = `
      <h2>${data.title}</h2>
      <p class="apod-date">${data.date}</p>
      ${data.media_type === 'image'
        ? `<img class="apod-image" src="${data.url}" alt="${data.title}" />`
        : `<iframe class="apod-video" src="${data.url}" title="${data.title}" allowfullscreen></iframe>`}
      <p class="apod-explanation">${data.explanation}</p>
    `;
  } catch (error) {
    console.error(error);
    apodCard.innerHTML = `<p class="apod-error">Could not load the APOD image right now. ${error.message}</p>`;
  }
}

if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    loadApod(randomDate());
  });
}

loadApod();
