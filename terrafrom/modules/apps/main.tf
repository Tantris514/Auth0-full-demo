resource "auth0_client" "springfeild_app" {
  name                                = "Springfeild App"
  description                         = "Springfeild Authorisation Code App"
  app_type                            = "regular_web"
  custom_login_page_on                = true
  is_first_party                      = true
  is_token_endpoint_ip_header_trusted = true
  oidc_conformant                     = true
  callbacks                           = ["http://localhost:3000/callback"]
  allowed_logout_urls                 = ["http://localhost:3000"]
  allowed_origins                     = ["http://localhost:3000"]
  web_origins                         = ["http://localhost:3000"]

  grant_types = [
    "authorization_code",
    "refresh_token",
  ]

  jwt_configuration {
    lifetime_in_seconds = 300
    secret_encoded      = true
    alg                 = "RS256"
    scopes = {
      foo = "bar"
    }
  }

  refresh_token {
    leeway          = 0
    token_lifetime  = 2592000
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

}