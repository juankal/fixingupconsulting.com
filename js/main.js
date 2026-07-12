// ================================================
// FIXING UP CONSULTING — Main JavaScript
// ================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }



  // ===== AOS (Animate on Scroll) =====
  const aosElements = document.querySelectorAll('[data-aos]');

  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || 0);
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  aosElements.forEach(el => aosObserver.observe(el));

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.stat-number[data-target], .counter-anim[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ===== FOOTER YEAR =====
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== QUICK CONTACT FORM =====
  const quickForm = document.getElementById('quickContactForm');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = quickForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;

      // Basic validation
      const required = quickForm.querySelectorAll('[required]');
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

      btn.textContent = 'Enviando...';
      btn.disabled = true;

      // Simulate form submission (replace with real endpoint)
      setTimeout(() => {
        btn.textContent = '✓ Mensaje Enviado';
        btn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        quickForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }, 1500);
    });
  }

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
