# Create the S3 bucket
resource "aws_s3_bucket" "wmata" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name = "WMATA Data"
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "wmata_versioning" {
  bucket = aws_s3_bucket.wmata.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Public access block (allow public reads)
resource "aws_s3_bucket_public_access_block" "wmata" {
  bucket                  = aws_s3_bucket.wmata.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy for public read access
resource "aws_s3_bucket_policy" "wmata_bucket_policy" {
  bucket = aws_s3_bucket.wmata.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.wmata.arn}/*"
      }
    ]
  })
}
