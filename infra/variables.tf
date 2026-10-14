variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "bucket_name" {
  description = "S3 bucket for the stations, lines, and fares the Lambda serves"
  type        = string
  default     = "wmata-fares"
}

variable "domain" {
  description = "Apex domain; the app is served there and the API at api.<domain>"
  type        = string
  default     = "wmatafares.com"
}

variable "pages_project" {
  description = "Cloudflare Pages project the app deploys to"
  type        = string
  default     = "wmata-fares"
}

# ------------------------------
# API rate limiting
# ------------------------------
variable "api_throttle_rate_limit" {
  description = "Steady-state requests per second allowed across the whole API"
  type        = number
  default     = 50
}

variable "api_throttle_burst_limit" {
  description = "Maximum burst of concurrent requests allowed across the whole API"
  type        = number
  default     = 100
}

variable "api_rate_limit_per_ip" {
  description = "Requests one IP may make to the API in 10 seconds before Cloudflare blocks it for 10 seconds"
  type        = number
  default     = 100
}

# ------------------------------
# Cloudflare
# ------------------------------
variable "cloudflare_api_token" {
  description = "Cloudflare API token for the zone: Zone Read; DNS, Zone Settings, Zone WAF, Cache Rules, and Single Redirect Edit"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account that owns the Pages project"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for wmatafares.com"
  type        = string
}
