    const {Schema,model} = require('mongoose')

    const UsuarioSchema = Schema({
    username:{
            type:String,
            require:true
        },
        password:{
            type:String,
            require:true
            },
        hotel:{
            type:String,
            require:true
        }
    })

    module.exports = model('Usuario',UsuarioSchema)