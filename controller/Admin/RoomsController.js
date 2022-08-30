const {response} = require('express')
const { pool } = require('../../database/connection')

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

    try {
        await  pool.query("SELECT Habitaciones.ID, Habitaciones.ID_Tipo_habitaciones,Tipo_estados.Nombre as nombreEstado, Habitaciones.Numero FROM Habitaciones INNER JOIN Tipo_estados ON Habitaciones.ID_Tipo_estados = Tipo_estados.ID WHERE Habitaciones.ID_Hotel =?",[id], (err, customer) =>{
        if(err) {
            res.status(401).json({
                ok:false
            })
        }else {
            res.status(201).json({
                ok:true,
                customer
            })
        }

        })

    


    } catch (error) {
            res.status(40.).json({
                ok:false
            })
    }   
}


module.exports ={InsertIntoRoomsAdmin,
                GetroomsAdmin}