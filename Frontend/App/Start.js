class Start {
    constructor(){
        this._DivApp = NanoXGetDivApp()
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
        this._DivApp.appendChild(NanoXBuild.DivText("Get your device", null, "Text", "margin-top: 1rem;"))

        // Build Menu Button
        this.BuildMenuButton()

        // Get Device form server
        Device.GetDevice().then((reponse)=>{
            this._DivApp.innerHTML=""
            if (reponse.length == 0){
                this._DivApp.appendChild(Device.RenderDeviceInfo(this.AddDevice.bind(this)))
            } else {
                Device.RenderDevice(reponse)
            }
        },(erreur)=>{
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(this.GetDivError(erreur))
        })
    }

    AddDevice(Parametres){
        // Clear view
        this._DivApp.innerHTML=""
        this._DivApp.appendChild(NanoXBuild.DivText("Saving your device...", null, "Text", "margin-top: 1rem;"))

        // Save device to DB
        Device.SaveDevice(Parametres).then((reponse)=>{
            this._DivApp.innerHTML=""
            this.LoadStartView()
        },(erreur)=>{
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(this.GetDivError(erreur))
        })
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
    GetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerHTML = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
    }

}

// Creation de l'application
let MyStart = new Start()
// Ajout de l'application
NanoXAddModule("Start", IconModule.Start(), MyStart.Initiation.bind(MyStart), true, false)