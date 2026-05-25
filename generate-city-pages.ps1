# generate-city-pages.ps1 (fixed for PowerShell compatibility)
# Uses a template and city list without special characters in the script body.

$cities = @(
    [PSCustomObject]@{ Slug="north-york";   Name="North York";   Region="City of Toronto" },
    [PSCustomObject]@{ Slug="scarborough";  Name="Scarborough";  Region="City of Toronto" },
    [PSCustomObject]@{ Slug="etobicoke";    Name="Etobicoke";    Region="City of Toronto" },
    [PSCustomObject]@{ Slug="east-york";    Name="East York";    Region="City of Toronto" },
    [PSCustomObject]@{ Slug="mississauga";  Name="Mississauga";  Region="Peel Region" },
    [PSCustomObject]@{ Slug="brampton";     Name="Brampton";     Region="Peel Region" },
    [PSCustomObject]@{ Slug="caledon";      Name="Caledon";      Region="Peel Region" },
    [PSCustomObject]@{ Slug="markham";      Name="Markham";      Region="York Region" },
    [PSCustomObject]@{ Slug="vaughan";      Name="Vaughan";      Region="York Region" },
    [PSCustomObject]@{ Slug="richmond-hill"; Name="Richmond Hill"; Region="York Region" },
    [PSCustomObject]@{ Slug="newmarket";    Name="Newmarket";    Region="York Region" },
    [PSCustomObject]@{ Slug="aurora";       Name="Aurora";       Region="York Region" },
    [PSCustomObject]@{ Slug="pickering";    Name="Pickering";    Region="Durham Region" },
    [PSCustomObject]@{ Slug="ajax";         Name="Ajax";         Region="Durham Region" },
    [PSCustomObject]@{ Slug="whitby";       Name="Whitby";       Region="Durham Region" },
    [PSCustomObject]@{ Slug="oshawa";       Name="Oshawa";       Region="Durham Region" },
    [PSCustomObject]@{ Slug="oakville";     Name="Oakville";     Region="Halton Region" },
    [PSCustomObject]@{ Slug="burlington";   Name="Burlington";   Region="Halton Region" },
    [PSCustomObject]@{ Slug="milton";       Name="Milton";       Region="Halton Region" },
    [PSCustomObject]@{ Slug="halton-hills"; Name="Halton Hills"; Region="Halton Region" }
)

$outputDir = $PSScriptRoot
$count = 0

