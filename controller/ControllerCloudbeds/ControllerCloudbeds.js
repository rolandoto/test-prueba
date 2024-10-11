const {response, json, query} = require('express');
const { pool } = require('../../database/connection');
const crypto = require('crypto');
const { URLSearchParams } = require('url');


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const getHotelDetails =async(req,res=response) =>{

    const {propertyID,token} = req.body

  
    try {
        const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getHotelDetails?propertyID=${propertyID}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer ${token}` }
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

    const {propertyID,token,search} = req.body

   
    try {

        const fetchReservations = async (searchType, searchValue) => {
            const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getReservations?propertyID=${propertyID}&${searchType}=${searchValue}`, {
                method: "GET",
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Verifica si la respuesta no es correcta (4xx o 5xx)
            if (!response.ok) {
                if (response.status === 401) {
                    return { ok: false, status: 401, data: null };
                }
                return { ok: false, status: 500, data: null };
            }

            const data = await response.json();
            return { ok: true, status: 200, data: data.data };
        };

        // Busca por `firstName`
        let result = await fetchReservations('firstName', search);
        if (result.ok && result.data.length > 0) {
            return res.status(200).json({ ok: true, data: result.data });
        }

        // Si no encuentra resultados, busca por `lastName`
        result = await fetchReservations('lastName', search);
        if (result.ok && result.data.length > 0) {
            return res.status(200).json({ ok: true, data: result.data });
        }

        // Si tampoco encuentra por `lastName`, busca por `reservationID`
        result = await fetchReservations('reservationID', search);
        if (result.ok && result.data.length > 0) {
            return res.status(200).json({ ok: true, data: result.data });
        }

        // Si no se encuentran resultados en ninguno de los casos
        return res.status(404).json({ ok: false, message: 'No reservations found' });


    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


const GetReservationDetailBypropertyID =async(req,res=response) =>{

    const {propertyID,token,reservationID} = req.body

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getReservationsWithRateDetails?propertyID=${propertyID}&reservationID=${reservationID}`, {
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


const GetReservation =async(req,res=response) =>{

    const {propertyID,token,reservationID} = req.body

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getGuest?propertyID=${propertyID}&reservationID=${reservationID}`, {
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

        const {data} = await response.json();

        console.log(data)

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

        const excludedRoomTypes = ["CLASICA (ocasional)","JACUZZI (ocasional)","AIRE (ocasional)","Hab Virtuales VENTILADOR (ocasional)","Hab Virtuales AIRE (ocasional)","Hab virtuales CLASICAS (Ocasionales)","Hab virtuales BAÑERA (Ocasionales)"];

        const filteredRooms = data[0].propertyRooms.filter(room => {
            if (!excludedRoomTypes.includes(room.roomTypeName)) {
                const maxGuests = parseInt(room.maxGuests, 10);
                return counPeople <= maxGuests;
            }
            return false;
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

    const propertyMap = {
        315187: {
          pub_prud: "pub_prod_cDEtQv88NubGXtHe93BPDlHlQE7PiFYE",
          prod_integrity: "prod_integrity_RNL8ipoo3kL967PV9EsvzFaR7PIBDYGl"
        },
        315188: {
          pub_prud: "pub_prod_t6vU4sNJVhfhfSZZ19lxqztcyX4m6SC1",
          prod_integrity: "prod_integrity_jFRyzKXDRCXWTQDMJq8cjGWPwhHBMN34"
        },
        315189: {
          pub_prud: "pub_prod_XwhXR7ZHlmCyco8zcGEXTZtweK5JELEH",
          prod_integrity: "prod_integrity_EBzQdc21H2auF17sF0DGRFcykCQVcna9"
        },
        315191: {
          pub_prud: "pub_prod_S4fZBanQpzL1Bf9Z1qP4sssh8vVS2aus",
          prod_integrity: "prod_integrity_YaYbpHVcNgevN209DPL3bsDGaqakxeEj"
        },
        315192: {
          pub_prud: "pub_prod_gs7xg5A9jFrZAXMFdITBN8BB7MquPm2l",
          prod_integrity: "prod_integrity_RPY4gLaZXn752qyrrBwdDj7GlP0JWauC"
        },
        315193: {
          pub_prud: "pub_prod_4K8DnlOLsTbxSBuXcBaXYorzq662AkkD",
          prod_integrity: "prod_integrity_aMTK18bVmDiEcni4ypf1xSzYoYzyr2st"
        }
      };
      
      // Obtener los valores para propertyID
      let pub_prud = "";
      let prod_integrity = "";
      
      if (propertyID === 315187 || propertyID === 315193) {
        pub_prud = propertyMap[315193].pub_prud;
        prod_integrity = propertyMap[315193].prod_integrity;
      } else if (propertyMap[propertyID]) {
        pub_prud = propertyMap[propertyID].pub_prud;
        prod_integrity = propertyMap[propertyID].prod_integrity;
      } else {
        console.log("Property ID no encontrado.");
      }

   
      
    const responsejSON = await fetch(` https://api.wompi.co/v1/merchants/${pub_prud}`, {
        method: "GET",
        headers: { 'Content-type': 'application/json',
        'Authorization': `Bearer ${pub_prud}` },
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
        'Authorization': `Bearer ${pub_prud}` },
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

    console.log(ProductoToken)
    console.log(amount_in_cents)
    console.log(prod_integrity)

    const cadenaConcatenada = `${ProductoToken}${amount_in_cents}COP${prod_integrity}`;
    const hash = crypto.createHash('sha256');
    hash.update(cadenaConcatenada);
    const hashHex = hash.digest('hex');

    const dataTransTions ={
        "public-key": `${pub_prud}` ,
        "amount_in_cents":amount_in_cents,
        "currency": "COP",
        "signature":  hashHex,
        "customer_email": guestEmail,
        "reference":ProductoToken,
        "acceptance_token": acceptance_token,
            "payment_method": {
                "type": "CARD",
                "installments": 1, // Número de cuotas
                "token":ProductoToken
            }
    }
    
  
    const responseTranstion = await fetch(`https://api.wompi.co/v1/transactions`, {
        method: "POST",
        headers: { 'Content-type': 'application/json',
        'Authorization': `Bearer ${pub_prud}` },
        body:JSON.stringify(dataTransTions)
    });

 

    if (responseTranstion.status === 422) {
        const messege= await responseTranstion.json();
        console.log(messege)
        return res.status(401).json({
             ok: false,
             msg:messege.error.messages });
    }
   
    
    await delay(10000);
       
    const Trasntion= await responseTranstion.json();



    const getTranstion = await fetch(` https://api.wompi.co/v1/transactions/${Trasntion.data.id}`, {
        method: "GET",
        headers: { 'Content-type': 'application/json',
        'Authorization': `Bearer ${pub_prud}` },
    });

    const getValidTransation= await getTranstion.json();

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
                console.log(paymentData)
                return res.status(201).json({
                    ok: true
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
    const { success } = reservationData;

    if (!success) {
        return res.status(400).json({
            ok: false,
            error: "Reservation failed",
        });
    }

    return res.status(201).json({
        ok: true
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
        return res.status(401).json({
            ok: false,
            error: "Payment failed",
        });
    }
    

    return res.status(201).json({
        ok: true
    });
}

  
} catch (error) {
    return res.status(401).json({
        ok:false,
        msg:"ocurrio un error"
    })
}
    /**
     * 
     * 
     * 
     */

}

async function handleCustomerAfterInsert(req, res, token, body) {


    try {
      // Fetch customer by identification
      const responseCustomer = await fetch(`https://api.siigo.com/v1/customers?identification=${body.identification}`, {
        method: "GET",
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
          'Partner-Id': 'officegroup'
        },
      });
  
      if (!responseCustomer.ok) {
        return res.status(500).json({ ok: false, error: 'Error fetching customer' });
      }
  
      const customerByIdDocument = await responseCustomer.json();
      const ByIdDocument = customerByIdDocument.results[0]?.id;
  
      // Decide whether to update or create the customer
      const apiUrl = ByIdDocument
        ? `https://api.siigo.com/v1/customers/${ByIdDocument}` // Update existing customer
        : `https://api.siigo.com/v1/customers`; // Create new customer
  
      const method = ByIdDocument ? "PUT" : "POST";
  
      // Update or create customer
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
          'Partner-Id': 'officegroup'
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        const status = response.status === 400 ? 401 : response.status;
        return res.status(status).json({ ok: false, error: 'Error saving customer data' });
      }
  
      const data = await response.json();
      return res.status(201).json({ ok: true, data });
  
    } catch (error) {
      console.error('Error in handleCustomerAfterInsert:', error);
      return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  }


const PostRegisterCloubeds =async(req,res=response) =>{

    const {ID_Tipo_documento,ID_city,ReservationID,token,body} = req.body

    const date ={
        ID_Tipo_documento:ID_Tipo_documento,
        ID_city:ID_city,
        ReservationID:ReservationID,
    }

    try {

        await pool.query('SELECT * FROM RegisterCloubeds WHERE ReservationID = ?', [ReservationID], (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: "Error checking existing reservation"
                });
            }
        
            if (results.length > 0) {
                // ReservationID already exists, update the existing record
                pool.query('UPDATE RegisterCloubeds SET ? WHERE ReservationID = ?', [date, ReservationID], async(err, result) => {
                    if (err) {
                        return res.status(401).json({
                            ok: false,
                            msg: "Error updating data"
                        });
                    } else {
                        await handleCustomerAfterInsert(req, res, token, body);
                    }
                });
            } else {
                // ReservationID does not exist, proceed with insert
                pool.query('INSERT INTO RegisterCloubeds SET ?',  date, async(err, result) => {
                    if (err) {
                        return res.status(401).json({
                            ok: false,
                            msg: "Error inserting data"
                        });
                    } else {
                        await handleCustomerAfterInsert(req, res, token, body);
                    }
                });
            }
        });
       
    } catch (error) {
            console.log(error)
        return res.status(401).json({
            ok:false
        })
    }
}


const PostRegisterSigoCloudbeds =async(req,res=response) =>{

  const {token,body} = req.body

  try {   
        const responseCustomer = await fetch(`https://api.siigo.com/v1/customers?identification=${body.identification}`, {
            method: "GET",
            headers: {
              "Authorization": token,
              'Content-Type': 'application/json',
              'Partner-Id': 'officegroup'
            },
          });
      
          if (!responseCustomer.ok) {
            return res.status(500).json({ ok: false, error: 'Error fetching customer' });
          }
      
          const customerByIdDocument = await responseCustomer.json();
          const ByIdDocument = customerByIdDocument.results[0]?.id;
      
          // Decide whether to update or create the customer
          const apiUrl = ByIdDocument 
            ? `https://api.siigo.com/v1/customers/${ByIdDocument}` // Update existing customer
            : `https://api.siigo.com/v1/customers`; // Create new customer
      
          const method = ByIdDocument ? "PUT" : "POST";
      
          // Update or create customer
          const response = await fetch(apiUrl, {
            method: method,
            headers: {
              "Authorization": token,
              'Content-Type': 'application/json',
              'Partner-Id': 'officegroup'
            },
            body: JSON.stringify(body)
          });
      
          if (!response.ok) {
            const status = response.status === 400 ? 401 : response.status;
            return res.status(status).json({ ok: false, error: 'Error saving customer data' });
          }
      
          const data = await response.json();
          return res.status(201).json({ ok: true, data });

 
  } catch (error) {
      
      return res.status(401).json({
          ok:false
      })
  }
}



const GetRegisterCloubes =async(req,res=response) =>{

    const {id} = req.params


    try {

        await pool.query('SELECT tableName.City, ID_Tipo_documento,ID_city,ReservationID FROM RegisterCloubeds INNER JOIN tableName on tableName.ID = RegisterCloubeds.ID_city WHERE ReservationID = ?;', [id], (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: "Error checking existing reservation"
                });
            }else{
                return res.status(201).json({
                    ok:true,
                    query:results
                })
            }
            
        });
       
    } catch (error) {
         
        return res.status(401).json({
            ok:false
        })
    }
}





