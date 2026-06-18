(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var next = mobilePanel.hasAttribute("hidden");
      if (next) {
        mobilePanel.removeAttribute("hidden");
      } else {
        mobilePanel.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(next));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchRoot = document.getElementById("search-results");
  if (searchRoot && typeof MovieSearchIndex !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-input");
    var status = document.getElementById("search-status");
    if (input) {
      input.value = query;
    }
    var normalize = function (value) {
      return String(value || "").toLowerCase();
    };
    var list = MovieSearchIndex;
    if (query) {
      var q = normalize(query);
      list = MovieSearchIndex.filter(function (item) {
        return normalize(item.title).indexOf(q) >= 0 ||
          normalize(item.oneLine).indexOf(q) >= 0 ||
          normalize(item.genre).indexOf(q) >= 0 ||
          normalize(item.tags).indexOf(q) >= 0 ||
          normalize(item.region).indexOf(q) >= 0;
      }).slice(0, 120);
    } else {
      list = MovieSearchIndex.slice(0, 80);
    }
    var escapeHtml = function (value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    var html = list.map(function (item) {
      var tags = String(item.tags || "").split("|").filter(Boolean).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-glow\"></span><span class=\"watch-pill\">立即观看</span></a>" +
        "<div class=\"movie-card-body\"><div class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div>" +
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div></div></article>";
    }).join("");
    searchRoot.innerHTML = html;
    if (status) {
      status.textContent = query ? "搜索：" + query + "，为你显示相关影片" : "为你显示站内热门影片";
    }
  }
})();

var SitePlayer = {
  init: function (videoId, buttonId, overlayId, src) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !button || !overlay || !src) {
      return;
    }
    var attached = false;
    var bindSource = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    var start = function (event) {
      if (event) {
        event.preventDefault();
      }
      bindSource();
      overlay.setAttribute("hidden", "");
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    };
    overlay.addEventListener("click", start);
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
  }
};
