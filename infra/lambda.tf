resource "null_resource" "build_lambda" {
  triggers = {
    lambda_sources = join(",", fileset("${path.module}/../lambda", "**/*.py"))
  }

  provisioner "local-exec" {
    command = <<EOT
      mkdir -p package
      cp ../lambda/*.py package/
      pip install --target ./package -r ../requirements.txt --no-cache-dir
      cd package
      zip -rq ../lambda.zip . -x "*.pyc" -x "*__pycache__*"
      cd ..
      rm -rf package
    EOT
  }
}

resource "aws_lambda_function" "fare_api" {
  depends_on = [null_resource.build_lambda]

  function_name = "WMATA-fare-api"
  role          = aws_iam_role.lambda_role.arn
  handler       = "fare_api.lambda_handler"
  runtime       = "python3.12"

  filename = "${path.module}/lambda.zip"

  environment {
    variables = {
      S3_BUCKET = aws_s3_bucket.wmata.bucket
      S3_PREFIX = "data/"
    }
  }
}
