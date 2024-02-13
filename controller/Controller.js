const {response, json, query} = require('express')
const bcryptjs = require('bcryptjs')
const Usuario = require('../model/Usuario')
const { GenerarJwt } = require('../helper/Jwt')
const fetch  = require('node-fetch')
const { pool } = require('../database/connection')

const LoginUsuario = async (req,res= response) => {
    const { username, password, hotel } = req.body;

    try {
        // Consultar el usuario en la base de datos
        const userQuery = await pool.query("SELECT * FROM `users` WHERE username = ?", [username]);

        // Verificar si el usuario existe
        if (userQuery.length === 0) {
            return res.status(401).json({
                ok: false,
                msg: "Credenciales inválidas"
            });
        }

        // Verificar si el usuario existe
        if (userQuery.length === 0) {
            return res.status(401).json({
                ok: false,
                msg: "Credenciales inválidas"
            });
        }

        // Obtener información adicional del hotel
        const hotelInfoQuery = await pool.query("SELECT name, id, logo, Iva FROM hotels WHERE id = ?", [hotel]);  

        const token = "sdassasadsadsajhaskdjaskdjkashj"

        return res.status(201).json({
            ok: true,
            result: {
                name: userQuery[0].name,
                hotel:hotelInfoQuery[0].name,
                id_hotel:hotelInfoQuery[0].id,
                id_user:userQuery[0].id,
                id_permissions:userQuery[0].id_permissions,
                logo:hotelInfoQuery[0].logo,
                photo:hotelInfoQuery[0].logo,
                Iva: hotelInfoQuery[0].Iva,
                token
            }
        })

    } catch (error) {
       
        return res.status(500).json({
            ok: false,
            msg: "Error de inicio de sesión"
        });
    }
};


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