const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi

const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
//const AuthAdim = require("@gregvanko/nanox").NanoXAuthAdmin

const ModelDevice = require("../MongooseModel/Model_Device")

// Route Get liste of device
router.get("/", AuthBasic, (req, res) => {
    LogStatApi("device", "get", req.user)
    GetDevice(res, req.user)
})
// Get device from DB
function GetDevice(res, User = null){
    if (User != null){
        const query = {UserId: User._id}
        const projection = {_id:1, DeviceName:1, DeviceId:1}
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
        LogError(`GetDevice: ${ErrorMsg}`, User)
    }
}

// Route Add device
router.post("/", AuthBasic, (req, res) => {
    LogStatApi("device", "post", req.user)
    AddDevice(req.body, res, req.user)
})
// Add device in DB
function AddDevice(Param = null, res, User = null){
    if ((User != null) && (Param != null)){
        let NewDevice = new ModelDevice({UserId:User._id, DeviceName: Param.DeviceName, DeviceId: Param.DeviceId})
        NewDevice.save((err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`AddDevice db eroor: ${err}`, User)
            } else {
                res.status(200).send("done")  
            }
        })
    } else {
        let ErrorMsg = "User or post data not define"
        res.status(500).send(ErrorMsg)
        LogError(`AddDevice: ${ErrorMsg}`, User)
    }
}

// Route modifiy device
router.patch("/", AuthBasic, (req, res) => {
    LogStatApi("device", "patch", req.user)
    PatchDevice(req.body, res, req.user)
})
// Modify Device in DB
function PatchDevice(Param = null, res, User = null){
    if ((User != null) && (Param != null)){
        ModelDevice.findByIdAndUpdate(Param.Id, {DeviceName: Param.DeviceName, DeviceId: Param.DeviceId}, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`PatchDevice db error: ${err}`, User)
            } else {
                res.status(200).send("OK")
            }
        })
    } else {
        let ErrorMsg = "User or patch data not define"
        res.status(500).send(ErrorMsg)
        LogError(`PatchDevice: ${ErrorMsg}`, User)
    }
}

// Route delete device
router.delete("/:deviceid", AuthBasic, (req, res) => {
    LogStatApi("device", "delete", req.user)
    DeleteDevice(req.params.deviceid, res, req.user)
})
// Delete device in DB
function DeleteDevice(Id = null, res, User = null){
    if ((User != null) && (Id != null)){
        ModelDevice.findByIdAndDelete(Id, (err, result)=>{
            if (err) {
                res.status(500).send(err)
                LogError(`DeleteDevice db eroor: ${err}`, User)
            } else {
                res.status(200).send("OK")
                LogInfo(`Device id ${Id} is deleted`, User)
            }
        })
    } else {
        let ErrorMsg = "User or delete data not define"
        res.status(500).send(ErrorMsg)
        LogError(`DeleteDevice: ${ErrorMsg}`, User)
    }
}



module.exports = router