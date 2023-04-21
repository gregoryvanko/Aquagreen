class AquagreenStart {
    constructor(){
        this._DivApp = NanoXGetDivApp()
    }

    Initiation(){
        // Load Start view
        this.LoadStartView()
    }

    LoadStartView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Build Menu Button
        this.BuildMenuButton()

        this._DivApp.innerHTML = "Yes it start"

        // Log serveur load module Blog
        NanoXApiPostLog("Load module Start")
    }

    BuildMenuButton(){
        // Menu bar Translucide
        NanoXSetMenuBarTranslucide(false)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // clear menu button setttings
        NanoXClearMenuButtonSettings()
        // Show name in menu bar
        NanoXShowNameInMenuBar(true)
    }
}

// Creation de l'application
let MyAquagreenStart = new AquagreenStart()
// Ajout de l'application
NanoXAddModule("Start", IconModule.Start(), MyAquagreenStart.Initiation.bind(MyAquagreenStart), true, false)