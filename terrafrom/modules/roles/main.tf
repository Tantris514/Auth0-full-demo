  resource "auth0_role" "citizen" {
    name        = "Citizen"
    description = "Regular Springfield citizen"
  }

  resource "auth0_role" "admin" {
    name        = "Admin"
    description = "Springfield administrator"
  }


resource "auth0_role_permissions" "citizen_permissions" {
    role_id = auth0_role.citizen.id

    permissions {
        resource_server_identifier = var.springfield_api_identifier
        name                       = "read:profile"
    }

    permissions {
        resource_server_identifier = var.springfield_api_identifier
        name                       = "update:profile"
    }

    depends_on = [var.springfield_api_scopes_id]
}

# Admin role gets all permissions
resource "auth0_role_permissions" "admin_permissions" {
role_id = auth0_role.admin.id

permissions {
    resource_server_identifier = var.springfield_api_identifier
    name                       = "read:profile"
}

permissions {
    resource_server_identifier = var.springfield_api_identifier
    name                       = "update:profile"
}

permissions {
    resource_server_identifier = var.springfield_api_identifier
    name                       = "admin:all"
}

depends_on = [var.springfield_api_scopes_id]
}

