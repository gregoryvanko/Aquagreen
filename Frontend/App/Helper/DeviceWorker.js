class DeviceWorker {
    constructor(Div, DisplayError, Device, LoadStartView){
        this._DivApp = Div
        this._DeviceConteneur = NanoXBuild.DivFlexColumn("DeviceConteneur", null, "width: 100%;")
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

        // Topic pour envoyer une demande de confiiguration du device
        this._TopicConfigReq = this._Device.DeviceId + '/config/req' 
        // Topic pour recevoir la configuration du device
        this._TopicConfigRes = this._Device.DeviceId + '/config/res' 
        // Topic pour demander un update de la config
        this._TopicConfigUpdateReq = this._Device.DeviceId + '/config/update/req' 
        // Topic pour revecoir la reponse d'un update de la config
        this._TopicConfigUpdateRes = this._Device.DeviceId + '/config/update/res' 
        // Topic pour envoyer une demande de statu du mode debug
        this._TopicDebugReq = this._Device.DeviceId + '/debug/req' 
        // Topic pour recevoir le statu du mode debug
        this._TopicDebugRes = this._Device.DeviceId + '/debug/res' 
        // Topic pour demander un update du mode debug
        this._TopicDebugUpdateReq = this._Device.DeviceId + '/debug/update/req' 
        // Topic pour recevoir le statu de la connexion du device
        this._TopicConnectionStatus = this._Device.DeviceId + '/connection/status'
        // Topic pour demander de demarrer une action
        this._TopicActionReq = this._Device.DeviceId + '/action/req'
        // Topic pour recevoir la reponse d'une action
        this._TopicActionRes = this._Device.DeviceId + '/action/res'

        // Constante
        this._ConstSaveElectrovanne = "SaveElectrovanne"
        this._DeviceIconStatusId = "DeviceIconStatusId"
        this._DeviceTitreId = "DeviceTitreId"

        // Configuration du device
        this._DeviceConfig = null
        // Statu de connextion du device
        this._DeviceConnected = null
        // Queue de message a envoyer lorsque le device n'est pas connecté
        this._DeviceMqttQueue = []
        // DebugMode
        this._IsOnDebugMode = false

        // Config pour les electrovanne
        this._Electrovanne = new Electrovanne(this.UpdateConfig.bind(this), this.ElectrovannesPlay.bind(this), this.RenderDeviceElectrovannePage.bind(this))

        // Config pour les scene
        this._Scene = new Scene(this.AddScenetoConfig.bind(this), this.UpdateSceneConfig.bind(this), this.DeleteSceneConfig.bind(this), this.RenderDeviceScenePage.bind(this))

        // Player
        this._Player = new Player(this._DeviceConteneur, this.PlayerActionCmd.bind(this), this.RenderDeviceStartPage.bind(this))

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
            this._MqttClient.subscribe( [me._TopicConfigRes, me._TopicDebugRes, me._TopicConfigUpdateRes, me._TopicConnectionStatus, me._TopicActionRes],(err) => {
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
            if (payload.length == 0){
                me.OnMessage(topic, "")
            } else {
                me.OnMessage(topic, JSON.parse(payload.toString()))
            }
        })
    }

    // Start de l'application
    Start(){
        // Clear view
        this._DivApp.innerHTML = ""
        this._DeviceConteneur.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.BackToStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Espace vide
        Conteneur.appendChild(NanoXBuild.Div(null, null, "height: 1rem;"))
        // Conteneur titre et satatu 
        let ConteneurTitreStatu = NanoXBuild.DivFlexRowSpaceBetween("ConteneurDeviceTitreSatatus", "ConteneurDeviceTitreSatatus Largeur", null)
        Conteneur.appendChild(ConteneurTitreStatu)
        // Titre
        ConteneurTitreStatu.appendChild(NanoXBuild.DivText(this._Device.DeviceName, this._DeviceTitreId, "DeviceTtire", null))
        // Status
        let status = NanoXBuild.Div(this._DeviceIconStatusId, "Dot", null)
        if (this._DeviceConnected == true){
            status.style.backgroundColor = "green"
        } else {
            status.style.backgroundColor = "red"
        }
        status.onclick = this.OnClickDebug.bind(this)
        ConteneurTitreStatu.appendChild(status)
        // add conteneur to divapp
        this._DivApp.appendChild(Conteneur)
        // add ConteneurDevice to divapp
        this._DivApp.appendChild(this._DeviceConteneur)

        // Publish a message on the topic 'TopicConfigReq'
        this.SendMqttMessage(this._TopicConfigReq, "true")
        // Publish a message on the topic 'TopicDebugReq'
        this.SendMqttMessage(this._TopicDebugReq, "true")
        // Set device start page
        this.RenderDeviceStartPage()
    }

    OnClickDebug(){
        if (this._IsOnDebugMode ){
            this._IsOnDebugMode = false
        } else {
            this._IsOnDebugMode = true
        }
        // Publish a message on the topic 'TopicDebugUpdateReq'
        let Updatemsg = {"Debug": this._IsOnDebugMode}
        // Send message
        this.SendMqttMessage(this._TopicDebugUpdateReq, JSON.stringify(Updatemsg))
    }

    // Reception des message sur les topics souscrits
    OnMessage(Topic, Payload){
        switch (Topic) {
            case this._TopicConfigRes:
                // Save Config
                this._DeviceConfig = Payload
                break;
            
            case this._TopicConfigUpdateRes:
                // Save Config
                this._DeviceConfig = Payload
                break;

            case this._TopicDebugRes:
                // Save Debug
                this._IsOnDebugMode = Payload.Debug
                let divtitre = document.getElementById(this._DeviceTitreId)
                if (this._IsOnDebugMode){
                    divtitre.innerText = "Debug: " + this._Device.DeviceName
                    divtitre.style.color = "red"
                } else {
                    divtitre.innerText = this._Device.DeviceName
                    divtitre.style.color = null
                }
                break;
            
            case this._TopicConnectionStatus:
                if (Payload.connection == "on"){
                    // Set DeviceConnected to true
                    this._DeviceConnected = true
                    // change color of status
                    if (document.getElementById(this._DeviceIconStatusId)){
                        document.getElementById(this._DeviceIconStatusId).style.backgroundColor = "green"
                    }
                    // Send message in queue
                    this._DeviceMqttQueue.forEach(Message => {
                        this.SendMqttMessage(Message.Topic, Message.Payload, Message.Option)
                    });
                    // Clear queue
                    this._DeviceMqttQueue = []
                } else {
                    // Set DeviceConnected to false
                    this._DeviceConnected = false
                    // change color of status
                    if (document.getElementById(this._DeviceIconStatusId)){
                        document.getElementById(this._DeviceIconStatusId).style.backgroundColor = "red"
                    }
                }
                break;
            
            case this._TopicActionRes:
                if (Payload != ""){
                    if (this._DeviceConfig != null){
                        this._Player.Show(Payload, this._DeviceConfig.Electrovannes)
                    }
                }
                break;
        
            default:
                this._DisplayError(`Topic not found: ${Topic}, Message: ${Payload}`)
                break;
        }
    }

    // Send MQTT Message or add in queue
    SendMqttMessage( Topic = null, Payload = "", Option = { qos: 0, retain: false }){
        if (Topic != null){
            if (this._DeviceConnected){
                // Si le device est connecté alors on envoie un message
                this._MqttClient.publish(Topic, Payload, Option)
            } else {
                // Si le device n'est pas connecté on ajoute le message à la qeue
                this._DeviceMqttQueue.push({"Topic": Topic, "Payload": Payload, "Option": Option})
            }
        }
    }

    // Affiche la start page du device
    RenderDeviceStartPage(){
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.BackToStartPage.bind(this))
        
        // Boutton Electrovannes
        let ConteneurElectrovanne = NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice Largeur", null)
        ConteneurElectrovanne.appendChild(NanoXBuild.DivText("Electrovannes", null, "Text", ""))
        ConteneurElectrovanne.onclick = this.RenderDeviceElectrovannePage.bind(this)
        this._DeviceConteneur.appendChild(ConteneurElectrovanne)
        // Boutton Scenes
        let ConteneurSecene= NanoXBuild.DivFlexRowSpaceEvenly(null, "ConteneurDevice Largeur", null)
        ConteneurSecene.appendChild(NanoXBuild.DivText("Scenes", null, "Text", ""))
        ConteneurSecene.onclick = this.RenderDeviceScenePage.bind(this)
        this._DeviceConteneur.appendChild(ConteneurSecene)
        // Button back
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        DivButton.appendChild(NanoXBuild.Button("Back", this.BackToStartPage.bind(this), "Back", "Button Text WidthButton1", null))
        this._DeviceConteneur.appendChild(DivButton)
        // Espace vide
        this._DeviceConteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
    }

    // Clear all data and go back to start page
    BackToStartPage(){
        this._MqttClient.end()
        this._MqttClient = null
        this._DeviceConfig = null
        this._DeviceConnected = false
        this._DeviceMqttQueue = []
        this._LoadStartView()
    }

    // afficher la page Electrovanne
    RenderDeviceElectrovannePage(){
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.RenderDeviceStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Electrovannes", null, "Titre", null))
        // Add all electrovanne
        if (this._DeviceConfig != null){
            // Add all electrovanne
            this._DeviceConfig.Electrovannes.forEach(Electrovanne => {
                Conteneur.appendChild(this.RenderButtonAction(Electrovanne.Name, this.ClickOnElectrovanne.bind(this, Electrovanne), this.ClickOnTreeDotsElectrovanne.bind(this, Electrovanne)))
            });
        } else {
            // Add texte Get Config
            Conteneur.appendChild(NanoXBuild.DivText("No configuration get from device", null, "Texte", "margin: 1rem;"))
        }
        // Button back
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "")
        DivButton.appendChild(NanoXBuild.Button("Back", this.RenderDeviceStartPage.bind(this), "Back", "Button Text WidthButton1", null))
        Conteneur.appendChild(DivButton)
        // add conteneur to divapp
        this._DeviceConteneur.appendChild(Conteneur)
        // Espace vide
        this._DeviceConteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
    }

    // afficher la page Scene
    RenderDeviceScenePage(){
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Clear Menu Button
        this.ClearMenuButton()
        // Add Back button in settings menu
        NanoXAddMenuButtonSettings("Back", "Back", IconModule.Back(), this.RenderDeviceStartPage.bind(this))
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Scenes", null, "Titre", null))
        // Add all scenes
        if (this._DeviceConfig != null){
            if (this._DeviceConfig.Scenes.length != 0){
                let SceneCount = 0
                this._DeviceConfig.Scenes.forEach(Scene => {
                    Conteneur.appendChild(this.RenderButtonAction(Scene.Name, this.ClickOnScene.bind(this, Scene.Name, Scene.Sequence), this.ClickOnTreeDotsScene.bind(this, Scene, SceneCount)))
                    SceneCount ++
                });
            } else {
                Conteneur.appendChild(NanoXBuild.DivText("No scene defined", null, "Text", ""))
            }
        }else {
            // Add texte Get Config
            Conteneur.appendChild(NanoXBuild.DivText("No configuration get from device", null, "Texte", "margin: 1rem;"))
        }
        // Div Button
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, "Largeur", "margin-top: 3rem;")
        Conteneur.appendChild(DivButton)
        // Button Add Scene
        if (this._DeviceConfig != null){
            DivButton.appendChild(NanoXBuild.Button("Add Scene", this.ClickOnAddScene.bind(this), "addscene", "Button Text WidthButton1", null))
        }
        // Button Back
        DivButton.appendChild(NanoXBuild.Button("Back", this.RenderDeviceStartPage.bind(this), "Back", "Button Text WidthButton1", null))
        // add conteneur to divapp
        this._DeviceConteneur.appendChild(Conteneur) 
        // Espace vide
        this._DeviceConteneur.appendChild(NanoXBuild.Div(null, null, "height: 2rem;"))
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
    ClickOnElectrovanne(Electrovanne){
        this._Electrovanne.RenderPlay(this._DeviceConteneur, Electrovanne)
    }

    // Play Electrovanne
    ElectrovannesPlay(Id, Name, Duree){
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Add texte
        this._DeviceConteneur.appendChild(NanoXBuild.DivText(`Start electrovanne: ${Name} for ${Duree} min.`, null, "Texte", "margin: 1rem;"))
        // Publish a message on the topic 'TopicConfigUpdateReq'
        let Actionemsg = {"Action":"Play", "Option":[{"Vanne":Id,"Duree":Duree}]}
        // Send message
        this.SendMqttMessage(this._TopicActionReq, JSON.stringify(Actionemsg))
    }

    // Click on Electrovanne TreeDots
    ClickOnTreeDotsElectrovanne(Electrovanne){
        // Load Electrovanne Config
        this._Electrovanne.RenderConfig(this._DeviceConteneur, Electrovanne)
    }

    // Action qui viennent du player
    PlayerActionCmd(Cmd){
        // Publish a message on the topic 'TopicConfigUpdateReq'
        let Actionemsg = {"Action":Cmd}
        // Send message
        this.SendMqttMessage(this._TopicActionReq, JSON.stringify(Actionemsg))
    }

    // Update the config with the new Electrovanne
    UpdateConfig(IsTypeElectrovanne = true){
        // L'éléctrovanne a ete passée en ref, this._DeviceConfig a donc été updaté automatiquement
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Add texte
        this._DeviceConteneur.appendChild(NanoXBuild.DivText("Save config to device", null, "Texte", "margin: 1rem;"))
        // Publish a message on the topic 'TopicConfigUpdateReq'
        let Updatemsg = {"Config": this._DeviceConfig}
        // Send message
        this.SendMqttMessage(this._TopicConfigUpdateReq, JSON.stringify(Updatemsg))
        // Render page
        if (IsTypeElectrovanne){
            this.RenderDeviceElectrovannePage()
        } else {
            this.RenderDeviceScenePage()
        }
        
    }

    // Click on Scene Action
    ClickOnScene(Name, Sequence){
        // Clear view
        this._DeviceConteneur.innerHTML = ""
        // Add texte
        this._DeviceConteneur.appendChild(NanoXBuild.DivText(`Start scène: ${Name}`, null, "Texte", "margin: 1rem;"))
        // Publish a message on the topic 'TopicConfigUpdateReq'
        let Actionemsg = {"Action":"Play", "Option":Sequence}
        // Send message
        this.SendMqttMessage(this._TopicActionReq, JSON.stringify(Actionemsg))
    }

    // Click on Scene TreeDots
    ClickOnTreeDotsScene(Scene, SceneCount){
        this._Scene.RenderAddModScene(this._DeviceConteneur, this._DeviceConfig.Electrovannes, Scene, SceneCount)
    }

    // Click on Add Scene
    ClickOnAddScene(){
        // Load add Scene Config
        this._Scene.RenderAddModScene(this._DeviceConteneur, this._DeviceConfig.Electrovannes)
    }

    AddScenetoConfig(Scene){
        // Add scene to Device Config
        this._DeviceConfig.Scenes.push(Scene)
        this.UpdateConfig(false)
    }

    UpdateSceneConfig(Scene, SceneCount){
        this._DeviceConfig.Scenes[SceneCount] = Scene
        this.UpdateConfig(false)
    }

    DeleteSceneConfig (Scene){
        this._DeviceConfig.Scenes = this._DeviceConfig.Scenes.filter(function(el) { return el.Name != Scene.Name; }); 
        this.UpdateConfig(false)
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