
const router =require('express').Router()
const { LisMotel,listMotelisid, listBictacoras, reservas, formats, forgetlfulnes, forgetlfulnesInsert, numberEmergencies, ListBooking, ListMaintenance, UpdateMaintenance, InsertMaintenance } = require('../controller/ListMotel')
    
router.get('/listmotel',LisMotel)

router.get('/listmotel/:id',listMotelisid)

router.get("/listbitacoras/:id",listBictacoras)

router.get("/reservas/:id",reservas)

router.get("/listformats/:id",formats)

router.get("/forgetfulnes",forgetlfulnes)

router.post("/forgetfulnesinsert",forgetlfulnesInsert)

router.get("/numberemergencies",numberEmergencies)

router.get("/listbooking/:id",ListBooking)

router.get("/listMaintenance/:id",ListMaintenance)

router.post("/updatemaintenance/:id",UpdateMaintenance)

router.post("/insertmaintenance",InsertMaintenance)

module.exports ={router}