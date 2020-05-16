var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);
var AutoJoin = mongoose.model('AutoJoin', SCHEMA.autoJoinSchema);

module.exports = function(req, res) {
  var user = req.body['user_name'];
  var slackid = req.body['user_id'];
  var channel = req.body['channel_name'];

  AutoJoin.findOne({name:'@'+user}).exec(function (err, doc) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    else {
	    var updater1 = {
	        name: '@'+user,
	        slackid: slackid,
          join: true
	    };
	    var updater2 = {
	        name: '@'+user,
	        slackid: slackid,
          join: false
	    };
      if (doc == null) {
        AutoJoin.create({
	        name: '@'+user,
	        slackid: slackid,
          join: true
        }, function(e, doccc){
          console.log("\n\n\nAuto Join created.\n\n\n"+e);
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"text":"I have added you to the Auto Sign Up List. Use this command again to toggle it on and off.", "response_type":"in_channel"}));
        return;
      } else {
        if(doc['join']==true) {
          AutoJoin.update({name:'@'+user}, updater2, {upsert: false}, function(er, docc){});
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"text":"You have disabled auto-signup. You may re-enable it with this command.", "response_type":"in_channel"}));
          return;
        } else {
          AutoJoin.update({name:'@'+user}, updater1, {upsert: false}, function(er, docc){});
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"text":"You have re-enabled auto-signup. You may disable it with this command.", "response_type":"in_channel"}));
          return;
        }
        return;
      }
    }
  });
}
