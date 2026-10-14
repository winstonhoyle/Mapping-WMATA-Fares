export const SITE_URL = "https://wmatafares.com";
const SITE_NAME = "WMATA Fares";

const escapeHtml = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Inside a <script> tag, "</" would end the tag early.
const jsonLd = (data) => JSON.stringify(data).replaceAll("</", "<\\/");

/** Transfer stations have one code per level (Metro Center is A01 and C01); keep the first. */
export const stationsToPublish = (features) =>
  features.filter(({ properties: p }) => {
    if (!/^[A-Z]\d{2}$/.test(p?.Code ?? "")) return false;
    return !p.StationTogether1 || p.Code < p.StationTogether1;
  });

export const stationPage = ({ properties: p, geometry }) => {
  const url = `${SITE_URL}/${p.Code}`;
  return {
    path: p.Code,
    title: `Metro fares from ${p.Name} | ${SITE_NAME}`,
    description: `What a Metrorail trip from ${p.Name} costs to every other station, at peak, off-peak, and senior and disabled fares.`,
    url,
    heading: `Metrorail fares from ${p.Name}`,
    summary: `Peak, off-peak, and reduced fares from ${p.Name} to every other Metrorail station, with travel time and distance.`,
    data: {
      "@context": "https://schema.org",
      "@type": "TrainStation",
      name: p.Name,
      url,
      geo: {
        "@type": "GeoCoordinates",
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      },
    },
  };
};

const setAttr = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`Template is missing ${pattern}`);
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
};

/** Copies the built index.html with the page's own head tags and a text summary inside #root. */
export const renderPage = (template, page) => {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = setAttr(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, page.description);
  html = setAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, page.description);
  html = setAttr(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, page.title);
  html = setAttr(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, page.url);
  html = setAttr(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, page.url);
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${jsonLd(page.data)}</script>`,
  );
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><main><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.summary)}</p></main></div>`,
  );
};

export const sitemapXml = (urls, lastmod) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
