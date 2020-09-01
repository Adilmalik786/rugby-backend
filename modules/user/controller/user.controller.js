//const userService = require('../services/user.service');
//const jwt = require('jsonwebtoken');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const Player = require('../models/user.model');
const Stat = require('../models/stats.model');
//var fs = require('fs');
require('dotenv/config');
var multer = require('multer')
//var upload = multer({dest: 'uploads/'})
//const {Positions} = require('../../../config/constants');
const ScoreModel = require('../models/score');


exports.getAllData = catchAsync(async (req,res,next)=>{
    const defence = await defenceTable(req);
    const errors = await errorTable(req);
    const piece = await pieceTable(req);
    const attack = await attackTable(req);
    const summary = await summaryTable(req);

    res.status(200).json({
        status: 'success',
        defence,
        errors,
        piece,
        attack,
        summary,
        error: false
    });

});

const defenceTable=async (req)=>{

    const name = req.query.playerName;

    const tackle = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Tackle"}},
                    /* {shirt_NO: {$in: pos}},*/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const missed = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Missed Tackle"}},
                    /* {shirt_NO: {$in: pos}},*/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);

    const toWon = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*   {shirt_NO: {$in: pos}},*/
                    {
                        $or: [
                            {
                                $and: [
                                    {eventName: {$eq: 'Tackle'}},
                                    {action_result: {$eq: 'Turnover Won'}},
                                ]
                            },
                            {
                                $and: [
                                    {action_type: {$eq: 'Jackal'}},
                                    {action_result: {$eq: 'Success'}},
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const result = {
        year: [],
        tackleCount: [],
        missedCount: [],
        percentage: []
    };
    let year = [];
    missed.forEach(item => {
        year.push(item._id);
    })
    tackle.forEach(item => {
        year.push(item._id);
    })
    toWon.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {

        let countMissed = missed.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackled = tackle.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countWon = toWon.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });


        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;

        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countMissed ? countMissed.count : 0;
        const count3 = countWon ? countWon.count : 0;
        const percent = count1 / (count1 + count2) * 100;
        const item = {
            year: year[i],
            missedCount: count2,
            tackleCount: count1,
            percentage: (percent).toFixed(2),
            missedAverage: (count2 / count).toFixed(2),
            tackleAverage: (count1 / count).toFixed(2),
            toWonAve: (count3 / count).toFixed(2),
            toWon: count3,

        }
        data.push(item);
    }
   return data;
};
const errorTable=async (req)=>{

    const name = req.query.playerName;


    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
            }
        }
    ]);


    const turnOver = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Turnover"}},
                    /*{shirt_NO: {$in: pos}},*/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const penalty = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Penalty Conceded"}},
                    /*{shirt_NO: {$in: pos}},*/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const result = {
        year: [],
        turnOverCount: [],
        penaltyCount: [],
        turnOverAverage: [],
        penaltyAverage: []
    };
    let year = [];
    turnOver.forEach(item => {
        year.push(item._id);
    })
    penalty.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];

    for (let i = 0; i < year.length; i++) {
        let countTurnOver = turnOver.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackled = penalty.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;
        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countTurnOver ? countTurnOver.count : 0;
        const item = {
            year: year[i],
            turnOverCount: count2,
            penaltyCount: count1,
            turnOverAverage: (count2 / count).toFixed(2),
            penaltyAverage: (count1 / count).toFixed(2)
        }
        data.push(item);
    }

   return data;
};
const pieceTable=async (req)=>{
    const name = req.query.playerName;


    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
            }
        }
    ]);

    const lineout = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Lineout throw"}},
                    /*{shirt_NO: {$in: pos}},*/
                    {
                        $or: [
                            {action_result: {$eq: "Won Clean"}},
                            {action_result: {$eq: "Won Tap"}},
                            {action_result: {$eq: "Won Penalty"}},
                            {action_result: {$eq: "Won Other"}},
                            {action_result: {$eq: "Won Free Kick"}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const percentage = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*  {shirt_NO: {$in: pos}},*/
                    {
                        $or: [
                            {action_result: {$eq: 'Won Clean'}},
                            {action_result: {$eq: 'Won Free Kick'}},
                            {action_result: {$eq: 'Won Other'}},
                            {action_result: {$eq: 'Won Penalty'}},
                            {action_result: {$eq: 'Won Tap'}},
                        ]
                    },
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const loJumps = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {eventName: {$eq: 'Lineout Take'}},
                    {
                        $or: [
                            {action_result: {$eq: "Won Clean"}},
                            {action_result: {$eq: "Won Tap"}},
                            {action_result: {$eq: "Won Penalty"}},
                            {action_result: {$eq: "Won Other"}},
                            {action_result: {$eq: "Won Free Kick"}},
                        ]
                    }

                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const loSteals = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {eventName: {$eq: 'Lineout Take'}},
                    {
                        $or: [
                            {action_type: {$eq: 'LineOut Steal 15m+'}},
                            {action_type: {$eq: 'LineOut Steal Back'}},
                            {action_type: {$eq: 'LineOut Steal Middle'}},
                            {action_type: {$eq: 'LineOut Steal Front'}},
                            {action_type: {$eq: 'LineOut Steal'}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);


    const result = {
        year: [],
        lineoutCount: [],
        loJumpsCount: [],
        loStealsCount: [],
        percentage: [],
        lineoutAverage: [],
        loJumpsAverage: [],
        loStealsAverage: [],
    };
    let year = [];
    lineout.forEach(item => {
        year.push(item._id);
    })
    percentage.forEach(item => {
        year.push(item._id);
    })
    loJumps.forEach(item => {
        year.push(item._id);
    })
    loSteals.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];

    for (let i = 0; i < year.length; i++) {
        let countlineout = lineout.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countPercentage = percentage.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countLoJumps = loJumps.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countloSteals = loSteals.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;
        const count1 = countlineout ? countlineout.count : 0;
        const count2 = countPercentage ? countPercentage.count : 0;
        const count3 = countLoJumps ? countLoJumps.count : 0;
        const count4 = countloSteals ? countloSteals.count : 0;

        const item = {
            year: year[i],
            lineoutCount: count1,
            loJumpsCount: count3,
            loStealsCount: count4,
            percentage: (count2).toFixed(2),
            lineoutAverage: (count1 / count).toFixed(2),
            loJumpsAverage: (count3 / count).toFixed(2),
            loStealsAverage: (count4 / count).toFixed(2),
        }
        data.push(item);
    }


    return data;
};
const attackTable=async (req)=>{
    const name = req.query.playerName;

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);
    const ballCarries = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                eventName: {$eq: 'Carry'}
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const meters = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*   {shirt_NO: {$in: pos}},*/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: "$metres"}
            }
        }
    ]);
    const tries = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /* {shirt_NO: {$in: pos}},*/
                    {action_type: {$eq: 'Try'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const tackleBreaks = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {action_type: {$eq: 'Defender Beaten'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const offload = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {action_type: {$eq: 'Offload'}},
                    {action_result: {$eq: 'Own Player'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const lineBreak = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {action_type: {$eq: 'Break'}},
                    {action_type: {$eq: 'Supported break'}},
                    {action_type: {$eq: 'Initial Break'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const passes = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /*{shirt_NO: {$in: pos}},*/
                    {eventName: {$eq: 'Pass'}},

                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const kicks = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /* {shirt_NO: {$in: pos}},*/
                    {eventName: {$eq: 'Kick'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const result = {
        year: [],
        ballCarries: [],
        ballCarriesAvg: [],
        meters: [],
        metersAvg: [],
        mtsAvg: [],
        tries: [],
        offloads: [],
        offloadsAvg: [],
        triesAvg: [],
        tackleBreaks: [],
        tackleBreaksAvg: [],
        lineBreak: [],
        lineBreakAvg: [],
        passes: [],
        passesAvg: [],
        kicks: [],
        kicksAvg: [],
    };
    let year = [];
    ballCarries.forEach(item => {
        year.push(item._id);
    })
    offload.forEach(item => {
        year.push(item._id);
    })
    meters.forEach(item => {
        year.push(item._id);
    })
    tries.forEach(item => {
        year.push(item._id);
    })
    tackleBreaks.forEach(item => {
        year.push(item._id);
    })
    lineBreak.forEach(item => {
        year.push(item._id);
    })
    passes.forEach(item => {
        year.push(item._id);
    })
    kicks.forEach(item => {
        year.push(item._id);
    })
    const data = [];
    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {
        let countBallCarries = ballCarries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countOffload = offload.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countMeters = meters.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTries = tries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackleBreaks = tackleBreaks.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countLineBreak = lineBreak.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countPasses = passes.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countFxIDs = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countKicks = kicks.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });

        const count = countFxIDs ? countFxIDs.game.length : 1;
        const count1 = countBallCarries ? countBallCarries.count : 0;
        const count2 = countMeters ? countMeters.count : 0;
        const count3 = countTries ? countTries.count : 0;
        const count4 = countTackleBreaks ? countTackleBreaks.count : 0;
        const count5 = countLineBreak ? countLineBreak.count : 0;
        const count6 = countPasses ? countPasses.count : 0;
        const count7 = countKicks ? countKicks.count : 0;
        const count8 = countOffload ? countOffload.count : 0;
        const item = {
            year: year[i],
            ballCarries: count1,
            ballCarriesAvg: (count1 / count).toFixed(2),
            meters: count2,
            metersAvg: (count2 / count).toFixed(2),
            mtsAvg: (count2 / count1).toFixed(2),
            tries: count3,
            triesAvg: (count3 / count).toFixed(2),
            offloads: count8,
            offloadsAvg: (count8 / count).toFixed(2),
            tackleBreaks: count4,
            tackleBreaksAvg: (count4 / count).toFixed(2),
            lineBreak: count5,
            lineBreakAvg: (count5 / count).toFixed(2),
            passes: count6,
            passesAvg: (count6 / count).toFixed(2),
            kicks: count7,
            kicksAvg: (count7 / count).toFixed(2),
        }
        data.push(item);
    }

    return data;
};
const summaryTable=async(req)=>{

    const position = req.query.position;

    const name = req.query.playerName;

    const starts = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                shirt_NO: {$in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                shirts: {$addToSet: "$shirt_NO"},
                count: {$sum: 1}
            }
        }
    ]);

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);

    const gameTime = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                totalTime: {$addToSet: "$mins"}
            }
        },

    ]);

    const positionRanking = await ScoreModel.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                position:{$eq:position}
            }
        },
        {
            $group: {
                _id: "$year",
                years: {$addToSet: "$year"},
                rank: {$first: "$position_rank"}
            }
        }
    ]);
    const worldRanking = await ScoreModel.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$year",
                years: {$addToSet: "$year"},
                rank: {$first: "$rank"}
            }
        }
    ]);


    const maxWorldRanking = await ScoreModel.aggregate([
        {
            $group: {
                _id: "$year",
                years: {$addToSet: "$year"},
                rank: {$max: "$rank"}
            }
        }
    ]);
     const maxPositions = await ScoreModel.aggregate([
            {
                $match: {
                    position:{$eq:position}
                }
            },
            {
                $group: {
                    _id: "$year",
                    years: {$addToSet: "$year"},
                    rank: {$max: "$position_rank"}
                }
            }
        ]);
     const scoring = await ScoreModel.aggregate([
         {
             $match: {
                 playerName: {$eq: name},
             }
         },
         {
             $group: {
                 _id: "$year",
                 years: {$addToSet: "$year"},
                 score: {$first: "$score"}
             }
         }
     ]);

    // need to verify
    const scoreMetersMade = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: "$metres"}
            }
        }
    ]);
    const scoreBallCarries = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                eventName: {$eq: 'Carry'}
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreDefenderBeaten = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {action_type: {$eq: 'Defender Beaten'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreTackle = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Tackle"}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreTurnOverWon = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {
                        $and: [
                            {eventName: {$eq: 'Tackle'}},
                            {action_result: {$eq: 'Turnover Won'}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const totalTackle = scoreTackle.reduce((acc, currentvalue) => {
        return acc + currentvalue.count
    }, 0);


    const result = {
        year: [],
        games: [],
        gameTime: [],
        Score: [],
        starts: []
    };

    let year = [];
    starts.forEach(item => {
        year.push(item._id);
    });

    scoreMetersMade.forEach(item => {
        year.push(item._id);
    })
    scoreBallCarries.forEach(item => {
        year.push(item._id);
    })
    scoring.forEach(item => {
        year.push(item._id);
    })
    scoreDefenderBeaten.forEach(item => {
        year.push(item._id);
    })
    scoreTackle.forEach(item => {
        year.push(item._id);
    })
    scoreTurnOverWon.forEach(item => {
        year.push(item._id);
    })
    gameTime.forEach(item => {
        year.push(item._id);
    })
    positionRanking.forEach(item => {
        year.push(item._id);
    })
    worldRanking.forEach(item => {
        year.push(item._id);
    })


    const data = [];
    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {
        let countMetersMade = scoreMetersMade.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countfxIDs = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countBallCarries = scoreBallCarries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countDefenderBeaten = scoreDefenderBeaten.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackle = scoreTackle.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTurnOverWon = scoreTurnOverWon.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countGameTime = gameTime.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countScoring =  scoring.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let pos_rank = positionRanking.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countworldRanking = worldRanking.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let startsCount = starts.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let max_world_rank = maxWorldRanking.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let max_pos_rank = maxPositions.find((item,index)=>{
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let count = countfxIDs ? countfxIDs.game.length : 1;
        count = count===0 ? 1 : count;
        const count1 = countBallCarries ? countBallCarries.count : 0;
        const count2 = countMetersMade ? countMetersMade.count : 0;
        const count3 = countDefenderBeaten ? countDefenderBeaten.count : 0;
        const count4 = countTackle ? countTackle.count : 0;
        const countTotalTackle = totalTackle === 0 ? 1 : totalTackle;
        const count9 = count4 / countTotalTackle;
        const count5 = countTurnOverWon ? countTurnOverWon.count : 0;
        const count8 = countGameTime ? countGameTime.totalTime.reduce((acc, currentvalue) => {
            return acc + currentvalue;
        }, 0) : 0;
        const count10 = startsCount ? startsCount.shirts.length : 0;
        const count_pos_rank = pos_rank ? pos_rank.rank : 0;
        const count_worldRanking = countworldRanking ? countworldRanking.rank : 0;
        const count_scored = countScoring ? countScoring.score : 0;
        const item = {
            year: year[i],
            games: count,
            gameTime: count8,
        //    Score: (((count1 * 3) + (count2 * 2) + (count3 * 5) + ((count9 * 2) / 10) + (count5 * 5)) + (((count8 * 2) / 10) / count)).toFixed(2),
             Score:count_scored,
            starts: count10,
            max_world_ranking:max_world_rank.rank,
            world_Ranking: count_worldRanking,
            position_ranking:count_pos_rank,
            max_Position_ranking:max_pos_rank.rank,
            percent_postion_ranking: ((count_pos_rank/max_pos_rank.rank)*100).toFixed(2),
            percent_world_ranking:((count_worldRanking/max_world_rank.rank)*100).toFixed(2)
        }
        data.push(item);
    }

    return data;
};


exports.findUser = catchAsync(async (req, res, next) => {

    const name = req.query.name;


    const user = await Player.findOne({player: name});
    if (!user) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }


    res.status(200).json({
        status: 'success',
        data: user,
        error: false
    });
});
exports.getPlayerProfiles = catchAsync(async (req, res, next) => {


    const users = await Stat.aggregate([
        {
            $match: {playerName: {$ne: ""}}
        },
        {
            $project: {
                playerName: 1
            }
        },
        {
            $group: {
                _id: "$playerName",
                name: {$first: "$playerName"},
            }
        }
    ]);

    if (!users) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            users
        },
        error: false
    });
});
/*exports.getDefenceTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];
    const tackle = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Tackle"}},
                    /!* {shirt_NO: {$in: pos}},*!/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const missed = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Missed Tackle"}},
                    /!* {shirt_NO: {$in: pos}},*!/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);

    const toWon = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*   {shirt_NO: {$in: pos}},*!/
                    {
                        $or: [
                            {
                                $and: [
                                    {eventName: {$eq: 'Tackle'}},
                                    {action_result: {$eq: 'Turnover Won'}},
                                ]
                            },
                            {
                                $and: [
                                    {action_type: {$eq: 'Jackal'}},
                                    {action_result: {$eq: 'Success'}},
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const result = {
        year: [],
        tackleCount: [],
        missedCount: [],
        percentage: []
    };
    let year = [];
    missed.forEach(item => {
        year.push(item._id);
    })
    tackle.forEach(item => {
        year.push(item._id);
    })
    toWon.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {

        let countMissed = missed.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackled = tackle.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countWon = toWon.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });


        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;

        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countMissed ? countMissed.count : 0;
        const count3 = countWon ? countWon.count : 0;
        const percent = count1 / (count1 + count2) * 100;
        const item = {
            year: year[i],
            missedCount: count2,
            tackleCount: count1,
            percentage: (percent).toFixed(2),
            missedAverage: (count2 / count).toFixed(2),
            tackleAverage: (count1 / count).toFixed(2),
            toWonAve: (count3 / count).toFixed(2),
            toWon: count3,

        }
        data.push(item);
    }
    if (!result) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            ...data
        },
        error: false
    });
});
exports.getErrorTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];


    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
            }
        }
    ]);
    console.log('fxIDs:', fxIDs);

    const turnOver = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Turnover"}},
                    /!*{shirt_NO: {$in: pos}},*!/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const penalty = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Penalty Conceded"}},
                    /!*{shirt_NO: {$in: pos}},*!/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const result = {
        year: [],
        turnOverCount: [],
        penaltyCount: [],
        turnOverAverage: [],
        penaltyAverage: []
    };
    let year = [];
    turnOver.forEach(item => {
        year.push(item._id);
    })
    penalty.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];

    for (let i = 0; i < year.length; i++) {
        let countTurnOver = turnOver.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackled = penalty.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;
        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countTurnOver ? countTurnOver.count : 0;
        const item = {
            year: year[i],
            turnOverCount: count2,
            penaltyCount: count1,
            turnOverAverage: (count2 / count).toFixed(2),
            penaltyAverage: (count1 / count).toFixed(2)
        }
        data.push(item);
    }

    if (!result) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            ...data
        },
        error: false
    });
});
exports.getPieceTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
            }
        }
    ]);

    const lineout = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Lineout throw"}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {
                        $or: [
                            {action_result: {$eq: "Won Clean"}},
                            {action_result: {$eq: "Won Tap"}},
                            {action_result: {$eq: "Won Penalty"}},
                            {action_result: {$eq: "Won Other"}},
                            {action_result: {$eq: "Won Free Kick"}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    console.log('lineout:', lineout);
    const percentage = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*  {shirt_NO: {$in: pos}},*!/
                    {
                        $or: [
                            {action_result: {$eq: 'Won Clean'}},
                            {action_result: {$eq: 'Won Free Kick'}},
                            {action_result: {$eq: 'Won Other'}},
                            {action_result: {$eq: 'Won Penalty'}},
                            {action_result: {$eq: 'Won Tap'}},
                        ]
                    },
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const loJumps = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {eventName: {$eq: 'Lineout Take'}},
                    {
                        $or: [
                            {action_result: {$eq: "Won Clean"}},
                            {action_result: {$eq: "Won Tap"}},
                            {action_result: {$eq: "Won Penalty"}},
                            {action_result: {$eq: "Won Other"}},
                            {action_result: {$eq: "Won Free Kick"}},
                        ]
                    }

                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    console.log('lo JUmps:', loJumps);

    const loSteals = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {eventName: {$eq: 'Lineout Take'}},
                    {
                        $or: [
                            {action_type: {$eq: 'LineOut Steal 15m+'}},
                            {action_type: {$eq: 'LineOut Steal Back'}},
                            {action_type: {$eq: 'LineOut Steal Middle'}},
                            {action_type: {$eq: 'LineOut Steal Front'}},
                            {action_type: {$eq: 'LineOut Steal'}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);


    const result = {
        year: [],
        lineoutCount: [],
        loJumpsCount: [],
        loStealsCount: [],
        percentage: [],
        lineoutAverage: [],
        loJumpsAverage: [],
        loStealsAverage: [],
    };
    let year = [];
    lineout.forEach(item => {
        year.push(item._id);
    })
    percentage.forEach(item => {
        year.push(item._id);
    })
    loJumps.forEach(item => {
        year.push(item._id);
    })
    loSteals.forEach(item => {
        year.push(item._id);
    })

    const data = [];

    year = [...Array.from(new Set(year))];
    result.year = [...year];

    for (let i = 0; i < year.length; i++) {
        let countlineout = lineout.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countPercentage = percentage.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countLoJumps = loJumps.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countloSteals = loSteals.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let fxIDsAvgCount = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        const count = fxIDsAvgCount ? fxIDsAvgCount.game.length : 1;
        const count1 = countlineout ? countlineout.count : 0;
        const count2 = countPercentage ? countPercentage.count : 0;
        const count3 = countLoJumps ? countLoJumps.count : 0;
        const count4 = countloSteals ? countloSteals.count : 0;

        const item = {
            year: year[i],
            lineoutCount: count1,
            loJumpsCount: count3,
            loStealsCount: count4,
            percentage: (count2).toFixed(2),
            lineoutAverage: (count1 / count).toFixed(2),
            loJumpsAverage: (count3 / count).toFixed(2),
            loStealsAverage: (count4 / count).toFixed(2),
        }
        data.push(item);
    }


    if (!result) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: data,
        error: false
    });
});
exports.getAttackTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);
    const ballCarries = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                eventName: {$eq: 'Carry'}
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const meters = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*   {shirt_NO: {$in: pos}},*!/
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: "$metres"}
            }
        }
    ]);
    const tries = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!* {shirt_NO: {$in: pos}},*!/
                    {action_type: {$eq: 'Try'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const tackleBreaks = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {action_type: {$eq: 'Defender Beaten'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const offload = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {action_type: {$eq: 'Offload'}},
                    {action_result: {$eq: 'Own Player'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const lineBreak = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {action_type: {$eq: 'Break'}},
                    {action_type: {$eq: 'Supported break'}},
                    {action_type: {$eq: 'Initial Break'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const passes = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!*{shirt_NO: {$in: pos}},*!/
                    {eventName: {$eq: 'Pass'}},

                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const kicks = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    /!* {shirt_NO: {$in: pos}},*!/
                    {eventName: {$eq: 'Kick'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);

    const result = {
        year: [],
        ballCarries: [],
        ballCarriesAvg: [],
        meters: [],
        metersAvg: [],
        mtsAvg: [],
        tries: [],
        offloads: [],
        offloadsAvg: [],
        triesAvg: [],
        tackleBreaks: [],
        tackleBreaksAvg: [],
        lineBreak: [],
        lineBreakAvg: [],
        passes: [],
        passesAvg: [],
        kicks: [],
        kicksAvg: [],
    };
    let year = [];
    ballCarries.forEach(item => {
        year.push(item._id);
    })
    offload.forEach(item => {
        year.push(item._id);
    })
    meters.forEach(item => {
        year.push(item._id);
    })
    tries.forEach(item => {
        year.push(item._id);
    })
    tackleBreaks.forEach(item => {
        year.push(item._id);
    })
    lineBreak.forEach(item => {
        year.push(item._id);
    })
    passes.forEach(item => {
        year.push(item._id);
    })
    kicks.forEach(item => {
        year.push(item._id);
    })
    const data = [];
    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {
        let countBallCarries = ballCarries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countOffload = offload.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countMeters = meters.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTries = tries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackleBreaks = tackleBreaks.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countLineBreak = lineBreak.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countPasses = passes.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countFxIDs = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });
        let countKicks = kicks.find((item, index) => {
            if (item._id === year[i]) {
                return item;
            }
        });

        const count = countFxIDs ? countFxIDs.game.length : 1;
        const count1 = countBallCarries ? countBallCarries.count : 0;
        const count2 = countMeters ? countMeters.count : 0;
        const count3 = countTries ? countTries.count : 0;
        const count4 = countTackleBreaks ? countTackleBreaks.count : 0;
        const count5 = countLineBreak ? countLineBreak.count : 0;
        const count6 = countPasses ? countPasses.count : 0;
        const count7 = countKicks ? countKicks.count : 0;
        const count8 = countOffload ? countOffload.count : 0;
        const item = {
            year: year[i],
            ballCarries: count1,
            ballCarriesAvg: (count1 / count).toFixed(2),
            meters: count2,
            metersAvg: (count2 / count).toFixed(2),
            mtsAvg: (count2 / count1).toFixed(2),
            tries: count3,
            triesAvg: (count3 / count).toFixed(2),
            offloads: count8,
            offloadsAvg: (count8 / count).toFixed(2),
            tackleBreaks: count4,
            tackleBreaksAvg: (count4 / count).toFixed(2),
            lineBreak: count5,
            lineBreakAvg: (count5 / count).toFixed(2),
            passes: count6,
            passesAvg: (count6 / count).toFixed(2),
            kicks: count7,
            kicksAvg: (count7 / count).toFixed(2),
        }
        data.push(item);
    }

    console.log('data:', data);

    if (!result) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: data,
        error: false
    });
});
exports.getSummaryTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;

    const starts = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                shirt_NO: {$in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                shirts: {$addToSet: "$shirt_NO"},
                count: {$sum: 1}
            }
        }
    ]);

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                count: {$sum: 1}
            }
        }
    ]);

    const gameTime = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$FxDate",
                game: {$addToSet: "$fx_ID"},
                totalTime: {$addToSet: "$mins"}
            }
        },

    ]);



        console.log('totalTime:', gameTime);
    // need to verify
    const scoreMetersMade = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: "$metres"}
            }
        }
    ]);
    const scoreBallCarries = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
                eventName: {$eq: 'Carry'}
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreDefenderBeaten = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {action_type: {$eq: 'Defender Beaten'}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreTackle = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Tackle"}},
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        }
    ]);
    const scoreTurnOverWon = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {
                        $and: [
                            {eventName: {$eq: 'Tackle'}},
                            {action_result: {$eq: 'Turnover Won'}},
                        ]
                    }
                ]
            }
        },
        {
            $group: {
                _id: "$FxDate",
                count: {$sum: 1}
            }
        },
    ]);

    const totalTackle = scoreTackle.reduce((acc, currentvalue) => {
        return acc + currentvalue.count
    }, 0);


    const result = {
        year: [],
        games: [],
        gameTime: [],
        Score: [],
        starts: []
    };

    let year = [];
    starts.forEach(item => {
        year.push(item._id);
    });

    scoreMetersMade.forEach(item => {
        year.push(item._id);
    })
    scoreBallCarries.forEach(item => {
        year.push(item._id);
    })
    scoreDefenderBeaten.forEach(item => {
        year.push(item._id);
    })
    scoreTackle.forEach(item => {
        year.push(item._id);
    })
    scoreTurnOverWon.forEach(item => {
        year.push(item._id);
    })
    gameTime.forEach(item => {
        year.push(item._id);
    })

    const data = [];
    year = [...Array.from(new Set(year))];
    result.year = [...year];
    for (let i = 0; i < year.length; i++) {
        let countMetersMade = scoreMetersMade.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countfxIDs = fxIDs.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countBallCarries = scoreBallCarries.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countDefenderBeaten = scoreDefenderBeaten.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackle = scoreTackle.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTurnOverWon = scoreTurnOverWon.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countGameTime = gameTime.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let startsCount = starts.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });

        let count = countfxIDs ? countfxIDs.game.length : 1;
        count = count===0 ? 1 : count;
        console.log('count:', count);
        const count1 = countBallCarries ? countBallCarries.count : 0;
        const count2 = countMetersMade ? countMetersMade.count : 0;
        const count3 = countDefenderBeaten ? countDefenderBeaten.count : 0;
        const count4 = countTackle ? countTackle.count : 0;
        const countTotalTackle = totalTackle === 0 ? 1 : totalTackle;
        const count9 = count4 / countTotalTackle;
        const count5 = countTurnOverWon ? countTurnOverWon.count : 0;
        const count8 = countGameTime ? countGameTime.totalTime.reduce((acc, currentvalue) => {
            return acc + currentvalue;
        }, 0) : 0;
        const count10 = startsCount ? startsCount.shirts.length : 0;

        const item = {
            year: year[i],
            games: count,
            gameTime: count8,
            Score: (((count1 * 3) + (count2 * 2) + (count3 * 5) + ((count9 * 2) / 10) + (count5 * 5)) + (((count8 * 2) / 10) / count)).toFixed(2),
            starts: count10
        }
        data.push(item);
    }

    console.log('data:', data);

    if (!result) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: data,
        error: false
    });
});*/


exports.submitForm = async (req, res, next) => {


    const {data} = req.body;

    const user = await Player.updateOne(
        {player: data.player},
        {
            height:data.height,
            dob: data.dob,
            age: data.age,
            weight: data.weight,
            photo: data.photo,
            player: data.player
        },
        {upsert: true}
        );

    res.status(200).json({
        status: 'success',
        data: user,
        error: false
    });
};

