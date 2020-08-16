const mongoose = require('mongoose');


const playerSchema = mongoose.Schema({
    player: {
        type: String, ref: 'Stats'
    },
    dob: String,
    age: Number,
    height: Number,
    weight:Number,
    photo: Object

});

module.exports = mongoose.model('Player', playerSchema);
