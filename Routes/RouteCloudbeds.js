const { check } = require('express-validator');
const { GetHotels, GetHotelsbyID, GetReservationBypropertyID, getAvailableRoomTypes, PostpostReservation, getHotelDetails, GetReservationDetailBypropertyID, GetReservation, PostRegisterCloubeds, GetRegisterCloubes, PostPaymentCloubeds, GetPaymentCloubeds, PostRegisterSigoCloudbeds, getRoomTypes, getTaxesfree, webhooksStatus_changed, webhooksAdd_Guest, webhooksTransitions, PostReservationCloubeds, PostReservationCloubedsWithRateDetails, PostReservationCloubedValidateInvoince } = require('../controller/ControllerCloudbeds/ControllerCloudbeds');
const { ValidarCampos } = require('../middleweres/middleweres');

const router = require('express').Router()

router.post("/getHotel",getHotelDetails);

router.get("/getHotelbyID/:id",GetHotelsbyID);

router.post("/getReservationBypropertyID",GetReservationBypropertyID);

router.post("/GetReservationDetailBypropertyID",GetReservationDetailBypropertyID);

router.post("/GetReservation",GetReservation);

router.post("/PostRegisterCloubeds",PostRegisterCloubeds);

router.post("/PostRegisterSigoCloudbeds",[
    check("token","es obligatorio").not().isEmpty(),
    check("body","es obligatorio").not().isEmpty(),
    ValidarCampos
],PostRegisterSigoCloudbeds);

router.get("/GetRegisterCloubes/:id",GetRegisterCloubes);

router.post("/PostPaymentCloubeds",[
    check("ReservationID","es obligatorio").not().isEmpty(),
    check("subTotal","es obligatorio").not().isEmpty(),
    check("taxesFees","es obligatorio").not().isEmpty(),
    check("additionalItems","es obligatorio").not().isEmpty(),
    check("Date","es obligatorio").not().isEmpty(),
    check("propertyID","es obligatorio").not().isEmpty(),
    check("tokenCloudbes","es obligatorio").not().isEmpty(),
    ValidarCampos
],PostPaymentCloubeds);

router.get("/GetPaymentCloubeds/:id",GetPaymentCloubeds);

router.post("/getAvailableRoomTypes",[
    check("propertyID","es obligatorio").not().isEmpty(),
    check("startDate","es obligatorio").not().isEmpty(),
    check("endDate","es obligatorio").not().isEmpty(),
    check("token","es obligatorio").not().isEmpty(),
    check("counPeople","es obligatorio").not().isEmpty(),
    ValidarCampos
],getAvailableRoomTypes);

router.post("/PostpostReservation",[
    check("propertyID","es obligatorio").not().isEmpty(),
    check("token","es obligatorio").not().isEmpty(),
    check("startDate","es obligatorio").not().isEmpty(),
    check("endDate","es obligatorio").not().isEmpty(),
    check("guestFirstName","es obligatorio").not().isEmpty(),
    check("guestLastName","es obligatorio").not().isEmpty(),
    check("guestEmail","es obligatorio").not().isEmpty(),
    check("guestPhone","es obligatorio").not().isEmpty(),
    check("rooms","es obligatorio").not().isEmpty(),
    check("adults","es obligatorio").not().isEmpty(),
    check("children","es obligatorio").not().isEmpty(),
    check("dateCreated","es obligatorio").not().isEmpty(),
    check("number","es obligatorio").not().isEmpty(),
    check("exp_month","es obligatorio").not().isEmpty(),
    check("exp_year","es obligatorio").not().isEmpty(),
    check("cvc","es obligatorio").not().isEmpty(),
    check("card_holder","es obligatorio").not().isEmpty(),
    check("subtotal","es obligatorio").not().isEmpty(),
],PostpostReservation);

router.post("/getRoomTypes",getRoomTypes);

router.post("/webhooksStatus_changed",webhooksStatus_changed)

router.post("/webhooksAdd_Guest",webhooksAdd_Guest)

router.post("/webhooksTransitions",webhooksTransitions)

router.post("/getTaxesfree",getTaxesfree);

router.post("/ReservationCloubeds",[
    check("token","es obligatorio").not().isEmpty(),
    ValidarCampos
],PostReservationCloubeds);

router.post("/ReservationCloubedsWithRateDetails",[
    check("token","es obligatorio").not().isEmpty(),
    check("reservationID","es obligatorio").not().isEmpty(),
    ValidarCampos
],PostReservationCloubedsWithRateDetails);

router.post("/ReservationCloubedValidateInvoince",PostReservationCloubedValidateInvoince);

module.exports = { router };  