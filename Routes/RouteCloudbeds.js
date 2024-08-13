const { check } = require('express-validator');
const { GetHotels, GetHotelsbyID, GetReservationBypropertyID, getAvailableRoomTypes, PostpostReservation } = require('../controller/ControllerCloudbeds/ControllerCloudbeds');
const { ValidarCampos } = require('../middleweres/middleweres');

const router = require('express').Router()

router.get("/getHotel",GetHotels);

router.get("/getHotelbyID/:id",GetHotelsbyID);

router.get("/getReservationBypropertyID/:id",GetReservationBypropertyID);

router.post("/getAvailableRoomTypes",[
    check("propertyID","es obligatorio").not().isEmpty(),
    check("startDate","es obligatorio").not().isEmpty(),
    check("endDate","es obligatorio").not().isEmpty(),
    check("token","es obligatorio").not().isEmpty(),
    check("counPeople","es obligatorio").not().isEmpty(),
    ValidarCampos
],getAvailableRoomTypes);

router.post("/PostpostReservation",[
    check("propertyID","es obligatorio").not().isEmpty(),
    check("token","es obligatorio").not().isEmpty(),
    check("startDate","es obligatorio").not().isEmpty(),
    check("endDate","es obligatorio").not().isEmpty(),
    check("guestFirstName","es obligatorio").not().isEmpty(),
    check("guestLastName","es obligatorio").not().isEmpty(),
    check("guestEmail","es obligatorio").not().isEmpty(),
    check("guestPhone","es obligatorio").not().isEmpty(),
    check("rooms","es obligatorio").not().isEmpty(),
    check("adults","es obligatorio").not().isEmpty(),
    check("children","es obligatorio").not().isEmpty(),
    check("dateCreated","es obligatorio").not().isEmpty(),
    check("number","es obligatorio").not().isEmpty(),
    check("exp_month","es obligatorio").not().isEmpty(),
    check("exp_year","es obligatorio").not().isEmpty(),
    check("cvc","es obligatorio").not().isEmpty(),
    check("card_holder","es obligatorio").not().isEmpty(),
    check("subtotal","es obligatorio").not().isEmpty(),
],PostpostReservation);

module.exports = { router };  