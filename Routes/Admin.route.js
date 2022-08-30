const router =require('express').Router()
const { InsertIntoRoomsAdmin, GetroomsAdmin } = require('../controller/Admin/RoomsController')
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


module.exports={router}