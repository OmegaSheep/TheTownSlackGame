var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var UTILITY = require('../utility.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);

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

  Game.findOne({}, 'active distribution previous', function(e, res){
    GAME_ACTIVE = res['active'];
  }).then(function(cb){
    if (GAME_ACTIVE == true) {
      res.send("Game has started, don't add test data now.");
      return;
    } else {
      res.send('Test data populating . . .');
      var dummy;
      for (var i = 0 ; i < 14 ; ++i) {
        var dummy = new Player({name: '@test'+i, slackid:"U00"+i, role: 'VILLAGER', fakerole: null, isDead : false, usedAbility : false, revealed: false, protected: false, marked: false, target: false, mail: false, bound: false, moxie: 4, infected: false, winner: false, commandCount: 0, voteCount: 0, dayOfDeath: 0, causeOfDeath: "ALIVE", initialRole: 'VILLAGER', loveSent: 0, loveReceived: 0});
        dummy.save({upsert: true}, function (err, item) {
          if (err) return console.error(err);
        });
        Lynch.create({voter:'@test'+i, target:null}, function(e, doccc){});
      }
    }
  });
}
