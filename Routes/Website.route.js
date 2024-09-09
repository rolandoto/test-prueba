
const { check } = require('express-validator');
const { InsertEventsWebsite, getEvents, getEventsDatail, getRoomHotel } = require('../controller/Controllerwebsite/Controllerwebsite');
const { ValidarCampos } = require('../middleweres/middleweres');

const router = require('express').Router()

router.post("/InsertEventsWebsite",[
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
