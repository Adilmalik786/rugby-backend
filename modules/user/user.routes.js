const express = require('express');
const router = express();
const userCtrl = require('./controller/user.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })


router
    .route('/playersProfiles',)
    .get(userCtrl.getPlayerProfiles);

router
    .route('/submitForm')
    .post(  upload.single('picture'),userCtrl.submitForm);

router
    .route('/finduser')
    .get(userCtrl.findUser);

/*
router
    .route('/getDefenceTable')
    .get(userCtrl.getDefenceTable);

router
    .route('/getErrorTable')
    .get(userCtrl.getErrorTable);

router
    .route('/getPieceTable')
    .get(userCtrl.getPieceTable);

router
    .route('/getAttackTable')
    .get(userCtrl.getAttackTable);

router
    .route('/getSummaryTable')
    .get(userCtrl.getSummaryTable);
*/

router
    .route('/getALLData')
    .get(userCtrl.getAllData);


/*
router
    .route('/:id')
    .delete(userCtrl.deleteUser)
    .patch(userCtrl.updateUser)
    .get(userCtrl.findUser);
*/

module.exports = router;


/*router
    .route('/')
    .get(userCtrl.findAllUser);*/
