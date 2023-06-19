class Player {
    constructor(DivApp){
        this._DivApp = DivApp
        
        this._Playing = false
    }

    Show(Data){
        console.log(Data)
        if (this._Playing){
            // Update des valeur
            if (Data.CurrentAction == "Play"){
                // ToDo
            } else if (Data.CurrentAction == "Pause"){
                // ToDo
            } else if (Data.CurrentAction == "Stop"){
                // ToDo
            } else {
                console.error("Action not found: " + Data.CurrentAction)
            }
            // ToDo
        } else {
            // Creation du palyer
            // Clear view
            this._DivApp.innerHTML = ""
            // Conteneur
            let Conteneur = NanoXBuild.DivFlexColumn("PlayerConteneur", "Largeur", null)
            // ToDo

            // Add conteneur
            this._DivApp.appendChild(Conteneur)
        }
    }
}