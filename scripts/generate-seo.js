const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const htmlPath = path.join(dist, "index.html");
const configuredSiteUrl = (process.env.URL || process.env.SITE_URL || "").trim();
const siteUrl = new URL(configuredSiteUrl || "https://asma-hammami.netlify.app");

if (siteUrl.protocol !== "https:" || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  throw new Error("URL or SITE_URL must be an HTTPS site origin without a path.");
}

if (!fs.existsSync(htmlPath)) {
  throw new Error("dist/index.html was not found. Run the Webpack build first.");
}

const siteOrigin = siteUrl.origin;
const canonicalUrl = `${siteOrigin}/`;
const socialImageUrl = `${siteOrigin}/img/og-portfolio.png`;
const sitemapUrl = `${siteOrigin}/sitemap.xml`;
const htmlEscape = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${canonicalUrl}#asma-hammami`,
      name: "Asma Hammami",
      url: canonicalUrl,
      image: `${siteOrigin}/img/asma-hammami-960.webp`,
      jobTitle: "Développeuse Front-End et intégratrice web",
      description:
        "Développeuse Front-End et intégratrice web à Tunis, spécialisée en interfaces responsive et intégration de maquettes Figma.",
      email: "mailto:hammami.asma@outlook.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tunis",
        addressCountry: "TN",
      },
      knowsAbout: [
        "Développement Front-End",
        "Intégration web",
        "HTML",
        "CSS",
        "JavaScript",
        "Responsive design",
        "Figma",
        "GSAP",
      ],
      sameAs: [
        "https://www.linkedin.com/in/asma-hammami/",
        "https://linktr.ee/hammami.asma",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${canonicalUrl}#website`,
      url: canonicalUrl,
      name: "Portfolio d’Asma Hammami",
      inLanguage: "fr-TN",
      publisher: { "@id": `${canonicalUrl}#asma-hammami` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${canonicalUrl}#profile`,
      url: canonicalUrl,
      name: "Portfolio d’Asma Hammami — Développeuse Front-End à Tunis",
      inLanguage: "fr-TN",
      isPartOf: { "@id": `${canonicalUrl}#website` },
      mainEntity: { "@id": `${canonicalUrl}#asma-hammami` },
    },
  ],
};

let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(
  /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<link\b(?=[^>]*\brel=["']sitemap["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<meta\b(?=[^>]*\bproperty=["']og:image(?:[:"][^"']*)?["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<meta\b(?=[^>]*\bname=["']twitter:image:alt["'])[^>]*>\s*/gi,
  "",
);
html = html.replace(
  /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
  "",
);

const metadata = [
  `<link rel="canonical" href="${htmlEscape(canonicalUrl)}">`,
  `<link rel="sitemap" type="application/xml" href="${htmlEscape(sitemapUrl)}">`,
  `<meta property="og:url" content="${htmlEscape(canonicalUrl)}">`,
];

if (fs.existsSync(path.join(dist, "img", "og-portfolio.png"))) {
  metadata.push(
    `<meta property="og:image" content="${htmlEscape(socialImageUrl)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Portfolio d’Asma Hammami, développeuse Front-End à Tunis">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:image" content="${htmlEscape(socialImageUrl)}">`,
    '<meta name="twitter:image:alt" content="Portfolio d’Asma Hammami, développeuse Front-End à Tunis">',
  );
}

metadata.push(
  `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`,
);

html = html.replace("</head>", `\n${metadata.join("\n")}\n</head>`);
fs.writeFileSync(htmlPath, html);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${canonicalUrl}</loc></url>\n</urlset>\n`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`,
);
