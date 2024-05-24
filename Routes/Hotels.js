const { SearchHotels } = require('../controller/Hotels');
const { ValidarCampos } = require('../middleweres/middleweres');
const { check } = require("express-validator");

const router =require('express').Router()

router.post("/SeacrhHotelsById", [
    check("id", "es obligatorio").not().isEmpty(),
    check("desde", "es obligatorio").isDate(),
    check("hasta", "es obligatorio").isDate(),
    ValidarCampos
  ],SearchHotels)

module.exports = { router };  