var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);

module.exports = function(req, res) {
  var text = req.body['text'];
  text = text.toUpperCase();

  var user = req.body['user_name'];
  Player.update({name: '@'+user}, { $inc: { commandCount: 1 }}, {upsert: false}, function(err, doc){
    if(err){
     console.log(err);
    } else{
     console.log("Incremented command count for @"+user);
    }
  });
  var channel = req.body['channel_name'];

  var responseText = "Here are the leaderboards:\n\n```";
  var statMap = {};
  var successMap = {};
  var bestMap = {};

  Stat.find({},['season','role','winner','name','initialRole'],{
    sort:{
        name: 1 //Sort by Date Added DESC
    }
  }).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      if (result.length > 0) {
        if (text != 'ROLE') {
          for (var i = 0 ; i < result.length ; ++i) {
            statMap[result[i]["name"]] = statMap[result[i]["name"]] || {"win":0, "loss":0};
            successMap[result[i]["name"]] = successMap[result[i]["name"]] || {};

            if (result[i]["winner"] == true) {
              statMap[result[i]["name"]]["win"] = statMap[result[i]["name"]]["win"] || 0;
              statMap[result[i]["name"]]["win"] += 1;
              successMap[result[i]['name']][result[i]["initialRole"]] = successMap[result[i]['name']][result[i]["initialRole"]] || 0;
              successMap[result[i]['name']][result[i]["initialRole"]] += 1;
            } else {
              statMap[result[i]["name"]]["loss"] = statMap[result[i]["name"]]["loss"] || 0;
              statMap[result[i]["name"]]["loss"] += 1;
            }
          }

          // Convert Map to List
          var sortable = [];
          for (var i in statMap) {
            sortable.push([i, statMap[i]]);
          }

          /* Sort that list */
          sortable.sort(function(a, b) {
            return b[1]["win"] - a[1]["win"] || (a[1]["win"] + a[1]["loss"]) - (b[1]["win"] + b[1]["loss"]);
          });

          // Convert Second Map to List
          var sortable2 = [];
          for (var i in successMap) {
            sortable2.push([i, successMap[i]]);
          }

          console.log(sortable2);

          for (var i in sortable2) {
            if (Object.keys(sortable2[i][1]).length !== 0) {
              bestRole = Object.keys(sortable2[i][1]).reduce(function(a, b) { return sortable2[i][1][a] > sortable2[i][1][b] ? a : b});
              highestValue = sortable2[i][1][bestRole];
              counter = 1;
              for (var key in sortable2[i][1]) {
                if (!bestRole.includes(key) && sortable2[i][1][key] == highestValue) {
                  bestRole += " / " + key;
                  counter += 1;
                }
              }
              if (counter < 4) {
                bestMap[sortable2[i][0]] = bestRole;
              } else {
                bestMap[sortable2[i][0]] = "VARIOUS";
              }
            }
          }

        } else {
          for (var i = 0 ; i < result.length ; ++i) {
            statMap[result[i]["initialRole"]] = statMap[result[i]["initialRole"]] || {"win":0, "loss":0};
            successMap[result[i]["initialRole"]] = successMap[result[i]["initialRole"]] || {};

            if (result[i]["winner"] == true) {
              statMap[result[i]["initialRole"]]["win"] = statMap[result[i]["initialRole"]]["win"] || 0;
              statMap[result[i]["initialRole"]]["win"] += 1;
              successMap[result[i]['initialRole']][result[i]["name"]] = successMap[result[i]['initialRole']][result[i]["name"]] || 0;
              successMap[result[i]['initialRole']][result[i]["name"]] += 1;
            } else {
              statMap[result[i]["initialRole"]]["loss"] = statMap[result[i]["initialRole"]]["loss"] || 0;
              statMap[result[i]["initialRole"]]["loss"] += 1;
            }
          }

          // Convert Map to List
          var sortable = [];
          for (var i in statMap) {
            sortable.push([i, statMap[i]]);
          }

          /* Sort that list */
          sortable.sort(function(a, b) {
            return (b[1]["win"]/(b[1]["win"]+(b[1]["loss"]))) - (a[1]["win"]/(a[1]["win"]+(a[1]["loss"]))) || (b[1]["win"] + b[1]["loss"]) - (a[1]["win"] + a[1]["loss"]);
          });

          // Convert Second Map to List
          var sortable2 = [];
          for (var i in successMap) {
            sortable2.push([i, successMap[i]]);
          }

          console.log(sortable2);

          for (var i in sortable2) {
            if (Object.keys(sortable2[i][1]).length !== 0) {
              bestPerson = Object.keys(sortable2[i][1]).reduce(function(a, b) { return sortable2[i][1][a] > sortable2[i][1][b] ? a : b});
              highestValue = sortable2[i][1][bestPerson];
              counter = 1;
              for (var key in sortable2[i][1]) {
                if (!bestPerson.includes(key) && sortable2[i][1][key] == highestValue) {
                  bestPerson += " / " + key;
                  counter += 1;
                }
              }
              if (counter < 4) {
                bestMap[sortable2[i][0]] = bestPerson;
              } else {
                bestMap[sortable2[i][0]] = "@VARIOUS";
              }
            }
          }
        }

        for (var i in sortable) {
          total = sortable[i][1]["win"] + sortable[i][1]["loss"];
          percent = ((sortable[i][1]["win"] / total) * 100);
          if (percent == 100) {
            percent = percent.toFixed(1);
          } else if (percent < 10) {
            percent = percent.toFixed(3);
          } else {
            percent = percent.toFixed(2);
          }
          responseText += sortable[i][0] + ": " + " ".repeat(20-sortable[i][0].length) + " ".repeat(2-sortable[i][1]["win"].toString().length) + sortable[i][1]["win"] + "/" + total + " ".repeat(4-total.toString().length) + "("+percent+"%)";
          if (bestMap[sortable[i][0]]) {
            if (text == 'ROLE') {
              if (bestMap[sortable[i][0]].includes('/')) {
                responseText += " Best Players : "+bestMap[sortable[i][0]];
              } else {
                responseText += " Best Player  : "+bestMap[sortable[i][0]];
              }
            } else {
              if (bestMap[sortable[i][0]].includes('/')) {
                responseText += " Best Roles : "+bestMap[sortable[i][0]];
              } else {
                responseText += " Best Role  : "+bestMap[sortable[i][0]];
              }
            }
          }
          responseText += "\n"
        }
        responseText += "```";
        res.send(responseText);
        return;
      } else {
        res.send("No stats could be retrieved.");
        return;
      }
  });
}
