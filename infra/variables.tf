variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "S3 bucket for app, lambda, and glue"
  type        = string
  default     = "wmata-fares"
}
