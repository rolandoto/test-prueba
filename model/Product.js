const {Schema,model} = require('mongoose')

const UsuarioSchema = Schema({
    check_list: Array
})

module.exports = model('Product',UsuarioSchema)