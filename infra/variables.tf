variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "bucket_name" {
  description = "S3 bucket for app and lambda"
  type        = string
  default     = "wmata-fares"
}

# Lambda zip path, need to build before running
variable "lambda_zip_path" {
  description = "Path to the Lambda ZIP file"
  type        = string
  default     = "../lambda/lambda_package.zip"
}

# Cloudfare vars
variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS:Edit & Zone:Read"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for wmatafares.com"
  type        = string
}