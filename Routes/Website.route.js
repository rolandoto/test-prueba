
const { check } = require('express-validator');
const { InsertEventsWebsite, getEvents, getEventsDatail, getRoomHotel } = require('../controller/Controllerwebsite/Controllerwebsite');
const { ValidarCampos } = require('../middleweres/middleweres');

const router = require('express').Router()

router.post("/InsertEventsWebsite",[
    check("Name","es obligatorio").not().isEmpty(),
    check("DescriptionEvent1","es obligatorio").not().isEmpty(),
    check("DescriptionEvent2","es obligatorio").not().isEmpty(),
    check("Start_date","es obligatorio").not().isEmpty(),
    check("End_date","es obligatorio").not().isEmpty(),
    check("Place", "es obligatorio").not().isEmpty(),
    check("id_hotel", "es obligatorio").not().isEmpty(),
    check("actividades1", "es obligatorio").not().isEmpty(),
    check("actividades2", "es obligatorio").not().isEmpty(),
    check("Finally", "es obligatorio").not().isEmpty(),
    ValidarCampos
],InsertEventsWebsite);

router.get("/getEvents/:id",getEvents)

router.get("/getEventsDetail/:id",getEventsDatail)

router.get("/getRoomHotel/:id",getRoomHotel)

module.exports = { router };
