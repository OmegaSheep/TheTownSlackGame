var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var DISTRIBUTION = require('../distribution.js');

var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);

module.exports = function(req, res) {
  var user = req.body['user_name'];
  var channel = req.body['channel_name'];
  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  }

  /* May need to refactor this initial statement */
  var playerData;
  var gameData;
  Player.find({}, 'name role causeOfDeath isDead revealed', {multi: true}).exec(function(err, res){
    console.log("Obtained player data.");
    return res;
  }).then(function(cb){
    playerData = cb;
    gd = Game.find({}, "distribution active previous", {multi: true}, function(err, res){
      console.log("Obtained game data."+res.length);
    });
    return gd;
  }).then(function(cb){
    gameData = cb;
    console.log("Data assignment complete.");
  }).then(function(cb){
    if (gameData[0]['active'] == false) {
      res.send("The game is not currently active, the map has not been selected.");
      return;
    } else if (gameData[0]['distribution'] == "THE FINALE") {
      res.send("*THE FINALE*\n```???```");
      return;
    } else {
      var roleMap = {};

      var responseText = "*"+gameData[0]['distribution']+"*\n```";
      var roleArray = DISTRIBUTION.get(gameData[0]['distribution']);
      var plen = playerData.length;
      var rlen = roleArray.length;

      for (var i=0; i < (plen - rlen); ++i) {
        roleArray.push("VILLAGER");
      }

      for (var i in roleArray) {
        roleMap[roleArray[i]] = roleMap[roleArray[i]] || 0;
        roleMap[roleArray[i]] += 1;
      }

      // Convert Map to List
      var sortable = [];
      for (var i in roleMap) {
        sortable.push([i, roleMap[i]]);
      }

      // Sort that list
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });

      // Finally post the sortable amounts
      for (var i in sortable) {
        responseText += sortable[i][0] + " (x" + sortable[i][1] + ")";
        if (i < sortable.length - 1) {
          responseText += '\n';
        }
      }
      responseText += "```";
      res.send(responseText);
    }
  });
}
