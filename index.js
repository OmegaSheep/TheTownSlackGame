/* NARRATOR BOT WOOOT */

// Global Block
var GAME_ACTIVE = false;
var MAXPLAYERS = 16;
var MINPLAYERS = 8;
var SEASON = 0;
var MAKE_STATS = true;
var SCHEDULER;

// Load data-based JS files
var TEXT_DATA = require('./js/textData.js');
var EMOJI_DATA = require('./js/emojiMap.js');
var SCHEMA = require('./js/schema.js');
var UTILITY = require('./js/utility.js');
var DISTRIBUTION = require('./js/distribution.js');

// Utility Data Loader
var MONSTER_ROLES = UTILITY.MONSTER_ROLES;

// Load rest API endpoints
var ANNOUNCE = require('./js/endpoints/announce.js');
var BUG = require('./js/endpoints/bug.js');
var HISTORY = require('./js/endpoints/history.js');
var LEADERBOARD = require('./js/endpoints/leaderboard.js');
var STATS = require('./js/endpoints/stats.js');
var TESTDATA = require('./js/endpoints/testdata.js');
var TESTACTION = require('./js/endpoints/testaction.js');
var SCANS = require('./js/endpoints/scans.js');
var INFO = require('./js/endpoints/info.js');
var SIGNUP = require('./js/endpoints/signup.js');
var MAPINFO = require('./js/endpoints/mapinfo.js');
var ADMIN = require('./js/endpoints/admin.js');
var AUTOJOIN_END = require('./js/endpoints/autoJoin.js');

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var moment = require("moment");
var schedule = require("node-schedule");
var dateTime = require('node-datetime');
const WebSocket = require('ws');

var app = express();

// These are all defined in a heroku environment variable.
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var mongouri = process.env.MONGOLAB_URI;
var db = mongoose.connect(mongouri);

var Game = mongoose.model('Game', SCHEMA.gameSchema);
var Player = mongoose.model('Player', SCHEMA.playerSchema);
var Lynch = mongoose.model('Lynch', SCHEMA.lynchSchema);
var Feast = mongoose.model('Feast', SCHEMA.feastSchema);
var Target = mongoose.model('Target', SCHEMA.targetSchema);
var Stat = mongoose.model('Stat', SCHEMA.statSchema);
var Scan = mongoose.model('Scan', SCHEMA.scanSchema);
var Veto = mongoose.model('Veto', SCHEMA.vetoSchema);
var MapStat = mongoose.model('MapStat', SCHEMA.mapStatSchema);

//Game.create({active: false, days: 1}, function(e, doccc){});
Game.findOne({}, 'active season distribution', function(e, res){
  GAME_ACTIVE = res['active'];
  SEASON = res['season'];
  console.log('GAME_ACTIVE = '+GAME_ACTIVE);
  if (GAME_ACTIVE) {
    console.log("Beginning game loop.");
    GAMELOOP();
  }
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Load home page.
app.get('/', function(request, response) {
  response.render('pages/rules');
});

// Load home page.
app.get('/maps', function(request, response) {
  response.render('pages/distribution');
});

app.get('/gamedata', function(request, response){
  var playerData;
  var gameData;

  var GAMETEXT = "";
  Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived dayOfDeath causeOfDeath', {multi: true}).sort({isDead: 1, dayOfDeath: 1, revealed: 1}).exec(function(err, res){
    console.log("Obtained player data.");
    return res;
  }).then(function(cb){
    playerData = cb;
    gd = Game.find({}, "days active distribution", {multi: true}, function(err, res){
      console.log("Obtained game data."+res.length);
    });
    return gd;
  }).then(function(cb){
    gameData = cb;
    console.log("Data assignment complete.");
    return true;
  }).then(function(cb) {
    if (gameData[0]['active']) {
      GAMETEXT += gameData[0]['distribution'] + "##" + gameData[0]['days'] + "##";
    } else {
      return GAMETEXT;
    }
    for (var i in playerData) {
      // Show Name
      GAMETEXT += playerData[i]["name"];

      // Show Death Status
      if (playerData[i]["isDead"] == false) {
        GAMETEXT += " ("+playerData[i]["causeOfDeath"]+")";
      } else {
        GAMETEXT += " ("+playerData[i]["causeOfDeath"]+" - DAY "+playerData[i]["dayOfDeath"]+")";
      }

      // Revealed? Show em.
      if (playerData[i]["revealed"] == true) {
        GAMETEXT += " ("+playerData[i]["role"]+")";
      }
      if (i < playerData.length - 1) {
        GAMETEXT += "##";
      }
    }
    return GAMETEXT;
  }).then(function(cb){
    response.json({
       message: GAMETEXT
    });
  });
});

app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...
        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: process.env.OAUTH, //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        })
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/* REAL TIME COMMENT MARKER */
var SOCKET_URL;
var WEB_SOCKET;

function openWebSocket() {
  console.log("Open Web Socket called.");

  request.post('https://slack.com/api/rtm.connect', {
    form:{token: process.env.BOT_TOKEN}
  },function(error, response, body){
    if (error) {
      console.log("Error: "+JSON.stringify(error));
    } else {
      console.log("Body: "+JSON.stringify(JSON.parse(body)));
      console.log("Connecting URL: "+JSON.parse(body)['url']);
    }
    SOCKET_URL = JSON.parse(body)['url'];

    WEB_SOCKET = new WebSocket(JSON.parse(body)['url']);

    WEB_SOCKET.on('open', function open() {
      console.log('SOCKET OPENED');
    });

    WEB_SOCKET.on('close', function close() {
      console.log('SOCKET CLOSED');
    });

    WEB_SOCKET.on('message', function incoming(data) {
      data = JSON.parse(data);
      //console.log("MESSAGE: \n"+JSON.stringify(data));
      console.log("Got a message of type: "+data['type']);
      /*
      if (data['type'] == "message") {
        if (data['channel'] == process.env.CHANNEL_ID && data['bot_id'] == process.env.BOT_ID) {
          UTILITY.sendEmoji(process.env.CHANNEL_ID, data['ts'], 'bigglesworth');
        }
      }*/
    });
  });
}

openWebSocket(); // Call this on server bootup.

// Send a typing notice before every night.
schedule.scheduleJob('55 59 22 * * 1-5', function(){
  if (GAME_ACTIVE) {
    WEB_SOCKET.send(
      JSON.stringify({id: 1,
        type: "typing",
        channel: process.env.CHANNEL_ID
      })
    );
  }
});

app.post('/testdata', TESTDATA);

app.post('/testaction', TESTACTION);

app.post('/commands', function(req, res) {
  var user = req.body['user_name'];
  Player.update({name: '@'+user}, { $inc: { commandCount: 1 }}, {upsert: false}, function(err, doc){
    if(err){
     console.log(err);
    } else{
     console.log("Incremented command count for @"+user);
    }
  });
  res.send(TEXT_DATA.commands);
});

app.post('/stats', STATS);

app.post('/history', HISTORY);

app.post('/leaderboard', LEADERBOARD);

app.post('/announce', ANNOUNCE);

app.post('/bug', BUG);

app.post('/scans', SCANS);

app.post('/info', INFO);

app.post('/signup', SIGNUP);

app.post('/mapinfo', MAPINFO);

app.post('/skip', function(req, res) {
  var user = req.body['user_name'];
  var text = req.body['text'];
  if (!UTILITY.ADMIN_LIST.includes(user)) {
    res.send("Command not available.");
    return;
  }
  SCHEDULER.reschedule('* * * * *', function(result){
    console.log("Rescheduled Result: "+result);
  });
  res.send("SKIP MODE ENABLED");
});

app.post('/admin', ADMIN);

app.post('/auto', AUTOJOIN_END);

app.post('/role', function(req, res) {
  var user = req.body['user_name'];
  var text = req.body['text'];
  text = text.toUpperCase();
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
  var exists = false;
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      if (result != null) {
        exists = true;
      }
  }).then(function(cb){
      console.log("Exists result: "+exists);
      if (!GAME_ACTIVE && (!text|| 0 === text.length)) {
        res.send("The game has not begun, so you have no role. However, you may use `/townrole rolename` to learn about a specific role.");
        return;
      }
      else if (!exists) {
        res.send("You do not appear to be part of this town.");
        return;
      }
      else {
        var role;
        var tellLies = true;
        Player.findOne({name:'@'+user}).exec(function (err, result) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            console.log("RESULTS: "+result);
            if (text == null || text.replace(/\s/g, '').length < 1) {
              role = result['role'];
            } else {
              role = text;
              tellLies = false;
            }
            dead = result['isDead'];
        }).then(function(cb){
            if (role == 'VILLAGER') {
              res.send(TEXT_DATA.villagerData);
            } else if (role == 'SEER') {
              res.send(TEXT_DATA.seerData);
            } else if (role == 'FOOL') {
              if (tellLies && !dead) {
                res.send(TEXT_DATA.seerData);
              } else {
                res.send(TEXT_DATA.foolData);
              }
            } else if (role == 'MANTIS') {
              if (tellLies && !dead) {
                res.send(TEXT_DATA.villagerData);
              } else {
                res.send(TEXT_DATA.mantisData);
              }
            } else if (role == 'GHOUL') {
              res.send(TEXT_DATA.ghoulData);
            } else if (role == 'LICH') {
              res.send(TEXT_DATA.lichData);
            } else if (role == 'HUNTER') {
              res.send(TEXT_DATA.hunterData);
            } else if (role == 'CURSED') {
              res.send(TEXT_DATA.cursedData);
            } else if (role == 'PALADIN') {
              res.send(TEXT_DATA.paladinData);
            } else if (role == 'BEHOLDER') {
              res.send(TEXT_DATA.beholderData);
            } else if (role == 'ASSASSIN') {
              res.send(TEXT_DATA.assassinData);
            } else if (role == 'SHADE') {
              res.send(TEXT_DATA.shadeData);
            } else if (role == 'HELLION') {
              res.send(TEXT_DATA.hellionData);
            } else if (role == 'IMP') {
              res.send(TEXT_DATA.impData);
            } else if (role == 'MASON') {
              res.send(TEXT_DATA.masonData);
            } else if (role == 'ZOMBIE') {
              res.send(TEXT_DATA.zombieData);
            } else if (role == 'CELESTIAL') {
              res.send(TEXT_DATA.celestialData);
            } else if (role == 'TECHIE') {
              res.send(TEXT_DATA.techieData);
            } else if (role == 'CRYPTKEEPER') {
              res.send(TEXT_DATA.cryptkeeperData);
            } else if (role == 'APPRENTICE') {
              res.send(TEXT_DATA.apprenticeData);
            } else if (role == 'MAYOR') {
              res.send(TEXT_DATA.mayorData);
            } else if (role == 'EXECUTIONER') {
              res.send(TEXT_DATA.executionerData);
            } else if (role == 'SPECTRE') {
              res.send(TEXT_DATA.spectreData);
            } else if (role == 'JESTER') {
              res.send(TEXT_DATA.jesterData);
            } else if (role == 'COURIER') {
              res.send(TEXT_DATA.courierData);
            } else if (role == 'DUELIST') {
              res.send(TEXT_DATA.duelistData);
            } else if (role == 'ARCHDEMON') {
              res.send(TEXT_DATA.archdemonData);
            } else if (role == 'HAZMAT') {
              res.send(TEXT_DATA.hazmatData);
            } else if (role == 'DRUNK') {
              res.send(TEXT_DATA.drunkData);
            } else if (role == 'BONEWHEEL') {
              res.send(TEXT_DATA.bonewheelData);
            } else {
              res.send("No matching role was found.");
            }
            return;
        });
      }
  });
});

app.post('/votes', function(req, res) {
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

  var responsetext = "You open the official town lynching document and begin reading votes.\n\n```"
  var mayorName = "";
  Player.find({isDead: false}, 'name isDead role', {multi: true}, function(err){
    console.log("Obtained player data.");
  }).then(function(cb){

    var livingVoters = [];
    for (var i = 0; i < cb.length ; ++i) {
      livingVoters.push(cb[i]['name']);
      if (cb[i]['role'] == 'MAYOR') {
        mayorName = cb[i]['name'];
      }
    }
    Lynch.find({
      'voter': { $in: livingVoters }
    }).sort({target: -1}).exec(function (err, result) {
        if (err) {
          res.send("The Narrator pauses. He appears to have run into a problem: "+err);
          return;
        }
        if (result.length > 0) {
          for (var i = 0 ; i < result.length ; ++i) {
            // Fails because death is not stored in the database as a lookup.
            if (result[i]["target"] != null && result[i]['isDead'] != true) {
              responsetext += result[i]["voter"] + " voted to lynch "+result[i]["target"]+".";
              if (result[i]["voter"] == mayorName) {
                responsetext += " (x2)"
              }
              responsetext += "\n";
            } else if (result[i]['isDead'] != true) {
              responsetext += result[i]["voter"] + " voted to lynch nobody.\n";
            }
          }
          responsetext += "```";
          res.send(responsetext);
          return;
        } else {
          res.send("There are currently no active lynch votes.");
          return;
        }
    });
  });
});

