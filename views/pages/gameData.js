var mongoose = require('mongoose');
var SCHEMA = require('../../js/schema.js');
var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);

var playerData;
var lynchData;
var feastData;
var gameData;
var scanData;

var GAMETEXT = "";
Player.find({}, 'name role fakerole isDead usedAbility revealed protected marked target dayOfDeath causeOfDeath', {multi: true}).sort({isDead: 1, dayOfDeath: 1, revealed: 1}).exec(function(err, res){
  console.log("Obtained player data.");
  return res;
}).then(function(cb){
  playerData = cb;
  gd = Game.find({}, "days active", {multi: true}, function(err, res){
    console.log("Obtained game data."+res.length);
  });
  return gd;
}).then(function(cb){
  gameData = cb;
  console.log("Data assignment complete.");
}).then(function(cb) {
  for (var i in playerData) {
    // Show Name 
    GAMETEXT += playerData[i]["name"];

    // Show Death Status
    if (playerData[i]["isDead"] == false) {
      GAMETEXT += " ("+playerData[i]["causeOfDeath"]+")";
    } else {
      GAMETEXT += " ("+playerData[i]["causeOfDeath"]+" - DAY "+playerData[i]["dayOfDeath"]+")";
    }

    // Show Role Status

    // Revealed? Show em.
    if (playerData[i]["revealed"] == true) {
      GAMETEXT += " ("+playerData[i]["role"]+")";
    } 
    GAMETEXT += "\n";
  }
}).then(function(cb){
  var gameBox = document.getElementById('gameData');
  gameBox.innerHTML = GAMETEXT;
});