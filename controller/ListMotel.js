const {response} = require('express')
const { pool } = require('../database/connection')
const ReverseMd5 = require('reverse-md5')
const moment = require("moment")
const res = require('express/lib/response')

const LisMotel = async(req,res=response) =>{
    
    const link = await  pool.query('SELECT * FROM hotels')

    res.status(201).json({
        LisMotel:{
            data:{  
                result:{
                    link
                }
            }
        }
    })
}

const listMotelisid = async(req,res)=>{

    const {id} = req.params

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
}

const listBictacoras =async(req,res=response)=>{
    const {id} = req.params
    
    const id_hotel =  id
    const link = await  pool.query(`SELECT * FROM APP_bitacora INNER JOIN APP_colaboradores ON APP_bitacora.id_user = APP_colaboradores.id_user WHERE id_hotel=? ORDER BY APP_bitacora.date DESC`,[id_hotel])
    
    res.status(201).json({
        LisMotel:{
            data:{
                result:{
                    link
                }
            }
        }
    })
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

const formats =async(req,res=response) =>{

    const {id} = req.params

    try {
        const link = await  pool.query(`SELECT *, hotels.name as hotel_name,APP_departamentos.name as name_departament, APP_centro_documental.name as name_centro_documental FROM APP_centro_documental INNER JOIN hotels ON APP_centro_documental.id_hotel = hotels.id  inner join APP_departamentos  ON APP_centro_documental.id_departamento =APP_departamentos.id WHERE APP_centro_documental.id_hotel=? AND  APP_centro_documental.id_departamento=2`,[id])
        
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

    console.log(req.body)

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
          
          console.log(query)

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

const numberEmergencies =async(req,res=response) =>{

    try {

        const link = await pool.query("SELECT * FROM APP_number_emergencia")
          
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

module.exports ={LisMotel,
                listMotelisid,
                listBictacoras,
                reservas,
                formats,
                forgetlfulnes,
                forgetlfulnesInsert,
                numberEmergencies,
                ListBooking,
                ListMaintenance,
                UpdateMaintenance,
                InsertMaintenance}
