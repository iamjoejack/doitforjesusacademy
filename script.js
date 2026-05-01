/* ============================================================
   DoItForJesus Academy — script.js
   Features: Hero Slider · Scroll Animations · Counter · Nav
   ============================================================ */

(function () {
  'use strict';

  /* ========== HERO SLIDER ========== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current  = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function advance() { goTo(current + 1); }

  function startSlider() {
    clearInterval(timer);
    timer = setInterval(advance, 5500);
  }

  if (slides.length) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.slide, 10));
        startSlider();
      });
    });
    startSlider();
  }

  /* ========== STICKY NAV ========== */
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ========== MOBILE NAV ========== */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');

  function closeMobile() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

  /* ========== SCROLL ANIMATIONS ========== */
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ========== COUNTER ANIMATION ========== */
  const counters = document.querySelectorAll('.stat-number[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 2200; // ms
    const start  = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ========== SMOOTH SCROLL ========== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id     = this.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 16;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ========== ACTIVE NAV LINK ON SCROLL ========== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + nav.offsetHeight + 40;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ========== LIGHTBOX ========== */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxClose= document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-cell img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ========== CONTACT FORM ========== */
  const form   = document.getElementById('contact-form');
  const submit = document.getElementById('contact-submit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#e63946';
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      submit.textContent = 'Sending...';
      submit.disabled = true;

      // Real form submission with Formspree
      const data = Object.fromEntries(new FormData(form).entries());

      fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then(async response => {
        if (response.ok) {
          submit.textContent = '✓ Message Sent!';
          submit.classList.add('sent');
          form.reset();
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error('Server Error:', errData);
          alert(`Submission failed: ${errData.error || 'Server error'}. Please try again later.`);
        }
      }).catch(error => {
        console.error('Network Error:', error);
        alert("Network error: Could not reach the server. Please check your connection or try again later.");
      }).finally(() => {
        setTimeout(() => {
          submit.textContent = 'Send Message';
          submit.classList.remove('sent');
          submit.disabled = false;
        }, 4000);
      });
    });
  }

})();
