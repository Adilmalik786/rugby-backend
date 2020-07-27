const {ErrorCodes} = require('../../../config/error-codes');
const User = require('../../user/models/user.model');
const HttpStatus = require('http-status-codes');

let authService = {

    validateUser: async (email) => {
        return await User.findOne({email}).select('+password');
    },
    signup: async (newUser) => {
             return User.create({
                 first_name: newUser.first_name,
                 last_name:  newUser.last_name,
                 email: newUser.email,
                 password:newUser.password,
                 passwordConfirm: newUser.passwordConfirm
             });
    },
};
module.exports = authService;
