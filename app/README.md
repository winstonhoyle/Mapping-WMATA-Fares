# WMATA Fares app

The map at wmatafares.com: React, TypeScript, and Leaflet, built with Vite. All data comes from
the API, so a local run needs no backend.

## Run locally

```bash
make app-start    # from the repo root; installs dependencies on first run
```

The app opens at http://localhost:3000 against `https://api.wmatafares.com`. To use another API,
put `VITE_API_BASE=https://your-api-host` in `app/.env.local`.

## Links

The URL holds the view, so it can be shared and reloaded: `/A01` shows fares from Metro Center,
`?line=orange` picks a line, and `?to=C05` adds a route to Rosslyn. Codes and line names are
case-insensitive, and an unknown one is ignored.

## Layout

| Path                     | Contents                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/map/`    | The map page: `MapView`, `StationMarker`, `RouteLayer`, `OverlayPanel`, `StationPicker`, `LineStations`, `RouteSummary`, `Legend`, `AboutDialog`      |
| `src/components/common/` | Domain-free pieces: `Button`, `IconButton`, `Combobox`, `SegmentedControl`, `Disclosure`, `Swatch`, `Panel`, `Dialog`, `ExternalLink`                 |
| `src/hooks/`             | `useMetroData` (stations, lines, fares, routes), `useStationUrl` (path and page title), `useQueryParam` and `useLineUrl` (view settings in the query) |
| `src/services/api.ts`    | API client                                                                                                                                            |
| `src/utils/`             | Measures, color breaks, and formatting (`fares.ts`); lines and route paths along their track (`lines.ts`); station path parsing                       |
| `src/styles/`            | `tokens.css` (every color, size, and space) and base styles                                                                                           |
| `scripts/`               | `build-pages.js` and `pages.js`, run after every build                                                                                                |
| `public/`                | Static files, including the API docs (`docs.html`, `openapi.yaml`)                                                                                    |

## Search engines and security headers

After `vite build`, `scripts/build-pages.js` reads `/stations` from the API and writes
`dist/sitemap.xml` plus one page per station (`dist/A01.html`, served at `/A01`). Each is a
copy of `index.html` with its own title, description, canonical link, Open Graph tags,
`TrainStation` JSON-LD, and a one-line summary, so crawlers and link previews see content before
JavaScript runs. Transfer stations get one page, under the first of their two codes. If the API
is down, the sitemap lists only the home page.

`public/robots.txt` allows everything and points at the sitemap. `public/_headers` sets the
Content Security Policy and the other security headers on Cloudflare Pages. A new tile server,
API host, or third-party script has to be added to the CSP there, or the browser blocks it.
