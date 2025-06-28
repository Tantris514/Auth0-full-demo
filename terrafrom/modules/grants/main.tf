resource "auth0_client_grant" "client_app_api_access" {
    client_id = var.client_app_client_id
    audience  = var.validation_api_identifier 

    scopes = [
        "read:users",
        "write:users",
        "delete:users", 
        ]
}