app.post('/monsters', function(req, res) {
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
  } else if (!GAME_ACTIVE) {
    res.send("The game has not begun, there are no monsters yet.");
    return;
  }
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("Only fiendish members of the town may search for their kin.");
        return;
      }
      // Are they not a monster?
      else if (MONSTER_ROLES.indexOf(result['role']) === -1) {
        res.send("As a regular person your ability to sense monsters is. . . limited.");
        return;
      }
      // Success is HERE
      else {
        var playerData;
        var feastData;
        var responsetext = "You skulk around and sense the presence of other monsters.\n\n```"
        var deadmap = {};
        deadmap[false] = "ALIVE";
        deadmap[true] = "DEAD";
        Player.find({'role': { $in: MONSTER_ROLES}}).then(function(cb) {
          playerData = cb;
          td = Feast.find({},'ghoul victim', { multi: true}, function(err){
            console.log("Obtained feast data.");
          });
          return td;
        }).then(function(cb) {
          feastData = cb;
        }).then(function(cb) {
          if (playerData.length > 0) {
            for (var i = 0 ; i < playerData.length ; ++i) {
              responsetext += playerData[i]["name"] + " (" + playerData[i]["role"] +  ") ("+deadmap[playerData[i]["isDead"]] + ")";
              for (var j = 0 ; j < feastData.length ; ++j) {
                if (playerData[i]["name"] == feastData[j]["ghoul"] && playerData[i]['isDead'] == false) {
                  victimtext = feastData[j]['victim'] == null ? 'Nobody' : feastData[j]['victim'];
                  responsetext += " (Feast Vote: " + victimtext + ")";
                }
              }
              responsetext += "\n"
            }
            responsetext += "```";
            res.send(responsetext);
            return;
          } else {
            res.send("It seems you cannot detect any fiendish creatures right now. How... odd...");
            return;
          }
        });
      }
  });
});

function townMark(user, text, res) {
  // Search for who to mark.
  Player.findOne({name:text}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Does the target exist?
      if (result == null) {
        res.send("You cannot seem to find your target.");
        return;
      // Are they marking someone who is dead?
      }
      else if (result['isDead'] == true) {
        res.send("You cannnot kill what is already dead.");
        return;
      // Successful marking HERE
      }
      else {
        // CLEAR ALL MARKS.
        Player.update({}, {$set: { marked: false }}, {multi: true, upsert: false}).exec(function (err, rezult) {
          if (err) {
            console.log(err);
            return;
          }

          // MARK SOMEONE
          Player.update({name:text}, {$set: { marked: true }}, {upsert: false}).exec(function (err, rezult) {
            if (err) {
              console.log(err);
              return;
            }
            res.send("You set your sights, and mark "+result['name']+" for death.");
            return;
          });

          // Do the infection transfer!
          if (result['infected'] == true) {
            var playerData;
            Player.find({}, 'name infected', {multi: true}, function(err){
              console.log("Obtained player data for mark-infection transfer.");
            }).then(function(cb){
              playerData = cb;

              // coin flip
              var coinFlip = Math.round(Math.random());
              if (coinFlip == 0) {
                UTILITY.randomInfection(playerData);
              } else {
                UTILITY.targetInfection('@'+user, playerData);
              }

              // update the infections
              for (var i = 0; i < playerData.length; ++i) {
                Player.update({name:playerData[i]['name']}, {$set: {
                  infected: playerData[i]['infected']
                }}, {upsert: false}).exec(function (err, result) {
                  if (err) console.log(err);
                });
              }
              return;
            });
          }
        });
      }
  });
}

function townBless(user, text, res) {
  // Search for who to bless.
  Player.findOne({name:text}).exec(function (err, result) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    // Does the target exist?
    if (result == null) {
      res.send("You focus your powers but cannot find who you are looking for.");
      return;
    // Are they protecting someone who is dead?
    }
    else if (result['isDead'] == true) {
      res.send("No sense in blessing the dead.");
      return;
    // Successful protect HERE
    }
    else {
      // clear all protective blessings on other people
      Player.update({role: { $ne: "PALADIN" }}, {$set: { protected: false }}, {multi: true, upsert: false}).exec(function (err, rexult) {
        if (err) {
          console.log(err);
          return;
        }
        // PROTECT THAT PERSON.
        Player.update({name:text}, {$set: { protected: true }}, {upsert: false}).exec(function (err, rezult) {
          if (err) {
            console.log(err);
            return;
          }
          res.send("Focusing your gift, you provide a protective blessing to "+result['name']+"!");
          return;
        });

        // Do the infection transfer!
        if (result['infected'] == true) {
          var playerData;
          Player.find({}, 'name infected', {multi: true}, function(err){
            console.log("Obtained player data for bless-infection transfer.");
          }).then(function(cb){
            playerData = cb;

            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
            return;
          });
        }
      });
    }
  });
}

function townMail(user, text, res) {
  // Search for who to mail.
  Player.findOne({name:text}).exec(function (err, result) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    // Does the target exist?
    if (result == null) {
      res.send("You cannot seem to find your target.");
      return;
    // Are they marking someone who is dead?
    }
    else if (result['isDead'] == true) {
      res.send("You cannnot mail the dead.");
      return;
    // Cannot mail already mailed folks.
    }
    else if (result['mail'] == true) {
      res.send("You already sent them mail.");
      return;
    // Successful mail HERE
    }
    else {
      // MAIL SOMEONE
      Player.update({name:'@'+user}, {$set: { usedAbility: true }}, {upsert: false}).exec(function (err, rezult) {
        if (err) {
          console.log(err);
          return;
        }
        Player.update({name:text}, {$set: { mail: true }}, {upsert: false}).exec(function (err, rezult) {
          if (err) {
            console.log(err);
            return;
          }
          UTILITY.sendPrivateMessage("Hello <@"+result["slackid"]+">! The Courier has sent you mail in <#"+process.env.CHANNEL_ID+">. Use `/towninfo` to learn their identity and more!", result["slackid"]);
          res.send("You secretly deliver mail to "+result['name']+" detailing your identity and who else has been mailed.");
          return;
        });

        // Do the infection transfer!
        if (result['infected'] == true) {
          var playerData;
          Player.find({}, 'name infected', {multi: true}, function(err){
            console.log("Obtained player data for mail-infection transfer.");
          }).then(function(cb){
            playerData = cb;

            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
            return;
          });
        }
      });
    }
  });
}

function townBind(user, text, res) {
  // Search for who to bind.
  Player.findOne({name:text}).exec(function (err, result) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    // Does the target exist?
    if (result == null) {
      res.send("You cannot seem to find your target.");
      return;
    // Are they binding someone who is dead?
    }
    else if (result['isDead'] == true) {
      res.send("You cannnot bind the dead.");
      return;
    // Cannot bind monsters.
    }
    else if (MONSTER_ROLES.indexOf(result['role']) !== -1) {
      res.send("You cannnot bind to another monster.");
      return;
    // Cannot bind someone bound.
    }
    else if (result['bound'] == true) {
      res.send("This person is already bound.");
      return;
    // Successful bind HERE
    }
    else {
      // BIND SOMEONE
      Player.update({name:'@'+user}, {$set: { usedAbility: true }}, {upsert: false}).exec(function (err, rezult) {
        if (err) {
          console.log(err);
          return;
        }
        Player.update({name:text}, {$set: { bound: true }}, {upsert: false}).exec(function (err, rezult) {
          if (err) {
            console.log(err);
            return;
          }
          res.send("You bind your soul to "+result['name']+" tethering yourself to the mortal plane.\n");
          return;
        });

        // Do the infection transfer!
        if (result['infected'] == true) {
          var playerData;
          Player.find({}, 'name infected', {multi: true}, function(err){
            console.log("Obtained player data for bind-infection transfer.");
          }).then(function(cb){
            playerData = cb;

            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
            return;
          });
        }
      });
    }
  });
}

function townRevealFool(user, text, res) {
  var playerData;
  Player.find({}, 'name role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
    console.log("Obtained player data for the FOOL.");
  }).then(function(cb){
    playerData = cb;
    var foundResult = false;
    var roleList = [];
    for (var i in playerData) {
      if (playerData[i]['name'] == text) {
        foundResult = true;
        if (playerData[i]['isDead'] == true) {
          res.send("No sense in revealing things about the dead.");
          return;
        }
        if (playerData[i]['fakerole'] != null) {
          if (playerData[i]['fakerole'] == 'FOOL') {
            // might be breaking shit again
            Player.update({name:'@'+user}, {$set: {
              usedAbility: true,
              winner: true
            }}, {upsert: false}).exec(function (err, result) {
              if (err) console.log(err);
            });
          } else {
            // might be breaking shit again
            Player.update({name:'@'+user}, {$set: {
              usedAbility: true
            }}, {upsert: false}).exec(function (err, result) {
              if (err) console.log(err);
            });
          }
          var objTargetName = playerData[i]['name'];
          var objScanResult = playerData[i]['fakerole'];
          Game.findOne({}).exec(function(error, game){
            Scan.create({
              casterName: '@'+user,
              casterRole: "FOOL",
              targetName: objTargetName,
              scanResult: objScanResult,
              day: game['days']
            }, function(e, doccc){
              console.log("\n\n\nFool Scan Created.\n\n\n"+e);
            });
          });
          if (playerData[i]['role'] == 'BEHOLDER') {
            UTILITY.sendPrivateMessage("Your magical senses pick up that you have been scanned by someone.", playerData[i]['slackid']);
          }
          res.send("Focusing your gift, you reveal that "+playerData[i]['name']+" is a "+playerData[i]['fakerole']+"!");

          // Do the infection transfer!
          if (playerData[i]['infected'] == true) {
            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
          }
          return;
        }
      }
      // Start adding all roles to the role list. Shade & Jester replaced with VILLAGER.
      if (playerData[i]['revealed'] == false) {
        roleList.push(['SHADE', 'JESTER', 'DRUNK'].includes(playerData[i]['role']) ? 'VILLAGER' : playerData[i]['role']);
      }
    }
    if (foundResult == false) {
      res.send("You focus your powers but cannot find who you are looking for.");
      return;
    } else {
      for (var i in playerData) {
        if (playerData[i]['fakerole'] != null) {
          var fake_index = roleList.indexOf(playerData[i]['fakerole']);
          if (fake_index != -1) {
            roleList.splice(fake_index, 1);
          }
        }
      }
      var newFake = roleList[Math.floor(Math.random()*roleList.length)];
      if (newFake == 'SEER') {
        newFake = 'VILLAGER';
      }
      for (var i in playerData) {
        if (playerData[i]['name'] == text) {
          playerData[i]['fakerole'] = newFake;

          if (playerData[i]['role'] == 'BEHOLDER') {
            UTILITY.sendPrivateMessage("Your magical senses pick up that you have been scanned by someone.", playerData[i]['slackid']);
          }

          // Do the infection transfer!
          if (playerData[i]['infected'] == true) {

            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
          }
        }
      }
      Player.update({name:text}, {$set: {
        fakerole: newFake
      }}, {upsert: false}).exec(function (err, result) {
        if (err) console.log(err);
      });

      // might be breaking shit
      Player.update({name:'@'+user}, {$set: {
        usedAbility: true
      }}, {upsert: false}).exec(function (err, result) {
        if (err) console.log(err);
      });
      res.send("Focusing your gift, you reveal that "+text+" is a "+newFake+"!");
      Game.findOne({}).exec(function(error, game){
        Scan.create({
          casterName: '@'+user,
          casterRole: "FOOL",
          targetName: text,
          scanResult: newFake,
          day: game['days']
        }, function(e, doccc){});
      });
    }
  });
}

