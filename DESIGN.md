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
its feature folder. A piece with no knowledge of stations or fares goes in `components/common/`:
`Swatch` is every color key (legend, line table), and text only screen readers read takes the
global `visually-hidden` class.

## Map colors

| Role                                            | Value                                                              | Used for                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `--wf-map-line-*`                               | WMATA's red, orange, blue, green, yellow, silver                   | The six lines                                                                                |
| `--rdylgn7-*`, `--rdylgn6-*`, `--rdylgn3-*`     | ColorBrewer RdYlGn, green to red; the 6 is the 7 without `#d9ef8b` | Station fill: 7 peak and travel time; 6 senior and disabled, and distance; 3 off-peak breaks |
| `--wf-map-fare-below`                           | black                                                              | A fare under the lowest break                                                                |
| `--wf-map-origin`                               | gray-90                                                            | The selected station                                                                         |
| `--wf-map-faded-line`, `--wf-map-faded-station` | Opacity 0.15 / 0.2                                                 | Lines and stations off the line picked under Advanced                                        |
| `--wf-map-route-casing`                         | The station stroke, gray-90                                        | The dark edge under a route, which fades every other line                                    |
| `--wf-map-station-fill`                         | white                                                              | Stations before one is selected, and its free other platform                                 |

The breaks are fixed per measure (`BREAKS` in `app/src/utils/fares.ts`) and follow the
fare structure: the base fare, distance classes, and the max fare each get a class. Peak: base
up to $2.25, then $2.30, 3, 4, 5, and 6, and the $6.75 max. Off-peak: base up to $2.25, then
$2.30 to $2.45, and the $2.50 max. Senior and disabled: base $1.10, then $1.15, 1.50, 2, and
2.50, and the $3.00 max. Travel time is WMATA's scheduled time in the train, in 10 minute
classes up to 60 and over. Distance is WMATA's fare distance in miles, in round 5 mile classes
to 20, then 20 to 30 and over. Per mile is the peak fare over that distance, in cents.
Revisit them when WMATA changes fares. Red and green look alike to many color-blind readers,
so the legend lists each color's range and the tooltip gives the amount, and `make colors-check`
simulates protanopia, deuteranopia, and tritanopia and fails if neighboring classes fall under
ΔE 10. WMATA's red and green lines fall under it for deuteranopia; they're WMATA's colors and the
line picker names them, so the check only warns.

## Controls

The panel picks what colors the map with a `SegmentedControl` (`components/common/`): native
radios drawn as joined buttons, each at least `--wf-target-min` tall for touch. "Color by"
picks a group (fare, time, distance, per mile); a group with more than one measure, like fare,
gets a second row for peak, off-peak, or senior and disabled. Add a measure in `MEASURES` and
`BREAKS`, and in `measureValue` if it's derived from other fields, and both rows, the legend,
and the tooltip pick it up.

Less used settings sit under an **Advanced** `Disclosure` (`components/common/`), a quiet text
button with a caret. It holds the line picker, which reuses the station `Combobox`: picking a
line fades the others, and with an origin it lists that line's stations in a `LineStations`
table with the fare, time, and miles, lowest first by what colors the map. The map fits the
picked line, or the whole system when cleared, in the space the panel leaves free.

With an origin, a **To** picker (the same `StationPicker` as **From**) asks the API for a route.
The map draws each leg in its line's color over a dark casing, fades every line and the
stations off the route, and fits it; the panel lists the legs in order, naming every line that covers a shared
stretch ("Blue, Orange or Silver line") and the direction only when one line does. The
destination is in the query (`/A15?to=C05`), next to `?line=`.

## Writing

Sentence case everywhere. Say what happened and what to do next, without HTTP codes. A comment
explains why, not what.
