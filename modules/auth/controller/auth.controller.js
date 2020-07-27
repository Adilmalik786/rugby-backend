const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const catchAsync = require('../../../utils/catchAsync');
const HttpStatus = require('http-status-codes');
const AppError = require('../../../utils/appError');

const signToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {

        const newUser = await authService.signup(req.body);
        const token = signToken(newUser['_id']);
        res.status(HttpStatus.CREATED).json({
            status: 'success',
            token,
            data:{
                user:newUser
            },
            error: false
        });
});

exports.login = catchAsync(async (req, res, next) => {
   const {email,password} = req.body;

   if(!email || !password){
       return next(new AppError("Please provide email and password", HttpStatus.NOT_FOUND));
   }

   const user = await authService.validateUser(email);

console.log(user);

if(!user || !(await user.correctPassword(password,user.password))){
    return next(new AppError("Incorrect Email or Password !", HttpStatus.UNAUTHORIZED));
}

const token = signToken(user['_id']);
   res.status(HttpStatus.OK).json({
      status: 'success',
      token,
      error:false
   });
});
