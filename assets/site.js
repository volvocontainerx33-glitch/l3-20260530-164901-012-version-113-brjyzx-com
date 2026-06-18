
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Hero carousel
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-prev]');
    const next = hero.querySelector('[data-next]');
    let index = 0;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === index));
      dots.forEach((d, n) => d.classList.toggle('active', n === index));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    prev && prev.addEventListener('click', () => show(index - 1));
    next && next.addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), 5000);
    show(0);
  }

  // Filter cards by search input, type select, and chips.
  document.querySelectorAll('[data-filter-group]').forEach((wrap) => {
    const input = wrap.querySelector('[data-filter-input]');
    const select = wrap.querySelector('[data-filter-select]');
    const chips = Array.from(wrap.querySelectorAll('[data-filter-chip]'));
    const cards = Array.from(wrap.querySelectorAll('[data-filter-item]'));
    const empty = wrap.querySelector('[data-filter-empty]');
    let activeChip = '';

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const type = (select?.value || '').trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const hay = `${card.dataset.title || ''} ${card.dataset.genre || ''} ${card.dataset.region || ''} ${card.dataset.tags || ''} ${card.dataset.year || ''} ${card.dataset.type || ''}`.toLowerCase();
        const okQ = !q || hay.includes(q);
        const okType = !type || (card.dataset.type || '').toLowerCase() === type;
        const okChip = !activeChip || (card.dataset.genre || '').toLowerCase().includes(activeChip);
        const ok = okQ && okType && okChip;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (empty) empty.classList.toggle('hidden', shown !== 0);
    };

    input && input.addEventListener('input', apply);
    select && select.addEventListener('change', apply);
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeChip = chip.dataset.filterChip || '';
      apply();
    }));
    apply();
  });

  // Play overlay for detail videos.
  document.querySelectorAll('[data-play-overlay]').forEach((overlay) => {
    const id = overlay.dataset.playOverlay;
    const video = document.getElementById(id);
    if (!video) return;
    overlay.addEventListener('click', async () => {
      try {
        await video.play();
        overlay.classList.add('hidden');
      } catch (err) {
        console.warn('Playback failed', err);
      }
    });
    video.addEventListener('play', () => overlay.classList.add('hidden'));
    video.addEventListener('pause', () => {
      if (!video.ended) overlay.classList.remove('hidden');
    });
    video.addEventListener('ended', () => overlay.classList.remove('hidden'));
  });

  const topBtn = document.querySelector('[data-top]');
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
