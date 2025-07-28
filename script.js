// Theme Toggle
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.add('light');
}

// Update toggle icon on load
toggleBtn.textContent = body.classList.contains('light') ? '🌙' : '☀️';

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('light');
  const newTheme = body.classList.contains('light') ? 'light' : 'dark';
  toggleBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', newTheme);
});

// Scroll Reveal for Cards
const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.2
});

cards.forEach(card => observer.observe(card));
