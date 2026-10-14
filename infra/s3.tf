# The Lambda reads the data with its role, so nothing here is public.
resource "aws_s3_bucket" "wmata" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name = "WMATA Data"
  }
}

resource "aws_s3_bucket_versioning" "wmata_versioning" {
  bucket = aws_s3_bucket.wmata.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "wmata" {
  bucket                  = aws_s3_bucket.wmata.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
