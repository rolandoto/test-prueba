const { SearchHotels, HotelCreateWebSite } = require('../controller/Hotels');
const { ValidarCampos } = require('../middleweres/middleweres');
const { check } = require("express-validator");

const router =require('express').Router()

router.post("/SeacrhHotelsById", [
    check("id", "es obligatorio").not().isEmpty(),
    check("desde", "es obligatorio").isDate(),
    check("hasta", "es obligatorio").isDate(),
    check("counPeople", "es obligatorio").not().isEmpty(),
    ValidarCampos
  ],SearchHotels)

  router.post("/HotelCreateWebSite",[
    check("cart", "es obligatorio").not().isEmpty(),
    check("name", "es obligatorio").not().isEmpty(),
    check("apellido", "es obligatorio").not().isEmpty(),
    check("email", "es obligatorio").not().isEmpty(),
    check("city", "es obligatorio").not().isEmpty(),
    check("country", "es obligatorio").not().isEmpty(),
    check("fecha", "es obligatorio").not().isEmpty(),
    ValidarCampos
  ],HotelCreateWebSite)

module.exports = { router };    