const {response} = require('express')
const { pool } = require('../database/connection')


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

module.exports ={LisMotel,listMotelisid}