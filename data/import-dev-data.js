var fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose');
const Stat = require('../modules/user/models/stats.model');
const moment = require('moment')
var xlsxtojson = require("xlsx-to-json");

//  DATABASE CONNECTION
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
const convertXlsToJSON = (callBack) => {

    xlsxtojson({
        input: `${__dirname}/stats.xlsx`,  // input xls
        output: "stats.json", // output json
        lowerCaseHeaders: true
    }, function (err, result) {
        if (err) {
            console.log('Error: ', err)
        } else {
            console.log('sucessfully converted to JSON')
            return callBack(result)
        }
    });
}


// READ JSON FILE
//const stats = JSON.parse(fs.readFileSync(`${__dirname}/stats.json`, 'utf-8'));

//IMPORT DATA INTO DATABASE
const importData = async (statss) => {

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


    console.log('stats.length: ', stats.length)

 /*   await Stat.insertMany(stats,{ordered: false})*/
    console.log('Data Successfully Loaded')
    process.exit(1);
};

// DELETE DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Stat.deleteMany();
        console.log('Data has been deleted Successfully');
        process.exit(1);
    } catch (err) {
        console.log('Error is:', err);
    }
}

if (process.argv[2] === '--import') {

    convertXlsToJSON((stats) => {
        importData(stats);
    })
} else if (process.argv[2] === '--delete') {
    deleteData();
}

// Command
//node data/import-dev-data.js --import
