############################################################
# Lambda Function
############################################################
resource "aws_lambda_function" "wmata-fares-api" {
  function_name = "wmata-fares-api-lambda"
  role          = aws_iam_role.wmata_fares_lambda_role.arn
  handler       = "fare_api.lambda_function"
  runtime       = "python3.12"

  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  environment {
    variables = {
      S3_BUCKET = aws_s3_bucket.wmata.bucket
      S3_PREFIX = "data/"
      REGION    = var.aws_region
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

  # Use /*/* to allow any stage, any route
  source_arn = "${aws_apigatewayv2_api.wmata_fares_api.execution_arn}/*/*"
}
