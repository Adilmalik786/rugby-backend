/*
const {ErrorHandler} = require("../helper/error");
/!*const {ERROR_CODES} = require('../config/error-codes');*!/
const HttpStatus = require('http-status-codes');
require('dotenv/config');
const Joi = require('@hapi/joi');
const User = require('../modules/user/models/user.model');
//Error Handling

const JoiValidation = {
    signUp: async (req, res, next) => {
        let {email, password, first_name, last_name} = req.body;
        const schema = Joi.object({
            firstName: Joi.string()
                .alphanum()
                .min(3)
                .max(30)
                .required(),
            lastName: Joi.string()
                .alphanum()
                .min(3)
                .max(30)
                .required(),

            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

            email: Joi.string()
                .email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'pk']}})
        })
            .with('email', 'password')
            .with('first_name', 'last_name');

        try {
            await schema.validateAsync({
                email: email,
                password: password,
                firstName: first_name,
                lastName: last_name
            });
            next();
        } catch (err) {
            console.log('error is: ',err);
            next(err);
        }

    },
    login: async (req, res, next) => {
        let {email, password} = req.body;
        const schema = Joi.object({
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

            email: Joi.string()
                .email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'pk']}})
        })
            .with('email', 'password')

        try {
            await schema.validateAsync({
                email: email,
                password: password,
            });
            next();
        } catch (error) {
            console.log('login validation error is  :', error);
            next(error);
        }
    }
};

module.exports = JoiValidation;
*/
