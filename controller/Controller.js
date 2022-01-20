const {response} = require('express')
const bcryptjs = require('bcryptjs')
const Usuario = require('../model/Usuario')
const { GenerarJwt } = require('../helper/Jwt')

const LoginUsuario =async(req,res=response) =>{

    const {username,password} = req.body

    try {
            const user = await Usuario.findOne({username})

            if(!user){
                res.status(401).json({
                    msg:"usuario no existe"
                })
            }

            const validPassword = bcryptjs.compareSync(password,user.password)

            if(!validPassword){
              return  res.status(401).json({
                    ok:false,
                    msg:"password invalid"
                })
            }

            const token =  await GenerarJwt(user.id,user.username)

            return res.status(201).json({
                ok:true,
                token,
                user:{
                    name:user.username
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