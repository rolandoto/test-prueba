
const router =require('express').Router()
const { LisMotel,listMotelisid, listBictacoras, reservas } = require('../controller/ListMotel')

router.get('/listmotel',LisMotel)

router.get('/listmotel/:id',listMotelisid)

router.get("/listbitacoras/:id",listBictacoras)

router.get("/reservas/:id",reservas)

module.exports ={router}
