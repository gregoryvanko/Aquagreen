class ElectrovanneConfig {
    constructor(UpdateElectrovannesConfig, RenderDeviceElectrovannePage){
        this._UpdateElectrovannesConfig = UpdateElectrovannesConfig
        this._RenderDeviceElectrovannePage = RenderDeviceElectrovannePage
    }

    Render(DivApp, Electrovanne){
        // Clear view
        DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Configuration", null, "Titre", null))
        // Name
        Conteneur.appendChild(NanoXBuild.InputWithLabel("Largeur", "Nom:", "Text", "ElectroName", Electrovanne.Name, "Input Text", "text", "Name", null, true))
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red; margin: 1rem;")
        Conteneur.appendChild(TextError)
        // Add button controle
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        DivButton.appendChild(NanoXBuild.Button("Update", this.ClickUpdate.bind(this, Electrovanne, TextError), "Update", "Button Text WidthButton1", null))
        DivButton.appendChild(NanoXBuild.Button("Cancel", this._RenderDeviceElectrovannePage, "Cancel", "Button Text WidthButton1", null))
        Conteneur.appendChild(DivButton)
        // add conteneur to divapp
        DivApp.appendChild(Conteneur) 
    }

    ClickUpdate(Electrovanne, TextError){
        let Name = document.getElementById("ElectroName").value
        // Verifier si les donnees input sont differentes de vide
        if(Name != ""){
            // Modify Electrovanne config
            Electrovanne.Name = Name 
            this._UpdateElectrovannesConfig()
        } else {
            TextError.innerText = "Empty value!"
        }
    }
}