const PostPaymentCloubeds =async(req,res=response) =>{

    const {ReservationID,subTotal,taxesFees,additionalItems,Date,body,token,id_user,propertyID,tokenCloudbes} = req.body

    const date ={
        ReservationID:ReservationID,
        subTotal:subTotal,
        taxesFees:taxesFees,
        additionalItems:additionalItems,
        Date:Date
    }

    try {

        const response = await fetch(`https://api.siigo.com/v1/invoices`, {
            method: "POST",
            headers: {
                "Authorization":token,
                'Content-Type': 'application/json',
                'Partner-Id': 'officegroup'
              },
             body:JSON.stringify(body)
        });

     

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }

        if (response.status === 400) {
            return res.status(401).json({ ok: false });
        }

        const data = await response.json();

        if(data.id){
            let dataDian ={
                Fecha:Date,
                id_user,
                Abono:subTotal,
                ID_facturacion:data.id,
                ID_Reserva:ReservationID
              }
            await pool.query('INSERT INTO Dian_facturacion_register set ?', dataDian, (err, customer) => {
                if(err){
                    return res.status(401).json({
                         ok:false,
                         msg:"error al insertar datos"
                    })
                 }else{

                       pool.query('INSERT INTO Payment_Cloudbeds SET ?',  date, (err, result) => {
                        if (err) {
                            return res.status(401).json({
                                ok: false,
                                msg: "Error inserting data"
                            });
                        } else {

                            const insertThrirdeQuery = async() =>{
                                            const formDataNote = new FormData();
                                            formDataNote.append("reservationID", ReservationID);
                                            formDataNote.append("reservationNote", "SE ENVIÓ FACTURACIÓN ELECTRÓNICA");
                                            const responseNote = await fetch(`https://api.cloudbeds.com/api/v1.1/postReservationNote?propertyID=${propertyID}`, {
                                                method: "POST",
                                                headers: { 
                                                    'Authorization': `Bearer ${tokenCloudbes}` 
                                                },
                                                body: formDataNote
                                            });
                                        
                                            if (responseNote.status === 401) {
                                                return res.status(401).json({ ok: false });
                                            }
                                        
                                            const note = await responseNote.json();

                                            
                                            if (!note.success) {
                                                return res.status(401).json({
                                                    ok: false,
                                                    error: "Payment failed",
                                                });
                                            }
                                            
                                            return res.status(201).json({
                                                ok: true,
                                                msg: "Data inserted successfully"
                                            });
                            }

                            insertThrirdeQuery()
                        }
                    });
                 }
              })   
        }
       
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


const GetPaymentCloubeds =async(req,res=response) =>{

    const {id} = req.params

    try {

        await pool.query('SELECT  ReservationID,SubTotal,AdditionalItems,TaxesFees,Date  FROM Payment_Cloudbeds WHERE ReservationID =?', [id], (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: "Error checking existing reservation"
                });
            }else{
                return res.status(201).json({
                    ok:true,
                    query:results
                })
            }
            
        });
       
    } catch (error) {
         
        return res.status(401).json({
            ok:false
        })
    }
}