foreach ($city in $cities) {
    $slug      = $city.Slug
    $name      = $city.Name
    $region    = $city.Region
    $canonical = "https://permittoronto.ca/permit-$slug.html"
    $filename  = "permit-$slug.html"
    $title     = "Building Permit $name | Expert Permit Services - PermitToronto.ca"
    $desc      = "Expert building and development permit services in $name, $region. We handle zoning, drawings and municipal submission. Call 647-985-0376 for a free quote."

    # Build JSON-LD as a plain string (no special PS chars)
    $jsonLd = '{' + [char]10 +
        '  "@context": "https://schema.org",' + [char]10 +
        '  "@graph": [' + [char]10 +
        '    {' + [char]10 +
        '      "@type": "LocalBusiness",' + [char]10 +
        '      "name": "Permit Toronto - ' + $name + '",' + [char]10 +
        '      "url": "' + $canonical + '",' + [char]10 +
        '      "telephone": "+16479850376",' + [char]10 +
        '      "email": "a.said@lagroupofcompanies.ca",' + [char]10 +
        '      "address": { "@type": "PostalAddress", "addressLocality": "' + $name + '", "addressRegion": "ON", "addressCountry": "CA" },' + [char]10 +
        '      "areaServed": { "@type": "City", "name": "' + $name + '" },' + [char]10 +
        '      "priceRange": "$$",' + [char]10 +
        '      "openingHours": "Mo-Fr 08:00-17:00"' + [char]10 +
        '    },' + [char]10 +
        '    {' + [char]10 +
        '      "@type": "BreadcrumbList",' + [char]10 +
        '      "itemListElement": [' + [char]10 +
        '        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://permittoronto.ca/" },' + [char]10 +
        '        { "@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "https://permittoronto.ca/#areas" },' + [char]10 +
        '        { "@type": "ListItem", "position": 3, "name": "' + $name + ' Permit Services", "item": "' + $canonical + '" }' + [char]10 +
        '      ]' + [char]10 +
        '    }' + [char]10 +
        '  ]' + [char]10 +
        '}'

    $html = '<!DOCTYPE html>' + [char]10 +
'<html lang="en">' + [char]10 +
'<head>' + [char]10 +
'    <meta charset="UTF-8">' + [char]10 +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' + [char]10 +
'    <meta name="city-slug" content="' + $slug + '">' + [char]10 +
'    <title>' + $title + '</title>' + [char]10 +
'    <meta name="description" content="' + $desc + '">' + [char]10 +
'    <meta name="robots" content="index, follow">' + [char]10 +
'    <meta name="author" content="Permit Toronto">' + [char]10 +
'    <link rel="canonical" href="' + $canonical + '">' + [char]10 +
'    <meta property="og:title" content="' + $title + '">' + [char]10 +
'    <meta property="og:description" content="' + $desc + '">' + [char]10 +
'    <meta property="og:type" content="website">' + [char]10 +
'    <meta property="og:url" content="' + $canonical + '">' + [char]10 +
'    <meta property="og:locale" content="en_CA">' + [char]10 +
'    <meta name="twitter:card" content="summary">' + [char]10 +
'    <meta name="twitter:title" content="' + $title + '">' + [char]10 +
'    <meta name="twitter:description" content="' + $desc + '">' + [char]10 +
'    <link rel="preconnect" href="https://fonts.googleapis.com">' + [char]10 +
'    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' + [char]10 +
'    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">' + [char]10 +
'    <link rel="stylesheet" href="style.css">' + [char]10 +
'    <link rel="stylesheet" href="location-page.css">' + [char]10 +
'    <script type="application/ld+json">' + [char]10 +
$jsonLd + [char]10 +
'    </script>' + [char]10 +
'</head>' + [char]10 +
'<body>' + [char]10 +
'    <header class="header scrolled">' + [char]10 +
'        <div class="container">' + [char]10 +
'            <div class="logo">' + [char]10 +
'                <a href="/" class="logo-link">' + [char]10 +
'                    <div class="logo-main">PERMIT<span class="accent">TORONTO</span></div>' + [char]10 +
'                    <div class="logo-tagline">Toronto''s Premier Permit Partners</div>' + [char]10 +
'                </a>' + [char]10 +
'            </div>' + [char]10 +
'            <nav class="nav">' + [char]10 +
'                <ul>' + [char]10 +
'                    <li><a href="/#services">Services</a></li>' + [char]10 +
'                    <li><a href="/#process">Our Process</a></li>' + [char]10 +
'                    <li><a href="/#about">About</a></li>' + [char]10 +
'                    <li><a href="/#areas">Areas We Serve</a></li>' + [char]10 +
'                    <li><a href="/#news">News</a></li>' + [char]10 +
'                    <li><a href="contact.html" class="btn btn-outline">Free Quote</a></li>' + [char]10 +
'                </ul>' + [char]10 +
'            </nav>' + [char]10 +
'            <button class="mobile-toggle" aria-label="Toggle Menu">' + [char]10 +
'                <span></span><span></span><span></span>' + [char]10 +
'            </button>' + [char]10 +
'        </div>' + [char]10 +
'    </header>' + [char]10 +
'    <main>' + [char]10 +
'        <section class="lp-hero">' + [char]10 +
'            <div class="lp-hero-overlay"></div>' + [char]10 +
'            <div class="container lp-hero-content">' + [char]10 +
'                <nav class="lp-breadcrumb" aria-label="Breadcrumb">' + [char]10 +
'                    <a href="/">Home</a><span>&#8250;</span>' + [char]10 +
'                    <a href="/#areas">Areas We Serve</a><span>&#8250;</span>' + [char]10 +
'                    <span id="lp-breadcrumb-city">' + $name + '</span>' + [char]10 +
'                </nav>' + [char]10 +
'                <span class="hero-subtitle">' + $region + '</span>' + [char]10 +
'                <h1 id="lp-hero-title">' + $name + ' Building Permit Services</h1>' + [char]10 +
'                <p id="lp-hero-sub" class="lp-hero-sub">Expert building &amp; development permit consulting in ' + $name + ', ' + $region + '</p>' + [char]10 +
'                <div class="hero-actions">' + [char]10 +
'                    <a href="contact.html" class="btn btn-gold">Get a Free Quote</a>' + [char]10 +
'                    <a href="#lp-services" class="btn btn-white-outline">Our Services</a>' + [char]10 +
'                </div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="lp-stats-bar">' + [char]10 +
'            <div class="container">' + [char]10 +
'                <div class="lp-authority-badge">' + [char]10 +
'                    <span class="lp-authority-label">Municipal Authority:</span>' + [char]10 +
'                    <span id="lp-authority">Loading...</span>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="lp-stats">' + [char]10 +
'                    <div class="lp-stat"><span class="stat-number" id="lp-stat-timeline">-</span><span class="stat-label">Avg. Permit Timeline</span></div>' + [char]10 +
'                    <div class="lp-stat"><span class="stat-number" id="lp-stat-projects">-</span><span class="stat-label">Projects in Region</span></div>' + [char]10 +
'                    <div class="lp-stat"><span class="stat-number" id="lp-stat-since">-</span><span class="stat-label">Serving Since</span></div>' + [char]10 +
'                </div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="lp-intro">' + [char]10 +
'            <div class="container lp-intro-grid">' + [char]10 +
'                <div class="lp-intro-text">' + [char]10 +
'                    <span class="hero-subtitle">Local Expertise</span>' + [char]10 +
'                    <h2>Permit Services in <span data-city-name>' + $name + '</span></h2>' + [char]10 +
'                    <p id="lp-intro-1" class="lead"></p>' + [char]10 +
'                    <p id="lp-intro-2"></p>' + [char]10 +
'                    <a href="contact.html" class="btn btn-gold" style="margin-top:1.5rem;">Start Your Project</a>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="lp-intro-side">' + [char]10 +
'                    <div class="lp-contact-card">' + [char]10 +
'                        <h3>Get a Free Quote</h3>' + [char]10 +
'                        <p>Serving <strong>' + $name + '</strong> and surrounding areas.</p>' + [char]10 +
'                        <div class="lp-contact-items">' + [char]10 +
'                            <div class="lp-contact-item"><span class="lp-contact-icon">&#128222;</span><a href="tel:+16479850376">647-985-0376</a></div>' + [char]10 +
'                            <div class="lp-contact-item"><span class="lp-contact-icon">&#9993;</span><a href="mailto:a.said@lagroupofcompanies.ca">a.said@lagroupofcompanies.ca</a></div>' + [char]10 +
'                            <div class="lp-contact-item"><span class="lp-contact-icon">&#128336;</span><span>Mon-Fri, 8am-5pm</span></div>' + [char]10 +
'                        </div>' + [char]10 +
'                        <a href="contact.html" class="btn btn-gold full-width" style="margin-top:1.5rem;">Request Free Quote</a>' + [char]10 +
'                    </div>' + [char]10 +
'                </div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section id="lp-services" class="lp-services">' + [char]10 +
'            <div class="container">' + [char]10 +
'                <div class="section-header">' + [char]10 +
'                    <h2>Permit Services in ' + $name + '</h2>' + [char]10 +
'                    <p>We handle the full spectrum of building and development permit applications for residential and commercial projects in ' + $name + '.</p>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="lp-permits-grid" id="lp-permits-grid"></div>' + [char]10 +
'                <div class="lp-services-cta">' + [char]10 +
'                    <p>Need a permit type not listed? <strong>We handle all municipal applications.</strong></p>' + [char]10 +
'                    <a href="contact.html" class="btn btn-gold">Discuss Your Project</a>' + [char]10 +
'                </div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="lp-process">' + [char]10 +
'            <div class="container">' + [char]10 +
'                <div class="section-header white-text">' + [char]10 +
'                    <h2>How We Handle Your ' + $name + ' Permit</h2>' + [char]10 +
'                    <p>A proven four-step process that minimises delays and maximises approval success.</p>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="process-steps">' + [char]10 +
'                    <div class="step"><div class="step-icon">01</div><h4>Zoning Review</h4><p>We analyse your project against local zoning bylaws and Ontario Building Code requirements.</p></div>' + [char]10 +
'                    <div class="step"><div class="step-icon">02</div><h4>Permit Drawings</h4><p>Our experts prepare professional drawings that meet all municipal submission standards.</p></div>' + [char]10 +
'                    <div class="step"><div class="step-icon">03</div><h4>City Submission</h4><p>We submit and manage your application through the municipal permit portal on your behalf.</p></div>' + [char]10 +
'                    <div class="step"><div class="step-icon">04</div><h4>Approval</h4><p>We handle all revisions and coordinate inspections until your permit and occupancy are issued.</p></div>' + [char]10 +
'                </div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="lp-faq">' + [char]10 +
'            <div class="container">' + [char]10 +
'                <div class="section-header">' + [char]10 +
'                    <h2>' + $name + ' Permit FAQs</h2>' + [char]10 +
'                    <p>Common questions about building and development permits specific to ' + $name + ', answered by our experts.</p>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="faq-list" id="lp-faq-list"></div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="lp-nearby">' + [char]10 +
'            <div class="container">' + [char]10 +
'                <div class="section-header">' + [char]10 +
'                    <h2>Also Serving Nearby Areas</h2>' + [char]10 +
'                    <p>Our permit expertise extends throughout the Greater Toronto Area.</p>' + [char]10 +
'                </div>' + [char]10 +
'                <div class="lp-nearby-grid" id="lp-nearby-grid"></div>' + [char]10 +
'                <div style="text-align:center;margin-top:2.5rem;"><a href="/#areas" class="btn btn-gold">View All GTA Locations</a></div>' + [char]10 +
'            </div>' + [char]10 +
'        </section>' + [char]10 +
'        <section class="cta"><div class="container"><div class="cta-box">' + [char]10 +
'            <h2>Ready to Start Your ' + $name + ' Project?</h2>' + [char]10 +
'            <p>Don''t let municipal red tape slow you down. Partner with the GTA''s local permit experts.</p>' + [char]10 +
'            <a href="contact.html" class="btn btn-gold btn-large">Get Your Free Quote Today</a>' + [char]10 +
'        </div></div></section>' + [char]10 +
'    </main>' + [char]10 +
'    <footer class="footer"><div class="container"><div class="footer-grid">' + [char]10 +
'        <div class="footer-col about"><div class="logo"><span class="logo-text">PERMIT<span class="accent">TORONTO</span></span></div>' + [char]10 +
'        <p>Dedicated to helping GTA property owners navigate building and development permits with ease.</p></div>' + [char]10 +
'        <div class="footer-col"><h4>Quick Links</h4><ul>' + [char]10 +
'            <li><a href="/#services">Services</a></li><li><a href="/#process">Process</a></li>' + [char]10 +
'            <li><a href="/#about">About Us</a></li><li><a href="/#areas">Areas We Serve</a></li>' + [char]10 +
'        </ul></div>' + [char]10 +
'        <div class="footer-col"><h4>Contact Us</h4><address>' + [char]10 +
'            <p><strong>Permit Toronto</strong></p><p>Toronto, ON, Canada</p>' + [char]10 +
'            <p>Phone: <a href="tel:+16479850376">647-985-0376</a></p>' + [char]10 +
'            <p>Email: <a href="mailto:a.said@lagroupofcompanies.ca">a.said@lagroupofcompanies.ca</a></p>' + [char]10 +
'        </address></div>' + [char]10 +
'    </div><div class="footer-bottom"><p>&copy; 2026 Permit Toronto. All rights reserved.</p></div>' + [char]10 +
'    </div></footer>' + [char]10 +
'    <script src="locations-data.js"></script>' + [char]10 +
'    <script src="location-page.js"></script>' + [char]10 +
'    <script src="main.js"></script>' + [char]10 +
'</body></html>'

    $filePath = Join-Path $outputDir $filename
    [System.IO.File]::WriteAllText($filePath, $html, [System.Text.Encoding]::UTF8)
    $count++
    Write-Host "Generated: $filename"
}

Write-Host "`nDone. Generated $count city pages."
