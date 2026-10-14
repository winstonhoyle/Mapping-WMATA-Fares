# WMATA Fares

WMATA Fares maps what a Metrorail trip costs. Pick a station and every other station is colored
by its fare from there, at peak, off-peak, or senior and disabled rates. Live at
[wmatafares.com](https://wmatafares.com).

## Architecture

| Part | Service | Folder |
| --- | --- | --- |
| Data | Python, run locally when fares change: WMATA API and Open Data DC to S3 | [`data/`](data/upload_files.py) |
| API | API Gateway and one Lambda, reading the S3 files | [`lambda/`](lambda/README.md) |
| Frontend | React, TypeScript, and Leaflet on Cloudflare Pages | [`app/`](app/README.md) |
| Infrastructure | Terraform: AWS resources, Cloudflare DNS, proxy, rate limit, and cache rules | [`infra/`](infra/README.md) |

GitHub Actions runs on every push to `main`: it lints and tests the app, tests the Lambda, applies
Terraform (which also packages the Lambda), then builds the app and deploys it to Cloudflare
Pages.

## API

All endpoints are `GET` on `https://api.wmatafares.com` and return JSON.

| Endpoint | Returns |
| --- | --- |
| `/stations` | GeoJSON points, one per station platform code (`Code`, `Name`, `StationTogether1`, `LineCode1`–`4`, `Address`) |
| `/lines` | GeoJSON lines, one per Metrorail line (`NAME`: `red`, `orange`, `blue`, `green`, `yellow`, `silver`) |
| `/fares/{code}` | Fares from that station to every station, keyed by destination code |

```json
{
  "A02": { "PeakTime": 2.0, "OffPeakTime": 2.0, "SeniorDisabled": 1.1, "RailTime": 2, "CompositeMiles": 0.75 },
  "A01": { "PeakTime": 0.0, "OffPeakTime": 0.0, "SeniorDisabled": 0.0, "RailTime": 0, "CompositeMiles": 0.0 }
}
```

The origin and its other platform at a transfer station (Metro Center is `A01` and `C01`) are
`0`. Status codes: `200`; `400` for a code that isn't a letter and two digits; `404` for an
unknown station or path; `429` past the rate limit.

Each IP may make 100 requests in 10 seconds. Responses are cached for an hour; the data changes
a few times a year.

## Updating the data

```bash
cp env.sample .env   # add a WMATA API key from https://developer.wmata.com/
make data            # writes data/*.json locally and uploads them to s3://wmata-fares/data/
```

Running Lambda containers keep the old files until they are recycled. To serve new data now,
redeploy the function or wait for the cache to expire.

## Development

| Command | What it does |
| --- | --- |
| `make app-start` | Dev server on http://localhost:3000 against the live API |
| `make app-check` | ESLint, Prettier, TypeScript, and Vitest |
| `make py-check` | pytest for the Lambda, in `.venv` |
| `make tf-plan` | Terraform plan; see [infra/README.md](infra/README.md) |

`.venv/bin/pre-commit install` runs these before each commit: gitleaks (secrets), private-key
and large-file checks, YAML and JSON checks, whitespace fixes, `terraform fmt`, the app's
ESLint and Prettier, and a lockfile check.
Design rules for the app are in [DESIGN.md](DESIGN.md).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you
would like to change.
