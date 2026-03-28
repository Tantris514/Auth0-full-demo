terraform {
    required_providers {
        auth0 = {
            source  = "auth0/auth0"
            version = "~> 1.0"
        }
    }
}


provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
}

module "API" {
    source =  "./modules/api"
}

module "apps" {
    source =  "./modules/apps"
}

module "roles" {
    source =  "./modules/roles"
    springfield_api_identifier = module.API.springfield_api_identifier
    springfield_api_scopes_id = module.API.springfield_api_scopes_id
}

module "users" {
    source =  "./modules/users"
    citizen_role_id = module.roles.citizen_role_id
    admin_role_id = module.roles.admin_role_id
}