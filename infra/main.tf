terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket       = "wmata-fares-terraform-state"
    key          = "infra/terraform.tfstate"
    region       = "us-west-1"
    use_lockfile = true
    encrypt      = true
  }

}