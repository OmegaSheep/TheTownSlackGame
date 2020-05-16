var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var AutoJoin = mongoose.model('AutoJoin', SCHEMA.autoJoinSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);
var UTILITY = require('../utility.js');

module.exports = function(req, res) {
  var user = req.body['user_name'];
  var text = req.body['text'];
  if (!UTILITY.ADMIN_LIST.includes(user)) {
    res.send("Command not available.");
    return;
  }


  var playerData;
  var autoJoinData;
  var scanData;
  var adminIndex = false;
  var swapIndex = false;
  if (text == 'RESET') {
    Player.find({}, '_id slackid name role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner voteCount commandCount dayOfDeath causeOfDeath', {multi: true}).then(function(cb) {
      playerData = cb;
      return playerData;
    }).then(function(cb){
      console.log("Reset begins.");
      for (var i in playerData) {
        Player.update({_id:playerData[i]['_id']}, {$set: {
          name: playerData[i]['name'],
          slackid: playerData[i]['slackid'],
          role: "VILLAGER",
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
          dayOfDeath: 0,
          causeOfDeath: "ALIVE",
          voteCount: 0,
          commandCount: 0,
          loveSent: 0,
          loveReceived: 0,
          initialRole: "VILLAGER"
        }}, {upsert: false}).exec(function (err, result) {
          if (err) console.log(err);
        });
      }
    });
    res.send("Update done. Players reset.");
  } else if (text == 'AUTO') {
      AutoJoin.find({}, '_id slackid name join', {multi: true}).then(function(cb) {
        autoJoinData = cb;
        console.log("AUTO JOIN SIZE: "+autoJoinData.length);
        return autoJoinData;
      }).then(function(cb){
        for (var i in autoJoinData) {
          if (autoJoinData[i]['join'] == true) {
            
            Lynch.update({voter:autoJoinData[i]['name']}, {voter:autoJoinData[i]['name'], target:null}, {upsert:true}, function(e, doccc){
              console.log("You made a lynched.")
            });

            console.log(autoJoinData[i]['name']+" joined the game.");
            var updater = {
      	        name: autoJoinData[i]['name'],
      	        slackid: autoJoinData[i]['slackid'],
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
      	    Player.findOneAndUpdate({name:autoJoinData[i]['name']}, updater, {upsert: true}).exec(function(err, doc){
      	      if (err) {
      	        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      	        return;
      	      }
      	      else {
      	        if (doc == null) {
      	          Player.update({name:autoJoinData[i]['name']}, updater, {upsert: true}, function(er, docc){
                  });
                  /*UTILITY.createIM(autoJoinData[i]['slackid']);
      	          signupMessage =  "<@"+autoJoinData[i]['slackid']+"> Thank you for signing up for <#"+process.env.CHANNEL_ID+">!\n\n";
      	          signupMessage += "Info About Roles: still-garden-25830.herokuapp.com\n";
      	          signupMessage += "Info About Maps: still-garden-25830.herokuapp.com/maps\n";
      	          signupMessage += "Use `/townveto #` to veto a map based on its number.\n\n";
      	          signupMessage += "If you have any other questions please ping Admin for more information.\n\n";
      	          UTILITY.sendPrivateMessage(signupMessage, autoJoinData[i]['slackid']);*/
      	          console.log("You have joined the town. Try vetoing a map with `/townveto #`.");
      	        } else {
      	          console.log("You have already joined the town.");
      	        }
      	      }
              return autoJoinData[i]['name'];
      	    });
          }
        }
      });
      res.send("Auto signed up players.");
  } else {
    res.send("Command of "+text+" not recognized.");
  }
}
