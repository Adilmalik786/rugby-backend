const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose');
const Stat = require('../modules/user/models/stats.model');
const ScoreModel = require('../modules/user/models/score');
const moment = require('moment')
var xlsxtojson = require("xlsx-to-json");


const DB = process.env.DATABASE_CONNECTION.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successfull !');
});

// Convert xlsx file to JSON file format
const convertXlsToJSONStats = (callBack) => {

    xlsxtojson({
        input: `${__dirname}/stats.xlsx`,  // input xls
        output: "stats.json", // output json
        lowerCaseHeaders: true
    }, function (err, result) {
        if (err) {
          //  console.log('Error: ', err)
        } else {

            return callBack(result)
        }
    });
};
const convertXlsToJSONScore = (callBack) => {

    xlsxtojson({
        input: `${__dirname}/summary.xlsx`,  // input xls
        output: "summary.json", // output json
        lowerCaseHeaders: true
    }, function (err, result) {
        if (err) {
          //  console.log('Error: ', err)
        } else {
         //   console.log('sucessfully converted to JSON')
            return callBack(result)
        }
    });
};

const importDataStats = async (statss) => {

    const stats = statss.map((stat) => {
        return {
            eventName: stat['Event Name'],
            fx_ID: stat['FXID'],
            player: stat['Player'],
            shirt_NO: stat['ShirtNo'],
            playerName: stat['PLFORN']+ ' ' + stat['PLSURN'],
            teamName: stat['TEAMNAME'],
            mins: stat['MINS'],
            left_right_fx_ID: stat['Left_Right_FXID'],
            actionRow: stat['ActionRow'],
            ID: stat['ID'],
            fx_ID_2: stat['FXID2'],
            right_PLID: stat['Right_PLID'],
            right_team_ID: stat['Right_team_id'],
            ps_timestamp: stat['ps_timestamp'],
            ps_endstamp: stat['ps_endstamp'],
            MatchTime: stat['MatchTime'],
            psID: stat['psID'],
            period: stat['period'],
            x_coord: stat['x_coord'],
            y_coord: stat['y_coord'],
            x_coord_end: stat['x_coord_end'],
            y_coord_end: stat['y_coord_end'],
            right_action: stat['Right_action'],
            metres: stat['Metres'],
            play_num: stat['PlayNum'],
            set_num: stat['SetNum'],
            sequence_id: stat['sequence_id'],
            player_advantage: stat['player_advantage'],
            score_advantage: stat['score_advantage'],
            flag: stat['flag'] === 'true',
            advantage: stat['advantage'],
            assoc_player: stat['assoc_player'],
            Right_Right_FXID: stat['Right_Right_FXID'],
            Data: stat['Data'],
            FxDate: moment(stat['FxDate'], "DD/MM/YYYY").year(),
            FxWeek: stat['FxWeek'],
            FxHTID: stat['FxHTID'],
            hometeam: stat['hometeam'],
            FxATID: stat['FxATID'],
            awayteam: stat['awayteam'],
            HTFTSC: stat['HTFTSC'],
            ATFTSC: stat['ATFTSC'],
            REFNAME: stat['REFNAME'],
            Competition_Name: stat['Competition Name'],
            action_type: stat['ActionType'],
            qualifier_3: stat['qualifier3'],
            action_result: stat['Actionresult'],
            qualifier_4: stat['qualifier4'],
            qualifier_5: stat['qualifier5'],
            team_id: stat['team_id'],
            Team: stat['Team'],
        };

    })

    let toInsert = [];
    for (let i = 0; i < stats.length; i++) {
        toInsert.push(stats[i]);
        const isLastItem = i === stats.length - 1;
        // every 100 items, insert into the database
        if (i % 10000 === 0 || isLastItem) {
            await Stat.insertMany(toInsert);
            toInsert = [];
        }
    }
};
const importDataStatsScore = async (statss) => {

    const stats = statss.map((score) => {
        return {
            rank: score['Rank'] === '#N/A' ? 0 : score['Rank'],
            position_rank: score['Position Rank'] === '#N/A' ? 0 : score['Position Rank'],
            playerName: score['Name'],
            position: score['Position'] ,
            score: score['Score'] === '#N/A' ? 0 : score['Score'],
            year: score['Year'],
        };
    })

    let toInsert = [];
    for (let i = 0; i < stats.length; i++) {
        toInsert.push(stats[i]);
        const isLastItem = i === stats.length - 1;
        if (i % 10000 === 0 || isLastItem) {
            await ScoreModel.insertMany(toInsert);
            toInsert = [];
        }
    }

};

// DELETE DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Stat.deleteMany();
        await ScoreModel.deleteMany();
        console.log('Data has been deleted Successfully');
        process.exit(1);
    } catch (err) {
        console.log('Error is:', err);
    }
}

if (process.argv[2] === '--import') {

    convertXlsToJSONStats((stats) => {
        importDataStats(stats).then(()=>{
            convertXlsToJSONScore( (data)=>{
                importDataStatsScore(data).then(()=>{
                    process.exit(1);
                });
            });
        });
    });



} else if (process.argv[2] === '--delete') {
    deleteData();
}

// Command
//node data/import-dev-data.js --import
//node data/import-dev-data.js --delete
