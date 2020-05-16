var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);

module.exports = function(req, res) {
  var GAME_ACTIVE = true;
  var user = req.body['user_name'];
  var slackid = req.body['user_id'];
  var channel = req.body['channel_name'];

  Game.findOne({}, 'active', function(e, res){
    GAME_ACTIVE = res['active'];
    return GAME_ACTIVE;
  }).then(function(cb){
    if (cb == true) {
      res.send("You can't sign up the game has begun already.");
      return;
    } else if (channel != UTILITY.ACTIVE_CHANNEL) {
	  res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
      return;
	} else {
	  var playerCount = 0;
	  Player.find().exec(function (err, results) {
	      if (err) {
	        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
	        return;
	      }
	      playerCount = results.length;
	      console.log("\n\nPLAYER COUNT: "+playerCount+"\n\n");
	  });
	  if (playerCount >= 16) {
	    res.send("The town has too many people in it. You will have to try again some other time.");
	    return;
	  }
	  else {
	    var updater = {
	        name: '@'+user,
	        slackid: slackid,
	        role: 'VILLAGER',
          initialRole: 'VILLAGER',
	        fakerole: null,
	        isDead: false,
	        usedAbility: false,
	        revealed: false,
	        protected: false,
	        marked: false,
	        target: false,
	        mail: false,
	        bound: false,
	        moxie: 4,
	        infected: false,
	        winner: false,
	        commandCount: 0,
	        voteCount: 0,
          loveSent: 0,
          loveReceived: 0,
	        dayOfDeath: 0,
	        causeOfDeath: "ALIVE"
	    };
	    Player.findOneAndUpdate({name:'@'+user}, updater, {upsert: true}, function (err, doc) {
	      if (err) {
	        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
	        return;
	      }
	      else {
	        if (doc == null) {
	          Player.update({name:'@'+user}, updater, {upsert: true}, function(er, docc){});
	          Lynch.create({voter:'@'+user, target:null}, function(e, doccc){});
            UTILITY.createIM(slackid);
	          signupMessage =  "<@"+slackid+"> Thank you for signing up for <#"+process.env.CHANNEL_ID+">!\n\n";
	          signupMessage += "Info About Roles: still-garden-25830.herokuapp.com\n";
	          signupMessage += "Info About Maps: still-garden-25830.herokuapp.com/maps\n";
	          signupMessage += "Use `/townveto #` to veto a map based on its number.\n\n";
	          signupMessage += "If you have any other questions please ping Admin for more information.\n\n";
	          UTILITY.sendPrivateMessage(signupMessage, slackid);

	          res.setHeader('Content-Type', 'application/json');
	          res.send(JSON.stringify({"text":"You have joined the town. Try vetoing a map with `/townveto #`.", "response_type":"in_channel"}));
	          return;
	        } else {
	          res.send("You have already joined the town.");
	          return;
	        }
	      }
	    });
	  }
	}
  });
}
