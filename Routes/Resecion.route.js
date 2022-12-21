const { check } = require("express-validator")
const { GetRooms, insertReservaRecepcion, getTypePet, getReserva, validateAvaible, GetCanales, roomAvaible, getDetailReservation, postCleanlineRooms, getCountry, updateDetailReservation, updateDetailPagos, getdetailhuespedes, postdetailUpdate } = require("../controller/Resecion")
const { ValidarCampos } = require("../middleweres/middleweres")

const router = require("express").Router()

router.get("/getroomsresecion/:id",GetRooms)

router.post("/validateavaible",[
    check("abono","el abono  es obligatorio").not().isEmpty(),
    check("ID_Tipo_Forma_pago","el ID_Tipo_Forma_pago  es obligatorio").not().isEmpty(),
    check("Observacion","el Observacion  es obligatorio").not().isEmpty(),
    check("Noches","el Noches  es obligatorio").not().isEmpty(),
    check("Infantes","el Infantes  es obligatorio").not().isEmpty(),
    check("ID_Talla_mascota","el ID_Talla_mascota  es obligatorio").not().isEmpty(),
    check("Ninos","el Ninos  es obligatorio").not().isEmpty(),
    check("Adultos","el Adultos  es obligatorio").not().isEmpty(),
    check("ID_Canal","el id canal es obligatorio").not().isEmpty(),
    check("habitaciones","la habitacion es obligatoria").not().isEmpty(),
    check("desde","la fecha inicial es obligatoria").not().isEmpty(),
    check("hasta","la fecha final es obligatoria").not().isEmpty(),
    check("Tipo_persona","la fecha final es obligatoria").not().isEmpty(),
    ValidarCampos
],validateAvaible)

router.post("/postinsertreservaresecipcion",insertReservaRecepcion)

router.get("/gettypepet",getTypePet)

router.get("/getreservarecepcion",getReserva)

router.get("/getcanales",GetCanales)

router.post("/roomsavaible",roomAvaible)

router.get("/getdetailreservation/:id",getDetailReservation)

router.post("/postcleanlineroom",postCleanlineRooms)

router.get("/getcountry",getCountry)

router.post("/updatereservation/:id",updateDetailReservation)

router.post("/updateDetailPagos/:id",updateDetailPagos)

router.get("/getdetailhuespedes/:id",getdetailhuespedes)

router.post("/postdetailupdate/:id",postdetailUpdate)

module.exports={router} 