const mongoose = require('mongoose');


const playerSchema = mongoose.Schema({
    player: {
        type: String, ref: 'Stats'
    },
    dob: Date,
    age: Number,
    height: Number,
    weight:Number,
    photo:Object
    /*photo: {
        data: Buffer, contentType: String
    }*/

});

module.exports = mongoose.model('Player', playerSchema);
