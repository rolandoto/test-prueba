
const { check } = require('express-validator');
const { InsertEventsWebsite, getEvents, getEventsDatail, getRoomHotel } = require('../controller/Controllerwebsite/Controllerwebsite');
const { ValidarCampos } = require('../middleweres/middleweres');
var path = require('path')
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './public')
  },
  filename: function (req, file, callback) {
      callback(null, file.fieldname + Date.now() + path.extname(file.originalname))
  }
})

var uploads = multer({ storage: storage })
/**
 * 
 *  check("Name","es obligatorio").not().isEmpty(),
    check("Description","es obligatorio").not().isEmpty(),
    check("Start_date","es obligatorio").not().isEmpty(),
    check("End_date","es obligatorio").not().isEmpty(),
    check("Place", "es obligatorio").not().isEmpty(),
    check("id_hotel", "es obligatorio").not().isEmpty(),
 * 
 */

const router = require('express').Router()

router.post("/InsertEventsWebsite",uploads.single("image"),[
    check("Name","es obligatorio").not().isEmpty(),
    check("Description","es obligatorio").not().isEmpty(),
    check("Start_date","es obligatorio").not().isEmpty(),
    check("End_date","es obligatorio").not().isEmpty(),
    check("Place", "es obligatorio").not().isEmpty(),
    check("id_hotel", "es obligatorio").not().isEmpty(),
   
    ValidarCampos
],InsertEventsWebsite);

router.get("/getEvents/:id",getEvents)

router.get("/getEventsDetail/:id",getEventsDatail)

router.get("/getRoomHotel/:id",getRoomHotel)

module.exports = { router };
