async function Start({Port = 9000, Name = "Aquagreen",  Debug = false, SplashScreenFilePath = null, MongoDbUrl = "mongodb://localhost:27017"} = {}){
    // Define default SplashScreenFilePath
    if (SplashScreenFilePath == null){SplashScreenFilePath = __dirname + "/Frontend/SplashScreen/SplashScreen.html"}

    // NonoX Option
    const OptionNanoX = {
        AppName: Name,
        AppColor: "rgb(20, 163, 255)",
        AppPort: Port,
        AppSecret: "TestNonoXSecret",
        MongoUrl: MongoDbUrl,
        Debug: Debug,
        IconPath:  __dirname + "/Backend/Icon/apple-icon-192x192.png",
        ApiServer: true,
        AllowSignUp: false,
        AppPath: "",
        NanoXAppOption : {
            SplashScreen : GetSplashScreen(SplashScreenFilePath),
            SplashScreenBackgroundColor : "black",
            ShowMenuBar: true,
            MenuBarIstransparent: false,
            ShowNameInMenuBar: true,
            //CssClassForName: "TestClassName",
            ColorMenuBar: "white",
            ColorIconMenuBar: "black",
            HeightMenuBar: "3rem",
            AppFolderClient: __dirname + "/Frontend/App",
            //AppFolderAdmin: __dirname + "/Frontend/Admin",
            UseAppModule: true
        }
    }

    // Initiation de NanoX
    require("@gregvanko/nanox").NanoXInitiation(OptionNanoX)

    // Code a jouter pour créer les routes de l’application

    // Start NanoX
    await require("@gregvanko/nanox").NanoXStart()
}

function GetSplashScreen(FilePath){
    const fs = require('fs')
    const path = require('path')

    var dir = path.resolve(FilePath)
    let HtmlString = null
    if (fs.existsSync(dir)){
        HtmlString = fs.readFileSync(FilePath, 'utf8')
        HtmlString = HtmlString.replace(/\r?\n|\r/g, " ")
        return HtmlString
    } else {
        console.log("SplashScreen file not found: " + FilePath)
        return HtmlString
    }
}

module.exports.Start = Start