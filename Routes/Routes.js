const {Router} = require('express')
const {check} = require('express-validator')
const { LoginUsuario, CreateUsuario } = require('../controller/controller')
const { validarCampos } = require('../middleweres/middleweres')

const router = Router()

router.post('/login',
        [ 
            check('username','el username es obligatorio').not().isEmpty(),
            check('password','el password es obligatorio').isLength({min:6}),
            validarCampos
        ],
    LoginUsuario
       
)

router.post('/register',
        [
            check('username','el usuario es obligatorio').not().isEmpty(),
            check('password','minimo 6 longitudes').isLength({min:6}),
            validarCampos
        ],
    CreateUsuario

    )

module.exports ={router}
