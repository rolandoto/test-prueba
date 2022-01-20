const {connect} = require('mongoose')


const dbConnection =() =>{
    
    const db = connect(process.env.URI)
    .then(() =>{
        console.log('connect database')
    }).catch(() =>{
        console.log('error no connection')
    })

    return db

}

module.exports ={ dbConnection}