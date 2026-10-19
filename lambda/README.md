# WMATA Fares API

One Lambda behind API Gateway at `https://api.wmatafares.com`. It answers `/stations`,
`/lines`, `/fares/{code}`, and `/route/{from}/{to}` from three JSON files in
`s3://wmata-fares/data/`, which it reads once per container. The endpoints are in the
[API reference](../README.md#api).

## Layout

| Module | Job |
| --- | --- |
| `wmata_fares_api/handler.py` | Entry point: dispatches by path, validates the station code, maps errors to responses |
| `wmata_fares_api/data.py` | Loads stations, lines, and fares from S3, cached for the container's life |
| `wmata_fares_api/fares.py` | Looks up a station and builds its fares, with the origin and its other platform free |
| `wmata_fares_api/routes.py` | Orders each line's stations from trip times, then finds the fastest legs between two stations |
| `wmata_fares_api/responses.py` | JSON responses with CORS and `Cache-Control` |
| `wmata_fares_api/config.py` | `S3_BUCKET` (default `wmata-fares`) and `S3_PREFIX` (default `data/`) |
| `tests/` | pytest against an in-memory dataset; no AWS needed |

Successful responses carry `Cache-Control: public, max-age=3600`, which Cloudflare follows;
errors carry `no-store`.

## Run and test

```bash
make py-check
```

## Deploy

The function has no dependencies beyond the runtime's boto3. Terraform zips
`wmata_fares_api/` (`infra/lambda.tf`) and updates the function when the code changes, so
`terraform apply` (or a push to `main`) is the whole deploy.
