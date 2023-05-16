const express = require("express");
const AuthRoutes = require("./Routes/Auth");
const ListRoutes = require("./Routes/Listmotel");
const AdminRoute = require("./Routes/Admin.route");
const ResecionRoute = require("./Routes/Resecion.route");
const cors = require("cors");
require("dotenv").config();
const { dbConnection } = require("./database/Config");

dbConnection();
//connection database
const app = express();

app.use(express.static("public"));
app.use(express.json());

app.use(cors());

app.use("/api/auth", AuthRoutes.router);
app.use("/api", ListRoutes.router);
app.use("/api/admin", AdminRoute.router);
app.use("/api/resecion", ResecionRoute.router);

// parse application/json
var port_number = app.listen(process.env.PORT || 5000);



//initial port
app.listen(port_number);





