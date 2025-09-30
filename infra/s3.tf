resource "aws_s3_bucket" "wmata" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name = "WMATA Frontend and Data"
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "wmata_versioning" {
  bucket = aws_s3_bucket.wmata.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Configure static website hosting
resource "aws_s3_bucket_website_configuration" "wmata_website" {
  bucket = aws_s3_bucket.wmata.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Public access block (optional)
resource "aws_s3_bucket_public_access_block" "wmata" {
  bucket                  = aws_s3_bucket.wmata.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

output "frontend_bucket_website_endpoint" {
  description = "S3 static website endpoint for frontend"
  value       = aws_s3_bucket_website_configuration.wmata_website.website_endpoint
}
