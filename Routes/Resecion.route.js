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
  UploadFile,
  ValidCheckingAll,
  UploadFileSignature,
  KPIgetUser,
  KpiTop,
  GetPublicidad,
  searchUsersaved,
  postInsetRoomsOcasional,
  occasionalCartRoomInsertion,
  getRoomsOcasionalesDetail,
  occasionalUpdateProductData
} = require("../controller/Resecion");
const { ValidarCampos } = require("../middleweres/middleweres");
const router = require("express").Router();

router.get("/getroomsresecion/:id", GetRooms);

router.post(
  "/validateavaible",
  [
    check("desde", "es obligatorio").not().isEmpty(),
    check("hasta", "es obligatorio").not().isEmpty(),
    check("habitaciones", "es obligatorio").not().isEmpty(),
    check("disponibilidad", "es obligatorio").not().isEmpty(),
    check("id_estados_habitaciones", "es obligatorio").not().isEmpty(),
    check("ID_Canal", "es obligatorio").not().isEmpty(),
    check("Adultos", "es obligatorio").not().isEmpty(),
    check("Ninos", "es obligatorio").not().isEmpty(),
    check("Noches", "es obligatorio").not().isEmpty(),
    check("Observacion", "es obligatorio").not().isEmpty(),
    check("huespe", "es obligatorio").not().isEmpty(),
    check("valor", "es obligatorio").not().isEmpty(),
    check("ID_Tipo_Forma_pago", "es obligatorio").not().isEmpty(),
    check("abono", "es obligatorio").not().isEmpty(),
    check("valor_habitacion", "es obligatorio").not().isEmpty(),
    check("valor_dia_habitacion", "es obligatorio").not().isEmpty(),
    check("resepcion", "es obligatorio").not().isEmpty(),
    check("link", "es obligatorio").not().isEmpty(),
    check("id_hotel", "es obligatorio").not().isEmpty(),
    
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

router.post('/uploadfile',uploads.array("myFile",2),UploadFile)

router.post('/uploadfileSignature',uploads.array("myFile",1),UploadFileSignature)

router.post("/validChecking/:id",ValidCheckingAll)

router.post("/userIdKpi/",KPIgetUser)

router.get("/userKpiTop/",KpiTop)

router.get("/getpublicidad",GetPublicidad)

router.post("/searchUsersaved",searchUsersaved)

router.post("/RoomsOcasional",
[
    check("ID_habitacion","es obligatorio").not().isEmpty(),
    check("Fecha","es obligatorio").not().isEmpty(),
    check("Time_ingreso","es obligatorio").not().isEmpty(),
    check("Time_salida","es obligatorio").not().isEmpty(),
    check("id_user","es obligatorio").not().isEmpty(),
    check("Hora_adicional","es obligatorio").not().isEmpty(),
    check("Persona_adicional","es obligatorio").not().isEmpty(),
    check("Tipo_forma_pago","es obligatorio").not().isEmpty(),
    check("Abono","es obligatorio").not().isEmpty(),
    ValidarCampos
],postInsetRoomsOcasional)

router.post("/occasionalCartRoomInsertion",occasionalCartRoomInsertion)

router.post("/occasionalRoomDetails",getRoomsOcasionalesDetail)

router.post("/occasionalUpdateProductData",[
  check("Tipo_forma_pago","es obligatorio").not().isEmpty(),
  ValidarCampos
],occasionalUpdateProductData)

module.exports = { router };  
