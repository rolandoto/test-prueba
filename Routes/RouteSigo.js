const { check } = require('express-validator');
const { PostInvoinceByIdCLient } = require('../controller/ControllerSigo/ControllerSigo');
const { ValidarCampos } = require('../middleweres/middleweres');


const router = require('express').Router()

router.post("/PostInvoinceByIdCLient",
    [
    check("token","es obligatorio").not().isEmpty(),
    check("body","es obligatorio").not().isEmpty(),
    check("id_Reserva","es obligatorio").not().isEmpty(),
    check("id_user","es obligatorio").not().isEmpty(),
    check("fecha","es obligatorio").not().isEmpty(),
    ValidarCampos
    ],PostInvoinceByIdCLient);


module.exports = { router };  