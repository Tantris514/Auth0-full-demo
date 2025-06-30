resource "auth0_user" "admin_user" {
  email      = "admin@blondsecurity.com"
  password   = sensitive("StrongPassword123!")
  connection_name = "Username-Password-Authentication"

  app_metadata = jsonencode({
    role = "admin"
  })

  user_metadata = jsonencode({
    first_name = "Admin",
    last_name  = "User"
  })
}