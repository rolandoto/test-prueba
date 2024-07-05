const { check } = require('express-validator');
const { ValidarCampos } = require('../middleweres/middleweres');
const { RegisterCardWompi } = require('../controller/Controllerwompi/ControllerWompi');

const router = require('express').Router()

router.post("/RegisterCardWompi",[
    check("number","es obligatorio").not().isEmpty(),
    check("exp_month","es obligatorio").not().isEmpty(),
    check("exp_year","es obligatorio").not().isEmpty(),
    check("cvc","es obligatorio").not().isEmpty(),
    check("card_holder","es obligatorio").not().isEmpty(),
    check("cart", "es obligatorio").not().isEmpty(),
    check("name", "es obligatorio").not().isEmpty(),
    check("apellido", "es obligatorio").not().isEmpty(),
    check("email", "es obligatorio").not().isEmpty(),
    check("city", "es obligatorio").not().isEmpty(),
    check("country", "es obligatorio").not().isEmpty(),
    check("fecha", "es obligatorio").not().isEmpty(),
    ValidarCampos
],RegisterCardWompi);

module.exports = { router };  