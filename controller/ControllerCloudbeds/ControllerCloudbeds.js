const {response, json, query} = require('express')


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const GetHotels =async(req,res=response) =>{

    try {
        const response = await fetch(`https://hotels.cloudbeds.com/api/v1.1/getHotels`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_IQWnqN9nTQLBc1mqd8DrCK8CiKbYjXiV` }
        });

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }

        const data = await response.json();

        return res.status(201).json({
            ok:true,
            data
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const GetHotelsbyID =async(req,res=response) =>{

    const {id} = req.params

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getHotelDetails?propertyID=${id}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_pSi8B1QEGnS2bdFXrQdSoC4KtUe7OkzS` }
        });

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
        
        const {data} = await response.json();

        return res.status(201).json({
            ok:true,
            data
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const GetReservationBypropertyID =async(req,res=response) =>{

    const {id} = req.params

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getReservations?propertyID=${id}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_pSi8B1QEGnS2bdFXrQdSoC4KtUe7OkzS` }
        });

        if (!response) {
            // If access is denied, return 401 status code
            if (response.status === 401) {
                return res.status(401).json({ ok: false });
            }
            // For other errors, return 500 status code
            return res.status(401).json({ ok: false });
        }

        const {data} = await response.json();

        if(!data){
            return res.status(401).json({
                ok:false
            })
        }

        return res.status(201).json({
            ok:true,
            data
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


const getAvailableRoomTypes =async(req,res=response) =>{

    const {propertyID,startDate,endDate,token,counPeople} = req.body

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getAvailableRoomTypes?propertyID=${propertyID}&startDate=${startDate}&endDate=${endDate}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer ${token}` }
        });

        if (!response) {
            // If access is denied, return 401 status code
            if (response.status === 401) {
                return res.status(401).json({ ok: false });
            }
            // For other errors, return 500 status code
            return res.status(401).json({ ok: false });
        }

        const {data,success} = await response.json();

        if(!success){
            return res.status(401).json({
                ok:false,
            })
        }

        const filteredRooms = data[0].propertyRooms.filter(room => {
            if(room.roomTypeNameShort !="HAB"){
                const maxGuests = parseInt(room.maxGuests);
                const meetsCondition = counPeople <= maxGuests
                return meetsCondition 
            }
        });

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const differenceInTime = endDateObj - startDateObj;

        const nights = differenceInTime / (1000 * 3600 * 24);

        const numberOfNights = Math.floor(nights);

        if(filteredRooms.length==0){
            return res.status(401).json({
                ok:false
            })
        }

        return res.status(201).json({
            ok:true,
            data:filteredRooms,
            startDate: startDate,
            endDate: endDate,
            nights: numberOfNights,
            counPeople:counPeople
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}




const PostpostReservation =async(req,res=response) =>{

    const { propertyID,
            token,
            startDate,
            endDate,
            guestFirstName,
            guestLastName,
            guestEmail,
            guestPhone,
            rooms,
            adults,
            children,
            dateCreated,
            number,
            exp_month,
            exp_year,
            cvc,
            card_holder,
            subtotal} = req.body
    try {


 

        const dataCard =  {
            "number":`${number}` ,
            "exp_month":exp_month, 
            "exp_year": exp_year,  // Código de seguridad (como string de 3 o 4 dígitos)
            "cvc": cvc,
            "card_holder":card_holder
        }


        const responsejSON = await fetch(` https://api.wompi.co/v1/merchants/pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ` },
        });

        if (responsejSON.status === 401) {
        return res.status(401).json({ ok: false });
        }

        const dataJson= await responsejSON.json();

        if(!dataJson){
            return res.status(401).json({
                ok:false
            })
        }
        const responseCardWompi = await fetch(`https://api.wompi.co/v1/tokens/cards`, {
            method: "POST",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ` },
            body:JSON.stringify(dataCard)
        });

        if (responseCardWompi.status === 401) {
            return res.status(401).json({ ok: false });
        }
           
        const productToken= await responseCardWompi.json();
       
        if(!productToken){
            return res.status(401).json({
                ok:false
            })
        }

        const acceptance_token = dataJson.data.presigned_acceptance.acceptance_token
        const ProductoToken = productToken.data.id



        let total = subtotal; // example value
        let amount_in_cents = total * 100; // add two zeros

        const dataTransTions ={
            "public-key": "pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ",
            "amount_in_cents":amount_in_cents,
            "currency": "COP",
            "customer_email": guestEmail,
            "reference":ProductoToken,
            "acceptance_token": acceptance_token,
                "payment_method": {
                    "type": "CARD",
                    "installments": 1, // Número de cuotas
                    "token":ProductoToken
                }
        }
      
        const responseTranstion = await fetch(` https://api.wompi.co/v1/transactions`, {
            method: "POST",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ` },
            body:JSON.stringify(dataTransTions)
        });

     

        if (responseTranstion.status === 422) {
            const messege= await responseTranstion.json();
           
            return res.status(401).json({
                 ok: false,
                 msg:messege.error.messages });
        }


        await delay(10000);
           
        const Trasntion= await responseTranstion.json();

        const getTranstion = await fetch(` https://api.wompi.co/v1/transactions/${Trasntion.data.id}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ` },
        });

        const getValidTransation= await getTranstion.json();

        console.log(getValidTransation)

        if(getValidTransation.data.status =="APPROVED"){
            
        const formData = new FormData();
        formData.append("startDate", startDate)
        formData.append("endDate",endDate)
        formData.append("guestFirstName",guestFirstName)
        formData.append("guestLastName", guestLastName)
        formData.append("guestCountry", "CO")
        formData.append("guestEmail", guestEmail)
        formData.append("guestPhone", guestPhone)
        formData.append("rooms", JSON.stringify(rooms));
        formData.append("adults", JSON.stringify(adults));
        formData.append("children", JSON.stringify(children));
        formData.append("paymentMethod", "Wompi")
        formData.append("dateCreated", dateCreated)
        formData.append("sendEmailConfirmation", "true") // es necesario que este valor sea una cadena

        const response = await fetch(`https://api.cloudbeds.com/api/v1.1/postReservation?propertyID=${propertyID}`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
    
        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
        
        const reservationData = await response.json();
        const { success, reservationID, grandTotal } = reservationData;
    
        if (!success) {
            return res.status(400).json({
                ok: false,
                error: "Reservation failed",
            });
        }
    
        const formDataPayment = new FormData();
        formDataPayment.append("amount", grandTotal);
        formDataPayment.append("type", "Wompi");
        formDataPayment.append("reservationID", reservationID);
    
        const responsePayment = await fetch(`https://api.cloudbeds.com/api/v1.1/postPayment?propertyID=${propertyID}`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formDataPayment
        });
    
        if (responsePayment.status === 401) {
            return res.status(401).json({ ok: false });
        }
    
        const paymentData = await responsePayment.json();
    
        if (!paymentData.success) {
            return res.status(400).json({
                ok: false,
                error: "Payment failed",
            });
        }
    
        return res.status(201).json({
            ok: true,
            reservationID,
        });
    }else if(getValidTransation.data.status =="DECLINED"){
        const formData = new FormData();
        formData.append("startDate", startDate)
        formData.append("endDate",endDate)
        formData.append("guestFirstName",guestFirstName)
        formData.append("guestLastName", guestLastName)
        formData.append("guestCountry", "CO")
        formData.append("guestEmail", guestEmail)
        formData.append("guestPhone", guestPhone)
        formData.append("rooms", JSON.stringify(rooms));
        formData.append("adults", JSON.stringify(adults));
        formData.append("children", JSON.stringify(children));
        formData.append("paymentMethod", "Wompi")
        formData.append("dateCreated", dateCreated)
        formData.append("sendEmailConfirmation", "true") // es necesario que este valor sea una cadena

        const response = await fetch(`https://api.cloudbeds.com/api/v1.1/postReservation?propertyID=${propertyID}`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
    
        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
        
        const reservationData = await response.json();
        const { success, reservationID, grandTotal } = reservationData;
    
        if (!success) {
            return res.status(400).json({
                ok: false,
                error: "Reservation failed",
            });
        }
    
        return res.status(201).json({
            ok: true,
        });
    }else if(getValidTransation.data.status =="PENDING"){
        const formData = new FormData();
        formData.append("startDate", startDate)
        formData.append("endDate",endDate)
        formData.append("guestFirstName",guestFirstName)
        formData.append("guestLastName", guestLastName)
        formData.append("guestCountry", "CO")
        formData.append("guestEmail", guestEmail)
        formData.append("guestPhone", guestPhone)
        formData.append("rooms", JSON.stringify(rooms));
        formData.append("adults", JSON.stringify(adults));
        formData.append("children", JSON.stringify(children));
        formData.append("paymentMethod", "Wompi")
        formData.append("dateCreated", dateCreated)
        formData.append("sendEmailConfirmation", "true") // es necesario que este valor sea una cadena

        const response = await fetch(`https://api.cloudbeds.com/api/v1.1/postReservation?propertyID=${propertyID}`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
    
        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
        
        const reservationData = await response.json();
        const { success, reservationID, grandTotal } = reservationData;
    
        if (!success) {
            return res.status(400).json({
                ok: false,
                error: "Reservation failed",
            });
        }
    
        const formDataPayment = new FormData();
        formDataPayment.append("amount", grandTotal);
        formDataPayment.append("type", "Wompi");
        formDataPayment.append("reservationID", reservationID);
    
        const responsePayment = await fetch(`https://api.cloudbeds.com/api/v1.1/postPayment?propertyID=${propertyID}`, {
            method: "POST",
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formDataPayment
        });
    
        if (responsePayment.status === 401) {
            return res.status(401).json({ ok: false });
        }
    
        const paymentData = await responsePayment.json();
    
        if (!paymentData.success) {
            return res.status(400).json({
                ok: false,
                error: "Payment failed",
            });
        }
    
        return res.status(201).json({
            ok: true,
            reservationID,
        });
    }

      
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"ocurrio un error"
        })
    }
}


module.exports ={
    GetHotels,
    GetHotelsbyID,
    GetReservationBypropertyID,
    getAvailableRoomTypes,
    PostpostReservation
}