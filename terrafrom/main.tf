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

module "grants" {
    source =  "./modules/grants"
    client_app_client_id = module.apps.client_app_id
    validation_api_identifier = module.API.validation_api_identifier
}

module "users" {
    source =  "./modules/users"
}