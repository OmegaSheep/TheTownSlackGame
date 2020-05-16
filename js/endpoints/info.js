var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);
var Feast = mongoose.model('Feast', SCHEMA.feastSchema);
var Target = mongoose.model('Target', SCHEMA.targetSchema);
var Scan = mongoose.model('Scan', SCHEMA.scanSchema);

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

  var userRole;
  var randomSeed = 0; // Used for Beholder
  var livingPlayer = false; // Used for living players
  var hasMail = false; // Does the player have mail?
  var userDayOfDeath = 0;
  var monsterRoles = UTILITY.MONSTER_ROLES;
  var scannerRoles = ["SEER", "LICH", "FOOL"];

  var foundUser = false;
  var responseText = "You summarize everything you know about the town.\n\n```"
  var playerData;
  var lynchData;
  var feastData;
  var gameData;
  var scanData;

  /* May need to refactor this initial statement */
  Player.find({}, 'name role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected dayOfDeath causeOfDeath', {multi: true}).sort({isDead: 1, dayOfDeath: 1, revealed: 1}).exec(function(err, res){
    console.log("Obtained player data.");
    return res;
  }).then(function(cb){
    playerData = cb;
    /* Make sure they are playing */
    for (var i in playerData) {
      if (playerData[i]["name"] == "@"+user) {
        userRole = playerData[i]["role"];
        userDayOfDeath = playerData[i]["dayOfDeath"];
        foundUser = true;
        if (playerData[i]["isDead"] == false) {
          livingPlayer = true;
        }
        if (playerData[i]["mail"] == true) {
          hasMail = true;
        }
        if (userRole == 'BEHOLDER') {
          randomSeed = playerData[i]['_id'].toString().substr(-1);
          if (["0","2","4","6","8","a","c","e"].includes(randomSeed)) {
            randomSeed = 1;
          } else {
            randomSeed = 2;
          }
        }
      }
    }

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
    sd = Scan.find({}, "casterName casterRole targetName scanResult day", {multi: true}).sort({day: 1}).exec(function(err, res){
      console.log("Obtained scan data."+res.length);
    });
    return sd;
  }).then(function(cb){
    scanData = cb;
    console.log("Data assignment complete.");
  }).then(function(cb){
    if (foundUser == false) {
      res.send("Only town players may use this.");
      return;
    }
    for (var i in playerData) {
      /* Show Name */
      responseText += playerData[i]["name"];

      /* Show Death Status */
      if (playerData[i]["isDead"] == false) {
        responseText += " ("+playerData[i]["causeOfDeath"]+")";
      } else {
        responseText += " ("+playerData[i]["causeOfDeath"]+" - DAY "+playerData[i]["dayOfDeath"]+")";
      }

      /* Show Role Status */

      // Revealed? Show em.
      if (playerData[i]["revealed"] == true) {
        responseText += " ("+playerData[i]["role"]+")";
      // Is it yourself? Show em.
      } else if (playerData[i]["name"] == "@"+user && gameData[0]["active"] == true) {
        if (playerData[i]["role"] == "FOOL" && playerData[i]["isDead"] == false) {
          responseText += " (SEER)";
        } else if (playerData[i]["role"] == "MANTIS" && playerData[i]["isDead"] == false){
          responseText += " (VILLAGER)";
        } else {
          responseText += " ("+playerData[i]["role"]+")";
        }
      // Fellow monster? Show em.
      } else if (monsterRoles.includes(playerData[i]["role"]) && monsterRoles.includes(userRole)) {
        responseText += " ("+playerData[i]["role"]+")";
      // Living ghoul and person is eaten? Show em.
      } else if (userRole == "GHOUL" && livingPlayer == true && playerData[i]["causeOfDeath"] == "EATEN") {
        responseText += " ("+playerData[i]["role"]+")";
      // Dead ghoul and person eaten before they died? Show em.
      } else if (userRole == "GHOUL" && livingPlayer == false && playerData[i]["causeOfDeath"] == "EATEN" && playerData[i]["dayOfDeath"] < userDayOfDeath) {
        responseText += " ("+playerData[i]["role"]+")";
      // Living cryptkeeper and person is dead? Show em.
      } else if (userRole == "CRYPTKEEPER" && livingPlayer == true && playerData[i]["isDead"] == true) {
        responseText += " ("+playerData[i]["role"]+")";
      // Dead cryptkeeper and person died before they died? Show em.
      } else if (userRole == "CRYPTKEEPER" && livingPlayer == false && playerData[i]["isDead"] == true && playerData[i]["dayOfDeath"] < userDayOfDeath) {
        responseText += " ("+playerData[i]["role"]+")";
      // Beholder past day 4 and person is shade? Show em.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "SHADE" && gameData[0]["days"] >= 4) {
        responseText += " ("+playerData[i]["role"]+")";
      // Beholder past day 3 and person is seer? Show em.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "SEER" && gameData[0]["days"] >= 3) {
        responseText += " ("+playerData[i]["role"]+")";
      // Beholder past day 3 and person is fool? Show em.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "FOOL" && gameData[0]["days"] >= 3) {
        responseText += " ("+playerData[i]["role"]+")";
      // Beholder past day 2 and person is seer? Partially show em.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "SEER" && gameData[0]["days"] >= 2) {
        responseText += " (POSSIBLE SEER)";
      // Beholder past day 2 and person is fool? Partially show em.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "FOOL" && gameData[0]["days"] >= 2) {
        responseText += " (POSSIBLE SEER)";
      // Beholder and person is seer? Partial show if random check passes.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "SEER" && randomSeed == 2) {
        responseText += " (POSSIBLE SEER)";
      // Beholder and person is fool? Partial show if random check passes.
      } else if (userRole == "BEHOLDER" && playerData[i]["role"] == "FOOL" && randomSeed == 1) {
        responseText += " (POSSIBLE SEER)";
      // Hunter and person is shot? Show em.
      } else if (userRole == "HUNTER" && playerData[i]["causeOfDeath"] == "SHOT") {
        responseText += " ("+playerData[i]["role"]+")";
      // Paladin and person is purged? Show em.
      } else if (userRole == "PALADIN" && playerData[i]["causeOfDeath"] == "PURGED") {
        responseText += " ("+playerData[i]["role"]+")";
      // Assassin and person is assassinated? Show em.
      } else if (userRole == "ASSASSIN" && playerData[i]["causeOfDeath"] == "ASSASSINATED") {
        responseText += " ("+playerData[i]["role"]+")";
      // Hellion and person is incinerated? Show em.
      } else if (userRole == "HELLION" && playerData[i]["causeOfDeath"] == "INCINERATED") {
        responseText += " ("+playerData[i]["role"]+")";
      // Techie and person is detonated? Show em.
      } else if (userRole == "TECHIE" && playerData[i]["causeOfDeath"] == "DETONATED") {
        responseText += " ("+playerData[i]["role"]+")";
      // Mantis and person is scuffled? Show em.
      } else if (userRole == "MANTIS" && playerData[i]["causeOfDeath"] == "SCUFFLED") {
        responseText += " ("+playerData[i]["role"]+")";
      // Show the MASON the other MASONS
      } else if (userRole == "MASON" && playerData[i]["role"] == "MASON") {
        responseText += " ("+playerData[i]["role"]+")";
      // Show the mail carriers the COURIER
      } else if (hasMail && playerData[i]["role"] == "COURIER") {
        responseText += " ("+playerData[i]["role"]+")";
      // Show Duelists other Duelists
      } else if (userRole == "DUELIST" && playerData[i]["role"] == "DUELIST") {
        responseText += " ("+playerData[i]["role"]+")";
      // Show Archdemon bound role.
      } else if (userRole == "ARCHDEMON" && playerData[i]["bound"] == true) {
        responseText += " ("+playerData[i]["role"]+")";
      // Show the HAZMAT people who die of INFECTION
      } else if (userRole == "HAZMAT" && playerData[i]["causeOfDeath"] == "INFECTION") {
        responseText += " ("+playerData[i]["role"]+")";
      }

      /* Bonus Information */

      // Mail / Courier sees mail.
      if ((userRole == "COURIER" || hasMail == true) && playerData[i]['mail'] == true) {
        responseText += " [RECEIVED MAIL]";
      }

      // Hazmat / See infected.
      if (userRole == "HAZMAT" && playerData[i]['infected'] == true) {
        responseText += " [INFECTED]";
      }

      // Duelist / Moxie Count
      if (userRole == "DUELIST" && playerData[i]['role'] == 'DUELIST') {
        responseText += " [MOXIE: "+Math.max(playerData[i]['moxie'], 0).toString()+"]";
      }

      // Archdemon sees bound
      if (userRole == "ARCHDEMON" && playerData[i]['bound'] == true) {
        responseText += " [SOUL-BOUND]";
      }

      // Paladin sees protected players.
      if (userRole == "PALADIN" && playerData[i]["protected"] == true) {
        responseText += " [BLESSED]";
      }
      // Assassin sees targeted players.
      else if (userRole == "ASSASSIN" && playerData[i]["target"] == true) {
        responseText += " [TARGET]";
      }
      // Masons can see if they are targets.
      else if (userRole == "MASON") {
        if (playerData[i]["target"] == true && playerData[i]["role"] == "MASON") {
          responseText += " [TARGET]";
        }
      }
      // Hunter sees marked players.
      else if (userRole == "HUNTER" && playerData[i]["marked"] == true) {
        responseText += " [MARKED]";
      }
      // Seer, Lich & Fool see past scans.
      else if (scannerRoles.includes(userRole)) {
        var scanText = "";
        for (var j in scanData) {
          if (scanData[j]["casterName"] == "@"+user && scanData[j]["targetName"] == playerData[i]["name"]) {
            scanText = " [DAY "+scanData[j]["day"]+" SCAN - "+scanData[j]["scanResult"]+"]";
          }
        }
        responseText += scanText;
      }

      /* Lynch Information */
      for (var j in lynchData) {
        if (lynchData[j]["voter"] == playerData[i]["name"] && lynchData[j]["target"] != null) {
          responseText += "\nVoting to Lynch: "+lynchData[j]["target"];
        }
      }

      /* Feast Information - Monsters only.*/
      if (monsterRoles.includes(userRole)) {
        for (var j in feastData) {
          if (feastData[j]["ghoul"] == playerData[i]["name"] && feastData[j]["victim"] != null) {
            responseText += "\nVoting to Feast: "+feastData[j]["victim"];
          }
        }
      }

      /* Last New Line for End of Loop */
      if (i < playerData.length - 1) {
        responseText += "\n\n";
      }
    }

    /* Vote TALLY */

    // Who the fuck is our mayor?
    mayorName = "";
    for (var i in playerData) {
      if (playerData[i]['role'] == 'MAYOR') {
        mayorName = playerData[i]['name'];
      }
    }
    var voteMap = {};
    for (var i in lynchData) {
      if (lynchData[i]["target"] != null) {
        voteMap[lynchData[i]["target"]] = voteMap[lynchData[i]["target"]] || 0;

        // Mayor counts as 2 votes.
        if (lynchData[i]['voter'] == mayorName) {
          voteMap[lynchData[i]["target"]] += 2;
        } else {
          voteMap[lynchData[i]["target"]] += 1;
        }
      }
    }

    // Convert Map to List
    var sortable = [];
    for (var i in voteMap) {
      sortable.push([i, voteMap[i]]);
    }

    // Sort that list
    sortable.sort(function(a, b) {
      return b[1] - a[1];
    });

    // If there are votes, add them.
    if (sortable.length > 0) {
      responseText += "\n\nVOTE TALLY: \n";
    }
    for (var i in sortable) {
      responseText += sortable[i][0] + ": " + sortable[i][1] + "\n";
    }
    responseText += "```";
    res.send(responseText);
    console.log("\n\n\n\nRESPONSE\n\n\n\n"+responseText);
    return;
  });
}
