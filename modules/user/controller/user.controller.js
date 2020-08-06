const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const Player = require('../models/user.model');
const Stat = require('../models/stats.model');
var fs = require('fs');
require('dotenv/config');
var multer = require('multer')
var upload = multer({dest: 'uploads/'})
const {Positions} = require('../../../config/constants');

//middleware
/*exports.aliasTopUsers = catchAsync(async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-email,password';
    req.query.fields = 'first_name,last_name,email';
    next();
});*/

exports.findUser = catchAsync(async (req, res, next) => {

    const name = req.query.name.toLowerCase();
    console.log('name:', name);
    const user = await Player.findOne({player: name});
    if (!user) {
        return next(new AppError(`Can't find user with this ID `, 404));
    }

    console.log('user: ', user);
    res.status(200).json({
        status: 'success',
        data: {
            user
        },
        error: false
    });
});
exports.getPlayerProfiles = catchAsync(async (req, res, next) => {

    //  const { name } = req.param
    /*    const {player,
            dob,
            age,
            height,
            weight,
            photo} = req.body;
         const user = await Player.create({
             player,
             dob,
             age,
             height,
             weight,
             photo
         });*/

    console.log('came!')

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
    // console.log('users:', users);
    console.log(users);
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
exports.getDefenceTable = catchAsync(async (req, res, next) => {

    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];
    const tackle = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Tackle"}},
                    {shirt_NO: {$in: pos}},
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
                    {shirt_NO: {$in: pos}},
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
                _id: "$fx_ID",
            }
        }, {
            $count: "counts"
        }
    ]);
    const toWon = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Missed Tackle"}},
                    {shirt_NO: {$in: pos}},
                    {eventName: {$eq: 'Tackle'}},
                    {action_result: {$eq: 'Turnover Won'}},
                    {action_type: {$eq: 'Jackal'}},
                    {action_result: {$eq: 'Success'}},

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
    let count = 1;
    if (fxIDs.length > 0) {
        count = fxIDs[0].counts
    }
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
        let countWon = tackle.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countMissed ? countMissed.count : 0;
        const count3 = countWon ? countWon.count : 0;
        const percent = count1 / (count1 + count2) * 100;
        const item = {
            year: year[i],
            missedCount: count1,
            tackleCount: count2,
            percentage: percent,
            missedAverage: count1 / count,
            tackleAverage: count2 / count,
            toWonAve: count3 / count,
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
    console.log('Error Table');
    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];

    console.log('name:', name);
    console.log('position:', position);
    console.log('pos:', pos);
    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$fx_ID",
            }
        }, {
            $count: "counts"
        }
    ]);

    const turnOver = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "Turnover"}},
                    {shirt_NO: {$in: pos}},
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
                    {shirt_NO: {$in: pos}},
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
    let count = 1;
    if (fxIDs.length > 0) {
        count = fxIDs[0].counts
    }
    year = [...Array.from(new Set(year))];
    result.year = [...year];

    for (let i = 0; i < year.length; i++) {
        let countMissed = turnOver.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        let countTackled = penalty.find((item, index) => {
            if (item._id === year[i]) {
                return item._id;
            }
        });
        const count1 = countTackled ? countTackled.count : 0;
        const count2 = countMissed ? countMissed.count : 0;
        const item = {
            year: year[i],
            turnOverCount: count1,
            penaltyCount: count2,
            turnOverAverage: count1 / count,
            penaltyAverage: count2 / count
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
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const name = req.query.playerName;
    const position = req.query.position;
    const pos = Positions[position];
    console.log('name:', name);
    console.log('position:', position);
    console.log('pos:', pos);

    const fxIDs = await Stat.aggregate([
        {
            $match: {
                playerName: {$eq: name},
            }
        },
        {
            $group: {
                _id: "$fx_ID",
            }
        }, {
            $count: "counts"
        }
    ]);
    console.log('fxIDs:', fxIDs);

    const lineout = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "LineOut throw"}},
                    {shirt_NO: {$in: pos}},
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
                    {eventName: {$eq: "LineOut throw"}},
                    {shirt_NO: {$in: pos}},
                    {action_result: {$eq: 'Won Clean'}},
                    {action_result: {$eq: 'Won Free Kick'}},
                    {action_result: {$eq: 'Won Other'}},
                    {action_result: {$eq: 'Won Penalty'}},
                    {action_result: {$eq: 'Won Tap'}},

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
    console.log('percentage:', percentage);
    const loJumps = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "LineOut throw"}},
                    {shirt_NO: {$in: pos}},
                    {eventName: {$eq: 'Lineout Take'}},
                    {action_type: {$eq: 'LineOut Win 15m+'}},
                    {action_type: {$eq: 'LineOut Back'}},
                    {action_type: {$eq: 'LineOut Middle'}},
                    {action_type: {$eq: 'LineOut Front'}},
                    {action_type: {$eq: 'LineOut Quick'}},
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
    console.log('loJumps:', loJumps);
    const loSteals = await Stat.aggregate([
        {
            $match: {
                $and: [
                    {playerName: {$eq: name}},
                    {eventName: {$eq: "LineOut throw"}},
                    {shirt_NO: {$in: pos}},
                    {eventName: {$eq: 'Lineout Take'}},
                    {action_type: {$eq: 'LineOut Steal 15m+'}},
                    {action_type: {$eq: 'LineOut Steal Back'}},
                    {action_type: {$eq: 'LineOut Steal Middle'}},
                    {action_type: {$eq: 'LineOut Steal Front'}},
                    {action_type: {$eq: 'LineOut Steal'}},
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



    console.log('loSteals:', loSteals);
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
    let count = 1;
    if (fxIDs.length > 0) {
        count = fxIDs[0].counts
    }
    console.log('count:', count);
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
        const count1 = countlineout ? countlineout.count : 0;
        const count2 = countPercentage ? countPercentage.count : 0;
        const count3 = countLoJumps ? countLoJumps.count : 0;
        const count4 = countloSteals ? countloSteals.count : 0;
        const item = {
            year: year[i],
            lineoutCount: count1,
            loJumpsCount: count3,
            loStealsCount: count4,
            percentage: count2,
            lineoutAverage: count1 / count,
            loJumpsAverage: count3 / count,
            loStealsAverage: count4 / count,
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

exports.submitForm = async (req, res, next) => {

    /*var modal = new Player();
    modal.photo.data = fs.readFileSync(req.body.data.photo);
    modal.photo.contentType = 'image/png';
    modal.player = req.data.player;
    modal.save();*/

    const {data} = req.body;
    console.log('Form:', data);
    // console.log(typeof data.photo)
    const user = await Player.create(data);
    //  console.log('user Submit Form:', typeof user.photo );

    res.status(200).json({
        status: 'success',
        data: {
            message: "Form Submitted"
        },
        error: false
    });
};
exports.attckingTable = async (req, res, next) => {

    const result = await Stat.aggregate([
        {
            $match: {}
        }
    ])

};


/*
exports.updateUser = catchAsync(async (req, res, next) => {

    const user = await userService.updateUser(req.params.id, req.body);
    console.log('ngo is:', NGO);
    if (!user) {
        return next(new AppError(  `Can't find user with this ID `, 404));
    }
    res.status(204).json({
        status: 'success',
        data: {
            user
        },
        error: false
    });
});
exports.deleteUser = catchAsync(async (req, res, next) => {

    const user =await userService.deleteUser(req.params.id);
    if (!user) {
        return next(new AppError(  `Can't find user with this ID `, 404));
    }
    res.status(204).json({
        status: 'success',
        data: null,
        error: false
    });
});

exports.findAllUser = catchAsync(async (req, res, next) => {
    const users = await userService.findAllUser(req);
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        },
        error: false
    });

});

exports.getUserStats = catchAsync(async (req, res, next) => {

    const stats = await User.aggregate([
        {
            $match: {ratingsAverage: {$gte: 3}}
        },
        {
            $group: {
                // _id: null,   for all records
                _id: '$difficulty',
                numUsers: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                aveRating: {$avg: '$ratingsAverage'},
                avePrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
            }
        },
        {
            $sort: {avePrice: 1}
        },
        {
            $match: {
                _id: {$ne: 'EASY'}
            }
        }
    ]);


    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });

});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    try {
        const year = req.params.year * 1;
        const plan = await User.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStart: {$sum: 1},
                    tours: {$push: '$name'},

                }
            },
            {
                $addField: {
                    _id: {month: '$_id'}
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    numTourStart: -1
                }
            },
            {
                $limit: 12
            }
        ]);
        res.status(200).json({
            status: 'succes',
            plan
        });

    } catch (err) {
        console.log('Error is:', err);
    }
});
*/
