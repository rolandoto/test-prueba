const {response, json, query} = require('express');
const { pool } = require('../../database/connection');

const PostInvoinceByIdCLient =async(req,res=response) =>{

    const {token,body,id_Reserva,id_user,fecha} = req.body

    console.log(id_Reserva)
    try {   
        const response = await fetch(`https://private-anon-72afbfb6b1-siigoapi.apiary-proxy.com/v1/invoices`, {
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
            const roomPay = await pool.query(
                "SELECT SUM(Pago_abono.Abono) as Total_Abono FROM Pago_abono WHERE  Pago_abono.Valid_Dian=0 and Pago_abono.ID_Reserva =?",
                [id_Reserva]
              );
          
              const abono = roomPay[0].Total_Abono || 0;
          
              if(!abono){
                return res.status(401).json({
                  ok:false,
                  msg:"noso puede facturar en numero 0"
                })
              }else{
          
                let dataDian ={
                  Fecha:fecha,
                  id_user,
                  Abono:abono,
                  ID_facturacion:data.id,
                  ID_Reserva:id_Reserva
                }
            
                await pool.query('INSERT INTO Dian_facturacion_register set ?', dataDian, (err, customer) => {
                  if(err){
                      return res.status(401).json({
                           ok:false,
                           msg:"error al insertar datos"
                      })
                   }else{
                      const insertSecondQuery = async() => {
            
                        let data = {
                          Valid_Dian:1
                        }
            
                          pool.query('UPDATE Pago_abono set ? WHERE ID_Reserva = ?', [data,id_Reserva], (err, customer) => {
                              if (err) {
                                  return res.status(401).json({
                                      ok: false,
                                      msg: "error al insertar datos"
                                  });
                              } else {
          
                                const insertSecondQuery = async() =>{
          
                                  let dataThird = {
                                    ID_facturacion:123456
                                  };
          
                                  await  pool.query(
                                    "UPDATE web_checking set ? WHERE ID_Reserva = ?",
                                    [dataThird,id_Reserva],
                                    (err, customer) => {
                                      if (err) {
                                        return res.status(401).json({
                                          ok: false,
                                        });
                                      }{
                                        return res.status(201).json({
                                          ok:true
                                        })
                                      }
                                    }
                                  )
                                }
          
                                insertSecondQuery()
          
                              }
                          });
                           
                      }
                      insertSecondQuery();
                   }
                })
              }
        }

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


module.exports={
    PostInvoinceByIdCLient
}