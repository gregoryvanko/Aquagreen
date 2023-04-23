const Mongoose = require("@gregvanko/nanox").Mongoose

let DeviceSchema = new Mongoose.Schema(
    {
        UserId : String,
        Name: String,
        DeviceId: String
    },
    { collection:'Device'}
)

module.exports = Mongoose.model('Device', DeviceSchema)