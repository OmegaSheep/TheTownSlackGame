var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);

var ROLE_LIST = ['VILLAGER', 'SEER', 'CELESTIAL','BEHOLDER', 'FOOL', 'PALADIN', 'HUNTER', 'MAYOR', 'CURSED', 'JESTER', 'MASON', 'CRYPTKEEPER', 'APPRENTICE', 'EXECUTIONER', 'GHOUL', 'LICH', 'SHADE', 'HELLION', 'IMP', 'ZOMBIE', 'SPECTRE', 'ASSASSIN', 'TECHIE', 'MANTIS', 'COURIER', 'DUELIST', 'ARCHDEMON', 'HAZMAT', 'DRUNK', 'BONEWHEEL'];

module.exports = function(req, res) {
  var text = req.body['text'];
  var textUpper = text.toUpperCase();
  var user = req.body['user_name'];
  Player.update({name: '@'+user}, { $inc: { commandCount: 1 }}, {upsert: false}, function(err, doc){
    if(err){
     console.log(err);
    } else{
     console.log("Incremented command count for @"+user);
    }
  });
  var channel = req.body['channel_name'];
  var responsetext = "Here are the requested stats:\n\n```"
  var winmap = {};
  winmap[false] = "LOST";
  winmap[true] = "WON";

  // If nobody is searched, tell them their own stats.
  var responsetext;
  if (text == null || text.replace(/\s/g, '').length < 1) {
    text = '@'+user;
    responsetext = "Here are your stats:\n\n```"
  } else {
    responsetext = "Here are the stats of "+text+":\n\n```"
  }

  console.log('DEBUG: text-'+text);
  if (ROLE_LIST.includes(textUpper)) {
    Stat.find({initialRole:textUpper},['name', 'season','role','winner','dayOfDeath','causeOfDeath', 'initialRole'],{
      sort:{
          season: 1 //Sort by Date Added DESC
      }
    }).exec(function (err, result) {
        if (err) {
          res.send("The Narrator pauses. He appears to have run into a problem: "+err);
          return;
        }
        if (result.length > 0) {
          console.log('DEBUG: '+result);
          for (var i = 0 ; i < result.length ; ++i) {
            deathString = result[i]["causeOfDeath"] === undefined ? "" : result[i]["causeOfDeath"];
            deathString += result[i]["dayOfDeath"] === undefined || result[i]["dayOfDeath"] == 0 ? "" : " on Day "+result[i]["dayOfDeath"];
            if (deathString != "") { deathString = " ("+deathString+")"; }

            if (result[i]['initialRole'] == result[i]['role']) {
              responsetext += 'SEASON '+result[i]["season"] + ": "+result[i]["name"]+deathString+" ("+winmap[result[i]["winner"]]+")\n";
            } else {
              responsetext += 'SEASON '+result[i]["season"] + ": "+result[i]["name"]+deathString+" ("+winmap[result[i]["winner"]]+") ["+result[i]['initialRole']+' -> '+result[i]['role']+"]\n";
            }
          }
          responsetext += "```";
          res.send(responsetext);
          return;
        } else {
          console.log('DEBUG: '+result);
          res.send("It seems this role has not been played in #the-town yet.");
          return;
        }
    });
  } else {
    Stat.find({name:text},['season','role','winner','dayOfDeath','causeOfDeath', 'initialRole'],{
      sort:{
          season: 1 //Sort by Date Added DESC
      }
    }).exec(function (err, result) {
        if (err) {
          res.send("The Narrator pauses. He appears to have run into a problem: "+err);
          return;
        }
        if (result.length > 0) {
          console.log('DEBUG: '+result);
          for (var i = 0 ; i < result.length ; ++i) {
            deathString = result[i]["causeOfDeath"] === undefined ? "" : result[i]["causeOfDeath"];
            deathString += result[i]["dayOfDeath"] === undefined || result[i]["dayOfDeath"] == 0 ? "" : " on Day "+result[i]["dayOfDeath"];
            if (deathString != "") { deathString = " ("+deathString+")"; }
            if (result[i]['initialRole'] == result[i]['role']) {
              responsetext += 'SEASON '+result[i]["season"] + ": "+result[i]["initialRole"]+deathString+" ("+winmap[result[i]["winner"]]+")\n";
            } else {
              responsetext += 'SEASON '+result[i]["season"] + ": "+result[i]["initialRole"]+" -> "+result[i]["role"]+deathString+" ("+winmap[result[i]["winner"]]+")\n";
            }
          }
          responsetext += "```";
          res.send(responsetext);
          return;
        } else {
          console.log('DEBUG: '+result);
          res.send("It seems this person has not participated in #the-town before.");
          return;
        }
    });
  }

}
