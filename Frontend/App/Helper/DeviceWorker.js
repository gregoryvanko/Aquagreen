class DeviceWorker {
    constructor(Div, DisplayError, Device, LoadStartView){
        this._DivApp = Div
        this._DisplayError = DisplayError
        this._Device = Device
        this._LoadStartView = LoadStartView

        // https://www.emqx.com/en/blog/mqtt-js-tutorial
        this._MqttUrl = 'wss://mosquitto.vanko.be:443'
        this._MqttOptions = {
            clean: true,
            connectTimeout: 4000,
            username: 'gregory',
            password: 'gregory'
        }
        this._MqttClient = null
        this._MqttFristConnection = true

        // Topic pour recevoir le statu du device
        this._TopicStatus = this._Device.DeviceId + '/status'
        // Topic pour envoyer une demande de confiiguration du device
        this._TopicConfigReq = this._Device.DeviceId + '/config/req' 
        // Topic pour recevoir la configuration du device
        this._TopicConfigRes = this._Device.DeviceId + '/config/res' 
        // Topic pour demander un update de la config
        this._TopicConfigUpdateReq = this._Device.DeviceId + '/config/update/req' 
        // Topic pour revecoir la reponse d'un update de la config
        this._TopicConfigUpdateRes = this._Device.DeviceId + '/config/update/res' 

        // Constante
        this._ConstSaveElectrovanne = "SaveElectrovanne"

        // Configuration du device
        this._DeviceConfig = null

        // Config pour les electrovanne
        this._ElectrovanneConfig = new ElectrovanneConfig(this._DivApp, this.UpdateElectrovannesConfig.bind(this), this.RenderDeviceElectrovannePage.bind(this))

        // Connection à MQTT et souscription aux topics
        this.MqttConnection()
    }

    // Connection à MQTT et souscription aux topics
    MqttConnection(){
        let me = this
        this._MqttClient  = mqtt.connect(this._MqttUrl, this._MqttOptions)
        this._MqttClient.on('connect', () => {
            console.log('Mqtt Connected')
            // Subscribe to topics
            this._MqttClient.subscribe( [me._TopicConfigRes, me._TopicConfigUpdateRes ],(err) => {
                if (err) {
                    me._DisplayError(err)
                } else {
                    if(me._MqttFristConnection){
                        me._MqttFristConnection = false 
                        me.Start()
                    }
                }
            })
        })

        this._MqttClient.on('reconnect', () => {
            console.log('Reconnecting...')
        })

        this._MqttClient.on('close', () => {
            console.log('Disconnected')
        })

        this._MqttClient.on('disconnect', (packet) => {
            console.log(packet)
        })

        this._MqttClient.on('offline', () => {
            console.log('offline')
        })

        this._MqttClient.on('error', (error) => {
            me._DisplayError(error)
        })

        this._MqttClient.on('message', (topic, payload, packet) => {
            me.OnMessage(topic, JSON.parse(payload.toString()))
        })
    }

    // Start de l'application
    Start(){
        let me = this
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.BackToStartPage.bind(this))
        // Clear view
        this._DivApp.innerHTML = ""
        // Add texte
        this._DivApp.appendChild(NanoXBuild.DivText("Get configuration from device", null, "Texte", "margin: 1rem;"))
        // Publish a message on the topic 'TopicConfigReq'
        this._MqttClient.publish(this._TopicConfigReq, "true", { qos: 0, retain: true }, (error) => {
            if (error) {
                me._DisplayError(error)
            }
        })
    }

    // Reception des message sur les topics souscrits
    OnMessage(Topic, Payload){
        switch (Topic) {
            case this._TopicConfigRes:
                // Save Config
                this._DeviceConfig = Payload
                // Set device start page
                this.RenderDeviceStartPage()
                // Delete persistant msg
                this._MqttClient.publish(this._TopicConfigReq, "", { qos: 0, retain: true })
                break;
            
            case this._TopicConfigUpdateRes:
                if (Payload.Reponse == this._ConstSaveElectrovanne){
                    this.RenderDeviceElectrovannePage()
                } else {
                    this._DisplayError("Error return by device when saving the new config: " + Payload.Reponse)
                }
                // Delete persistant msg
                this._MqttClient.publish(this._TopicConfigUpdateReq, "", { qos: 0, retain: true })
                break;
        
            default:
                this._DisplayError(`Topic not found: ${Topic}, Message: ${Payload}`)
                break;
        }
    }

    // Affiche la start page du device
    RenderDeviceStartPage(){
        // Clear view
        this._DivApp.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.BackToStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText(this._Device.DeviceName, null, "Titre", null))
        // Boutton Electrovannes
        let ConteneurElectrovanne = NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice Largeur", null)
        ConteneurElectrovanne.appendChild(NanoXBuild.DivText("Electrovannes", null, "Text", ""))
        ConteneurElectrovanne.onclick = this.RenderDeviceElectrovannePage.bind(this)
        Conteneur.appendChild(ConteneurElectrovanne)
        // Boutton Scenes
        let ConteneurSecene= NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice Largeur", null)
        ConteneurSecene.appendChild(NanoXBuild.DivText("Scenes", null, "Text", ""))
        ConteneurSecene.onclick = this.RenderDeviceScenePage.bind(this)
        Conteneur.appendChild(ConteneurSecene)
        // add conteneur to divapp
        this._DivApp.appendChild(Conteneur) 
    }

    // Clear all data and go back to start page
    BackToStartPage(){
        this._MqttClient.end()
        this._MqttClient = null
        this._LoadStartView()
    }

    // afficher la page Electrovanne
    RenderDeviceElectrovannePage(){
        // Clear view
        this._DivApp.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.RenderDeviceStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Electrovannes", null, "Titre", null))
        // Add all electrovanne
        this._DeviceConfig.Electrovannes.forEach(Electrovanne => {
            Conteneur.appendChild(this.RenderButtonAction(Electrovanne.Name, this.ClickOnElectrovanne.bind(this, Electrovanne.Id), this.ClickOnTreeDotsElectrovanne.bind(this, Electrovanne)))
        });
        // add conteneur to divapp
        this._DivApp.appendChild(Conteneur) 
    }

    // afficher la page Scene
    RenderDeviceScenePage(){
        // Clear view
        this._DivApp.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.RenderDeviceStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Scenes", null, "Titre", null))
        // Add all scenes
        if (this._DeviceConfig.Scenes.length != 0){
            this._DeviceConfig.Scenes.forEach(Scene => {
                Conteneur.appendChild(this.RenderButtonAction(Scene.Name, this.ClickOnScene.bind(this, Scene.Id), this.ClickOnTreeDotsScene.bind(this, Scene.Id)))
            });
        } else {
            Conteneur.appendChild(NanoXBuild.DivText("No scene defined", null, "Text", ""))
        }
        // Button Add Scene
        Conteneur.appendChild(NanoXBuild.Button("Add Scene", this.ClickOnAddScene.bind(this), "addscene", "Button Text", "margin-top: 3rem;"))
        // add conteneur to divapp
        this._DivApp.appendChild(Conteneur) 
    }

    // Boutton pour les Electrovanne et les scenes
    RenderButtonAction(Name = null, Action = null, TreeDotsAction = null){
        let Conteneur= NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice Largeur", null)
        let DivDevice = NanoXBuild.DivFlexRowStart(null, "DeviceCard", null)
        //let DivImage = NanoXBuild.DivFlexColumn(null, null, "height: 100%; width: 20%; margin-right: 0.5rem;")
        //DivImage.innerHTML = IconModule.Start()
        //DivDevice.appendChild(DivImage)
        DivDevice.appendChild(NanoXBuild.DivText(Name, null, "Text", ""))
        DivDevice.onclick = Action
        Conteneur.appendChild(DivDevice)
        // Div Trois points
        let DivTroisPoints = NanoXBuild.DivFlexRowStart(null, "DeviceTroisPoints", null)
        let DivImageTroisPoints = NanoXBuild.DivFlexColumn(null, null, "height: 100%; width: 100%;")
        DivImageTroisPoints.innerHTML = IconModule.ThreeDots()
        DivTroisPoints.appendChild(DivImageTroisPoints)
        DivTroisPoints.onclick = TreeDotsAction
        Conteneur.appendChild(DivTroisPoints)
        return Conteneur
    }

    // Click on Electrovanne Action
    ClickOnElectrovanne(Id){
        alert("Action: " +Id)
        // ToDo
    }

    // Click on Electrovanne TreeDots
    ClickOnTreeDotsElectrovanne(Electrovanne){
        // Load Electrovanne Config
        this._ElectrovanneConfig.Render(Electrovanne)
    }

    // Update the config with the new Electrovanne
    UpdateElectrovannesConfig(){
        // L'éléctrovanne a ete passée en ref, this._DeviceConfig a donc été updaté automatiquement
        // Clear view
        this._DivApp.innerHTML = ""
        // Add texte
        this._DivApp.appendChild(NanoXBuild.DivText("Save config to device", null, "Texte", "margin: 1rem;"))
        // Publish a message on the topic 'TopicConfigUpdateReq'
        let Updatemsg = {"Action" : this._ConstSaveElectrovanne, "Config": this._DeviceConfig}
        this._MqttClient.publish(this._TopicConfigUpdateReq, JSON.stringify(Updatemsg), { qos: 0, retain: true } , (error) => {
            if (error) {
                me._DisplayError(error)
            }
        })
    }

    // Click on Scene Action
    ClickOnScene(Id){
        alert("Treedots: " +Id)
        // ToDo
    }

    // Click on Scene TreeDots
    ClickOnTreeDotsScene(Id){
        alert("Treedots: " +Id)
        // ToDo
    }

    // Click on Add Scene
    ClickOnAddScene(){
        alert("Add Scene")
        // ToDo
    }

    // Clear MenuButton
    ClearMenuButton(){
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // clear menu button setttings
        NanoXClearMenuButtonSettings()
    }
}