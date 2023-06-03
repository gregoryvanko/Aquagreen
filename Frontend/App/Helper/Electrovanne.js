class Electrovanne {
    constructor(UpdateElectrovannesConfig, ElectrovannesPlay, RenderDeviceElectrovannePage){
        this._UpdateElectrovannesConfig = UpdateElectrovannesConfig
        this._ElectrovannesPlay = ElectrovannesPlay
        this._RenderDeviceElectrovannePage = RenderDeviceElectrovannePage
    }

    RenderConfig(DivApp, Electrovanne){
        // Clear view
        DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Configuration", null, "Titre", null))
        // Name
        Conteneur.appendChild(NanoXBuild.InputWithLabel("Largeur InputWithLabelBox", "Nom:", "Text", "ElectroName", Electrovanne.Name, "Input Text", "text", "Name", null, true))
        // Defaut Duree
        Conteneur.appendChild(NanoXBuild.InputWithLabel("Largeur InputWithLabelBox", "Duree:", "Text", "ElectroDefautDuree", Electrovanne.DefautDuree, "Input Text", "number", "Duree", null, true))
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red; margin: 1rem;")
        Conteneur.appendChild(TextError)
        // Add button controle
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        DivButton.appendChild(NanoXBuild.Button("Update", this.ClickUpdateConfig.bind(this, Electrovanne, TextError), "Update", "Button Text WidthButton1", null))
        DivButton.appendChild(NanoXBuild.Button("Cancel", this._RenderDeviceElectrovannePage, "Cancel", "Button Text WidthButton1", null))
        Conteneur.appendChild(DivButton)
        // add conteneur to divapp
        DivApp.appendChild(Conteneur) 
    }

    ClickUpdateConfig(Electrovanne, TextError){
        let Name = document.getElementById("ElectroName").value
        let DefautDuree = document.getElementById("ElectroDefautDuree").value
        // Verifier si les donnees input sont differentes de vide
        if((Name != "") && (DefautDuree != "")){
            // Modify Electrovanne config
            Electrovanne.Name = Name 
            Electrovanne.DefautDuree = DefautDuree 
            this._UpdateElectrovannesConfig()
        } else {
            TextError.innerText = "Empty value!"
        }
    }

    RenderPlay(DivApp, Electrovanne){
        // Clear view
        DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText(Electrovanne.Name, null, "Titre", null))
        // Duree
        Conteneur.appendChild(NanoXBuild.Input(Electrovanne.DefautDuree, "number", "Duree", "Duree", "Duree", "Largeur Input Text", null))
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red; margin: 1rem;")
        Conteneur.appendChild(TextError)
        // Add button controle
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        DivButton.appendChild(NanoXBuild.Button("Play", this.ClickPlay.bind(this, Electrovanne.Id, Electrovanne.Name, TextError), "Update", "Button Text WidthButton1", null))
        DivButton.appendChild(NanoXBuild.Button("Cancel", this._RenderDeviceElectrovannePage, "Cancel", "Button Text WidthButton1", null))
        Conteneur.appendChild(DivButton)
        // add conteneur to divapp
        DivApp.appendChild(Conteneur) 
    }

    ClickPlay(Id, Name, TextError){
        let Duree = document.getElementById("Duree").value
        // Verifier si les donnees input sont differentes de vide
        if(Duree != ""){
            this._ElectrovannesPlay(Id, Name, Duree)
        } else {
            TextError.innerText = "Empty value!"
        }
    }
}