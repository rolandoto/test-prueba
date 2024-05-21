const { GetHotels, GetHotelsbyID, GetReservationBypropertyID } = require('../controller/ControllerCloudbeds/ControllerCloudbeds');

const router = require('express').Router()

router.get("/getHotel",GetHotels);

router.get("/getHotelbyID/:id",GetHotelsbyID);

router.get("/getReservationBypropertyID/:id",GetReservationBypropertyID);

module.exports = { router };  