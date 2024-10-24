const { check } = require('express-validator');
const { PostInvoinceByIdCLient, GetClientSigo, GetTaxesSigo, GetProductSigo, GetPdfSigo, PostAuthSigo, GetProductsigoDashboard, CitySigo, PostClientSigo, GetClientsSigo, ProductDian, GetInvoinces, GetProductById, GetInvoinceById, FowrwardEmail } = require('../controller/ControllerSigo/ControllerSigo');
const { ValidarCampos } = require('../middleweres/middleweres');

const router = require('express').Router()

router.post("/PostInvoinceByIdCLient",
    [
    check("token","es obligatorio").not().isEmpty(),
    check("body","es obligatorio").not().isEmpty(),
    check("id_Reserva","es obligatorio").not().isEmpty(),
    check("id_user","es obligatorio").not().isEmpty(),
    check("fecha","es obligatorio").not().isEmpty(),
    check("Retention","es obligatorio").not().isEmpty(),
    ValidarCampos
    ],PostInvoinceByIdCLient);

router.post("/GetClientSigo",[
    check("token","es obligatorio").not().isEmpty(),
    check("document","es obligatorio").not().isEmpty(),
    ValidarCampos
]
,GetClientSigo);

router.post("/GetTaxesSigo",[
    check("token","es obligatorio").not().isEmpty(),
    ValidarCampos
]
,GetTaxesSigo);


router.post("/GetProductSigo",[
    check("token","es obligatorio").not().isEmpty(),
    ValidarCampos
]
,GetProductSigo);

router.post("/GetPdfSigo",[
    check("token","es obligatorio").not().isEmpty(),
    check("id","es obligatorio").not().isEmpty(),
    ValidarCampos
]
,GetPdfSigo);

router.get("/GetProductsigoDashboard",GetProductsigoDashboard);

router.post("/PostAuthSigo",PostAuthSigo);

router.get("/CitySiigo",CitySigo);

router.post("/PostClientSigo",[
    check("token","es obligatorio").not().isEmpty(),
    check("body","es obligatorio").not().isEmpty(),
    ValidarCampos
],PostClientSigo);

router.get("/clients",GetClientsSigo);

router.get("/ProductDian",ProductDian);

router.get("/GetInvoinces",GetInvoinces);

router.post("/GetProductById",GetProductById);

router.post("/GetInvoinceById",GetInvoinceById);

router.post("/FowrwardEmail",FowrwardEmail);

module.exports = { router };  