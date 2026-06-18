
(function(){
  const body = document.body;
  const heroCarousel = document.querySelector('[data-hero-carousel]');
  if (heroCarousel) {
    let timer = setInterval(() => {
      const step = heroCarousel.querySelector('.hero-slide')?.getBoundingClientRect().width || heroCarousel.clientWidth * 0.85;
      heroCarousel.scrollBy({left: step + 14, behavior: 'smooth'});
      if (heroCarousel.scrollLeft + heroCarousel.clientWidth >= heroCarousel.scrollWidth - 6) {
        setTimeout(() => heroCarousel.scrollTo({left: 0, behavior: 'smooth'}), 3000);
      }
    }, 5000);
    heroCarousel.addEventListener('mouseenter', () => clearInterval(timer));
    heroCarousel.addEventListener('mouseleave', () => {
      timer = setInterval(() => {
        const step = heroCarousel.querySelector('.hero-slide')?.getBoundingClientRect().width || heroCarousel.clientWidth * 0.85;
        heroCarousel.scrollBy({left: step + 14, behavior: 'smooth'});
        if (heroCarousel.scrollLeft + heroCarousel.clientWidth >= heroCarousel.scrollWidth - 6) {
          setTimeout(() => heroCarousel.scrollTo({left: 0, behavior: 'smooth'}), 3000);
        }
      }, 5000);
    });
  }

  const searchInput = document.querySelector('[data-live-search]');
  const searchResults = document.querySelector('[data-search-results]');
  const dataNode = document.querySelector('script[type="application/json"][data-search-index]');
  if (searchInput && searchResults && dataNode) {
    const index = JSON.parse(dataNode.textContent);
    const render = (list, keyword='') => {
      searchResults.innerHTML = '';
      if (!list.length) {
        searchResults.innerHTML = '<div class="center-note">没有找到匹配结果，请尝试更换关键词。</div>';
        return;
      }
      const html = list.slice(0, 80).map(item => `
        <a class="search-result" href="${item.href}">
          <div class="poster mini" style="background:${item.bg}"></div>
          <div>
            <h3>${item.title}</h3>
            <p>${item.meta}</p>
          </div>
          <span class="badge">${item.year}</span>
        </a>`).join('');
      searchResults.innerHTML = html;
    };
    const filter = () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return render(index);
      const list = index.filter(item => [item.title, item.genre, item.region, item.type, item.tags, item.summary].join(' ').toLowerCase().includes(q));
      render(list, q);
    };
    searchInput.addEventListener('input', filter);
    filter();
  }

  document.querySelectorAll('video[data-preview]').forEach(video => {
    const src = video.getAttribute('data-src');
    if (!src) return;
    if (/\.m3u8($|\?)/i.test(src) && window.Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
      video.play().catch(() => {});
    }
  });
})();
