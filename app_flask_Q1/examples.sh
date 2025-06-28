names=("Homer Simpson" "Marge Simpson" "Bart Simpson" "Lisa Simpson" "Maggie Simpson" "Ned Flanders" "Montgomery Burns" "Waylon Smithers" "Krusty le Clown" "Milhouse Van Houten")
usernames=("homer" "marge" "bart" "lisa" "maggie" "ned" "burns" "smithers" "krusty" "milhouse")


for i in {0..9}
do
    curl -X POST http://localhost:3000/users \
        -H "Content-Type: application/json; charset=utf-8" \
        -H "Authorization: Bearer $token" \
        -d "{\"name\": \"${names[$i]}\", \"username\": \"${usernames[$i]}\"}"
    echo 
done


token="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNJZGZqakZVZ2xTOVVmeHdSU2dkWiJ9.eyJpc3MiOiJodHRwczovL2Rldi02eXNpMGxjcmN6eTNzMnFkLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJDNjhpdUxBODhVUkRRYlBFT1hOaVlUTWdpSWE1NXBNa0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly92YWxpZGF0aW9uL2FwaSIsImlhdCI6MTc1MTA3ODA5MiwiZXhwIjoxNzUxMTY0NDkyLCJzY29wZSI6InJlYWQ6dXNlcnMgd3JpdGU6dXNlcnMgZGVsZXRlOnVzZXJzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiQzY4aXVMQTg4VVJEUWJQRU9YTmlZVE1naUlhNTVwTWsifQ.1wPaFAaYT_j1xOJblR6RohAGX8QOTyvm8Q5SsrlFBT9NtJ8g3UaawbxDwjw_XVSjPhpteojhoznoIHQhcZqPeXg9RwZvv4u1koANfpraiL4RzKutSFDdIk33nCP2nIXKhn-bQ6hKqOZ1MeGyjTIRqiNFyUNXaTL1ix-Aw5BDKruXlO4N6fqkAr_KoVj8BHu9E4O60GB4EsUHDhs7Ylj7A1YbFdTRX5axF-ZRYVMJrRVYLrMjAPicNSyomO57O6ac-PVuOSqgRO1kD8Dubz5bIjdt8uXlKvk-gLc_UDvBvvdBRRFF_h4Oqm3VI-Ds76hRXHjaCcgwDBOccOEq2nOGOQ"

curl -X POST http://localhost:3000/users \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d '{"name": "Alphonse Desjardins", "username": "alph_desj"}'


curl -X GET http://localhost:3000/users \
    -H "Authorization: Bearer $token"

curl -X GET http://localhost:3000/users/0 \
    -H "Authorization: Bearer $token"

curl -X PUT http://localhost:3000/users/0 \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{"name": "Tristan Desjardins"}'

curl -X DELETE http://localhost:3000/users/0 \
    -H "Authorization: Bearer $token"


curl -X GET http://localhost:3000/api/public


curl -X GET http://localhost:3000/api/private \
    -H "Authorization: Bearer $token"