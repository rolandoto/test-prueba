const express = require('express')
const { dbConnection } = require('./database/Config')
const { router } = require('./Routes/Routes')
require('dotenv').config()

//connection database
dbConnection()

const app = express()

app.use(express.json())

app.use('/api/auth',router)

//initial port
app.listen(process.env.PORT,() =>{
    console.log(`server connect  port ${4000}`)
})