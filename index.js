const express = require("express");
const AuthRoutes = require("./Routes/Auth");
const ListRoutes = require("./Routes/Listmotel");
const AdminRoute = require("./Routes/Admin.route");
const ResecionRoute = require("./Routes/Resecion.route");
const Hotels = require("./Routes/Hotels")
const cors = require("cors");
require("dotenv").config();
var path = require('path')
const { dbConnection } = require("./database/Config");
const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");

dbConnection();
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
app.use('/public', express.static(path.join(__dirname, 'public')));

const io = new Server(server, {
  cors: {
    origin: "https://test-frontent-n9ec.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("conectado")
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", (senderName) => {
    io.emit("sendNotification", senderName);
  });

  socket.on("mousemove", (data) => {
    const { userId, x, y ,Id_hotel} = data;


    // Aquí puedes utilizar el identificador del usuario (userId) para identificar al usuario
    // y realizar las acciones de seguimiento en tiempo real correspondientes.
    
    // Reenviar los datos del mouse a todos los clientes conectados
    io.emit("clientmousemove", data);
  });


});

server.listen(app.listen(process.env.PORT || 5000, () => {
  console.log("SERVER IS RUNNING");
}))

//var port_number = app.listen(process.env.PORT || 5000);
//initial port
//app.listen(port_number);\https://codesandbox.io/s/silly-mayer-lls9hm?file=/src/App.js:860-912