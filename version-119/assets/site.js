import { H as Hls } from './hls-dru42stk.js';

function toggleMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initPlayers() {
  const players = document.querySelectorAll('video[data-hls-url]');
  players.forEach((video) => {
    const sourceUrl = video.getAttribute('data-hls-url');
    const box = video.closest('[data-player-box]');
    const message = box ? box.querySelector('[data-player-message]') : null;
    const button = box ? box.querySelector('[data-play-button]') : null;

    if (!sourceUrl) {
      if (message) {
        message.textContent = '当前影片暂未配置播放地址。';
      }
      return;
    }

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (message && data && data.fatal) {
            message.textContent = '播放源加载遇到问题，请刷新页面或更换浏览器重试。';
          }
        });
      } else if (message) {
        message.textContent = '当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器。';
      }
    } catch (error) {
      if (message) {
        message.textContent = '播放器初始化失败，请刷新页面后重试。';
      }
    }

    if (button) {
      button.addEventListener('click', async () => {
        try {
          await video.play();
          if (box) {
            box.classList.add('is-playing');
          }
        } catch (error) {
          if (message) {
            message.textContent = '浏览器阻止了自动播放，请再次点击视频控件播放。';
          }
        }
      });
    }

    video.addEventListener('play', () => {
      if (box) {
        box.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', () => {
      if (box) {
        box.classList.remove('is-playing');
      }
    });
  });
}

function initFilterBars() {
  const scopes = document.querySelectorAll('[data-filter-scope]');
  scopes.forEach((scope) => {
    const container = scope.parentElement;
    if (!container) {
      return;
    }
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-filter-year]');
    const region = scope.querySelector('[data-filter-region]');
    const type = scope.querySelector('[data-filter-type]');
    const grid = container.querySelector('[data-filter-grid]');
    const emptyState = container.querySelector('[data-empty-state]');
    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const run = () => {
      const q = input ? input.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const r = region ? region.value : '';
      const t = type ? type.value : '';
      let shown = 0;
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matchQuery = !q || text.includes(q);
        const matchYear = !y || card.dataset.year === y;
        const matchRegion = !r || card.dataset.region === r;
        const matchType = !t || card.dataset.type === t;
        const visible = matchQuery && matchYear && matchRegion && matchType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    };

    [input, year, region, type].forEach((element) => {
      if (element) {
        element.addEventListener('input', run);
        element.addEventListener('change', run);
      }
    });
    run();
  });
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="movie-card">
      <a class="poster-wrap" href="${escapeHtml(movie.url)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.onerror=null;this.src='assets/cover-fallback.svg';">
        <span class="category-pill">${escapeHtml(movie.category)}</span>
      </a>
      <div class="movie-card-body">
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p class="movie-one-line">${escapeHtml(movie.oneLine)}</p>
        <div class="movie-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const form = document.querySelector('[data-search-page]');
  const input = document.querySelector('[data-search-input]');
  const category = document.querySelector('[data-search-category]');
  const year = document.querySelector('[data-search-year]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');
  const data = window.MOVIE_SEARCH_DATA || [];

  if (!form || !input || !results || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) {
    input.value = params.get('q');
  }

  const run = () => {
    const q = input.value.trim().toLowerCase();
    const c = category ? category.value : '';
    const y = year ? year.value : '';
    const matched = data.filter((movie) => {
      const haystack = [movie.title, movie.oneLine, movie.summary, movie.region, movie.type, movie.genre, movie.category, ...(movie.tags || [])]
        .join(' ')
        .toLowerCase();
      return (!q || haystack.includes(q)) && (!c || movie.category === c) && (!y || movie.year === y);
    }).slice(0, 120);

    summary.textContent = q || c || y ? `找到 ${matched.length} 个匹配结果（最多显示 120 个）` : '输入关键词后显示匹配结果。';
    results.innerHTML = matched.map(movieCardTemplate).join('');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (input.value.trim()) {
      params.set('q', input.value.trim());
    }
    const nextUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', nextUrl);
    run();
  });

  [input, category, year].forEach((element) => {
    if (element) {
      element.addEventListener('input', run);
      element.addEventListener('change', run);
    }
  });

  run();
}

document.addEventListener('DOMContentLoaded', () => {
  toggleMobileMenu();
  initPlayers();
  initFilterBars();
  initSearchPage();
});
