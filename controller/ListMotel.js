const {response} = require('express')
const { pool } = require('../database/connection')

const moment = require("moment")
const Product = require('../model/Product')

const LisMotel = async(req,res=response) =>{

    try {  
    const link = await  pool.query('SELECT hotels.id as id_hotel , hotels.name as nombre, hotels.segurohotelero as segurohotelero, hotels.valorseguro as valorseguro FROM hotels;')

    return res.status(201).json({
        ok:true,
       query:link
    })
        
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const listMotelisid = async(req,res=response)=>{

    const {id} = req.params

    try { 
    
        const link = await pool.query('SELECT * FROM hotels where id=?',[id])

    APP_centro_documental

    hotels
    res.status(201).json({
        LisMotel:{
            data:{
                result:{
                    link
                }
            }
        }
    })
        
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }

   
}



const reservas =async(req,res=response) =>{
    
        try {

        const {id} = req.params

        const link = await  pool.query(`SELECT * FROM reservas  where id=?`,[id])

        if(link.length ==0){
            return  res.status(401).json({
                ok:false,
                msg:"no esta disponible"
            })
        } 
        res.status(201).json({
            reservas:{
                data:{
                    result:{
                        link
                    }
                }
            }
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })  
    }
}


const forgetlfulnes =async(req,res=response) =>{
        
    try {
        const link = await  pool.query("SELECT * FROM APP_objectos_perdidos")

        if(link.length ==0){
            return  res.status(401).json({
                ok:false,
                msg:"no esta disponible"
            })
        } 
        res.status(201).json({
            link 
        })
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })   
    }
}

const  forgetlfulnesInsert =async(req,res=respons) =>{


    const t= moment().format();   
    let today = new Date(t)
    const day = today.toISOString().split('T')[0]

    const {id_hotel,id_user,description,ubicacion} = req.body

    const date ={
        id_hotel:id_hotel,
        id_user:id_user,
        date:day,
        description:description,
        ubicacion:ubicacion
    }

    try {
        const query = pool.query('INSERT INTO APP_objectos_perdidos set ?', date, (err, customer) => {
            console.log(customer)
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



 const ListBooking =async(req,res=response) =>{
    
    const { id } = req.params;
    
    try {
        
        const link = await pool.query("SELECT *, reservas.id as id_booking,  reservas.name as name_person, reservas.phone as phone_person  FROM reservas  inner join accommodation  ON reservas.id_room = accommodation.id inner join rooms ON accommodation.id_room = rooms.id where accommodation.id_hotel=?",[id])
        
        if(link.length ==0){
            return  res.status(401).json({
                ok:false,
                msg:"no esta disponible"
            })
        } 

        res.status(201).json({
            link 
            })

    } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })
    }
 }

 const ListMaintenance = async(req,res=response) =>{

    const { id } = req.params;

    try {
        
        const link = await pool.query("SELECT *,APP_mantenimiento.id as id_app_mantenimiento  FROM  APP_mantenimiento INNER JOIN hotels on APP_mantenimiento.id_hotel = hotels.id INNER JOIN APP_colaboradores on APP_mantenimiento.id_user_recepcion = APP_colaboradores.id_user where hotels.id=?",[id])
        
        if(link.length ==0){
            return  res.status(401).json({
                ok:false,
                msg:"no esta disponible"
            })
        } 
     
        res.status(201).json({
            link 
            })

    } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })
    }
 } 

 const UpdateMaintenance = async(req,res=response) =>{

    const { id } = req.params;

    const {options} = req.body
    const t= moment().format();   
    let today = new Date(t)
    const day = today.toISOString().split('T')[0]

    const newLink = {
        options,
        endDate:day
    }

    try {   
        var sql = "UPDATE APP_mantenimiento set ? WHERE id = ?";
      
             await pool.query(sql, [newLink, id], function(err, result) {
               if(result.affectedRows>0){
                   res.status(201).json({
                       ok:true
                   })
               }else{
                   res.status(201).json({
                       ok:false
                   })
               }
            });
  
    } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"no esta disponible"
        })
    }
 }

const  InsertMaintenance = async(req,res=response) =>{

    const {id_hotel,id_user_recepcion,id_user_mantenimiento,room,novelty} = req.body

    const t= moment().format();   
    let today = new Date(t)
    const day = today.toISOString().split('T')[0]

    const date ={
        id_hotel:id_hotel,
        id_user_recepcion:id_user_recepcion,
        id_user_mantenimiento:id_user_mantenimiento,
        startDate:day,
        endDate:null,
        room:room,
        novelty:novelty,
        options:1
    }

    try {

        const query = pool.query('INSERT INTO APP_mantenimiento set ?', date, (err, customer) => {
            console.log(customer)
          })
          
          console.log(query)
          res.status(201).json({
            ok:true,
            msg:"exictoso"
        })

     } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"no esta disponible"
        })
     }
}

const ProductInvoince =async(req,res=response)  =>{

    const {product} = req.body

    try {

        if(!product){
            return res.status(401).json({
                ok:false,
                msg:"no hay productos"
            })
        }

        const  to = new Product({
            check_list:product
        })

        await to.save()
        
        return res.status(201).json({
            ok:true,
            msg:"exitoso"
        })
        
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const MinImboxrRecesion = async (req,res=response) =>{

    const  {id} = req.params

    const to= moment().format();   
    
    let today = new Date(to)

    const day = today.toISOString().split('T')[0]

    const link = await pool.query("SELECT * FROM APP_caja_menor WHERE APP_caja_menor.id_hotel=? AND APP_caja_menor.date_creation=? AND id_cargo=2",[id,day])

    if(link.length ==0){
        return  res.status(401).json({
            ok:false,
            msg:"no esta disponible "
        })
    } 
    
    res.status(201).json({
        ok:true,
        link
    })
}

const MinImboxMaintance = async (req,res=response) =>{

    const  {id} = req.params

    const to= moment().format();   

    let today = new Date(to)

    const day = today.toISOString().split('T')[0]

    const link = await pool.query("SELECT * FROM APP_caja_menor WHERE APP_caja_menor.id_hotel=? AND APP_caja_menor.date_creation=? AND id_cargo=3",[id,day])

    if(link.length ==0){
        return  res.status(401).json({
            ok:false,
            msg:"no esta disponible "
        })
    } 
    
    res.status(201).json({
        ok:true,
        link
    })
}

const MinImboxMaintanceInsert =(req,res=response) =>{

    return res.status(201).json({
        ok:true
    })
}

module.exports ={LisMotel,
                listMotelisid,
                reservas,
                forgetlfulnes,
                forgetlfulnesInsert,
                ListBooking,
                ListMaintenance,
                UpdateMaintenance,
                InsertMaintenance,
                ProductInvoince,
                MinImboxrRecesion,
                MinImboxMaintance,
                MinImboxMaintanceInsert,
                }
    