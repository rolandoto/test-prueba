const {response, query} = require('express')
const { pool } = require('../../database/connection')
const fetch  = require('node-fetch')
const { count } = require('../../model/Usuario')
const app = require("express")();
const http = require("http");


const InsertIntoRoomsAdmin =async (req,res=response) =>{

    const {id_hotel,id_habitaciones,name_num} = req.body

    const date ={
        ID_Hotel:id_hotel,
        ID_Tipo_habitaciones:id_habitaciones,
        Numero:name_num,
    }

    try {
        await pool.query('INSERT INTO Habitaciones set ?', date, (err, customer) => {
            if(err){
                return res.status(401).json({
                     ok:false,
                     msg:"error al insertar datos"
                })
             }else{
                return res.status(201).json({
                    ok:true
                })
             }
          })

          res.status(201).json({
              ok:true,
              msg:"exictoso"
          })
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })  
    }
}

const  GetroomsAdmin =async(req,res=response)=>{
    
    const  {id}  = req.params
 
    const ray =[]
  
    try {
        
            const  query = await pool.query("SELECT rooms.id, rooms.name, rooms.price, rooms.price_people, rooms.people, rooms.max_people, Habitaciones.ID, Habitaciones.ID_Tipo_habitaciones, Tipo_estados.Nombre AS nombreEstado, Habitaciones.Numero FROM Habitaciones INNER JOIN Tipo_estados ON Habitaciones.ID_Tipo_estados = Tipo_estados.ID INNER JOIN rooms ON rooms.id = Habitaciones.ID_Tipo_habitaciones WHERE Habitaciones.ID_Hotel = ?",[id])
            query.forEach(element => {
                ray.push({
                    id_tipoHabitacion:element.id,
                    nombre:element.name,
                    precio:element.price,
                    precio_persona:element.price_people,
                    persona:element.people,
                    max_persona:element.max_people,
                    id: element.ID,
                    nombreEstado: element.nombreEstado,
                    Numero: element.Numero
                })
            }); 

        /*
        const  query = await pool.query("SELECT Habitaciones.ID, Habitaciones.ID_Tipo_habitaciones,Tipo_estados.Nombre as nombreEstado, Habitaciones.Numero FROM Habitaciones INNER JOIN Tipo_estados ON Habitaciones.ID_Tipo_estados = Tipo_estados.ID WHERE Habitaciones.ID_Hotel =?",[id])
    
        for(let i =0;i<query.length;i++){
            const response =  await fetch( `https://grupohoteles.co/api/getTypeRoomByID?id_tipo_habitacion=${query[i].ID_Tipo_habitaciones}`,{
                method:"get",
                headers:{'Content-type':'application/json'}
            }).then(index =>{
                const data =  index.json()
                return  data
            })
            .catch((e) =>{
            })
            
            ray.push({
                id_tipoHabitacion:response.id_tipoHabitacion,
                nombre:response.nombre,
                precio:response.precio,
                precio_persona:response.precio_persona,
                persona:response.persona,
                max_persona:response.max_persona,
                id:query[i].ID,
                nombreEstado:query[i].nombreEstado,
                Numero:query[i].Numero
            })
        }
        */

    
        res.status(201).json({
            ok:true,
            ray
        })

    } catch (error) {
            res.status(40.).json({
                ok:false,
              
            })
    }   

}

const InsertIntoStoreAdmin =async(req,res=response) =>{

    const  {ID_Tipo_categoria,ID_Hoteles,Nombre,Cantidad,Precio,Fecha_registro,Precio_compra,Nombre_Recepcion} = req.body

    const date ={
        ID_Tipo_categoria,
        ID_Hoteles,
        Nombre,
        Cantidad,
        Precio,
        Cantidad_inicial:Cantidad,
        Fecha_registro,
        Precio_compra
    }

    try {

        const query =  await pool.query('INSERT INTO Productos set ?', date, (err, customer) => {
            if(err){
                return res.status(401).json({
                     ok:false,
                     msg:"error al insertar datos"
                })
             }else{
                
                const insertSecondQuery = async() => {
                    const query1 = await pool.query("SELECT MAX(ID) as max FROM Productos where Productos.ID_Hoteles = ?",[ID_Hoteles]);

                    const result = query1.map((index) => {
                        return index.max;
                    });
                  
                    const dateOne = {
                        ID_Product: parseInt(result.toString()),
                        Cantidad_total:Cantidad,
                        Nombre_Recepcion
                    }

                   await  pool.query('INSERT INTO cantidad_product set ?',dateOne, (err, customer) => {
                        if (err) {
                            return res.status(401).json({
                                ok: false,
                                msg: "error al insertar datos"
                            });
                        } else {
                            return res.status(201).json({
                                ok: true
                            });
                        }
                    });
        
                }
                insertSecondQuery();
             }
          })

       

    } catch (error) {

        res.status(201).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })   
    }
}

