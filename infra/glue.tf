resource "aws_glue_job" "etl" {
  name     = "WMATA-ETL-Job"
  role_arn = aws_iam_role.glue_role.arn

  command {
    name            = "glueetl"
    python_version  = "3"
    script_location = "s3://${aws_s3_bucket.wmata.bucket}/glue/glue_etl.py"
  }

  default_arguments = {
    "--S3_BUCKET" = aws_s3_bucket.wmata.bucket
    "--S3_PREFIX" = "data/"
  }
}
