const { SearchHotels } = require('../controller/Hotels')

const router =require('express').Router()

router.post("/SeacrhHotelsById",SearchHotels)

module.exports = { router };  