const GetCategoryAdmin  = async(req,res=response) =>{

        try {
            const  query = await  pool.query("SELECT ID,Nombre as nombre ,Imagen FROM Tipo_categoria")

            res.status(201).json({
                ok:true,
                query
            })
    
        } catch (e) {
            res.status(401).json({
                ok:false
            })
    }
}

const GetListProductAdmin = async( req, res=response ) =>{

    const  {id} = req.params;

    try {

        const  query = await  pool.query("SELECT Productos.Cantidad, Productos.ID, Productos.Nombre,Productos.Precio, Tipo_categoria.Nombre as 'Nombre_categoria',Tipo_categoria.ID AS id_categoria FROM Productos INNER JOIN Tipo_categoria ON Tipo_categoria.ID = Productos.ID_Tipo_categoria INNER JOIN cantidad_product on Productos.ID = cantidad_product.ID_Product WHERE Productos.ID_Hoteles = ? GROUP BY Productos.ID ORDER BY cantidad_product.ID;", [id])
        
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {

        res.status(201).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })   
    }   
}

const GetListProductAdminById = async( req, res=response ) =>{

    const {id} = req.params;

    try {

        const  query = await  pool.query("SELECT cantidad_product.Fecha,  cantidad_product.Nombre_Recepcion,cantidad_product.Cantidad_total,  Productos.ID, Productos.Nombre, Productos.Cantidad, Productos.Precio, Tipo_categoria.Nombre as 'Nombre_categoria',Tipo_categoria.ID AS id_categoria FROM Productos INNER JOIN Tipo_categoria ON Tipo_categoria.ID = Productos.ID_Tipo_categoria   INNER JOIN cantidad_product on cantidad_product.ID_Product = Productos.ID  WHERE Productos.ID = ?",[id])

        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {

        res.status(201).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })   
    }
}


