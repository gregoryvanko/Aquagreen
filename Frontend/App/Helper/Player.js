class Player {
    constructor(DivApp, PlayerActionCmd, RenderDeviceStartPage){
        this._DivApp = DivApp
        this._PlayerActionCmd = PlayerActionCmd
        this._RenderDeviceStartPage = RenderDeviceStartPage

        this._IdPlayerConteneur = "PlayerConteneur"
        this._IdProgressRing = "ProgressRing"
        this._IdDureeTexte = "DureeTexte"
        this._IdDureeInitTexte = "DureeInitTexte"
        this._IdNbCurrentVanne = "NbCurrentVanne"
        this._IdCurrentVanneName = "CurrentVanneName"
        this._IdCurrentVanneAction = "CurrentVanneAction"
        this._IdProgressBar = "ProgressBar"
        this._IdPlayButton = "PlayButton"
        
        this._Playing = false
        this._CurrentSatatusAction = null
    }

    Show(Data, DeviceConfig){
        // Set Data
        this._CurrentSatatusAction = Data.CurrentAction
        let CalcProgressTotal = null
        if(Data.DureeDone < Data.DureeInitTotal){
            CalcProgressTotal =Math.floor((Data.DureeDone / (Data.DureeInitTotal -1)) * 100)
        } else {
            CalcProgressTotal = 100
        }
        let DureeInitTexte = this.DureetoText(Data.DureeInitTotal -1)
        let DureeTexte = this.DureetoText(Data.DureeDone)
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
            // Update duree texte
            document.getElementById(this._IdDureeTexte).innerText = DureeTexte
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
            if (this._CurrentSatatusAction == "Play"){
                // Change button to pause
                document.getElementById(this._IdPlayButton).innerHTML = "Pause"
                // Change color of player conteneur
                document.getElementById(this._IdPlayerConteneur).style.backgroundColor = "white"
            } else if (this._CurrentSatatusAction == "Pause"){
                // Change button to pause
                document.getElementById(this._IdPlayButton).innerHTML = "Play"
                // Change color of player conteneur
                document.getElementById(this._IdPlayerConteneur).style.backgroundColor = "#d9cfcf"
            } else if (this._CurrentSatatusAction == "Stop"){
                // Playing = false
                this._Playing = false
                this._RenderDeviceStartPage()
            } else if (this._CurrentSatatusAction == "End"){
                // Playing = false
                this._Playing = false
                this._RenderDeviceStartPage()
            } else {
                console.error("Action not found: " + this._CurrentSatatusAction)
            }
        } else { // Creation du palyer
            // Clear view
            this._DivApp.innerHTML = ""
            // Get App color
            let AppColor = getComputedStyle(document.documentElement).getPropertyValue('--NanoX-appcolor')
            // Conteneur
            let Conteneur = NanoXBuild.DivFlexColumn(this._IdPlayerConteneur, "Largeur", "border-radius: 1rem;")
            // Espace vide
            Conteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
            // progresssion totale
            Conteneur.appendChild(NanoXBuild.ProgressRing({Id:this._IdProgressRing, ProgressColor: AppColor, FillColor : "black", TextColor : AppColor, TextFontSize : "2rem", Progress : CalcProgressTotal, Progressheight : 10, ProgressheightMobile : null, Radius : 100, RadiusMobile : null}))
            // Texte temps
            let DivTextTemps = NanoXBuild.Div(null, null, "display: -webkit-flex; display: flex; flex-direction: row; justify-content:center; align-content:center; align-items: center; flex-wrap: wrap; margin-top: 0.5rem;")
            DivTextTemps.appendChild(NanoXBuild.DivText(DureeTexte, this._IdDureeTexte, "Text", "margin-right: 0.5rem;"))
            DivTextTemps.appendChild(NanoXBuild.DivText("/", null, "Text", null))
            DivTextTemps.appendChild(NanoXBuild.DivText(DureeInitTexte, this._IdDureeInitTexte, "Text", "margin-left: 0.5rem;"))
            Conteneur.appendChild(DivTextTemps)
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
            ProgressBar.setAttribute("Style", "margin-top: 0.5rem; width: 90%;")
            Conteneur.appendChild(ProgressBar)
            // Espace vide
            Conteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
            // Add button
            let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
            DivButton.appendChild(NanoXBuild.Button("Pause", this.ClickPlayPause.bind(this), this._IdPlayButton, "Button Text WidthButton1", null))
            DivButton.appendChild(NanoXBuild.Button("Stop", this.ClickStop.bind(this), "stop", "Button Text WidthButton1", null))
            Conteneur.appendChild(DivButton)
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

    ClickPlayPause(){
        if (this._CurrentSatatusAction == "Play"){
            this._PlayerActionCmd("Pause")
        } else {
            this._PlayerActionCmd("Play")
        }
    }

    ClickStop(){
        this._PlayerActionCmd("Stop")
    }

    DureetoText(DureeSeconde){
        const hours = Math.floor(DureeSeconde / 3600);
        DureeSeconde = DureeSeconde - hours * 3600;
        const minutes = Math.floor(DureeSeconde / 60)
        const seconds = DureeSeconde - (minutes * 60)
        return hours + "h" + minutes + "m" + seconds + "s"
    }
}