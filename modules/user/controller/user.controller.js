const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const Player = require('../models/user.model');
const Stat = require('../models/stats.model');
var fs = require('fs');
require('dotenv/config');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

//middleware
/*exports.aliasTopUsers = catchAsync(async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-email,password';
    req.query.fields = 'first_name,last_name,email';
    next();
});*/

exports.findUser = catchAsync(async (req, res, next) => {

    const name  = req.query.name.toLowerCase();
    console.log('name:', name);
     const user = await Player.findOne({player:name});
    if (!user) {
        return next(new AppError(  `Can't find user with this ID `, 404));
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
            $match: {player: {$ne: ""}}
        },
        {
            $project:{
                player: 1
            }
        },
        {
            $group:{
                _id: "$player",
                name: {$first: "$player"},
            }
        }
    ]);
   // console.log('users:', users);
    console.log(users);
    if (!users) {
        return next(new AppError(  `Can't find user with this ID `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            users
        },
        error: false
    });
});
exports.submitForm =  async(req,res,next )=>{

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
exports.attckingTable= async(req,res,next)=>{

    const result = await Stat.aggregate([
        {
            $match: {

            }
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
