class DeviceWorker {
    constructor(Div, DisplayError, Device){
        this._DivApp = Div
        this._DisplayError = DisplayError
        this._Device = Device

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

        // Topics
        this._TopicStatus = this._Device.DeviceId + '/status'
        this._TopicDeviceAction = this._Device.DeviceId + '/deviceaction' 
        this._TopicDeviceResponse = this._Device.DeviceId + '/deviceresponse' 

        // Device Action
        this._GetConfig = "GetConfig"

        this.DeviceConfig = null

        this.MqttConnection()
    }

    MqttConnection(){
        let me = this
        this._MqttClient  = mqtt.connect(this._MqttUrl, this._MqttOptions)
        this._MqttClient.on('connect', () => {
            console.log('Mqtt Connected')
            // Subscribe to topics
            this._MqttClient.subscribe(me._TopicDeviceResponse,(err) => {
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

        this._MqttClient.on('message', (topic, payload) => {
            me.OnMessage(topic, JSON.parse(payload.toString()))
        })
    }

    Start(){
        // Publish a message 'get' to the topic 'config'
        this._MqttClient.publish(this._TopicDeviceAction, this._GetConfig)
    }

    OnMessage(Topic, Payload){
        switch (Topic) {
            case this._TopicDeviceResponse:
                // si l'action de cette réponse était :this._GetConfig
                if (Payload.DeviceAction == this._GetConfig){
                    // Save Config
                    this.DeviceConfig = Payload.Response
                    // Set device start page
                    this.RenderDeviceStartPage()
                } else {
                    this._DisplayError(`Payload.DeviceAction not found for Topic: ${Topic}, Message: ${Payload}`)
                }
                break;
        
            default:
                this._DisplayError(`Topic not found: ${Topic}, Message: ${Payload}`)
                break;
        }
    }

    RenderDeviceStartPage(){
        // ToDo
    }
}