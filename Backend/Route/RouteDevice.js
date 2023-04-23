const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi

const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
//const AuthAdim = require("@gregvanko/nanox").NanoXAuthAdmin

const ModelDevice = require("../MongooseModel/Model_Device")

//Get liste of device
router.get("/", AuthBasic, (req, res) => {
    LogStatApi("device", "get", req.user)
    GetDevice(res, req.user)
})

// Get device from DB
function GetDevice(res, User = null){
    if (User != null){
        const query = {UserId: User._id}
        const projection = {}
        ModelDevice.find(query, projection, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`GetDevice db eroor: ${err}`, User)
            } else {
                res.status(200).send(result)  
            }
        })
    } else {
        let ErrorMsg = "User not define"
        res.status(500).send(ErrorMsg)
        LogError(`GetDevice db eroor: ${ErrorMsg}`, User)
    }
}

module.exports = router