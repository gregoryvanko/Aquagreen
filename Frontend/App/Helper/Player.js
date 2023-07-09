class Player {
    constructor(DivApp){
        this._DivApp = DivApp

        this._IdProgressRing = "ProgressRing"
        this._IdNbCurrentVanne = "NbCurrentVanne"
        this._IdCurrentVanneName = "CurrentVanneName"
        this._IdCurrentVanneAction = "CurrentVanneAction"
        this._IdProgressBar = "ProgressBar"
        
        this._Playing = false
    }

    Show(Data, DeviceConfig){
        console.log(Data)
        let CalcProgressTotal = null
        if(Data.DureeDone < Data.DureeInitTotal){
            CalcProgressTotal =Math.floor((Data.DureeDone / (Data.DureeInitTotal -1)) * 100)
        } else {
            CalcProgressTotal = 100
        }
        
        let NbVanneInit = Data.NbVannesInit -1
        let NbVanneDonne = Data.NbVannesDone -1
        let CurrentVanneName = null
        let CurrentVanneAction = null
        let CurrentProgressBarAction = null
        if (Data.Sequence.length > 0){
            CurrentVanneName = this.FindVanneName(DeviceConfig, Data.Sequence[0].Vanne)
            CurrentVanneAction = Data.Sequence[0].Action
            CurrentProgressBarAction = Math.floor((Data.Sequence[0].Duree / Data.Sequence[0].DureeInit) * 100)
        }

        if (this._Playing){
            // Update progress ring
            document.getElementById(this._IdProgressRing).setAttribute('progress', CalcProgressTotal)
            // Update du nombre de vanne done
            document.getElementById(this._IdNbCurrentVanne).innerText = NbVanneDonne
            // Update Vanne name et Vanne Action
            if ((CurrentVanneName != null) && (CurrentVanneAction != null)){
                document.getElementById(this._IdCurrentVanneName).innerText = CurrentVanneName
                document.getElementById(this._IdCurrentVanneAction).innerText = CurrentVanneAction
            }
            // Update progress Bar
            if (CurrentProgressBarAction != null){
                document.getElementById(this._IdProgressBar).setAttribute('value', CurrentProgressBarAction)
            }

            // Action
            if (Data.CurrentAction == "Play"){
               // ToDo
            } else if (Data.CurrentAction == "Pause"){
                // ToDo
            } else if (Data.CurrentAction == "Stop"){
                // ToDo
            } else if (Data.CurrentAction == "End"){
                // Playing = true
                this._Playing = false
                // Go To home
            } else {
                console.error("Action not found: " + Data.CurrentAction)
            }
        } else {
            // Creation du palyer
            // Clear view
            this._DivApp.innerHTML = ""
            // Get App color
            let AppColor = getComputedStyle(document.documentElement).getPropertyValue('--NanoX-appcolor')
            // Conteneur
            let Conteneur = NanoXBuild.DivFlexColumn("PlayerConteneur", "Largeur", null)
            // Espace vide
            Conteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
            // progresssion totale
            Conteneur.appendChild(NanoXBuild.ProgressRing({Id:this._IdProgressRing, ProgressColor: AppColor, FillColor : "black", TextColor : AppColor, TextFontSize : "2rem", Progress : CalcProgressTotal, Progressheight : 10, ProgressheightMobile : null, Radius : 100, RadiusMobile : null}))
            // Texte de l'action
            let DivTexteAction = NanoXBuild.Div(null, null, "display: -webkit-flex; display: flex; flex-direction: row; justify-content:center; align-content:center; align-items: center; flex-wrap: wrap; margin-top: 1rem;")
            DivTexteAction.appendChild(NanoXBuild.DivText("Vannes:", null, "Text", null))
            DivTexteAction.appendChild(NanoXBuild.DivText(NbVanneDonne, this._IdNbCurrentVanne, "Text", "margin-left: 1rem;"))
            DivTexteAction.appendChild(NanoXBuild.DivText("/" + NbVanneInit, null, "Text", null))
            Conteneur.appendChild(DivTexteAction)
            // Texte de la vanne
            let DivTextVanne = NanoXBuild.Div(null, null, "display: -webkit-flex; display: flex; flex-direction: row; justify-content:center; align-content:center; align-items: center; flex-wrap: wrap; margin-top: 1rem;")
            DivTextVanne.appendChild(NanoXBuild.DivText(CurrentVanneName, this._IdCurrentVanneName, "Text", null))
            DivTextVanne.appendChild(NanoXBuild.DivText(":", null, "Text", null))
            DivTextVanne.appendChild(NanoXBuild.DivText(CurrentVanneAction, this._IdCurrentVanneAction, "Text", "margin-left: 1rem;"))
            Conteneur.appendChild(DivTextVanne)
            // Progress bar
            let ProgressBar = document.createElement("progress")
            ProgressBar.setAttribute("id", this._IdProgressBar)
            ProgressBar.setAttribute("value", CurrentProgressBarAction)
            ProgressBar.setAttribute("max", 100)
            ProgressBar.setAttribute("Style", "margin-top: 0.5rem;")
            Conteneur.appendChild(ProgressBar)
            // Add conteneur
            this._DivApp.appendChild(Conteneur)
            // Playing = true
            this._Playing = true
        }
    }

    FindVanneName(DeviceConfig, IdVanne){
        let Name = "Vanne Name not found"
        DeviceConfig.Electrovannes.forEach(Vanne => {
            if (Vanne.Id == IdVanne){
                Name =  Vanne.Name
            }
        });
        return Name
    }
}