const getRoomTypes =async(req,res=response) =>{

    const {propertyID,token} = req.body

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getRoomTypes?propertyID=${propertyID}`, {
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



const getTaxesfree =async(req,res=response) =>{

    const {propertyID,token} = req.body

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getTaxesAndFees?propertyID=${propertyID}`, {
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


const webhooksStatus_changed =async(req,res=response) =>{
    
    const webhookEvent = req.body;

    try {
        
        if(webhookEvent.status =="checked_in"){
            console.log(webhookEvent)
            const hotelInfoQuery = await pool.query("SELECT name, id, logo, Iva,Token,propertyID FROM hotels WHERE propertyID = ?", [webhookEvent.propertyID]); 

            const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getGuest?propertyID=${webhookEvent.propertyID}&reservationID=${webhookEvent.reservationID}`, {
                method: "GET",
                headers: { 'Content-type': 'application/json',
                'Authorization': `Bearer ${hotelInfoQuery[0].Token}` }
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
    
        
            const  customFields = data.customFields
        
            const validateCustomFields = (fields) => {
           
                // Verifica si el array está vacío
                if (!fields || fields.length === 0) {
                    return false;  // Retorna false si no hay campos
                }
                
                // Verifica si todos los campos tienen valores válidos
                return fields.every(field => field.customFieldValue && field.customFieldValue.trim() !== ''&& field.customFieldValue.trim() !== '0');
            };
            
            // Validación if 
            if (validateCustomFields(customFields)) {
                return res.status(201).json({
                    ok: true
                });
            } else {
                    const formDataNote = new FormData();
                    formDataNote.append("reservationID", webhookEvent.reservationID);
                    formDataNote.append("reservationNote", "HAY CAMPOS VACIOS");
                    const responseNote = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservationNote?propertyID=${webhookEvent.propertyID}`, {
                        method: "POST",
                        headers: { 
                            'Authorization': `Bearer ${hotelInfoQuery[0].Token}`},
                        body: formDataNote
                    });
                
                    if (responseNote.status === 401) {
                        console.log("error")
                        return res.status(401).json({ ok: false });
                    }
                
                    const note = await responseNote.json();
    
                    if (!note.success) {
                        return res.status(401).json({
                            ok: false,
                            error: "Payment failed",
                        });
                    }
    
                    const formData = new URLSearchParams();
                    formData.append("reservationID", webhookEvent.reservationID);
                    formData.append("status", "confirmed");
                    const responseCheck = await fetch(`https://api.cloudbeds.com/api/v1.2/putReservation`, {
                        method: "PUT",
                        headers: { 
                            'Authorization': `Bearer ${hotelInfoQuery[0].Token}`},
                        body:formData // Send the body as JSON
                    });
    
                    if (responseCheck.status === 401) {
                        console.log("error")
                        return res.status(401).json({ ok: false });
                    }
                
                    const check = await responseCheck.json();
    
                    if (!check.success) {
                        return res.status(401).json({
                            ok: false,
                            error: "Payment failed",
                        });
                    }
     
                    return res.status(201).json({
                        ok: true
                    });
            }

        }

    } catch (error) {
        
        return res.status(401).json({
            ok:false
        })

    }

}


