// Publications page JavaScript — filters & form

document.addEventListener('DOMContentLoaded', () => {

  // ===== BOOK CATALOG FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const bookCards = document.querySelectorAll('.pub-book-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      bookCards.forEach((card, i) => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = `fadeInUp 0.4s ${i * 0.05}s ease both`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ===== SUBMIT MANUSCRIPT FORM =====
  const submitForm = document.getElementById('submitManuscriptForm');
  if (submitForm) {
    submitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = submitForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;

      const required = submitForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      btn.textContent = 'Enviando propuesta...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Propuesta Enviada — Nos pondremos en contacto';
        btn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        submitForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 4000);
      }, 1600);
    });
  }

});

// CSS animation for filtered items
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
