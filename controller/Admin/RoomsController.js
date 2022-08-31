const {response} = require('express')
const { pool } = require('../../database/connection')
const fetch  = require('node-fetch')

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
    
    const  {id}  = req.params;
 
    const ray =[]
  
    try {
        const  query = await  pool.query("SELECT Habitaciones.ID, Habitaciones.ID_Tipo_habitaciones,Tipo_estados.Nombre as nombreEstado, Habitaciones.Numero FROM Habitaciones INNER JOIN Tipo_estados ON Habitaciones.ID_Tipo_estados = Tipo_estados.ID WHERE Habitaciones.ID_Hotel =?",[id])
    
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

    const  {ID_Tipo_categoria,ID_Hoteles,Nombre,Cantidad,Precio} = req.body

    const date ={
        ID_Tipo_categoria,
        ID_Hoteles,
        Nombre,
        Cantidad,
        Precio
    }

    try {

        await pool.query('INSERT INTO Productos set ?', date, (err, customer) => {
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

        res.status(201).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })
        
    }

}


module.exports ={InsertIntoRoomsAdmin,
                GetroomsAdmin,
                InsertIntoStoreAdmin}