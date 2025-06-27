#!/bin/bash

# Tableau des noms et usernames
names=("Homer Simpson" "Marge Simpson" "Bart Simpson" "Lisa Simpson" "Maggie Simpson" "Ned Flanders" "Montgomery Burns" "Waylon Smithers" "Krusty le Clown" "Milhouse Van Houten")
usernames=("homer" "marge" "bart" "lisa" "maggie" "ned" "burns" "smithers" "krusty" "milhouse")


# Boucle de création des utilisateurs
for i in {0..9}
do
    curl -X POST http://localhost:3000/users \
        -H "Content-Type: application/json; charset=utf-8" \
        -d "{\"name\": \"${names[$i]}\", \"username\": \"${usernames[$i]}\"}"
    echo # Saut de ligne pour la lisibilité
done

#examples
# curl -X POST -H "Content-Type: application/json" -d '{"name": "Alphonse Desjardins", "username": "alph_desj"}' http://localhost:3000/users
# curl -X GET http://localhost:3000/users
# curl -X GET http://localhost:3000/users/0
# curl -X PUT -H "Content-Type: application/json" -d '{"name": "GabrielAlphonse Desjardins"}' http://localhost:3000/users/0
# curl -X DELETE http://localhost:3000/users/0