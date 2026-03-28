
resource "auth0_user" "homer" {
  email           = "homer@simpson.com"
  password        = "Doh123456!"
  connection_name = "Username-Password-Authentication"
}

resource "auth0_user" "wiggum" {
  email           = "chief@springfield.gov"
  password        = "Police123!"
  connection_name = "Username-Password-Authentication"
}

#Le best practice serais d'assigner le role a un groupe, pour la demo on assigne manuellement
resource "auth0_user_roles" "homer_roles" {
  user_id = auth0_user.homer.id
  roles   = [var.citizen_role_id]
}

resource "auth0_user_roles" "wiggum_roles" {
  user_id = auth0_user.wiggum.id
  roles   = [var.admin_role_id]
}

