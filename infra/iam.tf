# IAM User for Terraform deploys
resource "aws_iam_user" "wmata_app" {
  name = "wmata-fares-deployer"
}

# IAM User for GitHub Actions
resource "aws_iam_user" "github_actions" {
  name = "github-actions-deployer"
}

# Policy document for GitHub Actions
data "aws_iam_policy_document" "github_actions_policy_doc" {
  statement {
    actions = [
      "lambda:UpdateFunctionCode",
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration"
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.wmata.arn,
      "${aws_s3_bucket.wmata.arn}/*"
    ]
  }
}

# Create the policy
resource "aws_iam_policy" "github_actions_policy" {
  name        = "github-actions-policy"
  description = "Policy for GitHub Actions deployer"
  policy      = data.aws_iam_policy_document.github_actions_policy_doc.json
}

# Attach policy to GitHub Actions user
resource "aws_iam_user_policy_attachment" "github_actions_attach" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

# Create access key for GitHub Actions user
resource "aws_iam_access_key" "github_actions_key" {
  user = aws_iam_user.github_actions.name
}

output "github_actions_aws_access_key_id" {
  value     = aws_iam_access_key.github_actions_key.id
  sensitive = true
}

output "github_actions_aws_secret_access_key" {
  value     = aws_iam_access_key.github_actions_key.secret
  sensitive = true
}

# Attach AdminAccess for Terraform deploy user
resource "aws_iam_user_policy_attachment" "wmata_app_admin" {
  user       = aws_iam_user.wmata_app.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# Access key for Terraform deploy user
resource "aws_iam_access_key" "wmata_app" {
  user = aws_iam_user.wmata_app.name
}

output "wmata_app_access_key_id" {
  value = aws_iam_access_key.wmata_app.id
}

output "wmata_app_secret_access_key" {
  value     = aws_iam_access_key.wmata_app.secret
  sensitive = true
}
