const express = require('express');
const router = express();
const userCtrl = require('./controller/user.controller');
/*const middleware = require('../../middlewares/authentication')*/

/*
router
    .route('/stats')
    .get(userCtrl.getUserStats);

router
    .route('/monthly-plan/:year')
    .get(userCtrl.getMonthlyPlan)


router
    .route('/top-5-users')
    .get(userCtrl.aliasTopUsers,userCtrl.findAllUser)
*/


/*router
    .route('/')
    .get(userCtrl.findAllUser);*/


router
    .route('/playersProfiles')
    .get(userCtrl.getPlayerProfiles)

router
    .route('/submitForm')
    .post(userCtrl.submitForm);

router
    .route('/')
    .get(userCtrl.findUser);



/*
router
    .route('/:id')
    .delete(userCtrl.deleteUser)
    .patch(userCtrl.updateUser)
    .get(userCtrl.findUser);
*/

module.exports = router;
