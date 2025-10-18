resource "aws_iam_role" "wmata_fares_lambda_role" {
  name = "wmata-fares-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "wmata-fares-lambda-policy"
  role = aws_iam_role.wmata_fares_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # S3 access for fare data
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject"
        ],
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.wmata.bucket}",
          "arn:aws:s3:::${aws_s3_bucket.wmata.bucket}/*"
        ]
      },
      # Logs
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}
