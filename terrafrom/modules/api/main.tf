resource "auth0_resource_server" "validation_api" {
    name = "validation API"
    identifier  = "https://validation/api"
    signing_alg = "RS256"
}

resource "auth0_resource_server_scope" "read_message" {
  resource_server_identifier  = auth0_resource_server.validation_api.identifier
  scope                       = "read:messages"
}
