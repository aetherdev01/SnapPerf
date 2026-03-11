/* ===========================
   SnapPerf – main.js
   =========================== */

'use strict';

/* ─── Theme ─── */
(function () {
  const saved = localStorage.getItem('sp-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Scroll progress bar ─── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ─── Theme toggle ─── */
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sp-theme', next);
    });
  }

  /* ─── Hamburger / Mobile menu ─── */
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!ham.contains(e.target) && !mob.contains(e.target)) {
        ham.classList.remove('open');
        mob.classList.remove('open');
      }
    });
  }

  /* ─── Ripple Effect ─── */
  function addRipple(el, e) {
    const existing = el.querySelector('.ripple');
    if (existing) existing.remove();
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple-btn');
    if (btn) addRipple(btn, e);
  });

  /* ─── Button spring animation ─── */
  document.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      btn.classList.remove('btn-spring');
      void btn.offsetWidth; // reflow
      btn.classList.add('btn-spring');
      btn.addEventListener('animationend', () => btn.classList.remove('btn-spring'), { once: true });
    }
  });

  /* ─── Reveal on scroll ─── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ─── Lazy load images ─── */
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => imgObserver.observe(img));
  }

  /* ─── 3-dots popup (macOS style) ─── */
  const allDots = document.querySelectorAll('.post-dots');
  allDots.forEach(wrapper => {
    const btn = wrapper.querySelector('.dots-btn');
    const popupId = wrapper.dataset.popup;
    const popup = document.getElementById(popupId);
    if (!btn || !popup) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = popup.classList.contains('open');
      // Close all popups first
      closeAllPopups();
      if (!isOpen) {
        popup.style.display = 'flex';
        popup.classList.remove('close');
        requestAnimationFrame(() => popup.classList.add('open'));
      }
    });
  });

  function closeAllPopups() {
    document.querySelectorAll('.popup-menu.open').forEach(p => {
      p.classList.remove('open');
      p.classList.add('close');
      p.addEventListener('animationend', () => {
        p.classList.remove('close');
        p.style.display = '';
      }, { once: true });
    });
  }

  document.addEventListener('click', closeAllPopups);

  /* ─── Post filter ─── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const postCards = document.querySelectorAll('.post-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      postCards.forEach(card => {
        const tags = card.dataset.tags || '';
        if (filter === 'all' || tags.includes(filter)) {
          card.style.display = '';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 200);
        }
      });
    });
  });

  /* ─── Draw list search ─── */
  const searchInput = document.getElementById('drawSearch');
  const drawTable = document.getElementById('drawTable');
  if (searchInput && drawTable) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const rows = drawTable.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* ─── Navbar scroll shadow ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.setProperty(
        '--nav-shadow',
        window.scrollY > 40 ? '0 4px 32px rgba(0,85,255,.15)' : '0 2px 24px rgba(0,85,255,.08)'
      );
    }, { passive: true });
  }

  /* ─── Prevent text selection (allow links) ─── */
  document.addEventListener('selectstart', (e) => {
    if (!e.target.closest('a[href]')) e.preventDefault();
  });
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('a[href]') && !e.target.closest('img')) e.preventDefault();
  });

});
