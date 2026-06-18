(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    document.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });

    var nav = document.querySelector('[data-site-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      var dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
      var prev = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');
      if (queryValue) {
        input.value = queryValue;
      }

      var targets = Array.from(document.querySelectorAll('[data-search-target]'));
      var emptyState = document.querySelector('[data-empty-state]');

      function applySearch() {
        var query = normalize(input.value);
        var matches = 0;
        targets.forEach(function (target) {
          var haystack = normalize(target.getAttribute('data-search-text') || target.textContent);
          var visible = !query || haystack.indexOf(query) !== -1;
          target.hidden = !visible;
          if (visible) {
            matches += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = matches !== 0;
        }
      }

      input.addEventListener('input', applySearch);
      applySearch();
    });

    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var poster = shell.querySelector('.player-poster');
      var source = shell.getAttribute('data-stream');
      var hls = null;
      var started = false;

      function showError() {
        var existing = shell.querySelector('.player-error');
        if (existing) {
          return;
        }
        var panel = document.createElement('div');
        panel.className = 'player-error';
        panel.textContent = '播放遇到问题，请稍后重试';
        shell.appendChild(panel);
      }

      function start() {
        if (!video || !source) {
          showError();
          return;
        }
        if (!started) {
          started = true;
          shell.classList.add('is-playing');
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
              }
              showError();
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            showError();
            return;
          }
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (poster) {
        poster.addEventListener('click', start);
        poster.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            start();
          }
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          start();
        }
      });

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
