class DeviceManagement {
    constructor(Div, DisplayError, ClickOnDevice){
        this._DivApp = Div
        this._DisplayError = DisplayError
        this._ClickOnDevice = ClickOnDevice
    }

    // Get All Device of the user
    GetDevice(){
        this._DivApp.innerHTML=""
        this._DivApp.appendChild(NanoXBuild.DivText("Get your device", null, "Text", "margin-top: 1rem;"))
        NanoXApiGet("/device/", null).then((reponse)=>{
            // si il n'y a pas de device pour le user
            if (reponse.length == 0){
                // Afficher les information pour ajouter un device
                this.RenderDeviceInfo()
            } else {
                // Affichier les devices
                this.RenderAllDevices(reponse)
            }
        },(erreur)=>{
            this._DisplayError(erreur)
        })
    }

    // Render device information 
    RenderDeviceInfo(Update = false, MyDeviceName= "", MyDeviceId = "", MyId = ""){
        // Clear view
        this._DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        if (Update){
            Conteneur.appendChild(NanoXBuild.DivText("Update your device", null, "Titre", null))
        } else {
            Conteneur.appendChild(NanoXBuild.DivText("Add your device", null, "Titre", null))
        }
        // Device Name
        let DeviceName = NanoXBuild.Input(MyDeviceName, "text", "DeviceName", "Device Name", "DeviceName", "Input Text", "max-width: 400px; width: 90%;")
        DeviceName.autocomplete = "off"
        Conteneur.appendChild(DeviceName)
        // Device ID
        let DeviceId = NanoXBuild.Input(MyDeviceId, "text", "DeviceId", "Device Id", "DeviceId", "Input Text", "max-width: 400px; width: 90%;")
        DeviceId.autocomplete = "off"
        Conteneur.appendChild(DeviceId)
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red;")
        Conteneur.appendChild(TextError)
        // Add device button
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, null, "max-width: 400px; width: 90%;")
        if (Update){
            Conteneur.appendChild(NanoXBuild.Button("Delete Device", this.ClickDeleteDevice.bind(this, DeviceName.value, MyId), "deleteDevice", "Button Text", "color: red; border-color: red;"))
            DivButton.appendChild(NanoXBuild.Button("Update Device", this.ClickUpdateDevice.bind(this, DeviceName, DeviceId, TextError, MyId), "AddDevice", "Button Text", "width: 44%;"))
            DivButton.appendChild(NanoXBuild.Button("Cancel", this.GetDevice.bind(this), "Cancel", "Button Text", "width: 44%;"))
        } else {
            DivButton.appendChild(NanoXBuild.Button("Add Device", this.ClickAddDevice.bind(this, DeviceName, DeviceId, TextError), "AddDevice", "Button Text", "width: 44%;"))
            DivButton.appendChild(NanoXBuild.Button("Cancel", this.GetDevice.bind(this), "Cancel", "Button Text", "width: 44%;"))
        }
        Conteneur.appendChild(DivButton)
        // add conteneur to divapp
        this._DivApp.appendChild(Conteneur) 
    }

    // Add one device
    ClickAddDevice(DeviceName, DeviceId, TextError){
        // Verifier si les donnees input sont differentes de vide
        if((DeviceName.value != "") && (DeviceId.value != "")){
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(NanoXBuild.DivText("Saving your device...", null, "Text", "margin-top: 1rem;"))
            // Sauver les donnees
            NanoXApiPost("/device/",{"DeviceName": DeviceName.value, "DeviceId": DeviceId.value}, null, null).then((reponse)=>{
                this.GetDevice()
            },(erreur)=>{
                this._DisplayError(erreur)
            })
        } else {
            TextError.innerText = "Empty value!"
        } 
    }

    // Update one device
    ClickUpdateDevice(DeviceName, DeviceId, TextError, MyId){
        // Verifier si les donnees input sont differentes de vide
        if((DeviceName.value != "") && (DeviceId.value != "")){
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(NanoXBuild.DivText("Saving your device...", null, "Text", "margin-top: 1rem;"))
            // Sauver les donnees
            NanoXApiPatch("/device/",{"DeviceName": DeviceName.value, "DeviceId": DeviceId.value, "Id": MyId}, null, null).then((reponse)=>{
                this.GetDevice()
            },(erreur)=>{
                this._DisplayError(erreur)
            })
        } else {
            TextError.innerText = "Empty value!"
        } 
    }

    // Delete one device
    ClickDeleteDevice(DeviceName, MyId){
        if (confirm(`Delete Device: ${DeviceName} ?`) == true) {
            NanoXApiDelete("/device/" + MyId).then((reponse)=>{
                this.GetDevice()
            },(erreur)=>{
                this._DisplayError(erreur)
            })
        }
    }

    // Render all device
    RenderAllDevices(Devices){
        // Clear view
        this._DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Your devices", null, "Titre", null))
        Devices.forEach(element => {
            // Conteneur pour la carte du device est le Div Trois points
            let ConteneurDevice = NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice", null)
            // Carte du device
            let DivDevice = NanoXBuild.DivFlexRowStart(null, "DeviceCard", null)
            let DivImage = NanoXBuild.DivFlexColumn(null, null, "height: 100%; width: 20%; margin-right: 0.5rem;")
            DivImage.innerHTML = IconModule.Start()
            DivDevice.appendChild(DivImage)
            DivDevice.appendChild(NanoXBuild.DivText(element.DeviceName, null, "Text", ""))
            DivDevice.onclick = this.ClickOnDevice.bind(this, element)
            ConteneurDevice.appendChild(DivDevice)
            // Div Trois points
            let DivTroisPoints = NanoXBuild.DivFlexRowStart(null, "DeviceTroisPoints", null)
            let DivImageTroisPoints = NanoXBuild.DivFlexColumn(null, null, "height: 100%; width: 100%;")
            DivImageTroisPoints.innerHTML = IconModule.ThreeDots()
            DivTroisPoints.appendChild(DivImageTroisPoints)
            DivTroisPoints.onclick = this.RenderDeviceInfo.bind(this, true, element.DeviceName, element.DeviceId, element._id)
            ConteneurDevice.appendChild(DivTroisPoints)
            Conteneur.appendChild(ConteneurDevice)
        });
        // Add device button
        Conteneur.appendChild(NanoXBuild.Button("Add Device", this.RenderDeviceInfo.bind(this, false, "", "", ""), "AddOneDevice", "Button Text", null))
        this._DivApp.appendChild(Conteneur)
    }

    // ths fct execute when user click on a device
    ClickOnDevice(Device){
        // Clear view
        this._DivApp.innerHTML = ""
        // Call Callback ClickOnDevice
        this._ClickOnDevice(Device)
    }
}