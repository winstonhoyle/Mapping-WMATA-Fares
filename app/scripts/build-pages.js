import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, renderPage, sitemapXml, stationPage, stationsToPublish } from "./pages.js";

const API_BASE = process.env.VITE_API_BASE || "https://api.wmatafares.com";
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

const main = async () => {
  const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  let pages = [];
  try {
    const res = await fetch(`${API_BASE}/stations`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} on /stations`);
    pages = stationsToPublish((await res.json()).features ?? []).map(stationPage);
  } catch (err) {
    console.warn(`pages: API unavailable (${err.message}); writing the home page only`);
  }

  // A01.html, not A01/index.html: Pages serves it at /A01, where a folder would redirect to /A01/.
  for (const page of pages) {
    fs.writeFileSync(path.join(DIST, `${page.path}.html`), renderPage(template, page));
  }
  const urls = [`${SITE_URL}/`, `${SITE_URL}/docs`, ...pages.map((p) => p.url).sort()];
  fs.writeFileSync(
    path.join(DIST, "sitemap.xml"),
    sitemapXml(urls, new Date().toISOString().slice(0, 10)),
  );
  console.log(`pages: ${pages.length} pages and a sitemap of ${urls.length} URLs`);
};

await main();