const webhooksAdd_Guest =async(req,res=response) =>{

    const webhookEvent = req.body;


    try {

   
        const validateCustomFields = (fields) => {
           
            // Verifica si el array está vacío
            if (!fields || fields.length === 0) {
                return false;  // Retorna false si no hay campos
            }
            
            // Verifica si todos los campos tienen valores válidos
            return fields.every(field => field.customFieldValue && field.customFieldValue.trim() !== ''&& field.customFieldValue.trim() !== '0');
        };
        
        const reservationById = webhookEvent.propertyID ?  webhookEvent.reservationID : webhookEvent.reservationId
        const prepertyById = webhookEvent.propertyID ?  webhookEvent.propertyID : webhookEvent.propertyId
       
        const hotelInfoQuery = await pool.query("SELECT name, id, logo, Iva,Token,propertyID,Tra,RNT FROM hotels WHERE propertyID = ?", [prepertyById]); 
     
            const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getGuestsByFilter?propertyID=${prepertyById}&reservationID=${reservationById}`, {
                method: "GET",
                headers: { 'Content-type': 'application/json',
                'Authorization': `Bearer ${hotelInfoQuery[0].Token}` }
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

            console.log("2")

            let success = true;
            let completedQueries = 0;
            const totalQueries = data.length;

            const uniqueGuests = Array.from(new Set(data.map(guest => guest.guestID)))
                          .map(guestID => data.find(guest => guest.guestID === guestID));

            
            const responseReservation = await fetch(`https://api.cloudbeds.com/api/v1.1/getReservationsWithRateDetails?propertyID=${prepertyById}&reservationID=${reservationById}`, {
                method: "GET",
                headers: { 'Content-type': 'application/json',
                'Authorization': `Bearer ${hotelInfoQuery[0].Token}` }
            });
            
            if (!responseReservation) {
                // If access is denied, return 401 status code
                if (response.status === 401) {
                    return res.status(401).json({ ok: false });
                }
                // For other errors, return 500 status code
                return res.status(401).json({ ok: false });
            }
    
            const reservation = await responseReservation.json();
    
            console.log("3")
            if(!reservation){
                return res.status(401).json({
                    ok:false
                })
            }

            const reservationCheckIn =  reservation.data[0].reservationCheckIn
            const reservationCheckOut =  reservation.data[0].reservationCheckOut
            const subtotal =reservation.data[0].balanceDetailed.subTotal
            let amount_in_cents = subtotal * 100; // add two zeros


            uniqueGuests.forEach(async (guest) => {   
                const guestID = guest.guestID;
                const reservationID = guest.reservationID;
               
               
                const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getGuest?propertyID=${prepertyById}&guestID=${guestID}`, {
                    method: "GET",
                    headers: { 'Content-type': 'application/json',
                    'Authorization': `Bearer ${hotelInfoQuery[0].Token}` }
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
                
                const  customFields = data.customFields

                if (validateCustomFields(customFields)) {
                        const CountPeople= uniqueGuests.length
                    if(guest.isMainGuest){
                            await pool.query('SELECT * FROM Guest_cloudbed WHERE guestID = ?', guest.guestID, async(selectError, results) => {
                                if (selectError) {
                                    success = false;
                                } else {
                                    if (results.length === 0) {
                                        const body ={
                                            tipo_identificacion: customFields[1].customFieldValue,
                                            numero_identificacion:customFields[0].customFieldValue,
                                            nombres: data.firstName,
                                            apellidos:data.lastName,
                                            cuidad_residencia:customFields[4].customFieldValue,
                                            cuidad_procedencia:customFields[4].customFieldValue,
                                            numero_habitacion:guest.roomName,
                                            motivo:"hospedaje",
                                            numero_acompanantes:`${CountPeople}`,
                                            check_in:reservationCheckIn,
                                            check_out:reservationCheckOut,
                                            tipo_acomodacion:"Hotel",
                                            costo:amount_in_cents,
                                            nombre_establecimiento:hotelInfoQuery[0].name,
                                            rnt_establecimiento:hotelInfoQuery[0].RNT
                                    }
        
                                    const response = await fetch('https://pms.mincit.gov.co/one/', {
                                        method: 'POST',
                                        headers: {
                                        'Authorization': `token ${hotelInfoQuery[0].Tra}`,
                                        'Content-Type': 'application/json'
                                        },
                                    body:JSON.stringify(body)
                                    });
                                    
                                
                                    const responseData = await response.json();
                                    
                                    if(!responseData.code){
                                        return res.status(401).json({
                                            ok:false,
                                           
                                        })
                                    }
        
                                    const bodyGuest = {
                                        guestID:guestID,
                                        reservationID:reservationID,
                                        guestName:guest.guestName,
                                        Code:responseData.code,
                                        Date:reservationCheckIn,
                                        propertyID:prepertyById
                                    }
        
                                
                                    
                                        pool.query("INSERT INTO Guest_cloudbed SET ?", bodyGuest, async (insertError) => {
                                            if (insertError) {
                                                success = false;
                                                console.error("Error inserting record:", insertError);
                                            } else {
                                                // Post a reservation note
                                                const formDataNote = new FormData();
                                                formDataNote.append("reservationID", reservationById);
                                                formDataNote.append("reservationNote", "SE ENVIO TRA DEL HUESPED");
                                                const responseNote = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservationNote?propertyID=${prepertyById}`, {
                                                    method: "POST",
                                                    headers: { 
                                                        'Authorization': `Bearer ${hotelInfoQuery[0].Token}`
                                                    },
                                                    body: formDataNote
                                                });
                            
                                                if (responseNote.status === 401) {
                                                    console.log("error");
                                                    return res.status(401).json({ ok: false });
                                                }
                            
                                                const note = await responseNote.json();
                            
                                                if (!note.success) {
                                                    return res.status(401).json({
                                                        ok: false,
                                                        error: "Payment failed",
                                                    });
                                                }
                                                
                                                console.log(`GuestID ${guestID} insertado correctamente.`);
                                            }
                                            checkCompletion();
                                        });
                                    } else {
                                        // guestID exists, so now check the reservationID
                                        const existingReservation = results.find(r => r.reservationID === reservationById);
                                     
                           
                                        if (!existingReservation) {

                                                        
                                                    const body ={
                                                        tipo_identificacion: customFields[1].customFieldValue,
                                                        numero_identificacion:customFields[0].customFieldValue,
                                                        nombres: data.firstName,
                                                        apellidos:data.lastName,
                                                        cuidad_residencia:customFields[4].customFieldValue,
                                                        cuidad_procedencia:customFields[4].customFieldValue,
                                                        numero_habitacion:guest.roomName,
                                                        motivo:"hospedaje",
                                                        numero_acompanantes:`${CountPeople}`,
                                                        check_in:reservationCheckIn,
                                                        check_out:reservationCheckOut,
                                                        tipo_acomodacion:"Hotel",
                                                        costo:amount_in_cents,
                                                        nombre_establecimiento:hotelInfoQuery[0].name,
                                                        rnt_establecimiento:hotelInfoQuery[0].RNT
                                                }
                    
                                                const response = await fetch('https://pms.mincit.gov.co/one/', {
                                                    method: 'POST',
                                                    headers: {
                                                    'Authorization': `token ${hotelInfoQuery[0].Tra}`,
                                                    'Content-Type': 'application/json'
                                                    },
                                                body:JSON.stringify(body)
                                                });
                                                
                                            
                                                const responseData = await response.json();
                                                
                                                if(!responseData.code){
                                                    return res.status(401).json({
                                                        ok:false,
                                                    
                                                    })
                                                }
                    
                                                const bodyGuest = {
                                                    guestID:guestID,
                                                    reservationID:reservationID,
                                                    guestName:guest.guestName,
                                                    Code:responseData.code,
                                                    Date:reservationCheckIn,
                                                    propertyID:prepertyById
                                                }
        

                                            // Insert a new record because guestID exists but reservationID is different
                                            pool.query("INSERT INTO Guest_cloudbed SET ?", bodyGuest, async (insertError) => {
                                                if (insertError) {
                                                    success = false;
                                                    console.error("Error inserting record:", insertError);
                                                } else {
                                                    // Post a reservation note
                                                    const formDataNote = new FormData();
                                                    formDataNote.append("reservationID", reservationById);
                                                    formDataNote.append("reservationNote", "SE ENVIO TRA DEL HUESPED");
                                                    const responseNote = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservationNote?propertyID=${prepertyById}`, {
                                                        method: "POST",
                                                        headers: { 
                                                            'Authorization': `Bearer ${hotelInfoQuery[0].Token}`
                                                        },
                                                        body: formDataNote
                                                    });
                            
                                                    if (responseNote.status === 401) {
                                                        console.log("error");
                                                        return res.status(401).json({ ok: false });
                                                    }
                            
                                                    const note = await responseNote.json();
                            
                                                    if (!note.success) {
                                                        return res.status(401).json({
                                                            ok: false,
                                                            error: "Payment failed",
                                                        });
                                                    }
                                                    
                                                    console.log(`GuestID ${guestID} insertado correctamente con una nueva reservationID.`);
                                                }
                                                checkCompletion();
                                            });
                                        } else {
                                            // Both guestID and reservationID exist, no action needed
                                            console.log(`GuestID ${guestID} y reservationID ${reservationById} ya existen, no se inserta.`);
                                            checkCompletion();
                                        }
                                    }
                                }
                            });
                    }else{
                   
                    await pool.query('SELECT * FROM Guest_cloudbed WHERE reservationID = ?', reservationID, async(selectError, results) => {
                        if (selectError) {
                            success = false;
                        } else {
                            if (results.length === 0) {
                                        // Si ya existe, no hacer nada y marcar como completado
                                        console.log(`GuestID no encontrado`);
                                        checkCompletion();
                            } else {
                                const code = results[0].Code;
                                const body ={
                                    tipo_identificacion: customFields[1].customFieldValue,
                                    numero_identificacion:customFields[0].customFieldValue,
                                    nombres: data.firstName,
                                    apellidos:data.lastName,
                                    cuidad_residencia:customFields[4].customFieldValue,
                                    cuidad_procedencia:customFields[4].customFieldValue,
                                    numero_habitacion:guest.roomName,
                                    check_in:reservationCheckIn,
                                    check_out:reservationCheckOut,
                                    padre:code
                                }
                
                                const response = await fetch('https://pms.mincit.gov.co/two/', {
                                    method: 'POST',
                                    headers: {
                                    'Authorization': `token ${hotelInfoQuery[0].Tra}`,
                                    'Content-Type': 'application/json'
                                    },
                                body:JSON.stringify(body)
                                });
                                
                                const responseData = await response.json();
                                
                                if(!responseData.code){
                              
                                    return res.status(401).json({
                                        ok:false
                                    })
                                }
                
                                const bodyGuest = {
                                    guestID:guestID,
                                    reservationID:reservationID,
                                    guestName:guest.guestName,
                                    Code:responseData.code,
                                    Date:reservationCheckIn,
                                    propertyID:prepertyById
                                }

                                await pool.query('SELECT * FROM Guest_cloudbed WHERE guestID = ?', guest.guestID, (selectError, results) => {
                                    if (selectError) {
                                        success = false;
                                    } else {
                                        if (results.length === 0) {
                                            // Solo insertar si no existe ningún registro con ese guestID
                                            pool.query("INSERT INTO Guest_cloudbed SET ?", bodyGuest,async (insertError) => {
                                                if (insertError) {
                                                    success = false;
                                                    console.error("Error inserting record:", insertError);
                                                } else {
                                                    const formDataNote = new FormData();
                                                    formDataNote.append("reservationID", webhookEvent.reservationID);
                                                    formDataNote.append("reservationNote", "SE ENVIO TRA DEL HUESPED");
                                                    const responseNote = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservationNote?propertyID=${prepertyById}`, {
                                                        method: "POST",
                                                        headers: { 
                                                            'Authorization': `Bearer ${hotelInfoQuery[0].Token}`},
                                                        body: formDataNote
                                                    });
                                                
                                                    if (responseNote.status === 401) {
                                                        console.log("error")
                                                        return res.status(401).json({ ok: false });
                                                    }
                                                
                                                    const note = await responseNote.json();
                                    
                                                    if (!note.success) {
                                                        return res.status(401).json({
                                                            ok: false,
                                                            error: "Payment failed",
                                                        });
                                                    }
                                            
                                                }
                                                checkCompletion();
                                            });
                                        } else {
                                            console.log({"results":results})
                                            // Si ya existe, no hacer nada y marcar como completado
                                            console.log(`GuestID ${guestID} ya existe, no se inserta.`);
                                            checkCompletion();
                                        }
                                    }
                                });
                            }
                        }
                     });
                    }
                }    
            })

            
        function checkCompletion() {
            completedQueries++;
            if(completedQueries === totalQueries) {
                return res.status(success ? 200 : 500).json({ ok: success });
            }
        }

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
        
    }

}

module.exports ={
    getHotelDetails,
    GetHotelsbyID,
    GetReservationBypropertyID,
    GetReservationDetailBypropertyID,
    getAvailableRoomTypes,
    PostpostReservation,
    GetReservation,
    PostRegisterCloubeds,
    GetRegisterCloubes,
    PostPaymentCloubeds,
    GetPaymentCloubeds,
    PostRegisterSigoCloudbeds,
    getRoomTypes,
    getTaxesfree,
    webhooksStatus_changed,
    webhooksAdd_Guest
}