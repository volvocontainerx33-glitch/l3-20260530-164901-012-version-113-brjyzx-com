(function () {
    var select = function (target, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(target));
    };

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = select('[data-hero-slide]', hero);
        var dots = select('[data-hero-dot]', hero);
        var index = 0;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function initCardSearch() {
        var input = document.querySelector('[data-card-search]');
        if (!input) {
            return;
        }
        var cards = select('[data-card]');
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                card.classList.toggle('hidden', value && haystack.indexOf(value) === -1);
            });
        });
    }

    function bindStream(video, stream) {
        if (!stream) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== stream) {
                video.setAttribute('src', stream);
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsReady) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsReady = true;
            }
            return;
        }
        if (video.getAttribute('src') !== stream) {
            video.setAttribute('src', stream);
        }
    }

    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-play-overlay]');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var start = function () {
            bindStream(video, stream);
            overlay.classList.add('is-hidden');
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        };
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initCardSearch();
        initPlayer();
    });
})();
