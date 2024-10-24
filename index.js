const express = require("express");
const AuthRoutes = require("./Routes/Auth");
const ListRoutes = require("./Routes/Listmotel");
const AdminRoute = require("./Routes/Admin.route");
const ResecionRoute = require("./Routes/Resecion.route");
const Hotels = require("./Routes/Hotels")
const RouterCloudbeds = require("./Routes/RouteCloudbeds")
const RouterSigo = require("./Routes/RouteSigo")
const RouterWompi = require("./Routes/RouteWompi")
const RouteWenSite = require("./Routes/Website.route")
const cors = require("cors");
require("dotenv").config();
const bodyParser = require('body-parser');
var path = require('path')
const { dbConnection } = require("./database/Config");
const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");
const puppeteer = require('puppeteer');

const cloudinary = require('cloudinary').v2;

dbConnection();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


//connection database

const server = http.createServer(app);

app.use(express.static('public'));
app.use(express.json());
app.use(cors())

app.use("/api/auth", AuthRoutes.router);
app.use("/api", ListRoutes.router);
app.use("/api/admin", AdminRoute.router);
app.use("/api/resecion", ResecionRoute.router);
app.use("/api/hotels",Hotels.router)
app.use("/api/hotels/cloubeds",RouterCloudbeds.router)
app.use("/api/hotels/wompi",RouterWompi.router)
app.use("/api/hotels/sigo",RouterSigo.router)
app.use("/api/hotels/sigo",RouterSigo.router)
app.use("/api/hotels/webSite",RouteWenSite.router)
app.use('/public', express.static(path.join(__dirname, 'public')));

//"https://test-frontent-n9ec.vercel.app"
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? "https://test-frontent-n9ec.vercel.app" : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("conectado")

  socket.on("disconnect", () =>{
    console.log("a user disconnect")
  })
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", (senderName) => {
    io.emit("sendNotification", senderName);
  });

});

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  // Aquí es donde recibirás los datos del webhook
  const webhookEvent = req.body;

  // Imprimir los datos del webhook en consola

  // Realiza cualquier procesamiento que necesites (guardar en DB, procesar el evento, etc.)
  // Ejemplo: Guardar la reserva en la base de datos

  // Responder al servicio de webhook que se recibió correctamente
  res.status(200).send('Webhook recibido');
});

//hello

server.listen(app.listen(process.env.PORT || 5000, () => {
  console.log("SERVER IS RUNNING");
}))

//var port_number = app.listen(process.env.PORT || 5000);
//initial port
//app.listen(port_number);\https://codesandbox.io/s/silly-mayer-lls9hm?file=/src/App.js:860-912