function townReveal(user, text, res, userRole) {
  // Search for who to see.
  Player.findOne({name:text}).exec(function (err, result) {
    if (err) {
      res.send("The Narrator pauses. He appears to have run into a problem: "+err);
      return;
    }
    // Does the target exist?
    if (result == null) {
      res.send("You focus your powers but cannot find who you are looking for.");
      return;
    // Are they revealing someone who is dead?
    }
    else if (result['isDead'] == true) {
      res.send("No sense in revealing things about the dead.");
      return;
    // Successful reveal HERE
    }
    else {
      Player.update({name:'@'+user}, {$set: { usedAbility: true }}, {upsert: false}).exec(function (err, rezult) {
        if (err) {
          console.log(err);
          return;
        }

        // Switch the shade & jester to villager.
        if (['SHADE', 'JESTER','DRUNK'].includes(result["role"])) {
          result["role"] = "VILLAGER";
        }
        if (MONSTER_ROLES.includes(result['role']) && userRole == 'SEER' && result['revealed'] == false) {
          /* SEER WINS */
          Player.find({role: 'SEER', name:'@'+user}, 'winner', {upsert: false}, function(err, doc){
            doc[0].winner = true;
            doc[0].save();
          });
        }
        Game.findOne({}).exec(function(error, game){
          Scan.create({
            casterName: '@'+user,
            casterRole: userRole,
            targetName: result['name'],
            scanResult: result['role'],
            day: game['days']
          }, function(e, doccc){
          });
        });

        // Do the infection transfer!
        if (result['infected'] == true) {
          var playerData;
          Player.find({}, 'name infected', {multi: true}, function(err){
            console.log("Obtained player data for bind-infection transfer.");
          }).then(function(cb){
            playerData = cb;

            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }

            // update the infections
            for (var i = 0; i < playerData.length; ++i) {
              Player.update({name:playerData[i]['name']}, {$set: {
                infected: playerData[i]['infected']
              }}, {upsert: false}).exec(function (err, result) {
                if (err) console.log(err);
              });
            }
            return;
          });
        }

        if (result['role'] == 'BEHOLDER') {
          UTILITY.sendPrivateMessage("Your magical senses pick up that you have been scanned by someone.", result['slackid']);
        }

        res.send("Focusing your gift, you reveal that "+result['name']+" is a "+result["role"]+"!");
        return;
      });
    }
  });
}

function townDeath(user, text, res, userRole) {
  var playerData;
  var lynchData;
  var feastData;
  var gameData;
  var scanData;

  Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
    console.log("Obtained player data.");
  }).then(function(cb){
    playerData = cb;
    sd = Scan.find({}, 'casterName casterRole targetName scanResult day', { multi: true}, function(err){
      console.log("Obtained scan data.");
    });
    return sd;
  }).then(function(cb){
    scanData = cb;
    ld = Lynch.find({}, 'voter target', { multi: true}, function(err){
      console.log("Obtained lynch data.");
    });
    return ld;
  }).then(function(cb){
    lynchData = cb;
    fd = Feast.find({}, 'ghoul victim', { multi: true}, function(err){
      console.log("Obtained feast data.");
    });
    return fd;
  }).then(function(cb){
      feastData = cb;
      gd = Game.find({}, 'active days distribution', { multi: false}, function(err){
        console.log("Obtained game data.");
      });
      return gd;
  }).then(function(cb){
     gameData = cb;
  }).then(function(cb){
      notFound = true;
      storytext = "";
      for (var i in playerData) {
        if (userRole == 'HELLION' && playerData[i]['name'] == text && playerData[i]['isDead'] == false && !MONSTER_ROLES.includes(playerData[i]['role'])) {
          notFound = false;
          res.send("You begin chanting in tongues and drawing demonic symbols in the air.");

          // Do the infection transfer!
          if (playerData[i]['infected'] == true) {
            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }
          }

          if (playerData[i]['role'] != 'CELESTIAL') {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "INCINERATED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "A pentagram of hellfire emerges from the ground beneath the feet of <@"+playerData[i]['slackid']+"> engulfing them in the inferno!\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
            }
            if (playerData[i]['role'] == 'TECHIE') {
              storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
            } else if (playerData[i]['role'] == 'MANTIS') {
              storytext = UTILITY.mantisFight(playerData, gameData, lynchData, storytext, "INCINERATED");
            } else if (playerData[i]['role'] == 'DRUNK') {
              storytext = UTILITY.drunkFight(playerData, gameData, lynchData, storytext, "INCINERATED");
            }
            UTILITY.adjustPostDeath(playerData);
          } else {
            playerData[i]['revealed'] = true;
            storytext = "A pentagram of hellfire emerges from the ground beneath the feet of <@"+playerData[i]['slackid']+"> but it fails to harm them. They must be the CELESTIAL!\n\n";
          }
        }
        if (userRole == 'ASSASSIN' && playerData[i]['name'] == text && playerData[i]['isDead'] == false) {
          notFound = false;
          res.send("You twirl a knife under your coat and find a hidden vantage point.");

          // Do the infection transfer!
          if (playerData[i]['infected'] == true) {
            // coin flip
            var coinFlip = Math.round(Math.random());
            if (coinFlip == 0) {
              UTILITY.randomInfection(playerData);
            } else {
              UTILITY.targetInfection('@'+user, playerData);
            }
          }

          if (playerData[i]['role'] == 'CELESTIAL' || playerData[i]['role'] == 'ARCHDEMON' || playerData[i]['role'] == 'BONEWHEEL') {
            storytext = "The town is silent. A small, ornate blade flies out from seemingly nowhere and impales <@"+playerData[i]['slackid']+"> square in the chest. However, they shrug it off like nothing revealing they are the "+playerData[i]['role']+"!\n\n";
            playerData[i]['revealed'] = true;
          }
          else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) {
            storytext = "The town is silent. A small, ornate blade flies out from seemingly nowhere and impales <@"+playerData[i]['slackid']+"> square in the chest. However, they shrug it off like nothing revealing they are a ZOMBIE!\n\n";
            playerData[i]['revealed'] = true;
          }
          else {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "ASSASSINATED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The town is silent. A small, ornate blade flies out from seemingly nowhere and impales <@"+playerData[i]['slackid']+"> square in the chest, felling them on the spot!\n\n";

            // Before we calculate any of the side effects, let's quickly check if the Assassin won.
            UTILITY.checkAssassinCondition(playerData);

            if (playerData[i]['bound'] == true) {
              storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
            }
            if (playerData[i]['role'] == 'TECHIE') {
              storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
            } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
              UTILITY.spectreHaunt(playerData, gameData);
            } else if (playerData[i]['role'] == 'MANTIS') {
              storytext = UTILITY.mantisFight(playerData, gameData, lynchData, storytext, "ASSASSINATED");
            } else if (playerData[i]['role'] == 'DRUNK') {
              storytext = UTILITY.drunkFight(playerData, gameData, lynchData, storytext, "ASSASSINATED");
            } else if (playerData[i]['role'] == 'HUNTER') {
              storytext = UTILITY.hunterShot(playerData, gameData, storytext);
            }
            UTILITY.adjustPostDeath(playerData);
          }
        }
      }
      if (notFound) {
        res.send("Your target appears to be invalid. Are they a living player?");
        return;
      } else {

        // Who is dead?
        deadArray = [];
        for (var i in playerData) {
          if (playerData[i]['isDead'] == true) {
            deadArray.push(playerData[i]['name']);
          }
          // Assassin used ability
          if (playerData[i]['role'] == userRole && playerData[i]['name'] == '@'+user) {
            playerData[i]['usedAbility'] = true;
          }
        }
        // RESET LYNCH VOTES
        for (var i in lynchData) {
          if (deadArray.includes(lynchData[i]['voter'])) {
            lynchData[i]['target'] = null;
          }
          if (deadArray.includes(lynchData[i]['target'])) {
            lynchData[i]['target'] = null;
          }
        }

        // RESET FEAST VOTES
        for (var i in feastData) {
          if (deadArray.includes(feastData[i]['ghoul'])) {
            feastData[i]['victim'] = null;
          }
          if (deadArray.includes(feastData[i]['victim'])) {
            feastData[i]['victim'] = null;
          }
        }
      }

      // Check if the game ended.
      if (UTILITY.checkWinConditions(playerData, storytext) == true) {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        // UTILITY.createPINPost(storytext); //Done inside the checkWinConditionsFunction

        // Wait for data changes to commit then shut down.
        setTimeout(function(){
          shutdownGame();
        }, 5000);
        return;
      } else {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        UTILITY.createPINPost(storytext);
        return;
      }
  });
}

function rollChain(startNode, lynchData) {
  for (var i in lynchData) {
    if (lynchData[i]['voter'] == startNode) {
      return lynchData[i]['target'];
    }
  }
  return null;
}

function getRollText(count, victimID) {
  if (count == 1) {
    return "The Bonewheel rolls out of nowhere straight into <@"+victimID+"> impaling them in a flurry of spikes.\n"
  } else if (count == 2) {
    return "The Bonewheel rolls through <@"+victimID+"> puncturing them senseless. It's a double kill!\n";
  } else if (count == 3) {
    return "The Bonewheel continues to roll through <@"+victimID+"> shredding them to pieces. It's a triple kill!\n";
  } else if (count == 4) {
    return "The Bonewheel grinds forward into <@"+victimID+"> obliterating them. It's an ultra kill!\n";
  } else if (count == 5) {
    return "The Bonewheel hurls towards <@"+victimID+"> annihilating them instantly. THIS IS AN ABSOLUTE RAMPAGE!\n";
  } else if (count > 5) {
    return "The Bonewheel, drenched in victims crushes <@"+victimID+"> with vicious velocity. I'VE RUN OUT OF WAYS TO DESCRIBE IT!\n";
  } else {
    return;
  }
}

function townRoll(user, text, res) {
  var playerData;
  var lynchData;
  var feastData;
  var gameData;
  var scanData;

  Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
    console.log("Obtained player data.");
  }).then(function(cb){
    playerData = cb;
    ld = Lynch.find({}, 'voter target', { multi: true}, function(err){
      console.log("Obtained lynch data.");
    });
    return ld;
  }).then(function(cb){
    lynchData = cb;
    fd = Feast.find({}, 'ghoul victim', { multi: true}, function(err){
      console.log("Obtained feast data.");
    });
    return fd;
  }).then(function(cb){
      feastData = cb;
      gd = Game.find({}, 'active days distribution', { multi: false}, function(err){
        console.log("Obtained game data.");
      });
      return gd;
  }).then(function(cb){
     gameData = cb;
  }).then(function(cb){
      notFound = true;
      storytext = "";
      bonewheelName = "";
      bonewheelSlackID = "";
      carnageList = [];
      for (var i in playerData) {
        if (playerData[i]['role'] == 'BONEWHEEL') {
          bonewheelName = playerData[i]['name'];
          bonewheelSlackID = playerData[i]['slackid'];
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "CRASHED";
          playerData[i]['revealed'] = true;
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
        }
      }
      for (var i in playerData) {
        if (playerData[i]['name'] == text && playerData[i]['isDead'] == false) {
          notFound = false;
          res.send("You spin your spiked wheel. This is going to be fun.");

          carnageList.push(playerData[i]["name"]);
          while (true) {
            nextPerson = rollChain(carnageList[carnageList.length - 1], lynchData);
            //storytext += "Next Person: "+nextPerson+"\n";
            //storytext += "Carnage List: "+carnageList+"\n";
            if (carnageList.includes(nextPerson) || nextPerson == null || nextPerson == bonewheelName) {
              break;
            } else {
              carnageList.push(nextPerson);
            }
          }
          //storytext += "Bonewheel List: "+carnageList.toString() + "\n";
        }
      }
      if (notFound) {
        res.send("Your first target appears to be invalid. Are they a living player?");
        return;
      } else {

        afterDeathEvents = [];
        victimCounter = 0;
        for (var i in carnageList) {
          for (var j in playerData) {
            if (playerData[j]['name'] == carnageList[i]) {
              if (['ARCHDEMON', 'CELESTIAL'].includes(playerData[j]['role']) || (playerData[j]['role'] == 'ZOMBIE' && playerData[j]['usedAbility'] == false)) {
                storytext += "The Bonewheel rolls over <@"+playerData[j]['slackid']+"> but the "+playerData[j]['role']+" remains unharmed.\n";
                playerData[j]['revealed'] = true;
              } else {
                if (["HUNTER", "TECHIE"].includes(playerData[j]['role']) || (playerData[j]['role'] == 'SPECTRE' && playerData[j]['usedAbility'] == false)) {
                  afterDeathEvents.push(playerData[j]['role']);
                }
                if (playerData[j]['bound'] == true) {
                  afterDeathEvents.push("ARCHDEMON");
                }
                victimCounter += 1;
                storytext += getRollText(victimCounter, playerData[j]['slackid']);
                playerData[j]['isDead'] = true;
                playerData[j]['dayOfDeath'] = gameData[0]['days'];
                playerData[j]['causeOfDeath'] = "IMPALED";
                playerData[j]['marked'] = false;
                playerData[j]['protected'] = false;
                playerData[j]['infected'] = false;
                UTILITY.adjustPostDeath(playerData);
              }
            }
          }
        }
        storytext += "Finally <@"+bonewheelSlackID+"> crashes with a cataclysmic thud, ending the carnage.\n\n";
        //storytext += afterDeathEvents.toString() + "\n\n";
        for (var i in afterDeathEvents) {
          if (afterDeathEvents[i] == 'ARCHDEMON') {
            storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
          } else if (afterDeathEvents[i] == 'TECHIE') {
            storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
          } else if (afterDeathEvents[i] == 'SPECTRE') {
            UTILITY.spectreHaunt(playerData, gameData);
          } else if (afterDeathEvents[i] == 'HUNTER') {
            storytext = UTILITY.hunterShot(playerData, gameData, storytext);
          }
          UTILITY.adjustPostDeath(playerData);
        }

        // Who is dead?
        deadArray = [];
        for (var i in playerData) {
          if (playerData[i]['isDead'] == true) {
            deadArray.push(playerData[i]['name']);
          }
          // Bonewheel used ability
          /*if (playerData[i]['role'] == "BONEWHEEL" && playerData[i]['name'] == '@'+user) {
            playerData[i]['usedAbility'] = true;
          }*/
        }
        // RESET LYNCH VOTES
        for (var i in lynchData) {
          if (deadArray.includes(lynchData[i]['voter'])) {
            lynchData[i]['target'] = null;
          }
          if (deadArray.includes(lynchData[i]['target'])) {
            lynchData[i]['target'] = null;
          }
        }

        // RESET FEAST VOTES
        for (var i in feastData) {
          if (deadArray.includes(feastData[i]['ghoul'])) {
            feastData[i]['victim'] = null;
          }
          if (deadArray.includes(feastData[i]['victim'])) {
            feastData[i]['victim'] = null;
          }
        }
      }

      // Check if the game ended.
      if (UTILITY.checkWinConditions(playerData, storytext) == true) {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        // UTILITY.createPINPost(storytext); //Done inside the checkWinConditionsFunction

        // Wait for data changes to commit then shut down.
        setTimeout(function(){
          shutdownGame();
        }, 5000);
        return;
      } else {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        UTILITY.createPINPost(storytext);
        return;
      }
  });
}

