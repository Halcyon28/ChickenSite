const themeToggle = document.getElementById('theme-toggle');

function applySavedTheme() {
  const savedTheme = localStorage.getItem('site-theme') || 'dark theme';
  document.body.classList.toggle('light-theme', savedTheme === 'light theme');
  if (themeToggle) {
    themeToggle.textContent = savedTheme === 'light theme' ? 'Light theme' : 'Dark theme';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  if (themeToggle) {
    themeToggle.textContent = isLight ? 'Light theme' : 'Dark theme';
  }
  localStorage.setItem('site-theme', isLight ? 'light theme' : 'dark theme');
}

applySavedTheme();

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}
