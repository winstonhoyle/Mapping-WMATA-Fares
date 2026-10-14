# ACM DNS validation in Cloudflare (never proxied)
resource "cloudflare_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options :
    dvo.domain_name => dvo
  }

  zone_id = var.cloudflare_zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  content = each.value.resource_record_value
  ttl     = 60
}

# API Gateway custom domain, proxied so Cloudflare's rate limit and cache apply
resource "cloudflare_record" "api_gateway_alias" {
  zone_id    = var.cloudflare_zone_id
  name       = "api"
  type       = "CNAME"
  content    = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].target_domain_name
  proxied    = true
  ttl        = 1
  depends_on = [cloudflare_zone_settings_override.zone]
}

# www redirects to the apex (edge.tf); it needs a proxied record to answer at all.
resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  content = "${var.pages_project}.pages.dev"
  proxied = true
  ttl     = 1
}

# The app on Cloudflare Pages: the project answers for the apex, and the apex record points at it.
resource "cloudflare_pages_domain" "apex" {
  account_id   = var.cloudflare_account_id
  project_name = var.pages_project
  domain       = var.domain
}

resource "cloudflare_record" "apex" {
  zone_id    = var.cloudflare_zone_id
  name       = "@"
  type       = "CNAME"
  content    = "${var.pages_project}.pages.dev"
  proxied    = true
  ttl        = 1
  depends_on = [cloudflare_pages_domain.apex]
}
