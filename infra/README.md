# Infrastructure

Terraform for the AWS resources behind WMATA Fares and the Cloudflare records and rules in
front of them. State is in the `wmata-fares-terraform-state` S3 bucket with S3 native locking.

## Layout

| File | Resources |
| --- | --- |
| `main.tf`, `providers.tf` | Terraform settings, S3 backend, AWS, Cloudflare, and archive providers |
| `variables.tf` | Input variables and defaults |
| `s3.tf` | The private data bucket |
| `lambda.tf` | The Lambda, zipped from `../lambda/wmata_fares_api` |
| `apigateway.tf` | HTTP API, routes, throttling, custom domain |
| `acm.tf` | Certificate for `api.wmatafares.com` |
| `cloudflare.tf` | Certificate validation, apex, `api`, and `www` records, Pages domain, no-email records (null MX, SPF, DMARC) |
| `edge.tf` | SSL Full (strict), HTTPS only, HSTS, `www` redirect, API rate limit and cache rules |
| `iam.tf`, `github.tf` | Lambda role, GitHub Actions OIDC deploy role |

The Pages project is created once by hand (below) and CI deploys the app to it; Terraform attaches
`wmatafares.com` to it and points the apex record at it.

## One-time setup

1. A Cloudflare API token with Zone Read and these Edit permissions on `wmatafares.com`: DNS,
   Zone Settings, Zone WAF, Cache Rules, Single Redirect. Add Account > Cloudflare Pages Edit
   so CI can deploy the app with the same token.
2. Create the Pages project and attach the apex domain (Pages adds the apex record itself):
   ```bash
   cd app && npx wrangler pages project create wmata-fares --production-branch=main
   ```
3. GitHub repository secrets: `AWS_ACCOUNT_ID`, `AWS_REGION` (`us-west-1`), `CLOUDFLARE_ZONE_ID`,
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
4. For local runs, copy the variables file and fill it in. `terraform.tfvars` is gitignored.
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

## Deploy

```bash
make tf-init
make tf-plan     # review before applying
make tf-apply
```

## Rate limiting and caching

- Cloudflare blocks an IP for 10 seconds after `api_rate_limit_per_ip` requests (default 100) in 10 seconds.
- The API Gateway stage throttles all traffic together to `api_throttle_rate_limit` requests per second with bursts up to `api_throttle_burst_limit` (defaults 50 and 100).

The default `execute-api` URL is disabled, so every request comes through `api.wmatafares.com`
and Cloudflare, which caches responses for as long as their `Cache-Control` allows.
