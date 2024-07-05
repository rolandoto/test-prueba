const {response, json, query} = require('express');
const { pool } = require('../../database/connection');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchTransaction(transactionId) {
    try {
        const getTransaction = await fetch(`https://api.wompi.co/v1/transactions/${transactionId}`, {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ`
            }
        });

        if (!getTransaction.ok) {
            throw new Error(`Failed to get transaction: ${getTransaction.status}`);
        }

        const getValidTransaction = await getTransaction.json();

        console.log(getValidTransaction.data.status);

        return getValidTransaction.data.status;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw error;
    }
}

const RegisterCardWompi =async(req,res=response) =>{
    
    /*const dataCard = req.body*/
    const {cart,name,apellido,email,city,country,fecha,number,exp_month,exp_year,cvc,card_holder} = req.body

    try {


    const dataCard =  {
            "number":`${number}` ,
            "exp_month":exp_month, 
            "exp_year": exp_year,  // Código de seguridad (como string de 3 o 4 dígitos)
            "cvc": cvc,
            "card_holder":card_holder
        }

    console.log(dataCard)
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
        const response = await fetch(`https://api.wompi.co/v1/tokens/cards`, {
            method: "POST",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ` },
            body:JSON.stringify(dataCard)
        });

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
           
        const productToken= await response.json();
        
     
        if(!productToken){
            return res.status(401).json({
                ok:false
            })
        }

        const acceptance_token = dataJson.data.presigned_acceptance.acceptance_token
        const ProductoToken = productToken.data.id


        const dataTransTions ={
            "public-key": "pub_prod_GlPKJMtPAgxDIMX3ht392orLWYa5bQLJ",
            "amount_in_cents": 200,
            "currency": "COP",
            "customer_email": email,
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

        console.log(getValidTransation.data.status)

        if(getValidTransation.data.status =="APPROVED"){
            
            var n1 = 20000;
            var n2 = 10000;
            var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;
        
            for (const room of cart) {
              const data = {
                ID_Usuarios: 1,
                ID_Habitaciones: room.roomByID,
                ID_Talla_mascota: 3,
                Codigo_reserva: numero,
                Adultos: 1,
                Ninos: 1,
                Infantes: 0,
                Fecha_inicio: `${room.start} 15:00:00`,
                Fecha_final:  `${room.end} 13:00:00`,
                Noches: room.nights,
                Descuento: 0,
                ID_Canal: 3,
                ID_Tipo_Estados_Habitaciones: 0,
                Observacion: "Creado por la pagina web ",
              };
        
              await pool.query("INSERT INTO Reservas set ?", data);
           
              const queryResult = await pool.query(
                "SELECT MAX(ID) as max FROM Reservas"
              );
              const result = queryResult[0].max;
        
              const date = {
                ID_Reserva: parseInt(result.toString()),
                ID_Tipo_documento:1,
                Num_documento: "000",
                Nombre: name,
                Apellido: apellido,
                Fecha_nacimiento: room.start,
                Celular: "3000",
                Correo: email,
                Ciudad: city,
                ID_Prefijo: country,
                Tipo_persona: "persona",
                Firma: 0,
                Iva: 2,
                ID_facturacion:""
              };
        
               pool.query(
                "INSERT INTO  web_checking set ?",
                date,
                (q_err, q_res) => {
                  if (q_err)
                    return res.status(401).json({
                      ok: false,
                    });
                }
              );
        
              const huep = {
                ID_Reserva: parseInt(result.toString()),
                ID_Tipo_documento:1,
                ID_Tipo_genero: 1,
                Num_documento:"000",
                Nombre: name,
                Apellido:apellido,
                Fecha_nacimiento:room.start,
                Celular:"33123",
                Correo: email,
                Ciudad:city,
                ID_Prefijo: country,
              };
              pool.query(
                "INSERT INTO  Huespedes  set ?",
                huep,
                (q_err, q_res) => {
                  if (q_err)
                    return res.status(401).json({
                      ok: false,
                      msg: "error de web huespedes",
                    });
                }
              );
        
        
              const pay = {
                ID_Reserva: parseInt(result.toString()),
                ID_Motivo: 1,
                ID_Tipo_Forma_pago:4,
                Valor: room.Price,
                Abono:  room.Price,
                Valor_habitacion: room.Price,
                valor_dia_habitacion: room.Price_nigth,
                pago_valid: 1,
              };
        
             pool.query("INSERT INTO  Pagos  set ?", pay);
        
             const dataPayAbono = {
              ID_Reserva: parseInt(result.toString()),
              Abono: room.Price,
              Fecha_pago: fecha,
              Tipo_forma_pago: 4,
              Nombre_recepcion: "pagina web",
            };
           pool.query(
              "INSERT INTO  Pago_abono  set ?",
              dataPayAbono
            );
        
          }
          
          console.log("se creo la resera")

            return res.status(201).json({
                ok:true
            })
    
        }else if(getValidTransation.data.status =="PENDING"){
            var n1 = 20000;
            var n2 = 10000;
            var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;
        
            for (const room of cart) {
              const data = {
                ID_Usuarios: 1,
                ID_Habitaciones: room.roomByID,
                ID_Talla_mascota: 3,
                Codigo_reserva: numero,
                Adultos: 1,
                Ninos: 1,
                Infantes: 0,
                Fecha_inicio: `${room.start} 15:00:00`,
                Fecha_final:  `${room.end} 13:00:00`,
                Noches: room.nights,
                Descuento: 0,
                ID_Canal: 3,
                ID_Tipo_Estados_Habitaciones: 0,
                Observacion: "Creado por la pagina web ",
              };
        
              await pool.query("INSERT INTO Reservas set ?", data);
           
              const queryResult = await pool.query(
                "SELECT MAX(ID) as max FROM Reservas"
              );
              const result = queryResult[0].max;
        
              const date = {
                ID_Reserva: parseInt(result.toString()),
                ID_Tipo_documento:1,
                Num_documento: "000",
                Nombre: name,
                Apellido: apellido,
                Fecha_nacimiento: room.start,
                Celular: "3000",
                Correo: email,
                Ciudad: city,
                ID_Prefijo: country,
                Tipo_persona: "persona",
                Firma: 0,
                Iva: 2,
                ID_facturacion:""
              };
        
               pool.query(
                "INSERT INTO  web_checking set ?",
                date,
                (q_err, q_res) => {
                  if (q_err)
                    return res.status(401).json({
                      ok: false,
                    });
                }
              );
        
              const huep = {
                ID_Reserva: parseInt(result.toString()),
                ID_Tipo_documento:1,
                ID_Tipo_genero: 1,
                Num_documento:"000",
                Nombre: name,
                Apellido:apellido,
                Fecha_nacimiento:room.start,
                Celular:"33123",
                Correo: email,
                Ciudad:city,
                ID_Prefijo: country,
              };
              pool.query(
                "INSERT INTO  Huespedes  set ?",
                huep,
                (q_err, q_res) => {
                  if (q_err)
                    return res.status(401).json({
                      ok: false,
                      msg: "error de web huespedes",
                    });
                }
              );
        
        
              const pay = {
                ID_Reserva: parseInt(result.toString()),
                ID_Motivo: 1,
                ID_Tipo_Forma_pago:4,
                Valor: room.Price,
                Abono:  room.Price,
                Valor_habitacion: room.Price,
                valor_dia_habitacion: room.Price_nigth,
                pago_valid: 1,
              };
        
             pool.query("INSERT INTO  Pagos  set ?", pay);
        
             const dataPayAbono = {
              ID_Reserva: parseInt(result.toString()),
              Abono: room.Price,
              Fecha_pago: fecha,
              Tipo_forma_pago: 4,
              Nombre_recepcion: "pagina web",
            };
           pool.query(
              "INSERT INTO  Pago_abono  set ?",
              dataPayAbono
            );
        
          }

          console.log("se creo la resera")
            return res.status(201).json({
                ok:true
            })
    
        } else{
           
            return res.status(401).json({
                ok:false
            })
        }
        

  
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"algo fallo en el servidor"
        })
    }

}

module.exports={
    RegisterCardWompi
}