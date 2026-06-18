(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var list = document.querySelector("[data-filter-list]");
    var queryInput = document.querySelector("[data-query-input]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    } else if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var itemType = normalize(card.getAttribute("data-type"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !typeValue || itemType === typeValue;
        card.hidden = !(matchedKeyword && matchedType);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    apply();
  }

  function attachPlayer(video, overlay, source) {
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !video || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      prepared = true;
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("emptied", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
      hls = null;
      prepared = false;
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.querySelector(config.overlaySelector);
    if (!video) {
      return;
    }
    attachPlayer(video, overlay, config.source);
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
