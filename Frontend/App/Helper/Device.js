class Device {

    static async GetDevice(){
        return new Promise ((resolve, reject) => {
            NanoXApiGet("/device/", null).then((reponse)=>{
                resolve(reponse)
            },(erreur)=>{
                reject(erreur)
            })
        } )
    }

    static RenderDeviceInfo(AddDevice){
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Add your first device", null, "Titre", null))
        // Device Name
        let DeviceName = NanoXBuild.Input("", "text", "DeviceName", "Device Name", "DeviceName", "Input Text", "max-width: 400px; width: 90%;")
        Conteneur.appendChild(DeviceName)
        // Device ID
        let DeviceId = NanoXBuild.Input("", "text", "DeviceId", "Device Id", "DeviceId", "Input Text", "max-width: 400px; width: 90%;")
        Conteneur.appendChild(DeviceId)
        // Text error
        let TextError = NanoXBuild.DivText("", null, "Text", "color: red;")
        Conteneur.appendChild(TextError)
        // Add device button
        Conteneur.appendChild(NanoXBuild.Button("Add Device", 
            ()=>{
                TextError.innerText = ""
                if((DeviceName.value != "") && (DeviceId.value != "")){
                    AddDevice({"Name":DeviceName.value, "Id":DeviceId.value})
                } else {
                    TextError.innerText = "Empty value!"
                } 
            }, 
            "AddDevice", "Button Text", null))

        return Conteneur
    }

    static RenderDevice(Devices){
        console.log(Devices)
    }

    static async SaveDevice(Parametres){
        return new Promise ((resolve, reject) => {
            // ToDo
            
            // NanoXApiGet("/device/", null).then((reponse)=>{
            //     resolve(reponse)
            // },(erreur)=>{
            //     reject(erreur)
            // })
            resolve("ok")
        } )
    }
}