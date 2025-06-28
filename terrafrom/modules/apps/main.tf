resource "auth0_client" "client_app" {
  name                       = "client-app"
  app_type                   = "non_interactive"
  grant_types                = ["client_credentials"]
}