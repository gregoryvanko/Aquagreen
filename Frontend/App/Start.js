class Start {
    constructor(){
        this._DivApp = NanoXGetDivApp()
        this._DeviceManagement = new DeviceManagement(this._DivApp, this.DisplayError.bind(this), this.ClickOnDevice.bind(this))
    }

    Initiation(){
        // Load Start view
        this.LoadStartView()

        // Log serveur load module Blog
        NanoXApiPostLog("Load module Start")
    }

    LoadStartView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Build Menu Button
        this.BuildMenuButton()

        // Get Device form server
        this._DeviceManagement.GetDevice()
    }

    ClickOnDevice(Device){
        let MyDevice = new DeviceWorker(this._DivApp, this.DisplayError.bind(this), Device)
    }

    // Build all Nanox menu Button
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

    // retunr div with error message
    DisplayError(MyError){
        this._DivApp.innerHTML = ""
        let diverror = document.createElement('div')
        diverror.innerHTML = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        this._DivApp.appendChild(diverror)
    }

}

// Creation de l'application
let MyStart = new Start()
// Ajout de l'application
NanoXAddModule("Start", IconModule.Start(), MyStart.Initiation.bind(MyStart), true, false)