function townDrunk(drunkSlackID) {
  var playerData;
  var lynchData;
  var feastData;
  var gameData;

  Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
    console.log("Obtained player data.");
  }).then(function(cb){
    playerData = cb;
    sd = Scan.find({}, 'casterName casterRole targetName scanResult day', { multi: true}, function(err){
      console.log("Obtained scan data.");
    });
    return sd;
  }).then(function(cb){
    scanData = cb;
    ld = Lynch.find({}, 'voter target', { multi: true}, function(err){
      console.log("Obtained lynch data.");
    });
    return ld;
  }).then(function(cb){
    lynchData = cb;
    fd = Feast.find({}, 'ghoul victim', { multi: true}, function(err){
      console.log("Obtained feast data.");
    });
    return fd;
  }).then(function(cb){
      feastData = cb;
      gd = Game.find({}, 'active days distribution', { multi: false}, function(err){
        console.log("Obtained game data.");
      });
      return gd;
  }).then(function(cb){
     gameData = cb;
  }).then(function(cb){
      notFound = true;
      storytext = "";
      for (var i in playerData) {
        if (playerData[i]['slackid'] == drunkSlackID) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "PASSED OUT";
          playerData[i]['revealed'] = true;
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          storytext += "Unable to handle their booze, the absolutely hammered <@"+drunkSlackID+"> passes out!\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
          }
          UTILITY.adjustPostDeath(playerData);
        }
      }

      // Who is dead?
      deadArray = [];
      for (var i in playerData) {
        if (playerData[i]['isDead'] == true) {
          deadArray.push(playerData[i]['name']);
        }
      }
      // RESET LYNCH VOTES
      for (var i in lynchData) {
        if (deadArray.includes(lynchData[i]['voter'])) {
          lynchData[i]['target'] = null;
        }
        if (deadArray.includes(lynchData[i]['target'])) {
          lynchData[i]['target'] = null;
        }
      }

      // RESET FEAST VOTES
      for (var i in feastData) {
        if (deadArray.includes(feastData[i]['ghoul'])) {
          feastData[i]['victim'] = null;
        }
        if (deadArray.includes(feastData[i]['victim'])) {
          feastData[i]['victim'] = null;
        }
      }

      // Check if the game ended.
      if (UTILITY.checkWinConditions(playerData, storytext) == true) {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        // UTILITY.createPINPost(storytext); //Done inside the checkWinConditionsFunction

        // Wait for data changes to commit then shut down.
        setTimeout(function(){
          shutdownGame();
        }, 5000);
        return;
      } else {
        commitDataChanges(playerData, lynchData, feastData, gameData);
        UTILITY.createPINPost(storytext);
        return;
      }
  });
}

app.post('/ability', function(req, res) {
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
  } else if (!GAME_ACTIVE) {
    res.send("The game has not begun, it is far too early to do this.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("Only members of the town may use this.");
        return;
      }
      // Are they dead?
      else if (result['isDead'] == true) {
        res.send("Unfortunately you are dead.");
        return;
      }
      // Have they used an ability already?
      else if (result['usedAbility'] == true) {
        res.send("You have exhausted your ability to do this for the time being.");
        return;
      }
      // Are they targeting themself?
      else if ('@'+user == text) {
        res.send("You may not use this on yourself.");
        return;
      }
      // Assassin already won?
      else if (result['winner'] == true && result['role'] == 'ASSASSIN') {
        res.send("You finished your contract. Why bother killing someone else.");
        return;
      }
      // Seeing nobody, then vote abstain.
      else if (text == null || text.replace(/\s/g, '').length < 1) {
        res.send("You decide not to use this on anyone for now.");
        return;
      }
      else {
        if (result['role'] == 'COURIER') {
          townMail(user, text, res);
        } else if (result['role'] == 'ARCHDEMON') {
          townBind(user, text, res);
        } else if (result['role'] == 'HUNTER') {
          townMark(user, text, res);
        } else if (result['role'] == 'PALADIN') {
          townBless(user, text, res);
        } else if (result['role'] == 'FOOL') {
          townRevealFool(user, text, res);
        } else if (["SEER","LICH"].includes(result['role'])) {
          townReveal(user, text, res, result['role']);
        } else if (["ASSASSIN", "HELLION"].includes(result['role'])) {
          townDeath(user, text, res, result['role']);
        } else if (result['role'] == 'BONEWHEEL') {
          townRoll(user, text, res);
        } else {
          res.send("Your role does not possess an applicable ability.");
        }
      }
  });
});

app.post('/lynch', function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  var userRole = null;
  var userSlackID = null;
  var usedRevealed = false;

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
  } else if (!GAME_ACTIVE) {
    res.send("The game has not begun, it is far too early to grab your pitchfork.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("Only members of the town may vote to lynch people.");
        return;
      }
      // Are they dead?
      else if (result['isDead'] == true) {
        res.send("Unfortunately the dead do not speak.");
        return;
      }
      // Are they lynching themself?
      else if ('@'+user == text) {
        res.send("In spite of any dark desires, you cannot vote to lynch yourself.");
        return;
      }
      // Lynching nobody, then vote abstain.
      else if (text == null || text.replace(/\s/g, '').length < 1) {
        Lynch.update({voter:'@'+user}, {voter:'@'+user, target:null}, {upsert: true}, function (err, doc) {
          if (err) {
            res.send("The Narrator pauses. He appears to have run into a problem: "+err);
            return;
          }
          else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({"text":"Quietly, <@"+result['slackid']+"> announces they are abstaining from any lynching for now.", "response_type":'in_channel'}));
            return;
          }
        });
      }
      else {
        // Get some useful variables first.
        userRole = result['role'];
        userRevealed = result['revealed'];
        userSlackID = result['slackid'];

        // Search for who to Lynch.
        Player.findOne({name:text}).exec(function (err, result) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            // Does the target exist?
            if (result == null) {
              res.send("You search the town cautiously but cannot find who you are looking for.");
              console.log("User: "+user, "Err: "+err, "Result: "+result, "Text: "+text);
              return;
            // Are they lynching someone who is dead?
            }
            else if (result['isDead'] == true) {
              res.send("Try as you might, you cannot kill someone who is already dead.");
              return;
            // Successful Lynch HERE
            }
            else {
              targetSlackID = result['slackid'];
              Lynch.update({voter:'@'+user}, {voter:'@'+user, target:text}, {upsert: true}, function (err, doc) {
                if (err) {
                  res.send("The Narrator pauses. He appears to have run into a problem: "+err);
                  return;
                }
                else {
                  res.setHeader('Content-Type', 'application/json');
                  if (userRole == 'MAYOR' && userRevealed) {
                    res.send(JSON.stringify({"text":"In a public announcement, Mayor <@"+userSlackID+"> states their intention to lynch <@"+targetSlackID+">!", "response_type":'in_channel'}));
                  } else if (userRole == 'ZOMBIE' && userRevealed) {
                    res.send(JSON.stringify({"text":"In spite of their undead state, <@"+userSlackID+"> exercises their democratic privilege to vote to lynch <@"+targetSlackID+">!", "response_type":'in_channel'}));
                  } else {
                    res.send(JSON.stringify({"text":"With a shout, <@"+userSlackID+"> announces they vote to lynch <@"+targetSlackID+">!", "response_type":'in_channel'}));
                  }
                  return;
                }
              });
              // Uh-oh, infection is spreading!
              if (result['infected'] == true) {
                var playerData;
                Player.find({}, 'name infected', {multi: true}, function(err){
                  console.log("Obtained player data for lynch-infection transfer.");
                }).then(function(cb){
                  playerData = cb;

                  // coin flip
                  var coinFlip = Math.round(Math.random());
                  if (coinFlip == 0) {
                    UTILITY.randomInfection(playerData);
                  } else {
                    UTILITY.targetInfection('@'+user, playerData);
                  }

                  // update the infections
                  for (var i = 0; i < playerData.length; ++i) {
                    Player.update({name:playerData[i]['name']}, {$set: {
                      infected: playerData[i]['infected']
                    }}, {upsert: false}).exec(function (err, result) {
                      if (err) console.log(err);
                    });
                  }
                  return;
                });
              }
              Player.update({name: '@'+user}, { $inc: { voteCount: 1 }}, {upsert: false}, function(err, doc){
                if(err){
                 console.log(err);
                } else{
                 console.log("Incremented vote count for @"+user);
                }
              });
              return;
            }
        });
      }
  });
});

app.post('/love', function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  var userRole = null;
  var userSlackID = null;
  var usedRevealed = false;

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
  } else if (!GAME_ACTIVE) {
    res.send("The game has not begun, it is far too early to do this.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("Only members of the town may vote to love people.");
        return;
      }
      // Are they dead?
      else if (result['isDead'] == true) {
        res.send("Unfortunately the dead do not speak.");
        return;
      }
      // Are they lynching themself?
      else if ('@'+user == text) {
        res.send("You already love yourself, no need to announce it.");
        return;
      }
      // Lynching nobody, then vote abstain.
      else if (text == null || text.replace(/\s/g, '').length < 1) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"text":"Quietly, <@"+result['slackid']+"> announces they are not ready for love for now. :broken_heart:", "response_type":'in_channel'}));
        return;
      }
      else {
        // Get some useful variables first.
        userRole = result['role'];
        userSlackID = result['slackid'];
        userRevealed = result['revealed'];
        userLoveSent = result['loveSent'];

        // Search for who to Love.
        Player.findOne({name:text}).exec(function (err, result) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            // Does the target exist?
            if (result == null) {
              res.send("You search the town cautiously but cannot find who you are looking for.");
              console.log("User: "+user, "Err: "+err, "Result: "+result, "Text: "+text);
              return;
            // Are they loving someone who is dead?
            }
            else if (result['isDead'] == true) {
              res.send("You cannot use this on the dead.");
              return;
            // Successful Lynch HERE
            }
            else {
                targetSlackID = result['slackid'];
                res.setHeader('Content-Type', 'application/json');
                if (userRole == 'MAYOR' && userRevealed) {
                  res.send(JSON.stringify({"text":"In a public announcement, Mayor <@"+userSlackID+"> states their love for <@"+targetSlackID+">! :heart:", "response_type":'in_channel'}));
                } else if (userRole == 'ZOMBIE' && userRevealed) {
                  res.send(JSON.stringify({"text":"In spite of their undead state, <@"+userSlackID+"> announces their undying love for <@"+targetSlackID+">! :heart:", "response_type":'in_channel'}));
                } else {
                  res.send(JSON.stringify({"text":"With a shout, <@"+userSlackID+"> announces their love for <@"+targetSlackID+">! :heart:", "response_type":'in_channel'}));
                }
                Player.update({name: '@'+user}, { $inc: { voteCount: 1 }}, {upsert: false}, function(err, doc){
                  if(err){
                   console.log(err);
                  } else{
                   console.log("Incremented vote count for @"+user);
                  }
                });
                Game.findOne({}, 'days', function(e, res){
                  if (res['days'] > userLoveSent) {
                    Player.update({name: '@'+user}, { $inc: { loveSent: 1 }}, {upsert: false}, function(err, doc){
                      if(err){
                       console.log(err);
                      } else{
                       console.log("Incremented love count for @"+user);
                      }
                    });
                    Player.update({name: text}, { $inc: { loveReceived: 1 }}, {upsert: false}, function(err, doc){
                      if(err){
                       console.log(err);
                      } else{
                       console.log("Incremented love received for "+text);
                      }
                    });
                  }
                });
                return;
            }
        });
      }
  });
});

