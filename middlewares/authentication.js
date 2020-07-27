const {promisify} = require('util');
const checkAsync = require('../utils/catchAsync');
const appError = require('../utils/appError')
const HttpStatus = require('http-status-codes');
const middleware = {

    authenticate: checkAsync(async (req, res, next) => {
        let token;
// 1) Getting token and check if its there
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        console.log(token);

        if (!token) {
            return next(new appError("You are not logged in! Please log in to get access.", HttpStatus.UNAUTHORIZED))
        }
        // 2) Verification token

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        // 3) check user if exists


        // 4) check if user changed password after the token was issued


        next();
    })

};

module.exports = middleware;
