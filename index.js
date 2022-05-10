const express = require('express')
const  AuthRoutes  = require('./Routes/Auth')
const  ListRoutes  = require('./Routes/Listmotel')
const cors = require('cors')
require('dotenv').config()
const ReverseMd5 = require('reverse-md5')

//connection database

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

app.use('/api/auth',AuthRoutes.router)
app.use('/api',ListRoutes.router)

//initial port
app.listen(process.env.PORT,() =>{
    console.log(`server connect  port ${4000}`)
}) 