/**
 * location-page.js
 * Reads the city slug from <meta name="city-slug"> and renders
 * the full location page from locations-data.js
 */
(function () {
    'use strict';

    function init() {
        var slugMeta = document.querySelector('meta[name="city-slug"]');
        if (!slugMeta || typeof LOCATIONS === 'undefined') return;

        var slug = slugMeta.getAttribute('content');
        var city = null;
        for (var i = 0; i < LOCATIONS.length; i++) {
            if (LOCATIONS[i].slug === slug) { city = LOCATIONS[i]; break; }
        }
        if (!city) return;

        // ── Hero ──────────────────────────────────────────────────────────────
        var heroTitle = document.getElementById('lp-hero-title');
        var heroSub   = document.getElementById('lp-hero-sub');
        if (heroTitle) heroTitle.textContent = city.heroHeadline;
        if (heroSub)   heroSub.textContent   = city.heroSubtitle;

        // ── Breadcrumb ────────────────────────────────────────────────────────
        var breadcrumbCity = document.getElementById('lp-breadcrumb-city');
        if (breadcrumbCity) breadcrumbCity.textContent = city.name;

        // ── Intro ─────────────────────────────────────────────────────────────
        var intro1 = document.getElementById('lp-intro-1');
        var intro2 = document.getElementById('lp-intro-2');
        if (intro1 && city.intro[0]) intro1.textContent = city.intro[0];
        if (intro2 && city.intro[1]) intro2.textContent = city.intro[1];

        // ── Authority badge ───────────────────────────────────────────────────
        var auth = document.getElementById('lp-authority');
        if (auth) auth.textContent = city.municipalAuthority;

        // ── Stats ─────────────────────────────────────────────────────────────
        var statTimeline = document.getElementById('lp-stat-timeline');
        var statProjects = document.getElementById('lp-stat-projects');
        var statSince    = document.getElementById('lp-stat-since');
        if (statTimeline) statTimeline.textContent = city.stats.timeline;
        if (statProjects) statProjects.textContent = city.stats.projects;
        if (statSince)    statSince.textContent    = city.stats.since;

        // ── Permit types grid ─────────────────────────────────────────────────
        var permitsGrid = document.getElementById('lp-permits-grid');
        if (permitsGrid && city.permitTypes) {
            permitsGrid.innerHTML = city.permitTypes.map(function (p) {
                return '<div class="lp-permit-card">' +
                    '<div class="lp-permit-icon">' + p.icon + '</div>' +
                    '<div class="lp-permit-label">' + p.label + '</div>' +
                '</div>';
            }).join('');
        }

        // ── Local FAQs ────────────────────────────────────────────────────────
        var faqList = document.getElementById('lp-faq-list');
        if (faqList && city.localFaqs) {
            faqList.innerHTML = city.localFaqs.map(function (faq, idx) {
                var qId = 'lp-faq-q' + idx;
                var aId = 'lp-faq-a' + idx;
                return '<div class="faq-item">' +
                    '<button class="faq-question" aria-expanded="false" id="' + qId + '">' +
                        faq.q +
                        '<span class="faq-icon">+</span>' +
                    '</button>' +
                    '<div class="faq-answer" id="' + aId + '" role="region" aria-labelledby="' + qId + '">' +
                        '<p>' + faq.a + '</p>' +
                    '</div>' +
                '</div>';
            }).join('');

            // Wire up accordion
            faqList.querySelectorAll('.faq-question').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var expanded = this.getAttribute('aria-expanded') === 'true';
                    faqList.querySelectorAll('.faq-question').forEach(function (q) { q.setAttribute('aria-expanded', 'false'); });
                    faqList.querySelectorAll('.faq-answer').forEach(function (a) { a.classList.remove('open'); });
                    if (!expanded) {
                        var answerId = this.id.replace('lp-faq-q', 'lp-faq-a');
                        var answer = document.getElementById(answerId);
                        this.setAttribute('aria-expanded', 'true');
                        if (answer) answer.classList.add('open');
                    }
                });
            });
        }

        // ── Nearby areas ──────────────────────────────────────────────────────
        var nearbyGrid = document.getElementById('lp-nearby-grid');
        if (nearbyGrid && city.nearbyAreas) {
            var nearbyHtml = '';
            city.nearbyAreas.forEach(function (nearSlug) {
                for (var j = 0; j < LOCATIONS.length; j++) {
                    if (LOCATIONS[j].slug === nearSlug) {
                        nearbyHtml += '<a href="permit-' + nearSlug + '.html" class="lp-nearby-card">' +
                            '<span class="lp-nearby-name">' + LOCATIONS[j].name + '</span>' +
                            '<span class="lp-nearby-region">' + LOCATIONS[j].region + '</span>' +
                            '<span class="lp-nearby-arrow">→</span>' +
                        '</a>';
                        break;
                    }
                }
            });
            nearbyGrid.innerHTML = nearbyHtml;
        }

        // ── CTA city name injections ──────────────────────────────────────────
        document.querySelectorAll('[data-city-name]').forEach(function (el) {
            el.textContent = city.name;
        });

        // ── Header scroll effect ──────────────────────────────────────────────
        var header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', function () {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        // ── Mobile menu ───────────────────────────────────────────────────────
        var toggle = document.querySelector('.mobile-toggle');
        var nav    = document.querySelector('.nav');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('active');
                toggle.classList.toggle('active');
                document.body.classList.toggle('no-scroll');
            });
            document.querySelectorAll('.nav a').forEach(function (link) {
                link.addEventListener('click', function () {
                    nav.classList.remove('active');
                    toggle.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                });
            });
        }

        // ── Smooth scroll ─────────────────────────────────────────────────────
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var id = this.getAttribute('href');
                if (id === '#') return;
                var target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
