const {connect} = require('mongoose')

const dbConnection =() =>{
    
    const db = connect(process.env.URI)
    .then(() =>{
        console.log('connect database mongoDb')
    }).catch(() =>{
        console.log('error no connection')
    })
    return db
}
module.exports ={ dbConnection}