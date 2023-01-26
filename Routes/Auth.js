const router = require('express').Router()
const {check} = require('express-validator')
const { ValidarCampos } = require('../middleweres/middleweres')
const { LoginUsuario, CreateUsuario } = require('../controller/Controller')

router.post('/login',
        [ 
            check('username','el username es obligatorio').not().isEmpty(),
            check('password','el password es obligatorio').isLength({min:6}),
            check('hotel',' error de hotel').not().isEmpty(),
            ValidarCampos
        ],
    LoginUsuario   
)
router.post('/register',
        [
            check('username','el usuario es obligatorio').not().isEmpty(),
            check('password','minimo 6 longitudes').isLength({min:6}),
            check('hotel',' error de hotel').not().isEmpty(),
            ValidarCampos
        ],
    CreateUsuario
    )
module.exports ={router}
