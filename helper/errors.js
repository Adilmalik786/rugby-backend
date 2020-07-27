const AppError = require('../utils/appError');
const HttpStatus = require('http-status-codes');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, HttpStatus.BAD_REQUEST);
};
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, HttpStatus.BAD_REQUEST);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, HttpStatus.BAD_REQUEST);

};
const handleJWTError = err => new AppError('Invalid token. Please log in again', HttpStatus.UNAUTHORIZED);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorProd = (err, res) => {
    // operational, trusted error : send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: dont leak error details
    else {
        //1) Log Error
        console.error('Error is: ', err);
        //2) Send generic Error
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong !'
        });
    }

};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        console.log(process.env.NODE_ENV);
        let error = {...err};
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);

            sendErrorProd(error, res);
    }
    // production is not setting
};