const postListProductAdminById  =async( req, res=response) => {

    const {id} = req.params

    const  {Cantidad,Nombre_Recepcion,Fecha} = req.body
    
    const dateOne = {
        ID_Product:id,
        Cantidad_total:Cantidad,
        Nombre_Recepcion,
        Fecha
    }

    try {

        if(Cantidad <=0){
            return res.status(401).json({
                ok:false
            })
        }

        await pool.query('INSERT INTO cantidad_product set ?', dateOne, (err, customer) => {
            if(err){
                return res.status(401).json({
                     ok:false,
                     msg:"error al insertar datos"
                })
             }else{
                const insertSecondQuery = async() => {
                   const query = await pool.query("SELECT * FROM Productos  WHERE  Productos.ID =?",[id])

                  for(let i =0;i<query.length;i++){
                    const data = {
                        Cantidad:parseInt(query[i].Cantidad ) + parseInt(Cantidad)
                    }
                    pool.query('UPDATE Productos set ? WHERE ID = ?', [data,id], (err, customer) => {
                        if (err) {
                            return res.status(401).json({
                                ok: false,
                                msg: "error al insertar datos"
                            });
                        } else {
                            return res.status(201).json({
                                ok: true
                            });
                        }
                    });
                    
                  }
                }

               
                insertSecondQuery();
             }
          })

        res.status(201).json({
            ok:true
        })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}


const getStoreAdmin =async(req,res= response) =>{

    try {

        return res.status(201).json({
            ok:false,
            msg:"entro"
        })
        
    } catch (error) {

        return res.status(401).json({
            ok:false
        })
    }
}

const getSubProduct =async(req, res = response) => {

    try {   

        const query=  await pool.query("SELECT * FROM sub_categorias ORDER BY ID DESC")

        if(query.length==0){
            res.status(401).json({
                ok:true
            })
        }

        res.status(201).json({
            ok:true,
            query
        })
      
    } catch (error) {
      
            res.status(401).json({
                ok:false
            })
      
    }
}

const getproduct =async(req, res = response) => {
    
    const  {id} =req.params
    try {   

        const query=  await pool.query("SELECT  Productos.ID, Tipo_categoria.Nombre as categoria, Productos.ID_Hoteles,Productos.Nombre, Productos.Cantidad, Productos.Precio FROM Productos INNER JOIN Tipo_categoria on Tipo_categoria.ID = Productos.ID_Tipo_categoria WHERE Productos.ID =?",[id])

        if(query.length==0){
            res.status(401).json({
                ok:true
            })
        }

        res.status(201).json({
            ok:true,
            query
        })
      
    } catch (error) {
      
            res.status(401).json({
                ok:false
            })
      
    }
}


const updateProduct =async(req, res = response) =>{
    
  
    const  {ID,Cantidad,ID_user,Price,Fecha} = req.body
    
  
    try {

        
        const query = await pool.query("SELECT * FROM Productos  WHERE  Productos.ID =?",[ID])

        let count =0
        for(let i =0;i<query.length;i++){
            count +=parseInt(query[i].Cantidad )
        }

        const totalValid =  Cantidad < count ? 1 : 0

        const dateOne = {
            ID_Product:ID,
            Cantidad_total:Cantidad,
            ID_user:ID_user,
            Price:Price,
            valid:totalValid,
            Fecha
        }
    
        const data = {
            Precio:Price,
            Cantidad:Cantidad
        }
    
        await pool.query('INSERT INTO history_product_update set ?', dateOne, (err, customer) => {
            if(err){
                return res.status(401).json({
                     ok:false,
                     msg:"error al insertar datos"
                })
             }else{
                const insertSecondQuery = async() => {

                   
                    pool.query('UPDATE Productos set ? WHERE ID = ?', [data,ID], (err, customer) => {
                        if (err) {
                            return res.status(401).json({
                                ok: false,
                                msg: "error al insertar datos"
                            });
                        } else {
                            return res.status(201).json({
                                ok: true
                            });
                        }
                    });
                }
                insertSecondQuery();
             }
          })

        res.status(201).json({
            ok:true
        })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}

const postUpdteTarifasReservation =async(req, res = response) =>{

    const  {id} =req.params
    const {valid_buy,noches,Abono,ID_reservation,valor} =req.body

    let data = {
        valid_buy
    }

    const totalDay =  valor / noches

        try {

            const queryAbono = await pool.query("SELECT Abono from Pagos WHERE Pagos.ID_Reserva =? and pago_valid = 1;",[ID_reservation])
            
            let pay = {
                ID_Reserva: parseInt(ID_reservation),
                ID_Motivo: 1,
                ID_Tipo_Forma_pago:1,
                Valor: `${valor}`,
                Abono: `${queryAbono[0]?.Abono}`,
                Valor_habitacion: `${valor}`,
                valor_dia_habitacion: `${totalDay}`,
                pago_valid: 1,
              };
        

           
            if(!valid_buy){
                return res.status(401).json({
                    ok:false
                })
            }

        
            let dataPay = {
                pago_valid:0
            }
            pool.query('UPDATE TarifasReservation set ? WHERE ID = ?', [data,id], (err, customer) => {
                if(err){
                    return res.status(401).json({
                        ok:false
                    })
                }else{
                    const insertSecondQuery = async() => {
                        if(valid_buy ==1){
                            
                            await pool.query('UPDATE Pagos set ? WHERE ID_Reserva = ?',  [dataPay,ID_reservation], (err, customer) => {
                                if (err) {
                                    return res.status(401).json({
                                        ok: false,
                                        msg: "error al insertar datos"
                                    });
                                } else {
                                    const insertSecondQuery = async() => {
                                        if(valid_buy ==1){
                                            
                                            await pool.query('INSERT INTO Pagos set ?', pay, (err, customer) => {
                                                if (err) {
                                                    return res.status(401).json({
                                                        ok: false,
                                                        msg: "error al insertar datos"
                                                    });
                                                } else {
                                                    return res.status(201).json({
                                                        ok: true
                                                    });
                                                }
                                            });
                                        }else{
                                            return res.status(201).json({
                                                ok:true
                                            })
                                        }   
                                        }
                        
                                        insertSecondQuery();
                                }
                            });
                        }else{
                            return res.status(201).json({
                                ok:true
                            })
                        }   
                        }
                        insertSecondQuery();
                }
            })
            
    } catch (error) {
           return  res.status(401).json({
            ok:false
           })
    }
}

const getProdcutUpdte =async(req, res = response) =>{

    const {id} = req.params

    try {

        const query = await pool.query("SELECT history_product_update.Fecha ,  history_product_update.valid,  users.name,Productos.Nombre, history_product_update.Price,history_product_update.Cantidad_total , Tipo_categoria.Nombre as categoria  FROM `history_product_update` INNER JOIN Productos on Productos.ID = history_product_update.ID_Product INNER JOIN users on users.id = history_product_update.ID_user INNER JOIN Tipo_categoria on  Tipo_categoria.ID  = Productos.ID_Tipo_categoria   WHERE history_product_update.ID_Product = ?;",[id])

        res.status(201).json({
            ok:true,
            query
        })
    } catch (error) {
            res.status(401).json({
                ok:false
            })
    }
}

const getTarifasReservation =async(req, res = response) =>{

    const {id} = req.params

    try {

        const query = await pool.query("SELECT  APP_colaboradores.name , APP_colaboradores.foto, TarifasReservation.ID, TarifasReservation.valor , TarifasReservation.Description,TarifasReservation.Fecha,TarifasReservation.valid_buy,TarifasReservation.id_hotel,TarifasReservation.ID_reservation,TarifasReservation.name_reservation,TarifasReservation.Fecha ,TarifasReservation.codigo_reserva,TarifasReservation.valid_buy,TarifasReservation.noches,TarifasReservation.Abono,TarifasReservation.ID_reservation   FROM `TarifasReservation`  inner join APP_colaboradores on APP_colaboradores.id_user = TarifasReservation.id_user WHERE  TarifasReservation.id_hotel = ? order by TarifasReservation.ID DESC ",[id])

        res.status(201).json({
            ok:true,
            query
        })
    } catch (error) {
            res.status(401).json({
                ok:false
            })
    }
}


const postInsetTarifaReservation =async(req, res = response) =>{
    
    const  {id_user,
            id_hotel,
            valor,
            Description,
            Fecha,
            ID_reservation,
            name_reservation,
            codigo_reserva,
            noches,
            Abono} = req.body

    let data ={
        id_user,
        id_hotel,
        valor,
        Description,
        Fecha,
        ID_reservation,
        name_reservation,
        codigo_reserva,
        noches,
        Abono
    }
    
    try {

        await pool.query('INSERT INTO TarifasReservation set ?', data, (err, customer) => {
            if(err){
                return res.status(401).json({
                     ok:false,
                     msg:"error al insertar datos"
                })
             }else{
                return res.status(201).json({
                    ok:true
                })
             }
        })
        
    } catch (error) {
        
        return res.status(401).json({
            ok:false
        })
    }

}

const getHistialReservation =async(req, res = response) => {

    const  {id} =  req.params
    
    try {   
        
        const query = await pool.query("SELECT APP_colaboradores.name , APP_colaboradores.foto, TarifasReservation.ID, TarifasReservation.valor , TarifasReservation.Description,TarifasReservation.Fecha,TarifasReservation.valid_buy,TarifasReservation.id_hotel,TarifasReservation.ID_reservation,TarifasReservation.name_reservation,TarifasReservation.Fecha ,TarifasReservation.codigo_reserva,TarifasReservation.valid_buy,TarifasReservation.noches,TarifasReservation.Abono,TarifasReservation.ID_reservation FROM `TarifasReservation` inner join APP_colaboradores on APP_colaboradores.id_user = TarifasReservation.id_user WHERE TarifasReservation.ID_reservation = ? order by TarifasReservation.ID DESC;",[id])

        return res.status(201).json({
            ok:true,
            query
        })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }

}

module.exports ={InsertIntoRoomsAdmin,
                GetroomsAdmin,
                InsertIntoStoreAdmin,
                GetCategoryAdmin,
                GetListProductAdmin,
                getStoreAdmin,
                GetListProductAdminById,
                postListProductAdminById,
                getSubProduct,
                postUpdteTarifasReservation,
                getTarifasReservation,
                postInsetTarifaReservation,
                getHistialReservation,
                getproduct,
                updateProduct,
                getProdcutUpdte
}   