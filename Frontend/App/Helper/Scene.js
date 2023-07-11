class Scene {
    constructor(AddScenetoConfig, UpdateSceneConfig, DeleteSceneConfig, RenderDeviceScenePage){
        this._AddScenetoConfig = AddScenetoConfig
        this._UpdateSceneConfig = UpdateSceneConfig
        this._DeleteSceneConfig = DeleteSceneConfig
        this._RenderDeviceScenePage = RenderDeviceScenePage
        this._InitVanne = {"Vanne":1,"Duree":1}
        this._VanneInScene = null
    }

    RenderAddModScene(DivApp, Scene = {"Name" : "", "Sequence" : [this._VanneInScene]}){
        // Clear view
        DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Add Scene", null, "Titre", null))
        // Name
        Conteneur.appendChild(NanoXBuild.InputWithLabel("Largeur InputWithLabelBox", "Nom scene:", "Text", "SceneName", Scene.Name, "Input Text", "text", "Name", null, true))
        // ToDo add vanne
        this._VanneInScene = Scene.Sequence
        

        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red; margin: 1rem;")
        Conteneur.appendChild(TextError)
        // Add button controle
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        if (Scene.Name == ""){
            DivButton.appendChild(NanoXBuild.Button("Add", this.ClickAddUpdateConfig.bind(this, true, TextError), "Add", "Button Text WidthButton1", null))
        } else {
            DivButton.appendChild(NanoXBuild.Button("Update", this.ClickAddUpdateConfig.bind(this, false, TextError, Scene), "Update", "Button Text WidthButton1", null))
        }
        DivButton.appendChild(NanoXBuild.Button("Cancel", this._RenderDeviceScenePage, "Cancel", "Button Text WidthButton1", null))
        if (Scene.Name != ""){
            DivButton.appendChild(NanoXBuild.Button("Delete Scene", this.DeleteScene.bind(this, Scene), "Delete", "Button Text WidthButton1", null))
        }
        Conteneur.appendChild(DivButton)

        // add conteneur to divapp
        DivApp.appendChild(Conteneur) 
    }

    ClickAddUpdateConfig(IsAdd, TextError, Scene = null){
        let Name = document.getElementById("SceneName").value
        // Verifier si les donnees input sont differentes de vide
        if(Name != ""){
            if (IsAdd){
                let Scene = {"Name" : Name, "Sequence" : this._VanneInScene}
                this._AddScenetoConfig(Scene)
            } else {
                Scene.Name = Name
                Scene.Sequence = this._VanneInScene
                this._UpdateSceneConfig()
            }
            
        } else {
            TextError.innerText = "Empty value!"
        }
    }

    DeleteScene(Scene){
        if (confirm("Delete Scene") == true) {
            this._DeleteSceneConfig(Scene)
          }
    }
}