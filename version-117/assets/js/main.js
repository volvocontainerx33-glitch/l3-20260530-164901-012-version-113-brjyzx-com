(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const searchInputs = Array.from(document.querySelectorAll('[data-page-search]'));

  searchInputs.forEach(function (input) {
    const selector = input.getAttribute('data-page-search') || '.movie-card';
    const cards = Array.from(document.querySelectorAll(selector));

    function filterCards() {
      const query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener('input', filterCards);
  });

  const chips = Array.from(document.querySelectorAll('[data-filter-chip]'));

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const group = chip.closest('[data-filter-group]');
      const target = chip.getAttribute('data-filter-chip');
      const cards = Array.from(document.querySelectorAll('[data-category]'));

      if (group) {
        group.querySelectorAll('[data-filter-chip]').forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
      }

      cards.forEach(function (card) {
        const category = card.getAttribute('data-category');
        const visible = target === 'all' || category === target;
        card.classList.toggle('hidden-by-filter', !visible);
      });
    });
  });
})();
