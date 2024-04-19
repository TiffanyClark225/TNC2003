mkdir EE576
cd EE576
mkdir web-server
cd web-server

npm init -y
npm install express morgan winston


docker compose up

docker build -t web-server .
docker run -p 80:80 web-server
