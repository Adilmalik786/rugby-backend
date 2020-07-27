var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bosyParser = require('body-parser');
var indexRouter = require('./routes/routes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./helper/errors');
const cors = require('cors')
var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
}
;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bosyParser.json());

// App Routes
app.use('/api/v1', indexRouter);

// SWAGGER
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
/*app.use(function (req, res, next) {
    next(createError(404));
});*/

app.all('*', (req, res, next) => {
// what we pass in the error function express will know it it is the error skip other middlewares and
// and pass this error to the global middleware
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);



module.exports = app;


//  Connection String mongodb Compass
// mongodb+srv://adil:<password>@cluster0-6w09r.mongodb.net/test
