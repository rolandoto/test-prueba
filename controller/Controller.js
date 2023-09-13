const {response, json, query} = require('express')
const bcryptjs = require('bcryptjs')
const Usuario = require('../model/Usuario')
const { GenerarJwt } = require('../helper/Jwt')
const fetch  = require('node-fetch')
const { pool } = require('../database/connection')

const LoginUsuario =async(req,res=response) =>{
    
    const {username,password,hotel} = req.body
    
    const body = {
        username:username,
        password:password,
        hotel:hotel
    }
        
    try {    
            const response =  await fetch('https://grupo-hoteles.com/api/login-api',{
                body:JSON.stringify(body),
                method:"post",
                headers:{'Content-type':'application/json'}
            }).then(index =>{
                const data =  index.json()
                return data
            })
             .catch((e) =>{
            })
            
           if(!response){
               return res.status(401).json({
                   ok:false,
                   msg:"no estas registrado"
               })
           }    

           const token = await GenerarJwt(response.id_hotel,response.user_name)

           const logo  =  await pool.query("SELECT logo FROM hotels WHERE id = ?" ,[body.hotel])
           
           const totaLogo =  logo[0]?.logo

            return res.status(201).json({
                ok:true,
                result:{
                    name:response.user_name,
                    hotel:response.hotel_name,
                    id_hotel:response.id_hotel,
                    id_user:response.id_user,
                    id_permissions:response.id_permissions,
                    photo:response.foto,
                    token,
                    logo:totaLogo
                }
            })

    } catch (error) {
        return response.status(500).json({
            ok:false,
            msg:"error de login"
        })
    }
}

const CreateUsuario =async (req,res= response) =>{

    const {username,password} = req.body
 
    try {

        let recionist = await Usuario.findOne({username})

        if(recionist){
            return res.json({
                msg:"uso otro usuario este no esta disponible"
            })
        }

        let user = Usuario(req.body)

        let salt = bcryptjs.genSaltSync()
        user.password = bcryptjs.hashSync(password,salt)

        await  user.save()

        const token = await GenerarJwt(user.id,user.name)
    
        return res.status(201).json({
            ok:true,
            name:user.username,
            token
        })
        
    } catch (error) {
    
        return res.status(500).json({
            mgs:"error al register"
        })
    }
}
module.exports ={LoginUsuario,CreateUsuario}