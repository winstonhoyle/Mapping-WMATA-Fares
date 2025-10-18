# ACM DNS validation in Cloudflare
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

# API Gateway custom domain CNAME
resource "cloudflare_record" "api_gateway_alias" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  type    = "CNAME"
  content = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].target_domain_name
  ttl     = 300
}
