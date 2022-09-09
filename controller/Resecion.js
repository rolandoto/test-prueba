const {response} = require('express')
const { pool } = require('../database/connection')


const  GetRooms =async(req, res=response) =>{

    const {id} = req.params                                                                             
    
    try {

        const  query = await  pool.query("SELECT ID as id, ID_Tipo_habitaciones, ID_Tipo_estados, Numero as title FROM Habitaciones WHERE ID_Hotel = ?", [id])

        if(query.length ==0){
          return  res.status(201).json({
                ok:false
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

module.exports ={GetRooms}