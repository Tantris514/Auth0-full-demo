curl --request POST \
  --url https://dev-6ysi0lcrczy3s2qd.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"C68iuLA88URDQbPEOXNiYTMgiIa55pMk",
    "client_secret":"eauqO-qhG0CjT_xMMmrNOnddgou6Ehq_vfeGODDRdbUu-pJ7F5a2f6SDIh8PxueL",
    "audience":"https://validation/api",
    "grant_type":"client_credentials"
  }'