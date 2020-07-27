const dotenv = require('dotenv');

process.on('uncaughtException', err=>{
    console.log('UNCAUGHT Exception ! Shutting down ....');
    console.log(err.name, err.message);
        process.exit(1);        // need to crash the application : application needs to be restart
});

dotenv.config({path: './config.env'});
const app = require('./app');
const mongoose = require('mongoose');


//  DATABASE CONNECTION
const DB = process.env.DATABASE_CONNECTION.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false,
   /* poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity*/
}).then(() => {
    //console.log(con.connections);
    console.log('DB connection successfull !');
});

// START SERVER
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));


process.on('unhandledRejection', err=>{
    console.log('UNHANDER REJECTION ! Shutting down ....');
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);            // optional
    });
});

//Connectcion String for compass
//mongodb+srv://adil:adil123456@cluster0-fvhqf.mongodb.net/test?retryWrites=true&w=majority
