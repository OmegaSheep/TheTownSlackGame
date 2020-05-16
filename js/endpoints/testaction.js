var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');

var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);
var Feast = mongoose.model('Feast', SCHEMA.feastSchema);

module.exports = function(req, res) {
  var GAME_ACTIVE = false;
  var user = req.body['user_name'];
  var channel = req.body['channel_name'];
  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  }
  if (!UTILITY.ADMIN_LIST.includes(user)) {
    res.send("Only admins can do this.");
    return;
  }

  var playerData;
  var lynchData;
  var feastData;
  var gameData;

  /* May need to refactor this initial statement */
  Player.find({isDead: false}, 'name role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected dayOfDeath causeOfDeath', {multi: true}).sort({isDead: 1, dayOfDeath: 1, revealed: 1}).exec(function(err, res){
    console.log("Obtained player data.");
    return res;
  }).then(function(cb){
    playerData = cb;
    ld = Lynch.find({}, "voter target", {multi: true}, function(err, res){
      console.log("Obtained lynch data."+res.length);
    });
    return ld;
  }).then(function(cb){
    lynchData = cb;
    fd = Feast.find({}, "ghoul victim", {multi: true}, function(err, res){
      console.log("Obtained feast data."+res.length);
    });
    return fd;
  }).then(function(cb){
    feastData = cb;
    gd = Game.find({}, "days active distribution previous", {multi: true}, function(err, res){
      console.log("Obtained game data."+res.length);
    });
    return gd;
  }).then(function(cb){
    gameData = cb;
    console.log("Data assignment complete.");
  }).then(function(cb){

    // Pre-variables
    var hunterAlive = false;
    var paladinAlive = false;
    var hazmatAlive = false;
    var archdemonAlive = false;
    var somebodyBound = false;
    var courierAlive = false;

    // Make feasts if they don't exist.
    if (feastData.length <= 0) {
      for (var i in playerData) {
        if (UTILITY.MONSTER_ROLES.includes(playerData[i]['role'])) {
          Feast.create({ ghoul: playerData[i]['name'], victim: null }, {upsert: true}, function (err, small) {
            if (err) return;
            // saved!
          }).then(function(cb){
            feastData = Feast.find({}, "ghoul victim", {multi: true}, function(err, res){
              console.log("Obtained feast data."+res.length);
            });
          });
        }
      }
    }

    // Pre-data!
    console.log("Began gathering phase.");
    for (var i in playerData) {

      randomIndex = i;
      while (randomIndex == i) {
        randomIndex = Math.floor(Math.random() * playerData.length);
      }
      for (var j in lynchData) {
        if (playerData[i]['name'] == lynchData[j]['voter']) {
          lynchData[j]['target'] = playerData[randomIndex]['name'];
        }
      }

      if (playerData[i]['role'] == 'HUNTER') {
        hunterAlive = true
      } else if (playerData[i]['role'] == 'PALADIN') {
        paladinAlive = true;
      } else if (playerData[i]['role'] == 'HAZMAT') {
        hazmatAlive = true;
      } else if (playerData[i]['role'] == 'ARCHDEMON') {
        archdemonAlive = true;
      } else if (playerData[i]['role'] == 'COURIER') {
        courierAlive = true;
      }

      if (playerData[i]['bound'] == true) {
        somebodyBound = true;
      }
    }
    console.log("Completed gathering phase.");

    // Everyone lynch someone random!
    console.log("Began lynch phase.");
    for (var i in playerData) {

      randomIndex = i;
      while (randomIndex == i) {
        randomIndex = Math.floor(Math.random() * playerData.length);
      }
      for (var j in lynchData) {
        if (playerData[i]['name'] == lynchData[j]['voter']) {
          lynchData[j]['target'] = playerData[randomIndex]['name'];
        }
      }
    }
    console.log("Completed lynch phase.");

    // Monsters eat someone random!
    console.log("Began feast phase.");
    var victimIndex = Math.floor(Math.random() * playerData.length);
    while (UTILITY.MONSTER_ROLES.includes(playerData[victimIndex]['role'])) {
      victimIndex = Math.floor(Math.random() * playerData.length);
    }
    for (var i in playerData) {
      if (UTILITY.MONSTER_ROLES.includes(playerData[i]['role'])) {
        for (var j in feastData) {
          if (playerData[i]['name'] == feastData[j]['ghoul']) {
            feastData[j]['victim'] = playerData[victimIndex]['name'];
          }
        }
      }
    }
    console.log("Completed feast phase.");

    // Mark someone random!
    if (hunterAlive) {
      console.log("Began Hunter phase.");
      var markIndex = Math.floor(Math.random() * playerData.length);
      while (playerData[markIndex]['role'] == 'HUNTER') {
        markIndex = Math.floor(Math.random() * playerData.length);
      }
      for (var i in playerData) {
        if (i == markIndex) {
          playerData[i]['marked'] = true;
        } else {
          playerData[i]['marked'] = false;
        }
      }
      console.log("Completed Hunter phase.");
    }

    // Bless someone random!
    if (paladinAlive) {
      console.log("Began Paladin phase.");
      var blessIndex = Math.floor(Math.random() * playerData.length);
      while (playerData[blessIndex]['role'] == 'PALADIN') {
        blessIndex = Math.floor(Math.random() * playerData.length);
      }
      for (var i in playerData) {
        if (i == blessIndex) {
          playerData[i]['protected'] = true;
        } else if (playerData[i]['role'] != 'PALADIN') {
          playerData[i]['protected'] = false;
        }
      }
      console.log("Completed Paladin phase.");
    }

    // Bind someone random once!
    if (archdemonAlive && !somebodyBound) {
      console.log("Began binding phase.");
      var boundIndex = Math.floor(Math.random() * playerData.length);
      while (UTILITY.MONSTER_ROLES.includes(playerData[boundIndex]['role'])) {
        boundIndex = Math.floor(Math.random() * playerData.length);
      }
      playerData[boundIndex]['bound'] = true;
      console.log("Completed binding phase.");
    }

    // Infect someone random!
    if (hazmatAlive) {
      console.log("Began Hazmat phase.");
      var infectIndex = Math.floor(Math.random() * playerData.length);
      for (var i in playerData) {
        if (i == infectIndex) {
          playerData[i]['infected'] = true;
        } else {
          playerData[i]['infected'] = false;
        }
      }
      console.log("Completed Hazmat phase.");
    }

    // Update players
    for (var i = 0; i < playerData.length; ++i) {
      Player.update({name:playerData[i]['name']}, {$set: {
        role: playerData[i]['role'],
        fakerole: playerData[i]['fakerole'],
        isDead: playerData[i]['isDead'],
        usedAbility: playerData[i]['usedAbility'],
        protected: playerData[i]['protected'],
        marked: playerData[i]['marked'],
        mail: playerData[i]['mail'],
        bound: playerData[i]['bound'],
        infected: playerData[i]['infected']
      }}, {upsert: false}).exec(function (err, result) {
        if (err) console.log(err);
      });
    }

    // Update lynches
    for (var i = 0; i < lynchData.length; ++i) {
      /* As a note; it does not matter if these are synchronous. */
      Lynch.update({voter:lynchData[i]['voter']}, {$set: {
        target: lynchData[i]['target']
      }}, {upsert: false}).exec(function (err, result) {
        if (err) console.log(err);
      });
    }

    // Update feasts
    for (var i = 0; i < feastData.length; ++i) {
      /* As a note; it does not matter if these are synchronous. */
      Feast.update({ghoul:feastData[i]['ghoul']}, {$set: {
        victim: feastData[i]['victim']
      }}, {upsert: false}).exec(function (err, result) {
        if (err) console.log(err);
      });
    }

    res.send('Test action done . . .');
  });
}
