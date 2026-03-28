resource "auth0_resource_server" "springfeild_api" {
    name = "Springfeild API"
    identifier  = "https://api.springfield.gov"
    signing_alg = "RS256"
    enforce_policies = true
    token_dialect = "access_token_authz"
}

  resource "auth0_resource_server_scopes" "springfield_permissions" {
    resource_server_identifier = auth0_resource_server.springfeild_api.identifier

    scopes {
      name        = "read:profile"
      description = "Read own profile"
    }

    scopes {
      name        = "update:profile"
      description = "Update own profile"
    }

    scopes {
      name        = "admin:all"
      description = "Full admin access"
    }
  }
