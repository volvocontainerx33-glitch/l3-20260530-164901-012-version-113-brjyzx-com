(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    if (!lists.length || !inputs.length) {
      return;
    }

    function apply(value) {
      var query = normalize(value);
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input.value);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      inputs.forEach(function (input) {
        input.value = initial;
      });
      apply(initial);
    }
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;

      function load() {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function play() {
        load();
        frame.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        frame.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
}());
