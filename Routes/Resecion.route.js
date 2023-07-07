const { check } = require("express-validator");
const { response, query } = require("express");
var path = require('path')
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './public')
  },
  filename: function (req, file, callback) {
      callback(null, file.fieldname + Date.now() + path.extname(file.originalname))
  }
})

var uploads = multer({ storage: storage })

const {
  GetRooms,
  insertReservaRecepcion,
  getTypePet,
  getReserva,
  validateAvaible,
  GetCanales,
  roomAvaible,
  getDetailReservation,
  postCleanlineRooms,
  getCountry,
  updateDetailReservation,
  updateDetailPagos,
  getdetailhuespedes,
  postdetailUpdate,
  updateDetailReserva,
  getRoomdetalle,
  uploadImage,
  insertCartReservation,
  getCartReservaction,
  getDetailChecking,
  handAddHuespe,
  HuespeCount,
  handResolution,
  handUpdateResoluction,
  handUpdateStatus,
  handDeleteReserva,
  handInformeAuditoria,
  handReservationChekin,
  handInformeCamarera,
  insertCartStore,
  handRoomToSell,
  handPayStoreReservation,
  updateDetailReservaTypeRoom,
  handAlltotalReservation,
  handChangeRoom,
  handCleanRoom,
  handInformaSotore,
  notiticar,
  handUpdateCreateReservation,
  byIdProduct,
  handValidDian,
  handInsertPayAbono,
  getpayABono,
  roomAvaibleInformeConsolidado,
  AccountErrings,
  informationByIdHotel,
  InformeMovimiento,
  PostInformeMovimiento,
  PostRoomDetailUpdate,
  updateReservationPunter,
  updateChangeTypreRange,
  handChangeFormapago,
  getReservationSearch,
  UploadFile
} = require("../controller/Resecion");
const { ValidarCampos } = require("../middleweres/middleweres");
const router = require("express").Router();

router.get("/getroomsresecion/:id", GetRooms);

router.post(
  "/validateavaible",
  [
    check("abono", "el abono  es obligatorio").not().isEmpty(),
    check("ID_Tipo_Forma_pago", "el ID_Tipo_Forma_pago  es obligatorio")
      .not()
      .isEmpty(),
    check("Observacion", "el Observacion  es obligatorio").not().isEmpty(),
    check("Noches", "el Noches  es obligatorio").not().isEmpty(),
    check("Infantes", "el Infantes  es obligatorio").not().isEmpty(),
    check("ID_Talla_mascota", "el ID_Talla_mascota  es obligatorio")
      .not()
      .isEmpty(),
    check("Ninos", "el Ninos  es obligatorio").not().isEmpty(),
    check("Adultos", "el Adultos  es obligatorio").not().isEmpty(),
    check("ID_Canal", "el id canal es obligatorio").not().isEmpty(),
    check("habitaciones", "la habitacion es obligatoria").not().isEmpty(),
    check("desde", "la fecha inicial es obligatoria").not().isEmpty(),
    check("hasta", "la fecha final es obligatoria").not().isEmpty(),
    check("Tipo_persona", "la fecha final es obligatoria").not().isEmpty(),
    ValidarCampos,
  ],
  validateAvaible
);

router.post("/postinsertreservaresecipcion", insertReservaRecepcion);

router.get("/gettypepet", getTypePet);

router.get("/getreservarecepcion/:id", getReserva);

router.get("/getcanales", GetCanales);

router.post(
  "/roomsavaible",
  [
    check("desde", "el desde  es obligatorio").not().isEmpty(),
    check("hasta", "el hasta  es obligatorio").not().isEmpty(),
    check("habitaciones", "el habitaciones  es obligatorio").not().isEmpty(),
    check("ID_Habitaciones", "el ID_Habitaciones  es obligatorio")
      .not()
      .isEmpty(),
  ],
  ValidarCampos,
  roomAvaible
);

router.get("/getdetailreservation/:id", getDetailReservation);

router.post("/postcleanlineroom", postCleanlineRooms);

router.get("/getcountry", getCountry);

router.post("/updatereservation/:id", updateDetailReservation);

router.post("/updateDetailPagos/:id", updateDetailPagos);

router.get("/getdetailhuespedes/:id", getdetailhuespedes);

router.post("/postdetailupdate/:id", postdetailUpdate);

router.post("/updatedetailreserva", updateDetailReserva);

router.get("/getroomdetalle/:id", getRoomdetalle);

router.post("/uploadimage", uploadImage);

router.post("/insertcartreservation", insertCartReservation);

router.post("/insertcartstore",insertCartStore)

router.get("/getcartreservaction/:id", getCartReservaction);

router.get("/getdetailchecking/:id", getDetailChecking);

router.post("/handaddhuespe/:id", handAddHuespe);

router.get("/huespecount/:id", HuespeCount);

router.get("/resolucion", handResolution);

router.post("/updateresolution/:id", handUpdateResoluction);

router.post("/handupdatestatus/:id", handUpdateStatus);

router.post("/handdeletereserva/:id", handDeleteReserva);

router.post("/handinformeauditoria/:id", handInformeAuditoria);

router.post("/reservaschecking/:id", handReservationChekin);

router.post("/informecamerera/:id",handInformeCamarera)

router.post("/informeroomtosell/:id",handRoomToSell)

router.post("/handstorereservation/:id",handPayStoreReservation)

router.post("/updatedetailReservaTypeRoom",updateDetailReservaTypeRoom)

router.post("/handAlltotalReservationBiId/:id",handAlltotalReservation)

router.post("/handChangeRoomById/:id",handChangeRoom)

router.post("/handCleanRoom/:id",handCleanRoom)

router.get("/handInformaSotreById/:id",handInformaSotore)

router.post("/UpdateCreateReservation/",handUpdateCreateReservation)

router.post("/notificar"  ,notiticar)

router.post("/byIdProduct/:id",byIdProduct)

router.post("/ValidDianById",handValidDian)

router.post("/insertPayAbono",handInsertPayAbono)

router.get("/getPayabono/:id",getpayABono)

router.post("/informeConsolidadoByHotel/:id",roomAvaibleInformeConsolidado)

router.post("/informeAccount/:id",AccountErrings)

router.get("/informationByIdHotel/:id",informationByIdHotel)

router.post("/informeMovimiento/:id",InformeMovimiento)

router.post("/PostInformeMovimiento/:id",PostInformeMovimiento)

router.post("/RoomDetail",PostRoomDetailUpdate)

router.post("/UpdatePonter",updateReservationPunter)

router.post("/UpdatePonterRange",updateChangeTypreRange)

router.post("/updateformapago",handChangeFormapago)

router.get("/getReservationSearch",getReservationSearch)

router.post('/uploadfile',uploads.single("myFile"),UploadFile)

module.exports = { router };  
