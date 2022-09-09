const express = require('express')
const  AuthRoutes  = require('./Routes/Auth')
const  ListRoutes  = require('./Routes/Listmotel')
const AdminRoute = require("./Routes/Admin.route")
const ResecionRoute = require("./Routes/Resecion.route")
const cors = require('cors')
require('dotenv').config()
const ReverseMd5 = require('reverse-md5')
const  {dbConnection}= require("./database/Config")

dbConnection()

//connection database
const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

app.use('/api/auth',AuthRoutes.router)
app.use('/api',ListRoutes.router)
app.use("/api/admin",AdminRoute.router)
app.use("/api/resecion",ResecionRoute.router)

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const inputPath = '/path/to/files.jpg';
const formData = new FormData();
formData.append('size', 'auto');
formData.append('image_file', fs.createReadStream(inputPath), path.basename("sdasdsadas"));

//initial port
app.listen(process.env.PORT,() =>{
    console.log(`server connect  port ${4000}`)
})