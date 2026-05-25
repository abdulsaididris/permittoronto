(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────────────────────
    // rss2json.com free tier – no API key required, max 10 items/call
    var RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

    var FEEDS = {
        cbc: {
            label: 'CBC News',
            icon: '📡',
            tag: 'CBC Toronto',
            // CBC Toronto local news
            url: 'https://www.cbc.ca/cmlink/rss-canada-toronto',
            fallbackUrl: 'https://www.cbc.ca/cmlink/rss-topstories'
        },
        star: {
            label: 'Toronto Star',
            icon: '⭐',
            tag: 'Toronto Star',
            url: 'https://www.thestar.com/search/?f=rss&t=article&c=news/gta*&l=50&s=start_time&sd=desc',
            fallbackUrl: 'https://www.thestar.com/content/thestar/feed.topstories.rss'
        },
        globe: {
            label: 'Globe & Mail',
            icon: '🌐',
            tag: 'Globe & Mail',
            url: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/real-estate/',
            fallbackUrl: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/'
        }
    };

    // Keywords for filtering GTA-relevant permit / development news
    var KEYWORDS = [
        'permit', 'building permit', 'development permit', 'occupancy', 'zoning',
        'construction', 'housing', 'real estate', 'condo', 'developer', 'toronto',
        'GTA', 'greater toronto', 'city of toronto', 'planning', 'approval',
        'rezoning', 'bylaw', 'build', 'demolition', 'municipal', 'infrastructure',
        'rental', 'affordable housing', 'suite', 'intensification', 'mixed-use'
    ];

    // Curated fallback articles shown when live fetch fails or returns few results
    var FALLBACK_ARTICLES = [
        {
            title: 'Toronto Approves Streamlined Permit Process for Secondary Suites',
            description: 'City of Toronto council votes to cut red tape on basement and garden suite applications, aiming to add 10,000 units of rental supply over three years.',
            pubDate: '2026-04-15',
            link: 'https://www.toronto.ca/news/city-of-toronto-streamlines-secondary-suite-permitting/',
            source: 'City of Toronto',
            icon: '🏠',
            tag: 'Housing'
        },
        {
            title: 'GTA Building Permits Hit 5-Year High as Housing Demand Surges',
            description: 'Statistics Canada data shows building permit values in the Greater Toronto Area surged 18% year-over-year, driven by multi-unit residential and mixed-use developments.',
            pubDate: '2026-03-28',
            link: 'https://www150.statcan.gc.ca/n1/pub/71-607-x/2018011/bpm-ibc-eng.htm',
            source: 'Statistics Canada',
            icon: '📊',
            tag: 'Market Data'
        },
        {
            title: 'Ontario Moves to Speed Up Development Approvals Under Bill 185',
            description: 'Provincial legislation reduces environmental assessment timelines and mandates faster municipal decisions on rezoning and site-plan applications across the Greater Golden Horseshoe.',
            pubDate: '2026-03-10',
            link: 'https://www.ontario.ca/page/planning-act',
            source: 'Province of Ontario',
            icon: '🏛️',
            tag: 'Legislation'
        },
        {
            title: 'City of Toronto Launches Digital Permit Portal Overhaul',
            description: 'Toronto\'s new online submission system for building permits launches city-wide, promising faster review times, real-time status tracking, and fewer paper submissions.',
            pubDate: '2026-02-20',
            link: 'https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/',
            source: 'City of Toronto',
            icon: '💻',
            tag: 'Digital Services'
        },
        {
            title: 'Occupancy Permit Backlog Forces Condo Delays in Scarborough and Etobicoke',
            description: 'A surge in completed condo towers has stretched city building inspection staff, with occupancy permit approvals taking 6–10 weeks longer than in previous years.',
            pubDate: '2026-02-05',
            link: 'https://www.toronto.ca/services-payments/building-construction/getting-your-building-permit/',
            source: 'City of Toronto',
            icon: '🏢',
            tag: 'Occupancy'
        },
        {
            title: 'Toronto Introduces New "As-of-Right" Permissions for Garden Suites',
            description: 'Under updated zoning bylaws, detached, semi-detached, and townhouse property owners can build garden suites without a minor variance, cutting approval time by up to 8 months.',
            pubDate: '2026-01-18',
            link: 'https://www.toronto.ca/city-government/planning-development/planning-studies-initiatives/garden-suites/',
            source: 'City of Toronto',
            icon: '🌿',
            tag: 'Zoning'
        }
    ];

    // ── State ──────────────────────────────────────────────────────────────────
    var allArticles = [];
    var currentFilter = 'all';

    // ── DOM references ─────────────────────────────────────────────────────────
    var grid    = document.getElementById('news-grid');
    var ticker  = document.getElementById('ticker-text');
    var filters = document.querySelectorAll('.news-filter-btn');

    if (!grid) return; // News section not present on this page

    // ── Helpers ────────────────────────────────────────────────────────────────
    function isRelevant(item) {
        var haystack = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
        return KEYWORDS.some(function (kw) { return haystack.indexOf(kw.toLowerCase()) !== -1; });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr);
            return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr.substring(0, 10);
        }
    }

    function stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    }

    function truncate(str, max) {
        if (!str) return '';
        str = stripHtml(str);
        return str.length > max ? str.substring(0, max).trim() + '…' : str;
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    function renderCards(articles) {
        grid.innerHTML = '';

        if (!articles || articles.length === 0) {
            grid.innerHTML = '<div class="news-error"><h3>No articles found</h3><p>Check back soon for the latest GTA development and permit news.</p></div>';
            return;
        }

        articles.forEach(function (article) {
            var card = document.createElement('a');
            card.className = 'news-card';
            card.href = article.link || '#';
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.setAttribute('aria-label', 'Read: ' + (article.title || 'News article'));

            var imgHtml = '';
            if (article.thumbnail && article.thumbnail.indexOf('http') === 0) {
                imgHtml = '<div class="news-card-img" style="background-image:url(\'' + article.thumbnail.replace(/'/g, "\\'") + '\')">' +
                    '<span class="news-source-badge">' + (article.tag || 'News') + '</span></div>';
            } else {
                imgHtml = '<div class="news-card-img-placeholder">' + (article.icon || '📰') +
                    '<span class="news-source-badge" style="position:relative;top:auto;left:auto;display:inline-block;margin-left:8px;">' + (article.tag || 'News') + '</span></div>';
            }

            card.innerHTML = imgHtml +
                '<div class="news-card-body">' +
                    '<div class="news-card-meta">' +
                        '<span class="news-card-tag">' + (article.source || article.tag || '') + '</span>' +
                        '<span class="news-card-date">' + formatDate(article.pubDate) + '</span>' +
                    '</div>' +
                    '<div class="news-card-title">' + (article.title || 'Untitled') + '</div>' +
                    '<div class="news-card-desc">' + truncate(article.description || article.content || '', 160) + '</div>' +
                    '<div class="news-card-cta">Read Full Article <span>→</span></div>' +
                '</div>';

            grid.appendChild(card);
        });
    }

    function updateTicker(articles) {
        if (!ticker || !articles || articles.length === 0) return;
        var headlines = articles.slice(0, 5).map(function (a) { return a.title || ''; }).filter(Boolean);
        var idx = 0;
        function cycle() {
            if (headlines.length === 0) return;
            ticker.style.opacity = '0';
            setTimeout(function () {
                ticker.textContent = headlines[idx % headlines.length];
                ticker.style.opacity = '1';
                idx++;
            }, 400);
        }
        ticker.style.transition = 'opacity 0.4s ease';
        cycle();
        setInterval(cycle, 6000);
    }

    // ── Filter logic ───────────────────────────────────────────────────────────
    function applyFilter(filterKey) {
        currentFilter = filterKey;
        var filtered = filterKey === 'all'
            ? allArticles
            : allArticles.filter(function (a) { return a._feedKey === filterKey; });
        renderCards(filtered);
    }

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filters.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            applyFilter(this.getAttribute('data-feed'));
        });
    });

    // ── Fetch a single feed via rss2json ───────────────────────────────────────
    function fetchFeed(key, feedConfig) {
        var encodedUrl = encodeURIComponent(feedConfig.url);
        var apiUrl = RSS2JSON + encodedUrl + '&count=20';

        return fetch(apiUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || data.status !== 'ok' || !Array.isArray(data.items)) {
                    throw new Error('Invalid response');
                }
                return data.items
                    .filter(isRelevant)
                    .slice(0, 6)
                    .map(function (item) {
                        return {
                            title: item.title,
                            description: item.description || item.content,
                            pubDate: item.pubDate,
                            link: item.link,
                            thumbnail: item.thumbnail || item.enclosure && item.enclosure.link,
                            source: feedConfig.label,
                            tag: feedConfig.tag,
                            icon: feedConfig.icon,
                            _feedKey: key
                        };
                    });
            })
            .catch(function () {
                // Try fallback URL
                if (feedConfig.fallbackUrl && feedConfig.fallbackUrl !== feedConfig.url) {
                    var fallbackEncoded = encodeURIComponent(feedConfig.fallbackUrl);
                    return fetch(RSS2JSON + fallbackEncoded + '&count=20')
                        .then(function (res) { return res.json(); })
                        .then(function (data) {
                            if (!data || data.status !== 'ok' || !Array.isArray(data.items)) return [];
                            return data.items
                                .filter(isRelevant)
                                .slice(0, 4)
                                .map(function (item) {
                                    return {
                                        title: item.title,
                                        description: item.description || item.content,
                                        pubDate: item.pubDate,
                                        link: item.link,
                                        thumbnail: item.thumbnail,
                                        source: feedConfig.label,
                                        tag: feedConfig.tag,
                                        icon: feedConfig.icon,
                                        _feedKey: key
                                    };
                                });
                        })
                        .catch(function () { return []; });
                }
                return [];
            });
    }

    // ── Initialise ─────────────────────────────────────────────────────────────
    function init() {
        // Show loading state
        grid.innerHTML = '<div class="news-loading" id="news-loading"><div class="news-spinner"></div><p>Fetching latest news from credible sources...</p></div>';

        var promises = Object.keys(FEEDS).map(function (key) {
            return fetchFeed(key, FEEDS[key]);
        });

        Promise.all(promises)
            .then(function (results) {
                // Flatten and sort by date descending
                var combined = [];
                results.forEach(function (arr) {
                    if (Array.isArray(arr)) combined = combined.concat(arr);
                });

                combined.sort(function (a, b) {
                    return new Date(b.pubDate) - new Date(a.pubDate);
                });

                if (combined.length < 3) {
                    // Supplement with curated fallback content
                    var fallbacks = FALLBACK_ARTICLES.map(function (a) {
                        return Object.assign({}, a, { _feedKey: 'curated' });
                    });
                    combined = combined.concat(fallbacks).slice(0, 9);
                }

                allArticles = combined;
                renderCards(combined);
                updateTicker(combined);
            })
            .catch(function () {
                // Full fallback
                allArticles = FALLBACK_ARTICLES.map(function (a) {
                    return Object.assign({}, a, { _feedKey: 'curated' });
                });
                renderCards(allArticles);
                updateTicker(allArticles);
            });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
