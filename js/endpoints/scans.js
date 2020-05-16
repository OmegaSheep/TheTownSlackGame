var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Scan = mongoose.model('Scan', SCHEMA.scanSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);

module.exports = function(req, res) {
  var GAME_ACTIVE = false;
  var user = req.body['user_name'];
  Player.update({name: '@'+user}, { $inc: { commandCount: 1 }}, {upsert: false}, function(err, doc){
    if(err){
     console.log(err);
    } else{
     console.log("Incremented command count for @"+user);
    }
  });

  var channel = req.body['channel_name'];
  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  }

  Game.findOne({}, 'active', function(e, res){
    GAME_ACTIVE = res['active'];
    return GAME_ACTIVE;
  }).then(function(cb){
    if (cb == false) {
      res.send("The game has not begun, no scans have been made.");
      return;
    }
  });

  Player.findOne({name:'@'+user}).exec(function (err, result) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    // Are they a player?
    if (result == null) {
      res.send("Only prophetic members of the town may use this.");
      return;
    }
    // Are they not someone who can scan?
    else if (["LICH","SEER","FOOL"].indexOf(result['role']) === -1) {
      res.send("You lack prophetic powers.");
      return;
    }
    // Success is HERE
    else {
      var scanData;
      var responsetext = "You recall what your powers have revealed thus far.\n\n```"
      Scan.find({'casterRole': result['role'],
                'casterName': '@'+user
      }).sort({'day': 1}).then(function(cb) {
        scanData = cb;
      }).then(function(cb) {
        if (scanData.length > 0) {
          for (var i = 0 ; i < scanData.length ; ++i) {
            responsetext += "Day "+scanData[i]["day"] + ": " + scanData[i]["targetName"] +  " ("+ scanData[i]['scanResult'] + ")";
            responsetext += "\n"
          }
          responsetext += "```";
          res.send(responsetext);
          return;
        } else {
          res.send("You have yet to scan anyone.");
          return;
        }
      });
    }
  });
}
