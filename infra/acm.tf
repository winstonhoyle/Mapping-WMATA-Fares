# Create ACM certificate for your API custom domain
resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.wmatafares.com"
  validation_method = "DNS"
  region            = var.aws_region # Must be us-east-1 for API Gateway
}

# Validate the certificate (Cloudflare handles the DNS record)
resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn = aws_acm_certificate.api_cert.arn

  depends_on = [
    cloudflare_record.acm_validation
  ]
}
