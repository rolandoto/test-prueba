const express = require('express')
const AuthRoutes  = require('./Routes/Auth')
const ListRoutes  = require('./Routes/Listmotel')
const AdminRoute = require("./Routes/Admin.route")
const ResecionRoute = require("./Routes/Resecion.route")
const cors = require('cors')
require('dotenv').config()
const ReverseMd5 = require('reverse-md5')
const {dbConnection}= require("./database/Config")
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const https  = require("https")
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

app.use(express.urlencoded({
    extended: true
}));
 
// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const Jimp = require("jimp");

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const inputPath = '/path/to/files.jpg';

const formData = new FormData();
formData.append('size', 'auto');
formData.append('image_file', fs.createReadStream(inputPath), path.basename("sdasdsadas"));

const uploadImage = async (req, res, next) => {

    try {
           // to declare some path to store your converted image
           const path = './images/'+Date.now()+'.png'

           const imgdata = req.body.base64image;
   
           const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
          
           fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
            
           return res.status(201).json({
            ok:true
           })

    } catch (e) {
       return res.status(401).json({
        ok:false
       })
    }
}

app.post('/upload/image', uploadImage)

//initial port
app.listen(process.env.PORT,() =>{
    console.log(`server connect  port ${4000}`)
})