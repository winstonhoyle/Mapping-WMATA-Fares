############################################################
# Lambda Function
############################################################
# boto3 ships with the runtime, so the package is just our code.
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/build/lambda.zip"
  excludes    = ["tests", "README.md", "pyproject.toml", "local_server.py", ".pytest_cache", "**/__pycache__"]
}

resource "aws_lambda_function" "wmata-fares-api" {
  function_name = "wmata-fares-api-lambda"
  role          = aws_iam_role.wmata_fares_lambda_role.arn
  handler       = "wmata_fares_api.handler.lambda_handler"
  runtime       = "python3.14"
  memory_size   = 256
  timeout       = 10

  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      S3_BUCKET = aws_s3_bucket.wmata.bucket
      S3_PREFIX = "data/"
    }
  }
  depends_on = [
    aws_iam_role_policy.lambda_policy
  ]
}

############################################################
# Lambda Permission for API Gateway
############################################################
resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.wmata-fares-api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wmata_fares_api.execution_arn}/*/*"
}
