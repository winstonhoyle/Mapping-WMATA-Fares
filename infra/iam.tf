# IAM User for Terraform deploys
resource "aws_iam_user" "wmata_app" {
  name = "wmata-fares-deployer"
}

resource "aws_iam_user_policy_attachment" "wmata_app_admin" {
  user       = aws_iam_user.wmata_app.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

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
