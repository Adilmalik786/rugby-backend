const express = require('express');
const router = express.Router();
const authCtrl = require('./controller/auth.controller');

/*router.param('id', (req,res,next)=>{
        console.log('asdasdasd');
    })
    */

router
    .post('/sign-up', authCtrl.signup)
    .post('/login', authCtrl.login)

module.exports = router;
