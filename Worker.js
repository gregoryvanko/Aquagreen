class Worker {
    constructor(MyApp, RpiGpioAdress, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._UseWorker = UseWorker

        this._Status = new Object()
        this._Status.IsRunning = false
        this._Status.StepTotal = 0
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = 0
        this._Status.RelaisName = ""
        this._Status.DisplayName = ""
        this._Status.DisplayProgram = ""
        this._Status.ZoneAction = ""
        this._Status.ZoneStepTotal = 0
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = 0
        this._Status.ZoneNumberCurrent = 0

        this._CurrentRelaisName = ""
        this._CurrentDisplayName = ""
        this._CurrentZoneAction = ""
        this._CurrentZoneStatus = ""
        this._ListOfActions = new Array()
        this._WorkerInterval = null

        // MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
    }

    get Status(){return this._Status}

    /**
     * HTTP API du Worker
     * @param {Object} Data {Fct, Data} Object de parametre de l'API
     * @param {Res} Res Reponse à la requete de l'API
     * @param {String} UserId UserId de l'user qui a appeler l'API
     */
    ApiWork(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("Call ApiWorker Data:" + JSON.stringify(Data), User, UserId)
        if (Data.Fct == "ButtonPressed"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Worker Started by: " + Data.Name})
            this.ButtonPressed(Data.Name, User, UserId)
        } else if(Data.Fct == "Ping"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Pong"})
        } else if(Data.Fct == "GetConfig"){
            this.GetConfig(Res, User, UserId)
        } else {
            Res.json({Error: true, ErrorMsg: "ApiWorker error, Fct not found: " + Data.Fct, Data: null})
            this._MyApp.LogAppliError(`ApiWork error, Fct ${Data.Fct} not found`, User, UserId)
        }
    }

    /**
     * Get de la config des GPIO en DB
     * @param {Res} Res Reponse à la requete de l'API
     */
    GetConfig(Res, User, UserId){
        // Get Gpio Config in DB
        let me = this
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
        const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data: null})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data: reponse[0][this._MongoConfigCollection.Value]})
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiWork GetConfig DB error : " + erreur, User, UserId)
            Res.json({Error: true, ErrorMsg: "ApiWork GetConfig DB Error", Data: null})
        })
    }

    /**
     * Get de la config sous forme de promise
     * @param {String} User nom du user
     * @param {Int} UserId user id
     */
    PromiseGetConfig(Key, User, UserId){
        return new Promise(resolve => {
            let ReponseConfig = new Object()
            ReponseConfig.Error = true
            ReponseConfig.ErrorMsg = ""
            ReponseConfig.Data = null
    
            let me = this
            const Querry = {[this._MongoConfigCollection.Key]: Key}
            const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
            this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    ReponseConfig.Error = false
                    ReponseConfig.ErrorMsg = null
                    ReponseConfig.Data = null
                } else {
                    ReponseConfig.Error = false
                    ReponseConfig.ErrorMsg = null
                    ReponseConfig.Data = reponse[0][this._MongoConfigCollection.Value]
                }
                resolve(ReponseConfig)
            },(erreur)=>{
                ReponseConfig.Error = true
                ReponseConfig.ErrorMsg = "ApiWork GetConfig DB Error"
                ReponseConfig.Data = null
                me._MyApp.LogAppliError("ApiWork GetConfig DB error : " + erreur, User, UserId)
                resolve(ReponseConfig)
            })
        })
    }

    async ButtonPressed(ButtonName, User, UserId){
        // Si le woker ne confionne pas
        if (!this._Status.IsRunning){
            // Get de la config des GPIO
            let ReponseGetGpioConfig = await this.PromiseGetConfig(this._MongoConfigCollection.GpioConfigKey, User, UserId)
            // Si il existe une config
            if(!ReponseGetGpioConfig.Error){
                // Sil la config n'est pas null
                if(ReponseGetGpioConfig.Data != null){
                    // Chercher le bouton dans la config
                    var FoundButton = ReponseGetGpioConfig.Data.find((element) => { return element.name == ButtonName })
                    // Si le bouton est trouvé
                    if(FoundButton){
                        // Nom du program a trouver
                        let ProgramForThisButton = FoundButton.custom.programname
                        // Get de la config des programs
                        let ReponseGetProgramsConfig = await this.PromiseGetConfig(this._MongoConfigCollection.ProgramConfigKey, User, UserId)
                        // Si il existe une config de program
                        if(!ReponseGetProgramsConfig.Error){
                            // Sil la config n'est pas null
                            if(ReponseGetProgramsConfig.Data != null){
                                // Chercher le bouton dans la config
                                var FoundProgram = ReponseGetProgramsConfig.Data.find((element) => { return element.Name == ProgramForThisButton })
                                if (FoundProgram){
                                    // Liste des steps du program
                                    let ListOfStep = FoundProgram.ListOfSteps
                                    // si le nombre de step est >0
                                    if(ListOfStep.length > 0){
                                        // Add display name
                                        let NewList = []
                                        ListOfStep.forEach(elementListOfStep => {
                                            let setp = new Object()
                                            setp.RelaisName = elementListOfStep.RelaisName
                                            let Element = ReponseGetGpioConfig.Data.find(element => element.name == setp.RelaisName)
                                            if (Element == undefined){
                                                setp.DisplayName = "Not Found"
                                            } else {
                                                setp.DisplayName = Element.custom.displayname
                                            }
                                            setp.Delay = elementListOfStep.Delay
                                            NewList.push(setp)
                                        });
                                        // Start du worker
                                        let Worker = new Object()
                                        Worker.ProgramName = FoundProgram.Name
                                        Worker.ConfigList= NewList
                                        this.StartWorking(Worker, User, UserId)
                                    } else {this._MyApp.LogAppliError("ButtonPressed: no list of step defined!", User, UserId)}
                                } else {this._MyApp.LogAppliError("ButtonPressed: ProgramForThisButton not found in Program Config!", User, UserId)}
                            }else {this._MyApp.LogAppliError("ButtonPressed: No Program config defined!", User, UserId)}
                        }else {this._MyApp.LogAppliError("ButtonPressed: Error PromiseGetConfig for Program!", User, UserId)}
                    } else {this._MyApp.LogAppliError("ButtonPressed: Button name not found in GPIO Config!", User, UserId)}
                } else {this._MyApp.LogAppliError("ButtonPressed: No GPIO config defined!", User, UserId)}
            } else {this._MyApp.LogAppliError("ButtonPressed: Error PromiseGetConfig for Gpio!", User, UserId)}
        } else {this._MyApp.LogAppliError("Button pressed but worker is running", User, UserId)}
    }

    StartWorking(Worker, User, UserId){
        let lengthOfWorkerConfigList = Worker.ConfigList.length

        let TempStep = 0

        // Define list of action
        Worker.ConfigList.forEach(element => {
            TempStep++
            // Open
            let ObjectActionOpen = new Object()
            ObjectActionOpen.Step = TempStep
            ObjectActionOpen.RelaisName = element.RelaisName
            ObjectActionOpen.DisplayName = element.DisplayName
            ObjectActionOpen.Type = "Open"
            ObjectActionOpen.Delay = element.Delay * 60
            TempStep = TempStep + (element.Delay * 60)
            this._ListOfActions.push(ObjectActionOpen)
            // Close
            let ObjectActionClose = new Object()
            ObjectActionClose.Step = TempStep
            ObjectActionClose.RelaisName = element.RelaisName
            ObjectActionClose.DisplayName = element.DisplayName
            ObjectActionClose.Type = "Close"
            ObjectActionClose.Delay = 2
            TempStep = TempStep + 2
            this._ListOfActions.push(ObjectActionClose)
        })

        this._Status.IsRunning = true
        this._Status.StepTotal = TempStep
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = this._Status.StepTotal - this._Status.StepCurrent
        this._Status.ZoneAction = "Start"
        this._Status.RelaisName = "Worker"
        this._Status.DisplayName = "Worker"
        this._Status.DisplayProgram = Worker.ProgramName
        this._Status.ZoneStepTotal = 1
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = lengthOfWorkerConfigList
        this._Status.ZoneNumberCurrent = 0

        this._WorkerInterval = setInterval(this.UpdateWorkerStatus.bind(this, "Worker", "Worker"), 1000)
        this._MyApp.LogAppliInfo("Sart Worker", User, UserId)
    }

    UpdateWorkerStatus(User, UserId){
        this._Status.StepCurrent++
        this._Status.TotalSecond--
        this._Status.ZoneStepCurrent++
        let me = this
        if (this._ListOfActions.length > 0){
            if (this._Status.StepCurrent >= this._ListOfActions[0].Step){
                if (this._ListOfActions[0].Type == "Open"){
                    // Set GPIO => 1
                    if (this._UseWorker){
                        const axios = require('axios')
                        axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._ListOfActions[0].RelaisName, value: 1}}).then(res => {
                            if (res.data.Error){
                                me._MyApp.LogAppliError("UpdateWorkerStatus setgpio res error : " + res.data.ErrorMsg, User, UserId)
                                me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                            } else {
                                me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data), User, UserId)
                            }
                        }).catch(error => {
                            me._MyApp.LogAppliError("UpdateWorkerStatus setgpio error : " + error, User, UserId)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                        })
                    } else {
                        this._MyApp.LogAppliInfo("Setgpio done => 1 " + this._ListOfActions[0].RelaisName, User, UserId)
                    }
                    this._Status.ZoneAction = "Open"
                    this._Status.RelaisName = this._ListOfActions[0].RelaisName
                    this._Status.DisplayName = this._ListOfActions[0].DisplayName
                    this._Status.ZoneNumberCurrent++
                } else {
                    // Set GPIO => 0
                    if (this._UseWorker){
                        const axios = require('axios')
                        axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._ListOfActions[0].RelaisName, value: 0}}).then(res => {
                            if (res.data.Error){
                                me._MyApp.LogAppliError("UpdateWorkerStatus setgpio res error : " + res.data.ErrorMsg, User, UserId)
                                me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                            } else {
                                me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data), User, UserId)
                            }
                        }).catch(error => {
                            me._MyApp.LogAppliError("UpdateWorkerStatus setgpio error : " + error, User, UserId)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                        })
                    } else {
                        this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._ListOfActions[0].RelaisName, User, UserId)
                    }
                    this._Status.ZoneAction = "Close"
                    this._Status.RelaisName = this._ListOfActions[0].RelaisName
                    this._Status.DisplayName = this._ListOfActions[0].DisplayName
                }
                this._CurrentRelaisName = this._ListOfActions[0].RelaisName
                this._CurrentDisplayName = this._ListOfActions[0].DisplayName
                this._CurrentZoneAction = this._Status.ZoneAction
                this._CurrentZoneStatus = this._ListOfActions[0].Type
                this._Status.ZoneStepTotal = this._ListOfActions[0].Delay
                this._Status.ZoneStepCurrent = 0
                this._ListOfActions.shift()
            }
        }
        if (this._Status.StepCurrent > this._Status.StepTotal){
            // On stop le worker en emettant un message Stop aux sockets
            this.InitWorkerStatus()
            this._MyApp.Io.emit("PlayerStop", "")
        } else {
            this._MyApp.Io.emit("PlayerUpdate", this._Status)
        }
    }

    InitWorkerStatus(){
        if (this._WorkerInterval != null){
            clearInterval(this._WorkerInterval)
            this._WorkerInterval = null
        }
        this._Status.IsRunning = false
        this._Status.StepTotal = 0
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = 0
        this._Status.RelaisName = ""
        this._Status.DisplayName = ""
        this._Status.DisplayProgram = ""
        this._Status.ZoneAction = ""
        this._Status.ZoneStepTotal = 0
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = 0
        this._Status.ZoneNumberCurrent = 0
        this._ListOfActions = new Array()

        this._CurrentRelaisName = ""
        this._CurrentZoneAction = ""
        this._CurrentZoneStatus = ""
    }

    CommandePlay(User, UserId){
        if (this._Status.IsRunning){
            this._WorkerInterval = setInterval(this.UpdateWorkerStatus.bind(this, "Worker", "Worker"), 1000)
            this._Status.ZoneAction = this._CurrentZoneStatus 
            this._Status.RelaisName = this._CurrentRelaisName
            this._Status.DisplayName = this._CurrentDisplayName
            if (this._CurrentZoneStatus == "Open"){
                // Set GPIO => 1 de this._CurrentRelaisName
                if (this._UseWorker){
                    let me = this
                    const axios = require('axios')
                    axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentRelaisName, value: "1"}}).then(res => {
                        if (res.data.Error){
                            me._MyApp.LogAppliError("CommandePlay setgpio res error : " + res.data.ErrorMsg, User, UserId)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        } else {
                            me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data), User, UserId)
                        }
                    }).catch(error => {
                        me._MyApp.LogAppliError("CommandePlay setgpio error : " + error, User, UserId)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    })
                } else {
                    this._MyApp.LogAppliInfo("Setgpio done => 1 " + this._CurrentRelaisName, User, UserId)
                }
            }
            this._MyApp.Io.emit("PlayerUpdate", this._Status)
        }
    }

    CommandePause(User, UserId){
        if (this._WorkerInterval != null){
            clearInterval(this._WorkerInterval)
            this._WorkerInterval = null
            this._Status.ZoneAction = "Pause"
            this._Status.RelaisName = this._CurrentRelaisName
            this._Status.DisplayName = this._CurrentDisplayName
            if (this._CurrentZoneStatus == "Open"){
                // Set GPIO => 0 de this._CurrentRelaisName
                if (this._UseWorker){
                    let me = this
                    const axios = require('axios')
                    axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentRelaisName, value: "0"}}).then(res => {
                        if (res.data.Error){
                            me._MyApp.LogAppliError("CommandePause setgpio res error : " + res.data.ErrorMsg, User, UserId)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        } else {
                            me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data), User, UserId)
                        }
                    }).catch(error => {
                        me._MyApp.LogAppliError("CommandePause setgpio error : " + error, User, UserId)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    })
                } else {
                    this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._CurrentRelaisName, User, UserId)
                }
            }
            this._MyApp.Io.emit("PlayerUpdate", this._Status)
        }
    }

    CommandeStop(User, UserId){
        if (this._CurrentZoneStatus == "Open"){
            // Set GPIO => 0 de this._CurrentRelaisName
            if (this._UseWorker){
                let me = this
                const axios = require('axios')
                axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentRelaisName, value: "0"}}).then(res => {
                    if (res.data.Error){
                        me._MyApp.LogAppliError("CommandeStop setgpio res error : " + res.data.ErrorMsg, User, UserId)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        me.InitWorkerStatus()
                        me._MyApp.Io.emit("PlayerUpdate", this._Status)
                    } else {
                        me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data), User, UserId)
                        me.InitWorkerStatus()
                        me._MyApp.Io.emit("PlayerStop", "")
                    }
                }).catch(error => {
                    me._MyApp.LogAppliError("CommandeStop setgpio error : " + error, User, UserId)
                    me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    me.InitWorkerStatus()
                    me._MyApp.Io.emit("PlayerUpdate", this._Status)
                })
            } else {
                this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._CurrentRelaisName, User, UserId)
                this.InitWorkerStatus()
                this._MyApp.Io.emit("PlayerStop", "")
            }
        } else {
            this.InitWorkerStatus()
            this._MyApp.Io.emit("PlayerStop", "")
        }
    }

}
module.exports.Worker = Worker