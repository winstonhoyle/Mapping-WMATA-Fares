resource "aws_apigatewayv2_api" "wmata_fares_api" {
  name          = "wmata-fares-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "fares_integration" {
  api_id                 = aws_apigatewayv2_api.wmata_fares_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.wmata-fares-api.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stations" {
  api_id    = aws_apigatewayv2_api.wmata_fares_api.id
  route_key = "GET /stations"
  target    = "integrations/${aws_apigatewayv2_integration.fares_integration.id}"
}

resource "aws_apigatewayv2_route" "line" {
  api_id    = aws_apigatewayv2_api.wmata_fares_api.id
  route_key = "GET /lines"
  target    = "integrations/${aws_apigatewayv2_integration.fares_integration.id}"
}

resource "aws_apigatewayv2_route" "station" {
  api_id    = aws_apigatewayv2_api.wmata_fares_api.id
  route_key = "GET /station"
  target    = "integrations/${aws_apigatewayv2_integration.fares_integration.id}"
}

resource "aws_apigatewayv2_route" "fares" {
  api_id    = aws_apigatewayv2_api.wmata_fares_api.id
  route_key = "GET /fares/{station_code}"
  target    = "integrations/${aws_apigatewayv2_integration.fares_integration.id}"
}


resource "aws_apigatewayv2_deployment" "fares_deployment" {
  api_id = aws_apigatewayv2_api.wmata_fares_api.id

  depends_on = [
    aws_apigatewayv2_route.stations,
    aws_apigatewayv2_route.line,
    aws_apigatewayv2_route.station,
    aws_apigatewayv2_route.fares,
    aws_apigatewayv2_integration.fares_integration
  ]
}

resource "aws_apigatewayv2_stage" "flights_stage" {
  api_id      = aws_apigatewayv2_api.wmata_fares_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = "api.wmatafares.com"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api_cert_validation.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  api_id      = aws_apigatewayv2_api.wmata_fares_api.id
  domain_name = aws_apigatewayv2_domain_name.api_domain.domain_name
  stage       = aws_apigatewayv2_stage.flights_stage.name
}