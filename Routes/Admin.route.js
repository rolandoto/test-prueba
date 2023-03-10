const router =require('express').Router()
const { InsertIntoRoomsAdmin, GetroomsAdmin, InsertIntoStoreAdmin, GetCategoryAdmin, GetListProductAdmin, getStoreAdmin } = require('../controller/Admin/RoomsController')
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

router.get("/getstore",getStoreAdmin)

module.exports={router}