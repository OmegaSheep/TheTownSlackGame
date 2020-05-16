var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var MapStat = mongoose.model('MapStat', SCHEMA.mapStatSchema);

module.exports = function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  Player.update({name: '@'+user}, { $inc: { commandCount: 1 }}, {upsert: false}, function(err, doc){
    if(err){
     console.log(err);
    } else{
     console.log("Incremented command count for @"+user);
    }
  });
  var channel = req.body['channel_name'];
  var winmap = {};
  winmap[false] = "LOST";
  winmap[true] = "WON";

  if (text == null || text.replace(/\s/g, '').length < 1) {
    res.send("Please specify a season #.");
    return;
  }

  var responseText = "";
  MapStat.find({season: parseInt(text)},['name', 'season', 'result', 'duration'],{
    sort:{
        season: 1 //Sort by Date Added DESC
    }
  }).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      if (result.length > 0) {
        Stat.find({season: parseInt(text)},['season','role','initialRole', 'winner','name', 'dayOfDeath', 'causeOfDeath', 'target', 'mail', 'bound'],{
          sort:{
              dayOfDeath: 1 //Sort by Date Added DESC
          }
        }).exec(function (err, result2) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            if (result2.length > 0) {
              responseText += "*SEASON "+text+": "+result[0]['name']+"*\n```";
              if (result[0]['duration'] > 1) {
                responseText += "Duration: "+result[0]['duration']+" Days\n";
              } else {
                responseText += "Duration: "+result[0]['duration']+" Day\n";
              }
              responseText += "Result: "+result[0]['result']+"```\n```";
              for (var i in result2) {
                deathString = result2[i]["causeOfDeath"] === undefined ? "" : result2[i]["causeOfDeath"];
                deathString += result2[i]["dayOfDeath"] === undefined || result2[i]["dayOfDeath"] == 0 ? "" : " on Day "+result2[i]["dayOfDeath"];
                if (deathString != "") { deathString = " ("+deathString+")"; }

                if (result2[i]['initialRole'] == result2[i]['role']) {
                  responseText += result2[i]["name"]+" ".repeat(20-result2[i]["name"].length);
                  roleString = " ("+result2[i]['role']+")";
                  responseText += roleString + " ".repeat(23-roleString.length);
                  responseText += deathString+" ("+winmap[result2[i]["winner"]]+")";
                  if (result2[i]['target']) {
                    responseText += ' [TARGET]';
                  }
                  if (result2[i]['bound']) {
                    responseText += ' [BOUND]';
                  }
                  /*if (result2[i]['target']) {
                    responseText += ' [RECEIVED MAIL]';
                  }*/
                  responseText += '\n';
                } else {
                  responseText += result2[i]["name"]+" ".repeat(20-result2[i]["name"].length);
                  roleString = " ("+result2[i]['initialRole']+" -> "+result2[i]['role']+")";
                  responseText += roleString + " ".repeat(23-roleString.length);
                  responseText += deathString+" ("+winmap[result2[i]["winner"]]+")";
                  if (result2[i]['target']) {
                    responseText += ' [TARGET]';
                  }
                  if (result2[i]['bound']) {
                    responseText += ' [BOUND]';
                  }
                  /*if (result2[i]['target']) {
                    responseText += ' [RECEIVED MAIL]';
                  }*/
                  responseText += '\n';
                }
              }
              responseText += "```";
              res.send(responseText);
              return;
            } else {
              res.send("No stats could be retrieved.");
              return;
            }
        });
      } else {
        res.send("No stats could be retrieved.");
        return;
      }
  });
}
