
const router =require('express').Router()
const { LisMotel,listMotelisid } = require('../controller/ListMotel')

router.get('/listmotel',LisMotel)

router.get('/listmotel/:id',listMotelisid)

module.exports ={router}
