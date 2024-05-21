const { GetHotels } = require('../controller/ControllerCloudbeds/ControllerCloudbeds');

const router = require('express').Router()

router.get("/getHotel",GetHotels);

module.exports = { router };  