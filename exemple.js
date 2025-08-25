const Option = {
    Port:9999,
    Name:"Aquagreen",
    Debug: false,
    SplashScreenFilePath: __dirname + "/Frontend/SplashScreen/SplashScreen.html",
    MongoDbUrl: "mongodb://mongo:27017"
}
require('./index').Start(Option)