app.post('/feast', function(req, res) {
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
  } else if (!GAME_ACTIVE) {
    res.send("The game has not begun, it is far too early to do this.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("Only monstrous members of the town may feast on people.");
        return;
      }
      // Are they dead?
      else if (result['isDead'] == true) {
        res.send("Unfortunately the dead do not speak.");
        return;
      }
      // Are they not a ghoul based role?
      else if (MONSTER_ROLES.indexOf(result['role']) === -1) {
          res.send("You might be hungry, but you have no monstrous desires for human flesh.");
          return;
      }
      // Are they feasting themself?
      else if ('@'+user == text) {
        res.send("You cannot stand the taste of your own monstrous flesh.");
        return;
      }
      // Feasting nobody, then vote abstain.
      else if (text == null || text.replace(/\s/g, '').length < 1) {
        Feast.update({ghoul:'@'+user}, {ghoul:'@'+user, victim:null}, {upsert: true}, function (err, doc) {
          if (err) {
            res.send("The Narrator pauses. He appears to have run into a problem: "+err);
            return;
          }
          else {
            res.send("In a baffling twist, you decide not to feast on anyone tonight.");
            return;
          }
        });
      }
      else {
        // Search for who to Feast.
        Player.findOne({name:text}).exec(function (err, result) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            // Does the target exist?
            if (result == null) {
              res.send("You search the town cautiously but cannot find who you are looking for.");
              return;
            // Are they feasting someone who is dead?
            }
            else if (result['isDead'] == true) {
              res.send("This poor soul is too dead for even you to eat.");
              return;
            }
            // Are they feasting on a ghoul?
            else if (MONSTER_ROLES.indexOf(result['role']) !== -1) {
              res.send("You have no taste for the flesh of other fiendish creatures.");
              return;
            }
            // Successful Feast HERE
            else {
              Feast.update({ghoul:'@'+user}, {ghoul:'@'+user, victim:text}, {upsert: true}, function (err, doc) {
                if (err) {
                  res.send("The Narrator pauses. He appears to have run into a problem: "+err);
                  return;
                }
                else {
                  res.send("You decide to make "+text+" your next victim provided the other monsters cooperate.");
                  return;
                }
              });
              // Uh-oh, infection is spreading!
              if (result['infected'] == true) {
                var playerData;
                Player.find({}, 'name infected', {multi: true}, function(err){
                  console.log("Obtained player data for feast-infection transfer.");
                }).then(function(cb){
                  playerData = cb;

                  // coin flip
                  var coinFlip = Math.round(Math.random());
                  if (coinFlip == 0) {
                    UTILITY.randomInfection(playerData);
                  } else {
                    UTILITY.targetInfection('@'+user, playerData);
                  }

                  // update the infections
                  for (var i = 0; i < playerData.length; ++i) {
                    Player.update({name:playerData[i]['name']}, {$set: {
                      infected: playerData[i]['infected']
                    }}, {upsert: false}).exec(function (err, result) {
                      if (err) console.log(err);
                    });
                  }
                  return;
                });
              }
              return;
            }
        });
      }
  });
});

app.post('/veto', function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  var userRole = null;
  var channel = req.body['channel_name'];
  var vetoName = DISTRIBUTION.name(parseInt(text));

  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  } else if (GAME_ACTIVE) {
    res.send("The game has begun, it is too late to cast a veto.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("You must sign up first, join the game with `/townsignup`.");
        return;
      }
      // Empty veto.
      else if (text == null || text.replace(/\s/g, '').length < 1) {
        Veto.update({voter:'@'+user}, {voter:'@'+user, mapNumber: null}, {upsert: true}, function (err, doc) {
          if (err) {
            res.send("The Narrator pauses. He appears to have run into a problem: "+err);
            return;
          }
          else {
            res.setHeader('Content-Type', 'application/json');
            res.send("Your veto vote is now abstained.");
            return;
          }
        });
      }
      // Are they vetoing
      else if (vetoName == undefined) {
        res.send(text+" is not a valid map number. Check the website for the map numbers.");
        return;
      }
      else {
        Game.find({}, "previous distribution", {multi: true}, function(err, doc){
          console.log("Obtained game data."+doc.length);
          if (vetoName == doc[0]['previous']) {
            res.send(vetoName + " was the previous map and will be vetoed automatically.\n");
            return;
          } else {
            Veto.update({voter:'@'+user}, {voter:'@'+user, mapNumber: parseInt(text)}, {upsert: true}, function (err, doc) {
              if (err) {
                res.send("The Narrator pauses. He appears to have run into a problem: "+err);
                return;
              }
              else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({"text":"Your veto vote is now set to map #"+parseInt(text).toString()+": "+vetoName+"\n\nUse `/townvetoinfo` to view the veto votes.", "response_type":'in_channel'}));

                //res.send("Your veto vote is now set to map #"+parseInt(text).toString()+": "+vetoName);
                return;
              }
            });
          }
        });
      }
  });
});

app.post('/vetoinfo', function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  var userRole = null;
  var channel = req.body['channel_name'];

  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  } else if (GAME_ACTIVE) {
    res.send("The game has begun, it is too late to cast a veto.");
    return;
  }

  // Verify the person is playing before proceeding.
  Player.findOne({name:'@'+user}).exec(function (err, result) {
      if (err) {
        res.send("The Narrator pauses. He appears to have run into a problem: "+err);
        return;
      }
      // Are they a player?
      if (result == null) {
        res.send("You must sign up first, join the game with `/townsignup`.");
        return;
      }
      else {
        autoVeto = "";
        Game.find({}, "previous distribution", {multi: true}, function(err, doc){
          autoVeto = doc[0]['previous'];
          console.log("Obtained game data."+doc.length);
          Veto.find({}, "voter mapNumber", {multi: true}).sort({mapNumber: 1}).exec(function (err, doc) {
            if (err) {
              res.send("The Narrator pauses. He appears to have run into a problem: "+err);
              return;
            }
            else {

              // Count out the veto votes
              var vetoMap = {};
              for (var i = 0; i < doc.length; ++i) {
                // Map out votes.
                if (doc[i]['mapNumber'] != null) {
                  if (vetoMap[doc[i]['mapNumber']] === undefined) {
                    vetoMap[doc[i]['mapNumber']] = 1;
                  } else {
                    vetoMap[doc[i]['mapNumber']] += 1;
                  }
                }
              }

              var vetoResult = "";
              var sortable = [];
              for (var i in vetoMap) {
                sortable.push([i, vetoMap[i]]);
              }

              UTILITY.shuffleArray(sortable);

              // Sort that list
              sortable.sort(function(a, b) {
                return b[1] - a[1];
              });

              responseText = "*Veto Votes:* \n```";
              responseText += "Automatically Vetoed: "+autoVeto+"\n\n";
              for (var i in doc) {
                responseText += doc[i]['voter'] + ": " + doc[i]['mapNumber'] + " (" + DISTRIBUTION.name(parseInt(doc[i]['mapNumber'])) + ")\n";
              }
              responseText += "\n";
              for (var i = 0; i < sortable.length; ++i) {
                responseText += DISTRIBUTION.name(parseInt(sortable[i][0])) + ": " + sortable[i][1];
                responseText += "\n";
              }
              responseText += '```';
              res.send(responseText);
              return;
            }
          });
        });
      }
  });
});

app.post('/stopgame', function(req, res) {
  var text = req.body['text'];
  var user = req.body['user_name'];
  var channel = req.body['channel_name'];
  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  } else if (!UTILITY.ADMIN_LIST.includes(user)) {
    res.send("Only admins may do this.");
    return;
  }
  if (SCHEDULER) {
    SCHEDULER.cancel();
  }
  WEB_SOCKET.close(1000, "Drunk is now dead.");
  openWebSocket();
  Game.findOneAndUpdate({}, {active : false, distribution: "RANDOM"}, {upsert: false}, function (err, doc) {
    console.log("GAME_ACTIVE = false");
    GAME_ACTIVE = false;
  });
  Lynch.remove({}, function(err) {
   console.log('Lynches removed');
  });
  Feast.remove({}, function(err) {
   console.log('Feasts removed');
  });
  Player.remove({}, function(err) {
   console.log('Players removed');
  });
  Scan.remove({}, function(err) {
   console.log('Scans removed');
  });
  Veto.remove({}, function(err) {
   console.log('Vetoes removed');
  });
  res.send("Nuking everything. Run this twice for good measure. Wait 10 seconds after before signing up just to be sure.");
  return;
});

app.post('/startgame', function(req, res) {

  var text = req.body['text'];
  var user = req.body['user_name'];
  var channel = req.body['channel_name'];
  if (channel != UTILITY.ACTIVE_CHANNEL) {
    res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
    return;
  } else if (GAME_ACTIVE) {
    res.send("The game has begun, no need for this.");
    return;
  } else if (!UTILITY.ADMIN_LIST.includes(user)) {
    res.send("Only admins may do this.");
  }

  res.send("Attempting game loop.");
  GAMELOOP();
});

