
const router =require('express').Router()
const { LisMotel,listMotelisid,reservas, forgetlfulnes, forgetlfulnesInsert, ListBooking, ListMaintenance, UpdateMaintenance, InsertMaintenance, ProductInvoince, MinImboxrRecesion, MinImboxMaintance, MinImboxMaintanceInsert } = require('../controller/ListMotel')
    
router.get('/listmotel',LisMotel)

router.get('/listmotel/:id',listMotelisid)

router.get("/reservas/:id",reservas)

router.get("/forgetfulnes",forgetlfulnes)

router.post("/forgetfulnesinsert",forgetlfulnesInsert)

router.get("/listbooking/:id",ListBooking)

router.get("/listMaintenance/:id",ListMaintenance)

router.post("/updatemaintenance/:id",UpdateMaintenance)

router.post("/insertmaintenance",InsertMaintenance)

router.post("/productinvoince",ProductInvoince)

router.get("/minImboxrecesion/:id",MinImboxrRecesion)

router.get("/minImboxMaintance/:id",MinImboxMaintance)

router.post("/minimboxmaintanceinsert",MinImboxMaintanceInsert)




module.exports ={router}