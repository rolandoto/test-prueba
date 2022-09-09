const { GetRooms } = require("../controller/Resecion")

const router = require("express").Router()

router.get("/getroomsresecion/:id",GetRooms)

module.exports={router}