function GAMELOOP() {
  var playerData;
  var scanData;
  var lynchData;
  var feastData;
  var gameData;
  var vetoData;

  Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
    console.log("Obtained player data.");
  }).then(function(cb){
    playerData = cb;
    sd = Scan.find({}, 'casterName casterRole targetName scanResult day', { multi: true}, function(err){
      console.log("Obtained scan data.");
    });
    return sd;
  }).then(function(cb){
    scanData = cb;
    ld = Lynch.find({}, 'voter target', { multi: true}, function(err){
      console.log("Obtained lynch data.");
    });
    return ld;
  }).then(function(cb){
    lynchData = cb;
    fd = Feast.find({}, 'ghoul victim', { multi: true}, function(err){
      console.log("Obtained feast data.");
    });
    return fd;
  }).then(function(cb){
    feastData = cb;
    gd = Game.find({}, 'active days distribution season previous', { multi: false}, function(err){
      console.log("Obtained game data.");
    });
    return gd;
  }).then(function(cb){
    gameData = cb;
    vd = Veto.find({}, 'voter mapNumber', { multi: true}, function(err){
      console.log("Obtained game data.");
    });
    return vd;
  }).then(function(cb){
    vetoData = cb;
  }).then(function(cb){

    // Do we have enough people?
    if (playerData.length < MINPLAYERS || playerData.length > MAXPLAYERS) {
      console.log("INCORRECT PLAYER COUNT: "+playerData.length);
      return false;
    }

    // Do setup.
    if (gameData[0]['active'] == false) {
      seasonText = UTILITY.initialGameSetup(playerData, gameData, vetoData);
      commitDataChanges(playerData, lynchData, feastData, gameData);
      SEASON = gameData[0]['season'];
      seasonText += '*SEASON '+SEASON+' of #the-town*\n'+
                   '```Players: '+playerData.length+'\n'+
                   'Location: '+gameData[0]['distribution']+'\n\n'+
                   DISTRIBUTION.description(gameData[0]['distribution'])+
                   '```\n\n'+
                   'Featuring: \n```';
      // Tally up roles
      var roleMap = {};
      for (var i in playerData) {
        roleMap[playerData[i]["role"]] = roleMap[playerData[i]["role"]] || 0;
        roleMap[playerData[i]["role"]] += 1;
      }

      // Convert Map to List
      var sortable = [];
      for (var i in roleMap) {
        sortable.push([i, roleMap[i]]);
      }

      // Sort that list
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });

      // Finally post the sortable amounts
      for (var i in sortable) {
        seasonText += sortable[i][0] + " (x" + sortable[i][1] + ")";
        if (i < sortable.length - 1) {
          seasonText += '\n';
        }
      }
      seasonText += '```\nBegin!';
      if (gameData[0]['distribution'] == 'THE FINALE') {
        seasonText = '*FINAL SEASON of #the-town*\n'+
                     '```Players: '+playerData.length+'\n'+
                     'Location: ???\n\n'+
                     DISTRIBUTION.description(gameData[0]['distribution'])+
                     '```\n\n'+
                     'Featuring: ???\n';
      }
      UTILITY.createPINPost(seasonText);
    }

    /* SOCKET SECTION - Needs to be re-enabled when gameloop is called on server restart. */
    var drunkFound = false;
    var drunkSlackID = null;
    for (var i in playerData) {
      if (playerData[i]['role'] == 'DRUNK' && playerData[i]['isDead'] == false) {
        drunkFound = true;
        drunkSlackID = playerData[i]['slackid'];
        console.log("Found the drunk.");
      }
    }

    if (drunkFound) {
      WEB_SOCKET.on('message', function incoming(data) {
        data = JSON.parse(data);
          var drunkRegExp = new RegExp('([:][a-zA-Z1-9_+-]+[:])');
          if (data['type'] == "message" && data['user'] == drunkSlackID && data['channel'] == process.env.CHANNEL_ID) {
            if (data['text'][0] == '/') {
              return;
            } else {
              reducedText = data['text'].replace(" ", "");
              regResult = drunkRegExp.exec(reducedText);
              while (regResult != null) {
                reducedText = reducedText.replace(regResult[0], "");
                regResult = drunkRegExp.exec(reducedText);
              }
              if (reducedText.replace(/\s/g, '').length >= 1) {
                UTILITY.bugpost("Drunk Bad Text: "+reducedText.replace(/\s/g, ''));
                townDrunk(drunkSlackID);
                WEB_SOCKET.close(1000, "Drunk is now dead.");
                openWebSocket();
              }
              return;
            }
          }
      });
    }

    GAME_ACTIVE = true;

    // The actual loop.
    SCHEDULER = schedule.scheduleJob('0 23 * * 1-5', function(){
    //SCHEDULER = schedule.scheduleJob('* * * * *', function(){

      var playerData = null;
      var scanData = null;
      var lynchData = null;
      var feastData = null;
      var gameData = null;

      Player.find({}, 'name slackid role fakerole isDead usedAbility revealed protected marked target mail bound moxie infected initialRole loveSent loveReceived winner commandCount voteCount dayOfDeath causeOfDeath', {multi: true}, function(err){
        console.log("Obtained player data.");
      }).then(function(cb){
        playerData = cb;
        sd = Scan.find({}, 'casterName casterRole targetName scanResult day', { multi: true}, function(err){
          console.log("Obtained scan data.");
        });
        return sd;
      }).then(function(cb){
        scanData = cb;
        ld = Lynch.find({}, 'voter target', { multi: true}, function(err){
          console.log("Obtained lynch data.");
        });
        return ld;
      }).then(function(cb){
        lynchData = cb;
        fd = Feast.find({}, 'ghoul victim', { multi: true}, function(err){
          console.log("Obtained feast data.");
        });
        return fd;
      }).then(function(cb){
          feastData = cb;
          gd = Game.find({}, 'active days distribution previous', { multi: false}, function(err){
            console.log("Obtained game data.");
          });
          return gd;
      }).then(function(cb){
         gameData = cb;
      }).then(function(cb){
          console.log('Day completed. Preparing to lynch.');
          storytext = '';
          lynchedPerson = null;
          feastedPerson = null;
          markedPerson = null;
          mayorName = null;
          executionerName = null;
          executionerId = null;
          executionerVote = null;
          executionerVoteId = null;
          duelistList = [];
          moxieMap = {};
          validSpectreTargets = 0;
          currentMax = - 1;
          tie = false;
          ghoulCount = 0;
          villagerCount = 0;

          UTILITY.shuffleArray(playerData);

          // Make sure the Archdemon bound somebody
          if (gameData[0]['days'] == 1) {
            archbound = false;
            for (var i = 0; i < playerData.length; ++i) {
              if (playerData[i]['bound'] == true && playerData[i]['isDead'] == false) {
                archbound = true;
              }
            }
            if (archbound == false) {
              archdemonName = '';
              for (var i = 0; i < playerData.length; ++i) {
                if (playerData[i]['role'] == 'ARCHDEMON') {
                  playerData[i]['isDead'] = true;
                  playerData[i]['dayOfDeath'] = gameData[0]['days'];
                  playerData[i]['causeOfDeath'] = "BANISHED";
                  playerData[i]['marked'] = false;
                  playerData[i]['protected'] = false;
                  playerData[i]['infected'] = false;
                  playerData[i]['revealed'] = true; // Reveal them.

                  storytext += 'Having failed to anchor their soul to the material plane, the Archdemon '+
                  playerData[i]['name']+' is banished from the Town.\n\n';
                  archdemonName = playerData[i]['name'];
                }
                if (playerData[i]['role'] == 'DRUNK' && playerData[i]['isDead'] == true) {
                  WEB_SOCKET.close(1000, "Drunk is now dead.");
                  openWebSocket();
                }
              }
              // Reset associated lynch votes.
              for (var i = 0; i < lynchData.length; ++i) {
                if (lynchData[i]['voter'] == archdemonName) {
                  lynchData[i]['target'] == null;
                }
                if (lynchData[i]['target'] == archdemonName) {
                  lynchData[i]['target'] == null;
                }
              }
              // Reset their feast vote.
              for (var i = 0; i < feastData.length; ++i) {
                if (feastData[i]['ghoul'] == archdemonName) {
                  feastData[i]['victim'] == null;
                }
              }
            }
          }

          // Reset assassin strike on appropriate days
          if (gameData[0]['days'] == 1 || gameData[0]['days'] == 3) {
            for (var i = 0; i < playerData.length; ++i) {
              if (playerData[i]['role'] == 'ASSASSIN') {
                playerData[i]['usedAbility'] = false;
              }
            }
          }

          // Start of day 2. Hellion+Bonewheel gains one-time use ability.
          if (gameData[0]['days'] == 1) {
            for (var i in playerData) {
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'HELLION') {
                playerData[i]['usedAbility'] = false;
              }
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'BONEWHEEL') {
                playerData[i]['usedAbility'] = false;
              }
            }
          }

          // Who is the MAYOR? Who is the Executioner? Who are the Duelists?
          for (var i = 0; i < playerData.length; ++i) {
            if (playerData[i]['role'] == 'MAYOR') {
              mayorName = playerData[i]['name'];
            }
            if (playerData[i]['role'] == 'EXECUTIONER') {
              executionerName = playerData[i]['name'];
              executionerId = playerData[i]['slackid'];
            }
            if (playerData[i]['role'] == 'VILLAGER' && playerData[i]['isDead'] == false) {
              validSpectreTargets += 1;
            }
            if (playerData[i]['role'] == 'DUELIST') {
              moxieMap[playerData[i]['name']] = 0;
              duelistList.push(playerData[i]['name']);
            }
          }

          // Count out the lynch votes
          var lynchMap = {};
          for (var i = 0; i < lynchData.length; ++i) {
            // Not mayor? 1 vote.
            if (lynchData[i]['voter'] != mayorName){

              // Mark down who the executioner voted for.
              if (lynchData[i]['voter'] == executionerName) {
                executionerVote = lynchData[i]['target'];
                for (var i in playerData) {
                  if (playerData[i]['name'] == executionerVote) {
                    executionerVoteId = playerData[i]['slackid'];
                  }
                }
              }

              // Map out votes.
              if (lynchData[i]['target'] != null) {
                if (lynchMap[lynchData[i]['target']] === undefined) {
                  lynchMap[lynchData[i]['target']] = 1;
                } else {
                  lynchMap[lynchData[i]['target']] += 1;
                }
              }

              // Moxie Adjustment - If not a Duelist Vote then map some Moxie to the duelist.
              if (moxieMap[lynchData[i]['target']] !== undefined && !duelistList.includes(lynchData[i]['voter'])) {
                moxieMap[lynchData[i]['target']] += 1;
              }

            // Mayor? 2 votes.
            } else {

              // Map out votes.
              if (lynchData[i]['target'] != null) {
                if (lynchMap[lynchData[i]['target']] === undefined) {
                  lynchMap[lynchData[i]['target']] = 2;
                } else {
                  lynchMap[lynchData[i]['target']] += 2;
                }
              }

              // Moxie Adjustment - Mayor Edition
              if (moxieMap[lynchData[i]['target']] !== undefined) {
                moxieMap[lynchData[i]['target']] += 2;
              }
            }
          }

          // Loop through lynch votes, determine who gets lynched.
          for (var key in lynchMap) {
            if (lynchMap.hasOwnProperty(key)) {
              if (lynchMap[key] > currentMax) {
                tie = false;
                lynchedPerson = key;
                currentMax = lynchMap[key];
              } else if (lynchMap[key] == currentMax) {
                tie = true;
                lynchedPerson = null;
              }
            }
          }
          console.log("Lynch Blob DATA: "+JSON.stringify(lynchData, null, 4));
          console.log("Lynch Map DATA: "+JSON.stringify(lynchMap, null, 4));
          console.log("LYNCHED PERSON: "+lynchedPerson+"\nCURRENT_MAX: "+currentMax);

          // Executioner pre-check
          if (lynchedPerson == executionerName && executionerVote != null) {
            storytext += 'Just before midnight it is revealed that <@'+executionerId+'> is the EXECUTIONER! ';
            storytext += 'At their command, <@'+executionerVoteId+'> will be lynched instead.\n\n';
            lynchedPerson = executionerVote;
            for (var i in playerData) {
              if (playerData[i]['name'] == executionerName && playerData[i]['role'] == 'EXECUTIONER') {
                playerData[i]['revealed'] = true;
              }
            }
          }

          // If an eligible lynching happens, update their document.
          for (var i in playerData) {
            console.log(playerData[i]['name']);
            if (playerData[i]['name'] == lynchedPerson && playerData[i]['isDead'] == false) {
              var lynchedPersonRole = playerData[i]['role'];
              storytext += 'At midnight the bell tolls and <@'+playerData[i]['slackid']+'> is lynched at the demands of the town.\n';
              storytext += "Upon stepping up to the podium it is revealed that their role was . . . "+lynchedPersonRole+'!\n\n';
              var lynchFailed = false;
              if (playerData[i]['role'] == 'ASSASSIN' && playerData[i]['winner'] == true) {
                storytext += TEXT_DATA.assassinDeathSuccess;
              } else if (playerData[i]['role'] == 'ASSASSIN') {
                storytext += TEXT_DATA.assassinDeathFailure;
              } else if (playerData[i]['role'] == 'CURSED') {
                storytext += TEXT_DATA.cursedDeath;
              } else if (playerData[i]['role'] == 'LICH') {
                storytext += TEXT_DATA.lichDeath;
              } else if (playerData[i]['role'] == 'GHOUL') {
                storytext += TEXT_DATA.ghoulDeath;
              } else if (playerData[i]['role'] == 'IMP') {
                storytext += TEXT_DATA.impDeath;
              } else if (playerData[i]['role'] == 'MASON') {
                storytext += TEXT_DATA.masonDeath;
              } else if (playerData[i]['role'] == 'PALADIN') {
                storytext += TEXT_DATA.paladinDeath;
              } else if (playerData[i]['role'] == 'FOOL') {
                storytext += TEXT_DATA.foolDeath;
              } else if (playerData[i]['role'] == 'SEER') {
                storytext += TEXT_DATA.seerDeath;
              } else if (playerData[i]['role'] == 'HUNTER') {
                storytext += TEXT_DATA.hunterDeath;
              } else if (playerData[i]['role'] == 'BEHOLDER') {
                storytext += TEXT_DATA.beholderDeath;
              } else if (playerData[i]['role'] == 'SHADE') {
                storytext += TEXT_DATA.shadeDeath;
              } else if (playerData[i]['role'] == 'HELLION') {
                storytext += TEXT_DATA.hellionDeath;
              } else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == true && playerData[i]['revealed'] == false) {
                storytext += TEXT_DATA.zombieDeathSuccess;
              } else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == true && playerData[i]['revealed'] == true) {
                storytext += TEXT_DATA.zombieDeathSuccessRevealed;
              } else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) {
                playerData[i]['revealed'] = true;
                storytext += TEXT_DATA.zombieDeathFailure;
                lynchFailed = true;
              } else if (playerData[i]['role'] == 'CELESTIAL' && playerData[i]['revealed'] == false) {
                playerData[i]['revealed'] = true;
                storytext += TEXT_DATA.celestialDeathFailure;
                lynchFailed = true;
              } else if (playerData[i]['role'] == 'CELESTIAL' && playerData[i]['revealed'] == true) {
                storytext += TEXT_DATA.celestialDeathFailureRevealed;
                lynchFailed = true;
              } else if (playerData[i]['role'] == 'ARCHDEMON' && playerData[i]['revealed'] == false) {
                playerData[i]['revealed'] = true;
                storytext += TEXT_DATA.archdemonDeathFailure;
                storytext = UTILITY.archdemonList(playerData, storytext);
                lynchFailed = true;
              } else if (playerData[i]['role'] == 'ARCHDEMON' && playerData[i]['revealed'] == true) {
                storytext += TEXT_DATA.archdemonDeathFailureRevealed;
                storytext = UTILITY.archdemonList(playerData, storytext);
                lynchFailed = true;
              } else if (playerData[i]['role'] == 'TECHIE') {
                storytext += TEXT_DATA.techieDeath;
              } else if (playerData[i]['role'] == 'CRYPTKEEPER') {
                storytext += TEXT_DATA.cryptkeeperDeath;
              } else if (playerData[i]['role'] == 'APPRENTICE') {
                storytext += TEXT_DATA.apprenticeDeath;
              } else if (playerData[i]['role'] == 'MAYOR') {
                storytext += TEXT_DATA.mayorDeath;
              } else if (playerData[i]['role'] == 'EXECUTIONER') {
                storytext += TEXT_DATA.executionerDeath;
              } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false && validSpectreTargets > 0) {
                storytext += TEXT_DATA.spectreDeathOriginal;
              } else if (playerData[i]['role'] == 'SPECTRE' && (playerData[i]['usedAbility'] == true || validSpectreTargets <= 0)) {
                storytext += TEXT_DATA.spectreDeathFinal;
              } else if (playerData[i]['role'] == 'MANTIS') {
                storytext += TEXT_DATA.mantisDeath;
              } else if (playerData[i]['role'] == 'JESTER') {
                storytext += TEXT_DATA.jesterDeath;
              } else if (playerData[i]['role'] == 'COURIER') {
                storytext += TEXT_DATA.courierDeath;
              } else if (playerData[i]['role'] == 'DUELIST') {
                storytext += TEXT_DATA.duelistDeath;
              } else if (playerData[i]['role'] == 'HAZMAT') {
                storytext += TEXT_DATA.hazmatDeath;
              } else if (playerData[i]['role'] == 'DRUNK') {
                storytext += TEXT_DATA.drunkDeath;
              } else if (playerData[i]['role'] == 'BONEWHEEL') {
                storytext += TEXT_DATA.bonewheelDeath;
              } else {
                storytext += TEXT_DATA.genericDeath;
              }

              // Lynch Succeed.
              if (lynchFailed == false) {
                playerData[i]['isDead'] = true;
                playerData[i]['dayOfDeath'] = gameData[0]['days'];
                playerData[i]['causeOfDeath'] = "LYNCHED";
                playerData[i]['marked'] = false;
                playerData[i]['protected'] = false;
                playerData[i]['infected'] = false;
                playerData[i]['revealed'] = true; // Reveal them.

                if (playerData[i]['bound'] == true) {
                  storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                }
                UTILITY.adjustPostDeath(playerData);
              }

              // Role Specific Effects
              if (playerData[i]['role'] == 'TECHIE') {
                storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
                UTILITY.adjustPostDeath(playerData);
              } else if (playerData[i]['role'] == 'HUNTER') {
                storytext = UTILITY.hunterShot(playerData, gameData, storytext);
                UTILITY.adjustPostDeath(playerData);
              } else if (playerData[i]['role'] == 'MANTIS') {
                storytext = UTILITY.mantisFight(playerData, gameData, lynchData, storytext, "LYNCHED");
                UTILITY.adjustPostDeath(playerData);
              } else if (playerData[i]['role'] == 'DRUNK') {
                storytext = UTILITY.drunkFight(playerData, gameData, lynchData, storytext, "LYNCHED");
                UTILITY.adjustPostDeath(playerData);
              } else if (playerData[i]['role'] == 'SPECTRE') {
                UTILITY.spectreHaunt(playerData, gameData);
              }
            }
          }

          // Post lynching - Check Moxie
          for (var i in playerData) {
            if (playerData[i]['role'] == 'DUELIST') {
              playerData[i]['moxie'] -= moxieMap[playerData[i]['name']];
              playerData[i]['moxie'] = Math.max(playerData[i]['moxie'], 0);
              if (playerData[i]['moxie'] <= 0 && playerData[i]['isDead'] == false && playerData[i]['winner'] != true) {
                playerData[i]['isDead'] = true;
                playerData[i]['dayOfDeath'] = gameData[0]['days'];
                playerData[i]['causeOfDeath'] = "SHAME";
                playerData[i]['marked'] = false;
                playerData[i]['protected'] = false;
                playerData[i]['infected'] = false;
                playerData[i]['revealed'] = true; // Reveal them.

                storytext += "With their moxie dwindling to yellow-belly levels, <@"+playerData[i]['slackid']+"> is unable to complete their duel and dies of SHAME.\n\n";
                if (playerData[i]['bound'] == true) {
                  storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                }
                UTILITY.adjustPostDeath(playerData);
              }
            }
          }

          // Post lynching - LET THE INFECTION SPREAD MOTHA FUCKA
          for (var i in playerData) {
            if (playerData[i]['infected'] == true && playerData[i]['isDead'] == false) {
              if (playerData[i]['role'] == 'CELESTIAL' || playerData[i]['role'] == "BONEWHEEL" || playerData[i]['role'] == "ARCHDEMON"|| (playerData[i]["role"] == "ZOMBIE" && playerData[i]['usedAbility'] == false)) {
                playerData[i]['revealed'] = true;
                storytext += "The "+playerData[i]['role']+" <@"+playerData[i]['slackid']+"> easily fights off the viral infection.\n\n";
              } else if(playerData[i]['role'] == 'HAZMAT' && playerData[i]['usedAbility'] == false) {
                playerData[i]['usedAbility'] = true;
                storytext += "Hidden within the town, the HAZMAT struggles to resist the infection, but manages to succeed for now.\n\n";
              } else {
                playerData[i]['isDead'] = true;
                playerData[i]['dayOfDeath'] = gameData[0]['days'];
                playerData[i]['causeOfDeath'] = "INFECTION";
                playerData[i]['marked'] = false;
                playerData[i]['protected'] = false;
                playerData[i]['infected'] = false;

                storytext += "<@"+playerData[i]['slackid']+"> suddenly falls to a dangerous viral infection.\n\n";
                if (playerData[i]['bound'] == true) {
                  storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                }
                UTILITY.adjustPostDeath(playerData);

                  // Role Specific Effects
                if (playerData[i]['role'] == 'TECHIE') {
                  storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
                  UTILITY.adjustPostDeath(playerData);
                } else if (playerData[i]['role'] == 'HUNTER') {
                  storytext = UTILITY.hunterShot(playerData, gameData, storytext);
                  UTILITY.adjustPostDeath(playerData);
                } else if (playerData[i]['role'] == 'MANTIS') {
                  storytext = UTILITY.mantisFight(playerData, gameData, lynchData, storytext, "INFECTION");
                  UTILITY.adjustPostDeath(playerData);
                } else if (playerData[i]['role'] == 'DRUNK') {
                  storytext = UTILITY.drunkFight(playerData, gameData, lynchData, storytext, "INFECTION");
                  UTILITY.adjustPostDeath(playerData);
                } else if (playerData[i]['role'] == 'SPECTRE') {
                  UTILITY.spectreHaunt(playerData, gameData);
                }
              }
            }
          }


          // CHECK WIN CONDITIONS
          if (UTILITY.checkWinConditions(playerData, storytext) == true) {
            commitDataChanges(playerData, lynchData, feastData, gameData);
            // UTILITY.createPINPost(storytext); //Done inside the checkWinConditionsFunction

            // Wait for data changes to commit then shut down.
            setTimeout(function(){
              shutdownGame();
            }, 5000);
            return;
          }

          /* Count out the feast votes */
          currentMax = -1;  // re-use this var
          var feastMap = {};
          for (var i = 0; i < feastData.length; ++i) {
            if (feastData[i]['victim'] != null) {
              if (feastMap[feastData[i]['victim']] === undefined) {
                feastMap[feastData[i]['victim']] = 1;
              } else {
                feastMap[feastData[i]['victim']] += 1;
              }
            }
          }
          /* Loop through feast votes, determine who gets feasted. */
          for (var key in feastMap) {
            if (feastMap.hasOwnProperty(key)) {
              if (feastMap[key] > currentMax) {
                tie = false;
                feastedPerson = key;
                currentMax = feastMap[key];
              } else if (feastMap[key] == currentMax) {
                tie = true;
                feastedPerson = null;
              }
            }
          }
          console.log("FEASTED PERSON: "+feastedPerson+"\nCURRENT_MAX: "+currentMax);
          if (tie == true && currentMax != -1) {
            storytext += "In the night the monsters could not agree on who to devour and ended up eating nobody.\n\n";
          }
          /* If an eligible feasting happens, update their document. */
          for (var i in playerData) {
            if (playerData[i]['name'] == feastedPerson && playerData[i]['protected'] == true && playerData[i]['isDead'] == false){
              storytext += "In the night the monsters attempted to devour someone, but a shimmering holy light repelled them from consuming their desired meal.\n\n";
              for (var j in playerData) {
                if (playerData[j]['role'] == 'PALADIN') {
                  playerData[j]['usedAbility'] = true;
                  playerData[j]['winner'] = true;
                }
              }
              UTILITY.adjustPostDeath(playerData);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == 'PALADIN' && playerData[i]['protected'] == false && playerData[i]['isDead'] == false) {
              exorcismHappened = false;
              for (var j in playerData) {
                if (MONSTER_ROLES.includes(playerData[j]['role']) && playerData[j]['protected'] == true && playerData[i]['isDead'] == false) {
                  if (playerData[j]['role'] != 'ARCHDEMON') {
                    exorcismHappened = true;
                    playerData[i]['isDead'] = true;
                    playerData[i]['dayOfDeath'] = gameData[0]['days'];
                    playerData[i]['causeOfDeath'] = "EATEN";
                    playerData[i]['marked'] = false;
                    playerData[i]['revealed'] = true;
                    playerData[i]['protected'] = false;
                    playerData[i]['infected'] = false;
                    playerData[i]['winner'] = true;

                    playerData[j]['isDead'] = true;
                    playerData[j]['dayOfDeath'] = gameData[0]['days'];
                    playerData[j]['causeOfDeath'] = "PURGED";
                    playerData[j]['marked'] = false;
                    playerData[j]['protected'] = false;
                    playerData[j]['infected'] = false;
                    storytext += "During the night the monsters managed to slay <@"+playerData[i]['slackid']+">, but it appears the monster <@"+playerData[j]['slackid']+"> was destroyed by a holy blessing in the process.\n\n";
                    if (playerData[i]['bound'] == true || playerData[j]['bound'] == true) {
                      storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                    }
                    UTILITY.adjustPostDeath(playerData);
                  } else {
                    exorcismHappened = true;
                    playerData[i]['isDead'] = true;
                    playerData[i]['dayOfDeath'] = gameData[0]['days'];
                    playerData[i]['causeOfDeath'] = "EATEN";
                    playerData[i]['marked'] = false;
                    playerData[i]['revealed'] = true;
                    playerData[i]['protected'] = false;
                    playerData[i]['infected'] = false;
                    if (playerData[j]['revealed'] != true) {
                      playerData[i]['winner'] = true;
                    }

                    playerData[j]['revealed'] = true;
                    storytext += "During the night the monsters managed to slay <@"+playerData[i]['slackid']+">. A fierce battle ensued, however the Archdemon <@"+playerData[j]['slackid']+"> resisted any attempts at being purged.\n\n";
                    if (playerData[i]['bound'] == true) {
                      storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                    }
                    UTILITY.adjustPostDeath(playerData);
                  }
                }
              }
              if (exorcismHappened == false) {
                playerData[i]['isDead'] = true;
                playerData[i]['dayOfDeath'] = gameData[0]['days'];
                playerData[i]['causeOfDeath'] = "EATEN";
                playerData[i]['marked'] = false;
                playerData[i]['protected'] = false;
                playerData[i]['infected'] = false;
                storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
                if (playerData[i]['bound'] == true) {
                  storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
                }
                UTILITY.adjustPostDeath(playerData);
              }
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == 'CELESTIAL' && playerData[i]['isDead'] == false) {
              storytext += "The monsters attempted to eat <@"+playerData[i]['slackid']+"> but were unable to cause any harm, revealing them to be the CELESTIAL!\n\n";
              playerData[i]['revealed'] = true;
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == 'CURSED' && playerData[i]['isDead'] == false) {
              if (gameData[0]['days'] == 1 || gameData[0]['days'] == 2) {
                playerData[i]['role'] = 'HELLION';
              } else {
                playerData[i]['role'] = 'IMP';
              }
              storytext += "In the night the monsters discovered a CURSED villager and who transformed into a "+playerData[i]['role']+".\n\n";
              UTILITY.sendPrivateMessage("Your role has changed! Use `/townrole` for more information.", playerData[i]['slackid']);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == 'TECHIE' && playerData[i]['isDead'] == false) {
              storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
              playerData[i]['isDead'] = true;
              playerData[i]['dayOfDeath'] = gameData[0]['days'];
              playerData[i]['causeOfDeath'] = "EATEN";
              playerData[i]['marked'] = false;
              playerData[i]['protected'] = false;
              playerData[i]['infected'] = false;
              if (playerData[i]['bound'] == true) {
                storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
              }
              storytext = UTILITY.techieDetonation(playerData, gameData, storytext);
              UTILITY.adjustPostDeath(playerData);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == 'HUNTER' && playerData[i]['isDead'] == false) {
              storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
              playerData[i]['isDead'] = true;
              playerData[i]['dayOfDeath'] = gameData[0]['days'];
              playerData[i]['causeOfDeath'] = "EATEN";
              playerData[i]['marked'] = false;
              playerData[i]['protected'] = false;
              playerData[i]['infected'] = false;
              if (playerData[i]['bound'] == true) {
                storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
              }
              storytext = UTILITY.hunterShot(playerData, gameData, storytext);
              UTILITY.adjustPostDeath(playerData);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == "MANTIS" && playerData[i]['isDead'] == false) {
              storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
              playerData[i]['isDead'] = true;
              playerData[i]['dayOfDeath'] = gameData[0]['days'];
              playerData[i]['causeOfDeath'] = "EATEN";
              playerData[i]['marked'] = false;
              playerData[i]['protected'] = false;
              playerData[i]['infected'] = false;
              if (playerData[i]['bound'] == true) {
                storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
              }
              storytext = UTILITY.mantisFight(playerData, gameData, lynchData, storytext, "EATEN");
              UTILITY.adjustPostDeath(playerData);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] == "DRUNK" && playerData[i]['isDead'] == false) {
              storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
              playerData[i]['isDead'] = true;
              playerData[i]['dayOfDeath'] = gameData[0]['days'];
              playerData[i]['causeOfDeath'] = "EATEN";
              playerData[i]['marked'] = false;
              playerData[i]['protected'] = false;
              playerData[i]['infected'] = false;
              if (playerData[i]['bound'] == true) {
                storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
              }
              storytext = UTILITY.drunkFight(playerData, gameData, lynchData, storytext, "EATEN");
              UTILITY.adjustPostDeath(playerData);
            } else if (playerData[i]['name'] == feastedPerson && playerData[i]['role'] != 'CURSED' && playerData[i]['isDead'] == false && !MONSTER_ROLES.includes(playerData[i]['role'])) {
              storytext += "In the morning. . . the body of <@"+playerData[i]['slackid']+"> is found, mauled by monsters.\n\n";
              playerData[i]['isDead'] = true;
              playerData[i]['dayOfDeath'] = gameData[0]['days'];
              playerData[i]['causeOfDeath'] = "EATEN";
              playerData[i]['marked'] = false;
              playerData[i]['protected'] = false;
              playerData[i]['infected'] = false;
              if (playerData[i]['bound'] == true) {
                storytext = UTILITY.archdemonDeath(playerData, gameData, storytext);
              }
              UTILITY.adjustPostDeath(playerData);
            }
          }

          // CHECK WIN CONDITIONS
          if (UTILITY.checkWinConditions(playerData, storytext) == true) {
            commitDataChanges(playerData, lynchData, feastData, gameData);
            // UTILITY.createPINPost(storytext); //Done inside the checkWinConditionsFunction

            // Wait for data changes to commit then shut down.
            setTimeout(function(){
              shutdownGame();
            }, 5000);
            return;
          }

          // Reset powers, lynching votes, ghoul votes, protection etc
          for (var i = 0; i < playerData.length; ++i) {
            // hellion, assassin, paladin, zombie, archdemon and bonewheel do not reset like normal.
            if (!["HELLION", "ASSASSIN", "PALADIN", "ZOMBIE", "SPECTRE", "ARCHDEMON", "HAZMAT", "BONEWHEEL"].includes(playerData[i]['role'])) {
              playerData[i]['usedAbility'] = false;
            }
            // de-protect the PALADIN
            if (playerData[i]['role'] == 'PALADIN') {
              playerData[i]['protected'] = false;
            }

            // re-infect the HAZMAT
            if (playerData[i]['role'] == 'HAZMAT' && playerData[i]['isDead'] == false) {
              playerData[i]['infected'] = true;
            } else {
              playerData[i]['infected'] = false;
            }
          }
          for (var i = 0; i < lynchData.length; ++i) {
            lynchData[i]['target'] = null;
          }
          for (var i = 0; i < feastData.length; ++i) {
            feastData[i]['victim'] = null;
          }

          // Start of day 3. . . Techie win needs checking. . .
          // Start of day 3. . . Beholder win needs checking. . .
          if (gameData[0]['days'] == 2) {
            for (var i in playerData) {
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'TECHIE') {
                playerData[i]['winner'] = true;
              }
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'BEHOLDER') {
                playerData[i]['winner'] = true;
              }
            }
          }
          // Start of day 4. . . CURSED becomes CELESTIAL. . .
          if (gameData[0]['days'] == 3) {
            for (var i in playerData) {
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'CURSED') {
                playerData[i]['role'] = 'CELESTIAL';
                //storytext += 'Somewhere in the town, a powerful curse is broken. . .\n';
              }
            }
          }

          // Start of day 2 and 4 assassin notice. . .
          if (gameData[0]['days'] == 1 || gameData[0]['days'] == 3) {
            for (var i in playerData) {
              if(playerData[i]['isDead'] == false && playerData[i]['role'] == 'ASSASSIN' && playerData[i]['winner'] == false) {
                //storytext += 'Hidden amongst the innocent townfolk, an ASSASSIN prepares to strike. . .\n';
                assassinMessage = "You have gained your Assassination ability!\n\n";
                assassinMessage+= "Use `/townability @target` to kill someone instantly.";
                UTILITY.sendPrivateMessage(assassinMessage, playerData[i]['slackid']);
              }
            }
          }

          // if the drunk died tonight - restart the websocket so as to facilitate them not dying again
          for (var i in playerData) {
            if (playerData[i]['role'] == 'DRUNK' && playerData[i]['isDead'] == true && playerData[i]['dayOfDeath'] == gameData[0]['days']) {
              WEB_SOCKET.close(1000, "Drunk is now dead.");
              openWebSocket();
            }
          }

          //game days ++
          gameData[0]['days'] += 1;

          //Ending
          commitDataChanges(playerData, lynchData, feastData, gameData);

          // Print the story text to slack
          if (storytext == '') {
            storytext = "In a complete surprise to all residents, nothing of note happened in The Town tonight.";
          }

          UTILITY.createPINPost(storytext);
          console.log(storytext);
      }); // Then Function End Bracket
    }); // Scheduler Loop  End Bracket
  }); // Then Function End Bracket
}

