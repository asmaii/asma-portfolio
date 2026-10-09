const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const htmlPath = path.join(dist, 'index.html');
const siteUrl = (process.env.URL || process.env.SITE_URL || '').trim().replace(/\/+$/, '');

if (!fs.existsSync(htmlPath)) {
  throw new Error('dist/index.html was not found. Run the Webpack build first.');
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
html = html.replace(/\s*<meta[^>]+property=["']og:url["'][^>]*>/gi, '');

if (siteUrl && /^https:\/\//i.test(siteUrl)) {
  const canonical = `${siteUrl}/`;
  html = html.replace('</head>', `\n<link rel="canonical" href="${canonical}">\n<meta property="og:url" content="${canonical}">\n</head>`);
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${canonical}</loc></url>\n</urlset>\n`);
  fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
} else {
  // Do not publish a fake canonical or sitemap URL on local builds.
  fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  if (fs.existsSync(path.join(dist, 'sitemap.xml'))) fs.unlinkSync(path.join(dist, 'sitemap.xml'));
  console.warn('SEO URLs were not generated because URL/SITE_URL is not set to the production HTTPS URL. Netlify sets URL for deployed builds.');
}

// Add a social preview image only when the asset exists in the published output.
const socialImage = path.join(dist, 'img', 'og-portfolio.png');
html = html.replace(/\s*<meta[^>]+property=["']og:image["'][^>]*>/gi, '');
html = html.replace(/\s*<meta[^>]+name=["']twitter:card["'][^>]*>/gi, '');
if (fs.existsSync(socialImage) && siteUrl && /^https:\/\//i.test(siteUrl)) {
  html = html.replace('</head>', `\n<meta property="og:image" content="${siteUrl}/img/og-portfolio.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n</head>`);
}
fs.writeFileSync(htmlPath, html);
