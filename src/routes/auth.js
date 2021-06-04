const express = require('express')
const router = express.Router();
const { signup, signin } = require('../controllers/auth');

router.post('/signup', signup)
router.post('/signin', signin)
// router.post('/admin/signout', signout)

module.exports = router;




/*

const express = require('express')
const router = express.Router()
const { 
    register, 
    login, 
    forgotpassword, 
    resetpassword 
} = require('../controllers/auth.js')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgotpassword').post(forgotpassword)
router.route('/resetpassword/:resetToken').put(resetpassword)

module.exports = router

*/