import { describe, expect, it } from "vitest";
import { renderPage, sitemapXml, stationPage, stationsToPublish } from "./pages.js";

const station = (Code, Name, StationTogether1 = "") => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [-77.03, 38.9] },
  properties: { Code, Name, StationTogether1 },
});

const TEMPLATE = `<title>WMATA Fares</title>
<meta name="description" content="x" />
<link rel="canonical" href="https://wmatafares.com/" />
<meta property="og:title" content="x" />
<meta property="og:description" content="x" />
<meta property="og:url" content="https://wmatafares.com/" />
<script type="application/ld+json">{}</script>
<div id="root"></div>`;

describe("stationsToPublish", () => {
  it("keeps one code per transfer station and drops bad codes", () => {
    const kept = stationsToPublish([
      station("A01", "Metro Center", "C01"),
      station("C01", "Metro Center", "A01"),
      station("A02", "Farragut North"),
      station("../x", "Bad"),
    ]);
    expect(kept.map((s) => s.properties.Code)).toEqual(["A01", "A02"]);
  });
});

describe("renderPage", () => {
  it("sets the head tags and escapes names", () => {
    const html = renderPage(TEMPLATE, stationPage(station("E01", `L'Enfant <Plaza>`)));
    expect(html).toContain('<link rel="canonical" href="https://wmatafares.com/E01" />');
    expect(html).toContain("&lt;Plaza&gt;");
    expect(html).toContain("<h1>Metrorail fares from L'Enfant &lt;Plaza&gt;</h1>");
    expect(html).toContain('"@type":"TrainStation"');
  });
});

describe("sitemapXml", () => {
  it("lists each URL", () => {
    const xml = sitemapXml(["https://wmatafares.com/", "https://wmatafares.com/A01"], "2026-10-13");
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });
});
