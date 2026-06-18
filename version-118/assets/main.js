(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs(".menu-toggle");
    var mobilePanel = qs(".mobile-panel");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", expanded ? "false" : "true");
            mobilePanel.hidden = expanded;
        });
    }

    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (slides.length > 1) {
        var current = 0;
        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
            });
        });
        window.setInterval(function () {
            activate((current + 1) % slides.length);
        }, 5200);
    }

    var filterInput = qs("[data-filter-input]");
    var yearSelect = qs("[data-year-filter]");
    var tagSelect = qs("[data-tag-filter]");
    var cards = qsa(".searchable-card");
    var noResults = qs(".no-results");

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var tag = tagSelect ? tagSelect.value.toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
            var title = (card.getAttribute("data-title") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var tags = (card.getAttribute("data-tags") || "").toLowerCase();
            var ok = true;
            if (keyword && title.indexOf(keyword) === -1 && tags.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && cardYear !== year) {
                ok = false;
            }
            if (tag && tags.indexOf(tag) === -1) {
                ok = false;
            }
            card.style.display = ok ? "" : "none";
            if (ok) {
                visible += 1;
            }
        });
        if (noResults) {
            noResults.style.display = visible ? "none" : "block";
        }
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
    }
    if (tagSelect) {
        tagSelect.addEventListener("change", applyFilter);
    }

    var searchForm = qs("[data-search-form]");
    var searchInput = qs("[data-search-query]");
    var searchResults = qs("[data-search-results]");
    var searchEmpty = qs(".search-empty");

    function renderSearch() {
        if (!searchResults || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (searchInput && !searchInput.value) {
            searchInput.value = initial;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : initial.trim().toLowerCase();
        var results = [];
        if (query) {
            results = window.MOVIE_INDEX.filter(function (movie) {
                var text = [movie.title, movie.genre, movie.tags, movie.region, movie.year].join(" ").toLowerCase();
                return text.indexOf(query) !== -1;
            }).slice(0, 96);
        }
        searchResults.innerHTML = results.map(function (movie) {
            return [
                '<article class="movie-card compact">',
                '<a class="poster" href="./' + movie.file + '">',
                '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                '<span class="poster-badge">' + movie.year + '</span>',
                '</a>',
                '<div class="movie-info">',
                '<h2><a href="./' + movie.file + '">' + movie.title + '</a></h2>',
                '<p>' + movie.one + '</p>',
                '<div class="movie-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
                '</div>',
                '</article>'
            ].join("");
        }).join("");
        if (searchEmpty) {
            searchEmpty.style.display = query && !results.length ? "block" : "none";
        }
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set("q", searchInput.value.trim());
            window.history.replaceState({}, "", url.toString());
            renderSearch();
        });
    }
    if (searchInput) {
        searchInput.addEventListener("input", renderSearch);
        renderSearch();
    }
})();
