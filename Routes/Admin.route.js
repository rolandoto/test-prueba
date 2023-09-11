const router =require('express').Router()
const { InsertIntoRoomsAdmin, GetroomsAdmin, InsertIntoStoreAdmin, GetCategoryAdmin, GetListProductAdmin, getStoreAdmin, GetListProductAdminById, postListProductAdminById, getSubProduct, postUpdteTarifasReservation, getTarifasReservation, postInsetTarifaReservation, getHistialReservation } = require('../controller/Admin/RoomsController')
const  {check} = require("express-validator")
const { ValidarCampos } = require('../middleweres/middleweres')

router.post("/inserintoroomsadmin",

        [
            check("id_hotel","el id_hotel es obligatorio").not().isEmpty(),
            check("id_habitaciones","el id_hotel es obligatorio").not().isEmpty(),
            check("name_num","el id_hotel es obligatorio").not().isEmpty(),
            ValidarCampos
        ]

,InsertIntoRoomsAdmin)

router.get("/getroomsadmin/:id",GetroomsAdmin)

router.post("/insertintostoreadmin",
    [
        check("ID_Tipo_categoria","ID_Tipo_categoria es oblogatorio").not().isEmpty(),
        check("ID_Hoteles","ID_Hoteles es obligatorio").not().isEmpty(),
        check("Nombre","Nombre el obligatorio").not().isEmpty(),
        check("Cantidad","Cantidad es obligatorio").not().isEmpty(),
        check("Precio","Precio es obligatorio").not().isEmpty(),
        ValidarCampos
    ],
InsertIntoStoreAdmin)

router.get("/getcategoryadmin",GetCategoryAdmin)

router.get("/getlistproductadmin/:id",GetListProductAdmin)

router.get("/GetListProductAdminById/:id",GetListProductAdminById)

router.post("/postListProductAdminById/:id",postListProductAdminById)

router.get("/getstore",getStoreAdmin)

router.get("/getSubProduct",getSubProduct)

router.post("/posUpdateTarifasReservation/:id",[
    check("valid_buy","es obligatorio").not().isEmpty(),
    check("noches","es obligatorio").not().isEmpty(),
    check("Abono","es obligatorio").not().isEmpty(),
    check("ID_reservation","es obligatorio").not().isEmpty(),
    check("valor","es obligatorio").not().isEmpty(),
    ValidarCampos
],postUpdteTarifasReservation)

router.get("/getTarifasReservation/:id",getTarifasReservation) 

router.post("/postInsetTarifaReservation",[
    check("id_user","es obligatorio").not().isEmpty(),
    check("valor","es obligatorio").not().isEmpty(),
    check("Description","es obligatorio").not().isEmpty(),
    check("Fecha","es obligatorio").not().isEmpty(),
    check("ID_reservation","es obligatorio").not().isEmpty(),
    check("name_reservation","es obligatorio").not().isEmpty(),
    check("codigo_reserva","es obligatorio").not().isEmpty(),
    check("noches","es obligatorio").not().isEmpty(),
    check("Abono","es obligatorio").not().isEmpty(),
    ValidarCampos
],postInsetTarifaReservation)

router.get("/getHistialReservationById/:id",getHistialReservation)

module.exports={router}