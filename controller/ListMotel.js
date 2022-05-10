const {response} = require('express')
const { pool } = require('../database/connection')
const ReverseMd5 = require('reverse-md5')

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


module.exports ={LisMotel,listMotelisid,listBictacoras,reservas}