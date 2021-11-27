# How to run mariadb using docker

docker run -d --env MARIADB_ROOT_PASSWORD=password --env MARIADB_DATABASE=crowdcheck -p 3306:3306 mariadb:10.5
