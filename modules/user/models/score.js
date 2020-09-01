const mongoose = require('mongoose');


const scoreSchema = mongoose.Schema({
    rank: Number,
    position_rank: Number,
    playerName: String,
    position: String,
    score: Number,
    year: String,

});

module.exports = mongoose.model('Scores', scoreSchema);
