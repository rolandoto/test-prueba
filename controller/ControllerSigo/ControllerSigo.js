const {response, json, query} = require('express');
const { pool } = require('../../database/connection');

const PostInvoinceByIdCLient =async(req,res=response) =>{

    const {token,body,id_Reserva,id_user,fecha,Retention} = req.body

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
                                        const insertThrirdeQuery = async() =>{
          
                                          let dataThird = {
                                            Retention
                                          };
                  
                                          await  pool.query(
                                            "UPDATE Pagos set ? WHERE ID_Reserva = ?",
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
                                        insertThrirdeQuery()
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

const GetClientSigo =async(req,res=response) =>{

    const {token,document} = req.body

    try {   
        const response = await fetch(`https://api.siigo.com/v1/customers?identification=${document}`, {
            method: "GET",
            headers: {
                "Authorization":token,
                'Content-Type': 'application/json',
                'Partner-Id': 'officegroup'
              },
        });


        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }

        if (response.status === 400) {
            return res.status(401).json({ ok: false });
        }

        const data = await response.json();

        
        
        if(data.pagination.total_results ==0){
            return res.status(401).json({ ok: false });
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


const PostClientSigo =async(req,res=response) =>{

  const {token,body} = req.body
  try {   
      const response = await fetch(`https://api.siigo.com/v1/customers`, {
          method: "POST",
          headers: {
            "Authorization":token,
            'Content-Type': 'application/json',
            'Partner-Id': 'officegroup'
          },
         body:JSON.stringify(body) 
      });

      if (response.status === 400) {
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


const GetTaxesSigo =async(req,res=response) =>{

  const {token} = req.body

  try {   
      const response = await fetch(`https://api.siigo.com/v1/taxes`, {
          method: "GET",
          headers: {
              "Authorization":token,
              'Content-Type': 'application/json',
              'Partner-Id': 'officegroup'
            },
      });


      if (response.status === 401) {
          return res.status(401).json({ ok: false });
      }

      if (response.status === 400) {
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

const GetProductSigo =async(req,res=response) =>{

  const {token} = req.body

  try {   
      const response = await fetch(`https://api.siigo.com/v1/products?created_start=2024-02-06`, {
          method: "GET",
          headers: {
              "Authorization":token,
              'Content-Type': 'application/json',
              'Partner-Id': 'officegroupe'
            },
      });

   
      if (response.status === 401) {
          return res.status(401).json({ ok: false });
      }

      if (response.status === 400) {
          return res.status(401).json({ ok: false });
      }

      const {results} = await response.json();

    

      return res.status(201).json({
          ok:true,
          data:results
      })

  } catch (error) {
      return res.status(401).json({
          ok:false
      })
  }
}

const GetPdfSigo =async(req,res=response) =>{

  const {token,id} = req.body

  try {   
      const response = await fetch(`https://api.siigo.com/v1/invoices/${id}/pdf`, {
          method: "GET",
          headers: {
              "Authorization":token,
              'Content-Type': 'application/json',
              'Partner-Id': 'officegroup'
            },
      });

      if (response.status === 401) {
          return res.status(401).json({ ok: false });
      }

      if (response.status === 400) {
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


const PostAuthSigo=async(req,res=response) =>{

  const body = {
    username: '10elementossas@gmail.com',
    access_key: "YzFmOTA0MjktNmVmYi00YzMzLWJmOTItN2QyNDk1NGE1YzIzOmlkVioxSDIjalE="
  };

  try {   
      const response = await fetch(`https://api.siigo.com/auth`, {
        method: "POST",
        headers: {
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


const GetProductsigoDashboard=async(req,res=response) =>{

  try {

    const data = await pool.query("SELECT hotels.name , ID_DIAN, id_hotel,id_paymen,id_type_document,observations FROM Dian_register INNER JOIN hotels on hotels.id = Dian_register.id_hotel;")

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


const CitySigo =async(req, res = response) =>{

  try {

    const  query = await  pool.query("SELECT * FROM `tableName`")

    return res.status(201).json({
      ok:true,
      query
    })
  } catch (error) {

   return res.status(401).json({
    ok:false
   }) 
  }
}


module.exports={
    PostInvoinceByIdCLient,
    GetClientSigo,
    GetTaxesSigo,
    GetProductSigo,
    GetPdfSigo,
    PostAuthSigo,
    GetProductsigoDashboard,
    CitySigo,
    PostClientSigo
}