function commitDataChanges(playerData, lynchData, feastData, gameData) {
  /* Commit all the updated documents to the database. */
  for (var i = 0; i < playerData.length; ++i) {
    /* As a note; it does not matter if these are synchronous. */
    Player.update({name:playerData[i]['name']}, {$set: {
      slackid: playerData[i]['slackid'],
      role: playerData[i]['role'],
      fakerole: playerData[i]['fakerole'],
      isDead: playerData[i]['isDead'],
      usedAbility: playerData[i]['usedAbility'],
      revealed: playerData[i]['revealed'],
      protected: playerData[i]['protected'],
      marked: playerData[i]['marked'],
      target: playerData[i]['target'],
      mail: playerData[i]['mail'],
      bound: playerData[i]['bound'],
      moxie: playerData[i]['moxie'],
      infected: playerData[i]['infected'],
      winner: playerData[i]['winner'],
      commandCount: playerData[i]['commandCount'],
      voteCount: playerData[i]['voteCount'],
      dayOfDeath: playerData[i]['dayOfDeath'],
      causeOfDeath: playerData[i]['causeOfDeath'],
      loveSent: playerData[i]['loveSent'],
      loveReceived: playerData[i]['loveReceived'],
      initialRole: playerData[i]['initialRole']
    }}, {upsert: false}).exec(function (err, result) {
      if (err) console.log(err);
    });
  }
  for (var i = 0; i < lynchData.length; ++i) {
    /* As a note; it does not matter if these are synchronous. */
    Lynch.update({voter:lynchData[i]['voter']}, {$set: {
      target: lynchData[i]['target']
    }}, {upsert: false}).exec(function (err, result) {
      if (err) console.log(err);
    });
  }
  for (var i = 0; i < feastData.length; ++i) {
    /* As a note; it does not matter if these are synchronous. */
    Feast.update({ghoul:feastData[i]['ghoul']}, {$set: {
      victim: feastData[i]['victim']
    }}, {upsert: false}).exec(function (err, result) {
      if (err) console.log(err);
    });
  }
  for (var i = 0; i < gameData.length; ++i) {
    /* As a note; it does not matter if these are synchronous. */
    Game.update({}, {$set: {
      active: gameData[i]['active'],
      days: gameData[i]['days'],
      distribution: gameData[i]['distribution']
    }}, {upsert: false}).exec(function (err, result) {
      if (err) console.log(err);
    });
  }
}

