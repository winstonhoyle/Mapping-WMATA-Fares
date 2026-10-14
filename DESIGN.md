# Design system

WMATA Fares is one map with a few floating controls. It shares its look with
[Flight Atlas](https://flightatlas.io): the [U.S. Web Design System](https://designsystem.digital.gov/)
type pair, system colors, spacing grid, and button styles, without the USWDS package itself.

## The one rule

**No colors, font sizes, or spacing values outside `app/src/styles/tokens.css`.** Components
read tokens through `var(--wf-…)` in their CSS modules. Map code, which paints through Leaflet
where `var()` doesn't work, reads them with `tokenValue()` from `app/src/styles/tokens.ts`.
This should print nothing:

```sh
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' app/src --include=*.ts --include=*.tsx --include=*.css | grep -v styles/tokens.css
```

## Files

Each component is `Name.tsx`, `Name.module.css`, and `Name.test.tsx` when it has tests, flat in
its feature folder. A piece with no knowledge of stations or fares goes in `components/common/`.

## Map colors

| Role | Value | Used for |
| --- | --- | --- |
| `--wf-map-line-*` | WMATA's red, orange, blue, green, yellow, silver | The six lines |
| `--rdylgn7-*`, `--rdylgn5-*` | ColorBrewer RdYlGn, green to red | Station fill by fare: 7 peak breaks, 5 off-peak and senior breaks |
| `--wf-map-fare-below` | black | A fare under the lowest break |
| `--wf-map-origin` | gray-90 | The selected station |
| `--wf-map-station-fill` | white | Stations before one is selected, and its free other platform |

The breaks are fixed per fare type (`FARE_BREAKS` in `app/src/utils/fares.ts`), carried over from
the first version of the app: peak at $2, 2.50, 3, 3.50, 4, 5, and 6; off-peak at $2, 2.50, 3,
3.50, and 3.85; senior and disabled at $1, 1.50, 2, 2.50, and 3. Red and green look alike to
many color-blind readers, so the legend lists each color's range and the tooltip gives the
amount.

## Writing

Sentence case everywhere. Say what happened and what to do next, without HTTP codes. A comment
explains why, not what.
