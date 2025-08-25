# Aquagreen
A Node.js application for managing your garden

## Installation
First, install the package using npm:
```bash
npm install @gregvanko/aquagreen --save
```

## Usage
Create a file "App.js" with this content:
```js
const Option = {
    Port:9000,
    Name:"Aquagreen",
    Debug: false,
    SplashScreenFilePath: __dirname + "/SplashScreen.html"
}
require('@gregvanko/aquagreen').Start(Option)
```

It is possible to start the application with default values (Port=9000, Name=Aquagreen, Debug=false, SplashScreenFilePath= default splach screen):
```js
require('@gregvanko/aquagreen').Start()
```

## Env variable
PORT and MONGOURL are available as env variables.

## Docker installation
docker-compose.yml
```
services:
  aquagreen:
    container_name: aquagreen
    image : gregoryvanko/aquagreen
    ports:
      - 9999:9999
    networks:
      - frontend
    environment:
      - MONGOURL=mongodb://mongo:27017

networks:
  frontend:
    external: true
```