function shutdownGame() {
  SCHEDULER.cancel();
  Lynch.remove({}, function(err) {
   console.log('Lynches removed');
  });
  Feast.remove({}, function(err) {
   console.log('Feasts removed');
  });
  Player.find({}, function(err, result) {
    /* MAKE STATS */
    var vetoData = null;
    var survivorCount = 0;
    var monsterLived = false;
    if (MAKE_STATS) {
      Veto.find({}, 'voter mapNumber', { multi: true }, function(err){
        console.log("Obtained game data.");
      }).then(function(cb){
        vetoData = cb;
      }).then(function(cb){
        for (var i in result) {
          if (result[i]['isDead'] == false) {
            survivorCount += 1;
            if (MONSTER_ROLES.includes(result[i]['role'])) {
              monsterLived = true;
            }
          }
          vetoVoteResult = "N/A";
          for (var j in vetoData) {
            if (vetoData[j]['voter'] == result[i]['name'] && vetoData[j]['mapNumber'] != null) {
              vetoVoteResult = DISTRIBUTION.name(parseInt(vetoData[j]['mapNumber']));
            }
          }
          Stat.create({
            name: result[i]['name'],
            role: result[i]['role'],
            season: SEASON,
            winner: result[i]['winner'],
            dayOfDeath: result[i]['dayOfDeath'],
            causeOfDeath: result[i]['causeOfDeath'],
            initialRole: result[i]['initialRole'],
            vetoVote: vetoVoteResult,
            commandCount: result[i]['commandCount'],
            voteCount: result[i]['voteCount'],
            loveSent: result[i]['loveSent'],
            loveReceived: result[i]['loveReceived'],
            target: result[i]['target'],
            bound: result[i]['bound'],
            mail: result[i]['mail']
          }, function(e, doccc){
            if (e) {
              console.log('Stat Error: '+e);
            }
          });
        }
      }).then(function(cb){
        victoryType = "";
        if (survivorCount == 0) {
          victoryType = "CATASTROPHE";
        } else if (survivorCount == 1) {
          victoryType = "SOLE SURVIVOR";
        } else if (survivorCount > 1 && !monsterLived) {
          victoryType = "TOWN VICTORY";
        } else if (survivorCount > 1 && monsterLived) {
          victoryType = "MONSTER VICTORY";
        }
        Game.find({}, "distribution days", {multi: true}, function(err, res){
          selectedMap = res[0]['distribution'];
          gameDuration = res[0]['days'];
          MapStat.create({
            name: selectedMap,
            season: SEASON,
            result: victoryType,
            duration: gameDuration,
          }, function(e, doccc){
            if (e) {
              console.log('Map Stat Error: '+e);
            }
          });
        });
      });
    }

    /* POST SPOILERS */
    finalResult = "*FINAL REVEAL:* \n```";
    for (var i in result) {
      if (result[i]['initialRole'] == result[i]['role']) {
        finalResult += result[i]['name'] + ": (" + result[i]['role'] + ")";
      } else {
        finalResult += result[i]['name'] + ": (" + result[i]['initialRole'] + " -> " + result[i]['role'] + ")";
      }
      if (result[i]['winner'] == true) {
        finalResult += ' (WINNER)';
        UTILITY.sendPrivateMessage("<@"+result[i]['slackid']+"> Congratulations for winning this season of <#"+process.env.CHANNEL_ID+">! :bigglesworth:", result[i]['slackid']);
      }
      if (result[i]['role'] == "DUELIST") {
        finalResult += ' [MOXIE: '+result[i]['moxie']+']';
      }
      if (result[i]['target'] == true) {
        finalResult += ' [TARGET]';
      }
      if (result[i]['bound'] == true) {
        finalResult += ' [SOUL-BOUND]';
      }
      if (result[i]['mail'] == true) {
        finalResult += ' [RECEIVED MAIL]';
      }
      if (i < result.length - 1) {
        finalResult += '\n';
      }
    }
    finalResult += '```';
    UTILITY.createPINPost(finalResult);

    setTimeout(function(){
      Player.remove({}, function(err) {
       console.log('Players removed');
      });
      Scan.remove({}, function(err) {
       console.log('Targets removed');
      });
      Game.find({}, "distribution season days", {multi: true}, function(err, res){
        console.log("Obtained game data."+res.length);
        Game.findOneAndUpdate({}, {active : false, distribution: "RANDOM", previous: res[0]['distribution'], $inc: { season: 1}}, {upsert: true}, function (err, doc) {
          console.log("GAME_ACTIVE = false");
          GAME_ACTIVE = false;
        });
      });
      Veto.remove({}, function(err) {
       console.log('Vetoes removed');
      });
      GAME_ACTIVE = false;
    }, 20000);
    return;
  });
}
