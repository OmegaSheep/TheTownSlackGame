var mongoose = require('mongoose');
var SCHEMA = require('../schema.js');
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var UTILITY = require('../utility.js');

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
    if (channel != UTILITY.ACTIVE_CHANNEL) {
      res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
      return;
    }
    res.send("Sending bug post. . . ");
    UTILITY.bugpost('@bugpost: '+text);
}
