const ErrorCodes = require('../../../config/error-codes')
const User = require('../models/user.model');
const HttpStatus = require('http-status-codes');
const APIFeatures = require('../../../utils/apiFeatures');

let userService = {

    updateUser: async (userId, updatedUser) => {
        console.log('updated user is :', updatedUser);
        return await User.findByIdAndUpdate(userId, updatedUser, {
            new: true,
            runValidators: true
        });
    },
    deleteUser: async (userId) => {
        await User.findByIdAndDelete(userId);
    },

    findAllUser: async (req) => {

        const features = new APIFeatures(User.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        //Execute Query
        return await features.query;

    },
    getUser: async (user_Name) => {
        return User.findById(user_Id);
    }
};

module.exports = userService;
