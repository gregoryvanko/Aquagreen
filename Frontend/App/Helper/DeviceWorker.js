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
        this._TopicConfig = this._Device.DeviceId + '/config'

        this.MqttConnection()
    }

    MqttConnection(){
        let me = this
        this._MqttClient  = mqtt.connect(this._MqttUrl, this._MqttOptions)
        this._MqttClient.on('connect', () => {
            console.log('Mqtt Connected')
            // Subscribe to topics
            this._MqttClient.subscribe(me._TopicStatus,(err) => {
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
            // Payload is Buffer
            console.log(`Topic: ${topic}, Message: ${payload.toString()}`)
        })
    }

    Start(){
        // Publish a message 'get' to the topic 'config'
        this._MqttClient.publish(this._TopicConfig, 'GetConfig')
    }
}