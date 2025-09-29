resource "aws_lambda_function" "fare_api" {
  function_name = "WMATA-fare-api"
  role          = aws_iam_role.lambda_role.arn
  handler       = "fare_api.lambda_handler"
  runtime       = "python3.12"

  filename         = "${path.module}/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda.zip")

  environment {
    variables = {
      S3_BUCKET = aws_s3_bucket.wmata.bucket
      S3_PREFIX = "data/"
    }
  }
}
