var mongoose = require('mongoose');

module.exports = {
  gameSchema : mongoose.Schema({
      active: {type: Boolean, required: true},
      days: {type: Number, required: true},
      distribution: {type: String, required: true},
      previous: {type: String, required: true},
      season: {type: Number, required: true}
  }),
  playerSchema : mongoose.Schema({
      name: {type: String, required: true},
      slackid: {type: String, required: true},
      role: {type: String, required: true},
      fakerole: {type: String, required: false},
      initialRole: {type: String, required: false},
      isDead: {type: Boolean, required: true},
      usedAbility: {type: Boolean, required: true},
      revealed: {type: Boolean, required: true},
      protected: {type: Boolean, required: true},
      marked: {type: Boolean, required: true},
      target: {type: Boolean, required: true},
      mail: {type: Boolean, required: true},
      bound: {type: Boolean, required: true},
      moxie: {type: Number, required: true},
      infected: {type: Boolean, required: true},
      winner: {type: Boolean, required: true},
      commandCount: {type: Number, required: true},
      voteCount: {type: Number, required: true},
      loveSent: {type: Number, required: false},
      loveReceived: {type: Number, required: false},
      dayOfDeath: {type: Number, required: true},
      causeOfDeath: {type: String, required: true}
  }),
  lynchSchema : mongoose.Schema({
      voter: {type: String, required: true},
      target: {type: String},
  }),
  feastSchema : mongoose.Schema({
      ghoul: {type: String, required: true},
      victim: {type: String},
  }),
  targetSchema : mongoose.Schema({
      name: {type: String, required: true}
  }),
  statSchema : mongoose.Schema({
      name: {type: String, required: true},
      role: {type: String, required: true},
      season: {type: Number, required: true},
      winner: {type: Boolean, required: true},
      dayOfDeath: {type: Number, required: false},
      causeOfDeath: {type: String, required: false},
      initialRole: {type: String, required: false},
      vetoVote: {type: String, required: false},
      commandCount: {type: Number, required: false},
      voteCount: {type: Number, required: false},
      loveSent: {type: Number, required: false},
      loveReceived: {type: Number, required: false},
      target: {type: Boolean, required: false},
      bound: {type: Boolean, required: false},
      mail: {type: Boolean, required: false}
  }),
  mapStatSchema : mongoose.Schema({
      name: {type: String, required: true},
      season: {type: Number, required: true},
      result: {type: String, required: true},
      duration: {type: Number, required: false}
  }),
  scanSchema : mongoose.Schema({
      casterName: {type: String, required: true},
      casterRole: {type: String, required: true},
      targetName: {type: String, required: true},
      scanResult: {type: String, required: true},
      day: {type: Number, required: true}
  }),
  vetoSchema : mongoose.Schema({
      voter: {type: String, required: true},
      mapNumber: {type: Number, required: true}
  }),
  autoJoinSchema : mongoose.Schema({
      name: {type: String, required: true},
      slackid: {type: String, required: true},
      join: {type: Boolean, required: true}
  })
}
