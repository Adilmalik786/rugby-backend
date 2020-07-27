const express = require('express');
const router = express.Router();
const userRoute = require('../modules/user/user.routes');
/*const authRoutes = require('../modules/auth/auth.routes');*/
const {END_POINTS} = require('../config/end-points');

//GET status.
router.get('/health-check', function (req, res, next) {
    res.send('Server is OK');
});

/*router.use(END_POINTS.AUTH, authRoutes);*/
router.use(END_POINTS.USER, userRoute);

module.exports = router;
