class Scene {
    constructor(AddScenetoConfig, UpdateSceneConfig, DeleteSceneConfig, RenderDeviceScenePage){
        this._AddScenetoConfig = AddScenetoConfig
        this._UpdateSceneConfig = UpdateSceneConfig
        this._DeleteSceneConfig = DeleteSceneConfig
        this._RenderDeviceScenePage = RenderDeviceScenePage
        this._VanneInScene = null
        this._Electrovannes = null

        this._IdConteneurVannesInScene = "ConteneurVannesInScene"
        this._IdInputVanne = "InputVanne"
        this._IdInputVanneName = "InputVanneName"
        this._IdInputVanneDuree = "InputVanneDuree"
    }

    RenderAddModScene(DivApp, Electrovannes, Scene = {"Name" : "", "Sequence" : [{"Vanne":1,"Duree":5}]}){
        this._Electrovannes = Electrovannes
        // Clear view
        DivApp.innerHTML = ""
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Add Scene", null, "Titre", null))
        // Name
        Conteneur.appendChild(NanoXBuild.InputWithLabel("Largeur InputWithLabelBox", "Nom scene:", "Text", "SceneName", Scene.Name, "Input Text", "text", "Name", null, true))
        // Add vanne
        this._VanneInScene = Scene.Sequence
        let ConteneurForScene = NanoXBuild.DivFlexColumn(this._IdConteneurVannesInScene, null, "width: 100%;")
        Conteneur.appendChild(ConteneurForScene)
        this.AddVannesinSceneInConteneur(ConteneurForScene)
        // Add button Add scene
        Conteneur.appendChild(NanoXBuild.Button("Add Vanne", this.ClickAddVanne.bind(this), "AddVanne", "Button Text", null))
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red; margin: 1rem;")
        Conteneur.appendChild(TextError)
        // Add button controle
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        if (Scene.Name == ""){
            DivButton.appendChild(NanoXBuild.Button("Add", this.ClickAddUpdateConfig.bind(this, true, TextError, null), "Add", "Button Text WidthButton1", null))
        } else {
            DivButton.appendChild(NanoXBuild.Button("Update", this.ClickAddUpdateConfig.bind(this, false, TextError, Scene), "Update", "Button Text WidthButton1", null))
        }
        DivButton.appendChild(NanoXBuild.Button("Cancel", this.ClickCancel.bind(this), "Cancel", "Button Text WidthButton1", null))
        if (Scene.Name != ""){
            DivButton.appendChild(NanoXBuild.Button("Delete Scene", this.DeleteScene.bind(this, Scene), "Delete", "Button Text WidthButton1", null))
        }
        Conteneur.appendChild(DivButton)

        // add conteneur to divapp
        DivApp.appendChild(Conteneur) 
    }

    ClickCancel(){
        this._VanneInScene = null
        this._Electrovannes = null
        this._RenderDeviceScenePage()
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

    AddVannesinSceneInConteneur(Conteneur){
        //let me = this
        let ListeOfValue = this.GetListeOfVanne()
        let IndexVanne = 0
        // On efface le conteneur
        Conteneur.innerHTML = ""
        this._VanneInScene.forEach(Vanne => {
            let IdInputVanne = "Input" + IndexVanne
            // Box de la description de la vanne
            let BoxVanneInScene = NanoXBuild.DivFlexRowSpaceBetween(null, "Largeur BoxVanneInScene", "")
            // Selection de la vanne
            let Myinput = NanoXBuild.Input(this.FindVanneName(Vanne.Vanne), "text", this._IdInputVanneName, "Nom", IdInputVanne, "Input Text", "width: 65%; margin: 0rem")
            Myinput.autocomplete = "off"
            Myinput.setAttribute("inputmode","none")
            Myinput.setAttribute ("onfocus" , "this.value = ''; ")
            BoxVanneInScene.appendChild(Myinput)
            autocomplete({
                input: Myinput,
                minLength: 0,
                showOnFocus: true,
                //debounceWaitMs: 200,
                emptyMsg: 'No suggestion',
                fetch: function(text, update) {
                    text = text.toLowerCase();
                    var GroupFiltred = ListeOfValue.filter(n => n.toLowerCase().startsWith(text))
                    var suggestions = []
                    GroupFiltred.forEach(element => {
                        var MyObject = new Object()
                        MyObject.label = element
                        suggestions.push(MyObject)
                    });
                    update(suggestions);
                },
                onSelect: function(item) {
                    document.getElementById(IdInputVanne).value = item.label;
                    //let id = parseInt(IdInputVanne.replace('Input', ''))
                    //me._VanneInScene[id].Vanne = me.FindVanneId(item.label)
                },
                customize: function(input, inputRect, container, maxHeight) {
                    container.style.textAlign = "right"
                    if (container.childNodes.length == 1){
                        if (container.childNodes[0].innerText == 'No suggestion'){
                            input.style.backgroundColor = "lightcoral"
                        } else {
                            input.style.backgroundColor = "white"
                        }
                    } else {
                        input.style.backgroundColor = "white"
                    }
                },
                disableAutoSelect: false
            });
            // Selection de la duree
            let InputDuree = NanoXBuild.Input(Vanne.Duree, "number", this._IdInputVanneDuree, "Duree", null, "Input Text", "width: 20%; ; margin: 0rem")
            InputDuree.setAttribute("autocomplete", "off")
            InputDuree.setAttribute("pattern", "[0-9]*")
            BoxVanneInScene.appendChild(InputDuree)
            // Delete button
            let DivBin = NanoXBuild.DivFlexRowStart(null, "DeviceTroisPoints", null)
            let DivImageBin = NanoXBuild.DivFlexColumn(null, null, "height: 100%; width: 100%;")
            DivImageBin.innerHTML = IconModule.Bin()
            DivBin.appendChild(DivImageBin)
            DivBin.onclick = this.DeleteVanneInScene.bind(this, IndexVanne)
            BoxVanneInScene.appendChild(DivBin)
            // Add to conteneur
            Conteneur.appendChild(BoxVanneInScene)
            // Incrementer IndexVanne
            IndexVanne ++
        });
    }

    DeleteVanneInScene(Number){
        if (this._VanneInScene.length > 1){
            this.SaveVanneInScene()
            this._VanneInScene.splice(Number, 1)
            this.AddVannesinSceneInConteneur(document.getElementById(this._IdConteneurVannesInScene))
        } else {
            alert("Error : Min number of vanne is 1")
        }
        
    }

    ClickAddVanne(){
        this.SaveVanneInScene()
        this._VanneInScene.push({"Vanne":1,"Duree":5})
        this.AddVannesinSceneInConteneur(document.getElementById(this._IdConteneurVannesInScene))
    }

    SaveVanneInScene(){
        let Vannes = document.getElementsByName(this._IdInputVanneName)
        Vannes.forEach(OneInputVanne => {
            
        });
    }

    FindVanneName(IdVanne){
        let Name = "Vanne Name not found"
        if (this._Electrovannes != null){
            this._Electrovannes.forEach(Vanne => {
                if (Vanne.Id == IdVanne){
                    Name =  Vanne.Name
                }
            });
        }
        return Name
    }

    FindVanneId(Name){
        let Id = "not found"
        if (this._Electrovannes != null){
            this._Electrovannes.forEach(Vanne => {
                if (Vanne.Name == Name){
                    Id =  Vanne.Id
                }
            });
        }
        return Id
    }

    GetListeOfVanne(){
        let liste = []
        if (this._Electrovannes != null){
            this._Electrovannes.forEach(Vanne => {
                liste.push(Vanne.Name)
            });
        }
        return liste
    }
}