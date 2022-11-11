const { check } = require("express-validator")
const { GetRooms, insertReservaRecepcion, getTypePet, getReserva, validateAvaible, GetCanales, roomAvaible, getDetailReservation } = require("../controller/Resecion")
const { ValidarCampos } = require("../middleweres/middleweres")

const router = require("express").Router()

router.get("/getroomsresecion/:id",GetRooms)

router.post("/validateavaible",[
    check("habitaciones","la habitacion es obligatoria").not().isEmpty(),
    check("desde","la fecha inicial es obligatoria").not().isEmpty(),
    check("hasta","la fecha final es obligatoria").not().isEmpty(),
    ValidarCampos
],validateAvaible)

router.post("/postinsertreservaresecipcion",insertReservaRecepcion)

router.get("/gettypepet",getTypePet)

router.get("/getreservarecepcion",getReserva)

router.get("/getcanales",GetCanales)

router.post("/roomsavaible",roomAvaible)

router.get("/getdetailreservation/:id",getDetailReservation)

module.exports={router} 