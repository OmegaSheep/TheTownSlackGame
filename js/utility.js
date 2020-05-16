var request = require('request');
var DISTRIBUTION = require('./distribution.js');
var EMOJI_DATA = require('./emojiMap.js');
var STRATEGY_DATA = require('./strategyMap.js');

module.exports = {
    slackpost: function slackpost(text) {
    request({
      url: process.env.ANNOUNCEHOOK,
      method: "POST",
      json: true,   // <--Very important!!!
      body: {'text':text}
    }, function (error, response, body){
        console.log(response);
       }
    );
  },
  bugpost: function bugpost(text) {
    request({
      url: process.env.BUGHOOK,
      method: "POST",
      json: true,   // <--Very important!!!
      body: {'text':text}
    }, function (error, response, body){
        console.log(response);
       }
    );
  },
  shuffleArray: function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  },
  adjustPostDeath: function adjustPostDeath(playerData) {
    var seerDead = false;
    var foolDead = false;
    // Remove all blessings if Paladin is dead
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'PALADIN') {
        if (playerData[i]['usedAbility'] == true || playerData[i]['isDead'] == true) {
          for (var j in playerData) {
            playerData[j]['protected'] = false;
          }
        }
      }
      // Make Zombie vulnerable if Lich is dead
      if (playerData[i]['role'] == 'LICH' && playerData[i]['isDead'] == true) {
        for (var j = 0; j < playerData.length; ++j) {
          if (playerData[j]['role'] == 'ZOMBIE') {
            playerData[j]['usedAbility'] = true;
          }
        }
      }
      // Hazmat dead? Remove infections
      if (playerData[i]['role'] == 'HAZMAT' && playerData[i]['isDead'] == true) {
        for (var j in playerData) {
          playerData[j]['infected'] = false;
        }
      }
      // Dead seer? Make apprentice great again.
      if (playerData[i]['role'] == 'SEER' && playerData[i]['isDead'] == true) {
        seerDead = true;
      }
      // Dead fool? Make apprentice not so great again.
      if (playerData[i]['role'] == 'FOOL' && playerData[i]['isDead'] == true) {
        foolDead = true;
      }
    }
    if (seerDead) {
      for (var j = 0; j < playerData.length; ++j) {
        if (playerData[j]['role'] == 'APPRENTICE' && playerData[j]['isDead'] == false) {
          playerData[j]['role'] = 'SEER';
          playerData[j]['fakerole'] = 'FOOL';
          module.exports.sendPrivateMessage("Your role has changed! Use `/townrole` for more information.", playerData[j]['slackid']);
        }
      }
    } else if (foolDead && !seerDead) {
      for (var j = 0; j < playerData.length; ++j) {
        if (playerData[j]['role'] == 'APPRENTICE' && playerData[j]['isDead'] == false) {
          playerData[j]['role'] = 'FOOL';
          playerData[j]['fakerole'] = 'SEER';
          module.exports.sendPrivateMessage("Your role has changed! Use `/townrole` for more information.", playerData[j]['slackid']);
        }
      }
    }
  },
  techieDetonation: function techieDetonation(playerData, gameData, storytext) {
    //module.exports.bugpost("Techie detonator called.");
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'TECHIE') {
        playerData[i]['revealed'] = true;
      }

      // Safety check for that weird double explosion bug. . .
      if (playerData[i]['causeOfDeath'] == 'DETONATED') {
        return storytext;
      }
    }
    spectreCheck = false;
    boundCheck = false;
    storytext += "Suddenly an explosion ripples through the town with a thundering crash of fire and gunpowder! ";
    module.exports.shuffleArray(playerData);
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['isDead'] == false) {
        if (playerData[i]['role'] != 'CELESTIAL' && playerData[i]['role'] != 'ARCHDEMON' && playerData[i]['role'] != 'BONEWHEEL') {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "DETONATED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          storytext += "<@"+playerData[i]['slackid']+"> perishes in the flames, ";
          if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            spectreCheck = true;
          }
          if (playerData[i]['bound'] == true) {
            boundCheck = true;
          }
        } else {
          if (playerData[i]['revealed'] == true) {
            storytext += "<@"+playerData[i]['slackid']+"> emerges unscathed, however ";
          } else {
            playerData[i]['revealed'] = true;
            storytext += "<@"+playerData[i]['slackid']+"> emerges unscathed revealing they are the "+playerData[i]['role']+", however ";
          }
        }
        break;
      }
    }
    module.exports.shuffleArray(playerData);
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['isDead'] == false) {
        if (playerData[i]['role'] != 'CELESTIAL' && playerData[i]['role'] != 'ARCHDEMON' && playerData[i]['role'] != 'BONEWHEEL') {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "DETONATED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          storytext += "<@"+playerData[i]['slackid']+"> does not survive the destruction.\n\n";
          if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            spectreCheck = true;
          }
          if (playerData[i]['bound'] == true) {
            boundCheck = true;
          }
        } else {
          if (playerData[i]['revealed'] == true) {
            storytext += "however <@"+playerData[i]['slackid']+"> emerges unscathed.\n\n";
          } else {
            playerData[i]['revealed'] = true;
            storytext += "however <@"+playerData[i]['slackid']+"> emerges unscathed revealing they are the "+playerData[i]['role']+"!\n\n";
          }
        }
        break;
      }
    }
    if (spectreCheck == true) {
      module.exports.spectreHaunt(playerData, gameData);
    }
    if (boundCheck == true) {
      storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
    }
    return storytext;
  },
  hunterShot: function hunterShot(playerData, gameData, storytext) {
    shotFired = false;
    shotIndex = -1;
    hunterIndex = -1;
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['marked'] == true && playerData[i]['isDead'] == false) {
        shotFired = true;
        shotIndex = i;
      }
      if (playerData[i]['role'] == 'HUNTER') {
        hunterIndex = i;
      }
      // Safety check for that weird double shot bug. . .
      if (playerData[i]['causeOfDeath'] == 'SHOT') {
        return storytext;
      }
    }
    if (shotFired) {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'HUNTER') {
          playerData[i]['revealed'] = true;
        }
      }
      if (playerData[shotIndex]['role'] == 'CELESTIAL') {
        playerData[shotIndex]['revealed'] = true;
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+">, but they shrug it off revealing they are the CELESTIAL!\n\n";
      } else if (playerData[shotIndex]['role'] == 'ZOMBIE' && playerData[shotIndex]['usedAbility'] == false) {
        playerData[shotIndex]['revealed'] = true;
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+">, but they remain un-phased revealing they are a ZOMBIE!\n\n";
      } else if (playerData[shotIndex]['role'] == 'BONEWHEEL') {
        playerData[shotIndex]['revealed'] = true;
        storytext += "During the commotion of the nights events, an arrow flies ineffectively through <@"+playerData[shotIndex]['slackid']+">, revealing they are just a BONEWHEEL skeleton!\n\n";
      } else if (playerData[shotIndex]['role'] == 'TECHIE'){
        playerData[shotIndex]['isDead'] = true;
        playerData[shotIndex]['dayOfDeath'] = gameData[0]['days'];
        playerData[shotIndex]['causeOfDeath'] = "SHOT";
        playerData[shotIndex]['marked'] = false;
        playerData[shotIndex]['protected'] = false;
        playerData[shotIndex]['infected'] = false;
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+"> killing them on the spot.\n\n";
        storytext = module.exports.techieDetonation(playerData, gameData, storytext);
      } else if (playerData[shotIndex]['role'] == 'SPECTRE' && playerData[shotIndex]['usedAbility'] == false){
        playerData[shotIndex]['isDead'] = true;
        playerData[shotIndex]['dayOfDeath'] = gameData[0]['days'];
        playerData[shotIndex]['causeOfDeath'] = "SHOT";
        playerData[shotIndex]['marked'] = false;
        playerData[shotIndex]['protected'] = false;
        playerData[shotIndex]['infected'] = false;
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+"> killing them on the spot.\n\n";
        module.exports.spectreHaunt(playerData, gameData);
      } else if (playerData[shotIndex]['role'] == 'ARCHDEMON') {
        playerData[shotIndex]['revealed'] = true;
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+">, but they shrug it off revealing they are the ARCHDEMON!\n\n";
      } else {
        playerData[shotIndex]['isDead'] = true;
        playerData[shotIndex]['dayOfDeath'] = gameData[0]['days'];
        playerData[shotIndex]['causeOfDeath'] = "SHOT";
        playerData[shotIndex]['marked'] = false;
        playerData[shotIndex]['protected'] = false;
        playerData[shotIndex]['infected'] = false;

        // Shot a monster? You win bro.
        if (module.exports.MONSTER_ROLES.includes(playerData[shotIndex]['role']) && playerData[shotIndex]['isDead'] == true) {
          playerData[hunterIndex]['winner'] = true;
        }
        storytext += "During the commotion of the nights events, an arrow finds its mark in the chest of <@"+playerData[shotIndex]['slackid']+"> killing them on the spot.\n\n";

        if (playerData[shotIndex]['bound'] == true && playerData[shotIndex]['isDead'] == true) {
          playerData[hunterIndex]['winner'] = true;
          storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
        }
      }
    }
    return storytext;
  },
  spectreHaunt: function spectreHaunt(playerData, gameData, storytext) {
    //module.exports.bugpost("Spectre haunt called.");

    // Safety check for that weird double haunt bug. . .
    spectreCount = 0;
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'SPECTRE') {
        spectreCount += 1;
      }
    }
    if (spectreCount > 1) {
      return;
    }

    module.exports.shuffleArray(playerData);
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'VILLAGER' && playerData[i]['isDead'] == false && playerData[i]['bound'] == false) {
        playerData[i]['usedAbility'] = true;
        playerData[i]['role'] = 'SPECTRE';
        module.exports.sendPrivateMessage("Your role has changed! Use `/townrole` for more information.", playerData[i]['slackid']);
        break;
      }
    }
  },
  archdemonDeath: function archdemonDeath(playerData, gameData, storytext) {
    boundName = "";
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['bound'] == true) {
        boundName = "<@"+playerData[i]['slackid']+">";
      }
    }
    // Kill them!
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'ARCHDEMON') {
        playerData[i]['revealed'] = true;
        playerData[i]['isDead'] = true;
        playerData[i]['dayOfDeath'] = gameData[0]['days'];
        playerData[i]['causeOfDeath'] = "BANISHED";
        playerData[i]['marked'] = false;
        playerData[i]['protected'] = false;
        playerData[i]['infected'] = false;
        storytext += "With "+boundName+" now dead, the Archdemon <@"+playerData[i]['slackid']+"> lacks a tether to the mortal plane, and is banished in an instant!\n\n";
      }
    }
    return storytext;
  },
  archdemonList: function archdemonList(playerData, storytext) {
    nameList = [];
    textAdd = "```"
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['bound'] == true) {
        nameList.push(playerData[i]['name']);
      }
    }
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['isDead'] == false && playerData[i]['role'] != 'ARCHDEMON' && nameList.length < 3) {
        nameList.push(playerData[i]['name']);
      }
    }
    module.exports.shuffleArray(nameList);
    for (var i = 0; i < nameList.length; ++i) {
      textAdd += nameList[i];
      if (i < nameList.length - 1) {
        textAdd += "\n";
      }
    }
    textAdd += "```\n";
    storytext += textAdd;
    return storytext;
  },
  mantisFight: function mantisFight(playerData, gameData, lynchData, storytext, cause) {
    // Reveal the Mantis
    mantisName = "";
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'MANTIS') {
        playerData[i]['revealed'] = true;
        mantisName = playerData[i]['name'];
      }
      // Safety check for that weird double scuffle bug. . .
      if (playerData[i]['causeOfDeath'] == 'SCUFFLED') {
        return storytext;
      }
    }
    module.exports.shuffleArray(playerData);

    // WHO DID THIS?!
    if (cause == 'LYNCHED') {
      mantisHaters = [];
      for (var i = 0; i < lynchData.length; ++i) {
        if (lynchData[i]['target'] == mantisName) {
          mantisHaters.push(lynchData[i]['voter']);
        }
      }
      for (var i = 0; i < playerData.length; ++i) {
        if (mantisHaters.includes(playerData[i]['name']) && playerData[i]['isDead'] == false) {
          if (playerData[i]['role'] == 'CELESTIAL' || playerData[i]['role'] == 'ARCHDEMON' || playerData[i]['role'] == 'BONEWHEEL') {
            playerData[i]['revealed'] = true;
            storytext += "The Mantis flies into a rage and strikes <@"+playerData[i]['slackid']+"> before being taken back to the gallows. It appears this attack failed to inflict signifcant harm to the "+playerData[i]['role']+".\n\n";
          } else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['revealed'] = true;
            storytext += "The Mantis flies into a rage and decapitates <@"+playerData[i]['slackid']+"> before being taken back to the gallows. But the ZOMBIE promptly re-attachs its head revealing its true nature!\n\n";
          } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Mantis flies into a rage and decapitates <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
            module.exports.spectreHaunt(playerData, gameData);
          } else if (playerData[i]['role'] == 'HUNTER') {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Mantis flies into a rage and decapitates <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            storytext = module.exports.hunterShot(playerData, gameData, storytext);
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          } else if (playerData[i]['role'] == 'TECHIE') {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Mantis flies into a rage and decapitates <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            storytext = module.exports.techieDetonation(playerData, gameData, storytext);
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          } else {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Mantis flies into a rage and decapitates <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          }
          break;
        }
      }
    } else if (cause == 'EATEN') {
      for (var i = 0; i < playerData.length; ++i) {
        if (module.exports.MONSTER_ROLES.includes(playerData[i]['role']) && playerData[i]['isDead'] == false) {
          if ((playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) || playerData[i]['role'] == 'ARCHDEMON' || playerData[i]['role'] == 'BONEWHEEL') {
            playerData[i]['revealed'] = true;
            storytext += "It appears the fallen Mantis tried to decapitate <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault, but they survived on account of being the "+playerData[i]['role']+"!\n\n";
          } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "It appears the fallen Mantis decapitated <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
            module.exports.spectreHaunt(playerData, gameData);
          } else {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "It appears the fallen Mantis decapitated <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          }
          break;
        }
      }
    } else if (cause == 'ASSASSINATED') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'ASSASSIN' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "Only feigning death, the Mantis lashes out in a surprise strike and kills <@"+playerData[i]['slackid']+"> before succumbing to its wounds.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    } else if (cause == 'INCINERATED') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'HELLION' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "However the burning Mantis managed to lash out and kill <@"+playerData[i]['slackid']+"> before succumbing to the fire.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    } else if (cause == 'INFECTION') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'HAZMAT' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "However the weakened Mantis managed to lash out and kill <@"+playerData[i]['slackid']+"> before succumbing to the virus.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    }
    return storytext;
  },
  drunkFight: function drunkFight(playerData, gameData, lynchData, storytext, cause) {
    // Reveal the Drunk
    drunkName = "";
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['role'] == 'DRUNK') {
        playerData[i]['revealed'] = true;
        drunkName = playerData[i]['name'];
      }
      // Safety check for that weird double scuffle bug. . .
      if (playerData[i]['causeOfDeath'] == 'SCUFFLED') {
        return storytext;
      }
    }
    module.exports.shuffleArray(playerData);

    // WHO DID THIS?!
    if (cause == 'LYNCHED') {
      drunkHaters = [];
      for (var i = 0; i < lynchData.length; ++i) {
        if (lynchData[i]['target'] == drunkName) {
          drunkHaters.push(lynchData[i]['voter']);
        }
      }
      for (var i = 0; i < playerData.length; ++i) {
        if (drunkHaters.includes(playerData[i]['name']) && playerData[i]['isDead'] == false) {
          if (playerData[i]['role'] == 'CELESTIAL' || playerData[i]['role'] == 'ARCHDEMON' || playerData[i]['role'] == 'BONEWHEEL') {
            playerData[i]['revealed'] = true;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows. It appears this attack failed to inflict signifcant harm to the "+playerData[i]['role']+".\n\n";
          } else if (playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['revealed'] = true;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows. But the ZOMBIE promptly recovers, revealing its true nature!\n\n";
          } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
            module.exports.spectreHaunt(playerData, gameData);
          } else if (playerData[i]['role'] == 'HUNTER') {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            storytext = module.exports.hunterShot(playerData, gameData, storytext);
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          } else if (playerData[i]['role'] == 'TECHIE') {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            storytext = module.exports.techieDetonation(playerData, gameData, storytext);
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          } else {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "The Drunk smashes fist first into <@"+playerData[i]['slackid']+"> before being taken back to the gallows.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          }
          break;
        }
      }
    } else if (cause == 'EATEN') {
      for (var i = 0; i < playerData.length; ++i) {
        if (module.exports.MONSTER_ROLES.includes(playerData[i]['role']) && playerData[i]['isDead'] == false) {
          if ((playerData[i]['role'] == 'ZOMBIE' && playerData[i]['usedAbility'] == false) || playerData[i]['role'] == 'ARCHDEMON' || playerData[i]['role'] == 'BONEWHEEL') {
            playerData[i]['revealed'] = true;
            storytext += "It appears the fallen Mantis tried to decapitate <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault, but they survived on account of being the "+playerData[i]['role']+"!\n\n";
          } else if (playerData[i]['role'] == 'SPECTRE' && playerData[i]['usedAbility'] == false) {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "It appears the fallen Drunk managed to beat up <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
            module.exports.spectreHaunt(playerData, gameData);
          } else {
            playerData[i]['isDead'] = true;
            playerData[i]['dayOfDeath'] = gameData[0]['days'];
            playerData[i]['causeOfDeath'] = "SCUFFLED";
            playerData[i]['marked'] = false;
            playerData[i]['protected'] = false;
            playerData[i]['infected'] = false;
            storytext += "It appears the fallen Drunk managed to beat up <@"+playerData[i]['slackid']+"> before succumbing to the monsters assault.\n\n";
            if (playerData[i]['bound'] == true) {
              storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
            }
          }
          break;
        }
      }
    } else if (cause == 'ASSASSINATED') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'ASSASSIN' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "Only appearing to be dead, the Drunken brawler strikes back at <@"+playerData[i]['slackid']+"> before succumbing to their injury.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    } else if (cause == 'INCINERATED') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'HELLION' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "However the burning Drunk managed to beat up <@"+playerData[i]['slackid']+"> before succumbing to the fire.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    } else if (cause == 'INFECTION') {
      for (var i = 0; i < playerData.length; ++i) {
        if (playerData[i]['role'] == 'HAZMAT' && playerData[i]['isDead'] == false) {
          playerData[i]['isDead'] = true;
          playerData[i]['dayOfDeath'] = gameData[0]['days'];
          playerData[i]['causeOfDeath'] = "SCUFFLED";
          playerData[i]['marked'] = false;
          playerData[i]['protected'] = false;
          playerData[i]['infected'] = false;
          playerData[i]['revealed'] = true;
          storytext += "However the weakened Drunk managed to beat up <@"+playerData[i]['slackid']+"> before succumbing to the virus.\n\n";
          if (playerData[i]['bound'] == true) {
            storytext = module.exports.archdemonDeath(playerData, gameData, storytext);
          }
          break;
        }
      }
    }
    return storytext;
  },
  randomInfection: function randomInfection(playerData) {
    var randomIndex = Math.floor(Math.random() * playerData.length);
    while (playerData[randomIndex]['isDead'] == true) {
      randomIndex = Math.floor(Math.random() * playerData.length);
    }
    for (var i = 0; i < playerData.length; ++i) {
      if (i == randomIndex) {
        playerData[i]['infected'] = true;
      } else {
        playerData[i]['infected'] = false;
      }
    }
  },
  targetInfection: function targetInfection(name, playerData) {
    for (var i = 0; i < playerData.length; ++i) {
      if (playerData[i]['name'] == name) {
        playerData[i]['infected'] = true;
      } else {
        playerData[i]['infected'] = false;
      }
    }
  },
  ACTIVE_CHANNEL: 'the-town',
  MONSTER_ROLES: ["GHOUL", "SHADE", "LICH", "HELLION", "IMP", "ZOMBIE", "SPECTRE", "ARCHDEMON", "BONEWHEEL"],
  ADMIN_LIST: process.env.ADMIN_LIST.split("-"), // Admin List is user names split on a hyphen, since you cant natively store a list.

  // Specifically check if the Assassin won.
  checkAssassinCondition: function checkAssassinCondition(playerData) {
    deadTargetCount = 0;
    for (var i in playerData) {
      if (playerData[i]['target'] == true && playerData[i]['isDead'] == true) {
        deadTargetCount += 1;
      }
    }
    if (deadTargetCount >= 3) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'ASSASSIN' && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
      }
    }
  },
  // WIN CONDITION CHECKER - Returns true if the game is over.
  checkWinConditions: function checkWinConditions(playerData, storytext) {

    deadPlayerCount = 0;
    deadTargetCount = 0;
    deadMonsterCount = 0;
    monsterCount = 0;
    villagerCount = 0;
    goodMail = 0;
    livingDuelists = 0;
    infectionCount = 0;

    // count up current people statistics
    for (var i in playerData) {
      if (playerData[i]['isDead'] == true) {
        deadPlayerCount += 1;
      }
      if (playerData[i]['target'] == true && playerData[i]['isDead'] == true) {
        deadTargetCount += 1;
      }
      if (playerData[i]['isDead'] == false && module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
        monsterCount += 1;
      }
      if (playerData[i]['isDead'] == false && !module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
        villagerCount += 1;
      }
      if (playerData[i]['isDead'] == true && module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
        deadMonsterCount += 1;
      }
      if (playerData[i]['mail'] == true && !module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
        goodMail += 1;
      }
      if (playerData[i]['isDead'] == false && playerData[i]['role'] == 'DUELIST') {
        livingDuelists += 1;
      }
      if (playerData[i]['isDead'] == true && playerData[i]['role'] != 'HAZMAT' && playerData[i]['causeOfDeath'] == 'INFECTION') {
        infectionCount += 1;
      }
    }

    // condition 0 - cryptkeeper win: continue other checks
    if (deadPlayerCount >= 4) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'CRYPTKEEPER' && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 1 - executioner win: continue other checks
    if (deadMonsterCount >= 1) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'EXECUTIONER' && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 1.2 - courier win: continue other checks
    if (goodMail >= 2) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'COURIER') {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 1.4 - duelist win: continue other checks
    if (livingDuelists == 1) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'DUELIST' && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 1.6 - jester win: continue other checks
    for (var i in playerData) {
      if (playerData[i]['role'] == 'JESTER' && playerData[i]['isDead'] == true && ["LYNCHED", "SHOT", "ASSASSINATED", "INCINERATED", "SCUFFLED", "DETONATED", "IMPALED"].includes(playerData[i]['causeOfDeath'])) {
        playerData[i]['winner'] = true;
      }
    }

    // condition 1.8 - assassin win: continue other checks
    if (deadTargetCount >= 3) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'ASSASSIN' && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 1.9 - hazmat win: continue other checks
    if (infectionCount >= 2) {
      for (var i in playerData) {
        if (playerData[i]['role'] == 'HAZMAT') {
          playerData[i]['winner'] = true;
        }
      }
    }

    // condition 2 - everyone dead: everyone loses when this happens.
    if (monsterCount + villagerCount <= 0) {
        storytext += 'A cold wind blows. The Town. . . is empty. None who live remain. You all get the bad ending. Nobody wins.\n\n';
        module.exports.createPINPost(storytext);
        for (var i in playerData) {
          playerData[i]['winner'] = false;
        }
        return true;

    // condition 3 - There is exactly 1 person left. They are the only winner.
    } else if (monsterCount + villagerCount == 1) {
        var soleSurvivor = "";
        for (var i in playerData) {
          if (playerData[i]['isDead'] == false) {
            soleSurvivor = "<@"+playerData[i]['slackid']+">";
          }
        }
        storytext += 'Silence. At last. Only '+soleSurvivor+' remains. Standing alone atop their enemies, they are the sole survivor. The true master of the Town.\n\n';
        module.exports.createPINPost(storytext);
        for (var i in playerData) {
          if (playerData[i]['isDead'] == true) {
            playerData[i]['winner'] = false;
          } else {
            playerData[i]['winner'] = true;
          }
        }
        return true;

    // condition 4 - monsters outnumber everyone
    } else if (monsterCount >= villagerCount) {
      storytext += 'The fiendish monsters begin to overpower the villagers and proceed to take over The Town.\n\n';
      module.exports.createPINPost(storytext);
      for (var i in playerData) {
        // Monsters win.
        if (module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
          playerData[i]['winner'] = true;
        }

        // Certain Neutral survivors win
        if (['TECHIE', 'MANTIS', 'DRUNK'].includes(playerData[i]['role']) && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }

        // Non-monster, non-neutrals lose, even if they previously were winning.
        if (!(module.exports.MONSTER_ROLES.concat(["ASSASSIN", "TECHIE", "MANTIS", "JESTER", "DUELIST", "HAZMAT", "DRUNK"]).includes(playerData[i]['role']))) {
          playerData[i]['winner'] = false;
        }
      }
      // If the duel wasn't settled, settle it.
      if (livingDuelists > 1) {
        duelTie = false
        highestMoxie = -1;
        winnerIndex = -1;
        for (var i in playerData) {
          if (playerData[i]['role'] == 'DUELIST') {
            if (playerData[i]['moxie'] > highestMoxie) {
              highestMoxie = playerData[i]['moxie'];
              winnerIndex = i;
              duelTie = false;
            } else if (playerData[i]['moxie'] == highestMoxie) {
              winnerIndex = -1;
              duelTie = true;
            }
          }
        }
        if (duelTie != true) {
          playerData[winnerIndex]['winner'] = true;
        }
      }
      return true;

    // condition 5 - monsters are defeated
    } else if (monsterCount == 0) {
      storytext += 'The dust settles. The people look around. Many casualties occurred on all sides but at last the monsters have been purged from the Town and the people are safe.\n\n';
      module.exports.createPINPost(storytext);
      masonSurvived = false;
      for (var i in playerData) {
        // Any living person who isn't a monster, assassin, jester, duelist or hazmat wins.
        if (!(module.exports.MONSTER_ROLES.concat(["ASSASSIN", "JESTER", "DUELIST", "HAZMAT"]).includes(playerData[i]['role'])) && playerData[i]['isDead'] == false) {
          playerData[i]['winner'] = true;
        }
        // The mayor wins no matter what happened to them.
        if (playerData[i]['role'] == 'MAYOR') {
          playerData[i]['winner'] = true;
        }
        // Check if a Mason survived.
        if (playerData[i]['role'] == 'MASON' && playerData[i]['isDead'] == false) {
          masonSurvived = true;
        }
        // Bound person wins.
        if (playerData[i]['bound'] == true && playerData[i]['isDead'] == true && !module.exports.MONSTER_ROLES.includes(playerData[i]['role'])) {
          playerData[i]['winner'] = true;
        }
      }
      // If one Mason survives, they win.
      if (masonSurvived) {
        for (var i in playerData) {
          if (playerData[i]['role'] == 'MASON') {
            playerData[i]['winner'] = true;
          }
        }
      }
      // If the duel wasn't settled, settle it.
      if (livingDuelists > 1) {
        duelTie = false
        highestMoxie = -1;
        winnerIndex = -1;
        for (var i in playerData) {
          if (playerData[i]['role'] == 'DUELIST' && playerData[i]['isDead'] == false) {
            if (playerData[i]['moxie'] > highestMoxie) {
              highestMoxie = playerData[i]['moxie'];
              winnerIndex = i;
              duelTie = false;
            } else if (playerData[i]['moxie'] == highestMoxie) {
              winnerIndex = -1;
              duelTie = true;
            }
          }
        }
        if (duelTie != true) {
          playerData[winnerIndex]['winner'] = true;
        }
      }
      return true;
    } else {
      return false;
    }
  },

  // Do this once at the start of the game.
  initialGameSetup: function initialGameSetup(playerData, gameData, vetoData) {
    // Choose a role distribution.
    var roleArray;
    var MONSTER_ROLES = module.exports.MONSTER_ROLES;
    var vetoResult = "";

    if (gameData[0]['distribution'] != 'RANDOM') {
      roleArray = DISTRIBUTION.get(gameData[0]['distribution']);
    } else {
      distributionArray = DISTRIBUTION.get(playerData.length);

      // Count out the veto votes
      var vetoMap = {};
      for (var i = 0; i < vetoData.length; ++i) {
        // Map out votes.
        if (vetoData[i]['mapNumber'] != null) {
          if (vetoMap[vetoData[i]['mapNumber']] === undefined) {
            vetoMap[vetoData[i]['mapNumber']] = 1;
          } else {
            vetoMap[vetoData[i]['mapNumber']] += 1;
          }
        }
      }

      var sortable = [];
      for (var i in vetoMap) {
        sortable.push([i, vetoMap[i]]);
      }

      module.exports.shuffleArray(sortable);

      // Sort that list
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });

      // If there are votes, add them.
      vetoResult += "*VETO RESULTS*\n```";
      for (var i in sortable) {
        vetoResult += DISTRIBUTION.name(parseInt(sortable[i][0])) + ": " + sortable[i][1];
        if (i <= 1) {
          vetoResult += " (VETOED)"
        }
        vetoResult += "\n";
      }
      vetoResult += gameData[0]['previous'] + " (PREVIOUS MAP - IGNORED)"
      vetoResult += "```\n";

      // Get rid of the top two maps.
      for (var i=0; i <Math.min(sortable.length, 2); ++i) {
        var vetoIndex = distributionArray.indexOf(DISTRIBUTION.name(parseInt(sortable[i][0])));
        if (vetoIndex != -1) {
          distributionArray.splice(vetoIndex, 1);
        }
      }
      var prevIndex = distributionArray.indexOf(gameData[0]['previous']);
      distributionArray.splice(prevIndex, 1);

      gameData[0]['distribution'] = distributionArray[Math.floor(Math.random()*distributionArray.length)];
      roleArray = DISTRIBUTION.get(gameData[0]['distribution']);
    }

    // Dish out the roles.
    module.exports.shuffleArray(playerData);
    for (var i in roleArray) {
      playerData[i]['role'] = roleArray[i];
      playerData[i]['initialRole'] = roleArray[i];
    }

    // Assassin targets chosen.
    if (roleArray.includes("ASSASSIN")) {
      module.exports.shuffleArray(playerData);
      for (var i in playerData) {
        if (MONSTER_ROLES.includes(playerData[i]['role']) && playerData[i]['target'] == false) {
          playerData[i]['target'] = true;
          break;
        }
      }
      module.exports.shuffleArray(playerData);
      for (var i in playerData) {
        if (!(MONSTER_ROLES.includes(playerData[i]['role'])) && playerData[i]['target'] == false && playerData[i]['role'] != 'CURSED' && playerData[i]['role'] != 'ASSASSIN') {
          playerData[i]['target'] = true;
          break;
        }
      }
      module.exports.shuffleArray(playerData);
      for (var i in playerData) {
        if (playerData[i]['target'] == false && playerData[i]['role'] != 'CURSED' && playerData[i]['role'] != 'ASSASSIN') {
          playerData[i]['target'] = true;
          break;
        }
      }
    }
    module.exports.shuffleArray(playerData);
    for (var i in playerData) {
      // Command counts to zero.
      playerData[i]['commandCount'] = 0;

      // Assassin ability disabled. Hellion ability disabled. Bonewheel ability disabled.
      if (playerData[i]['role'] == 'ASSASSIN' || playerData[i]['role'] == 'HELLION' || playerData[i]['role'] == 'BONEWHEEL') {
        playerData[i]['usedAbility'] = true;
      }
      // Seer fakerole = Fool
      if (playerData[i]['role'] == 'SEER') {
        playerData[i]['fakerole'] = 'FOOL';
      }
      // Fool fakerole = Seer
      if (playerData[i]['role'] == 'FOOL') {
        playerData[i]['fakerole'] = 'SEER';
      }
      // Mayor fakerole = Mayor
      // Mayor revealed.
      if (playerData[i]['role'] == 'MAYOR') {
        playerData[i]['fakerole'] = 'MAYOR';
        playerData[i]['revealed'] = true;
      }
      // Paladin protected.
      if (playerData[i]['role'] == 'PALADIN') {
        playerData[i]['protected'] = true;
      }
      // Hazmat infected.
      if (playerData[i]['role'] == 'HAZMAT') {
        playerData[i]['infected'] = true;
      }
    }

    // Send season starting messages.
    monsterArray = [];
    duelistArray = [];
    masonArray = [];
    for (var i in playerData) {
      if (MONSTER_ROLES.includes(playerData[i]['role'])) {
        monsterArray.push(playerData[i]);
      } else if (playerData[i]['role'] == 'DUELIST') {
        duelistArray.push(playerData[i]);
      } else if (playerData[i]['role'] == 'MASON') {
        masonArray.push(playerData[i]);
      } else {
        displayRole = playerData[i]['role'];
        if (displayRole == 'FOOL') {
          displayRole = 'SEER';
        } else if (displayRole == 'MANTIS') {
          displayRole = 'VILLAGER';
        }
        PM = "Hello <@"+playerData[i]['slackid']+">. Just letting you know that Season "+gameData[0]['season']+" of <#"+process.env.CHANNEL_ID+"> has begun.\n\n";
        PM+= "Your role this game is: "+displayRole+" "+EMOJI_DATA[displayRole]+"\n\n";
        PM+= "You can find out more about this role by using `/townrole`.\n\n";
        PM+= "*Basic Strategy Advice:* "+STRATEGY_DATA[displayRole]+"\n\n";
        PM+= "Best of luck this season! :bigglesworth:";
        module.exports.sendPrivateMessage(PM, playerData[i]['slackid']);
      }
    }
    if (monsterArray.length > 1) {
      monsterMessage = "Hello ";
      for (var i in monsterArray) {
        if (i > 0 && i < monsterArray.length - 1) {
          monsterMessage += ', ';
        }
        if (i == monsterArray.length - 1) {
          monsterMessage += " and ";
        }
        monsterMessage += "<@"+monsterArray[i]['slackid']+">";
      }
      monsterMessage += ". Just letting you know that Season "+gameData[0]['season']+" of <#"+process.env.CHANNEL_ID+"> has begun.\n\n";
      for (var i in monsterArray) {
        monsterMessage += "<@"+monsterArray[i]['slackid']+"> Your role this game is: "+monsterArray[i]['role']+" "+EMOJI_DATA[monsterArray[i]['role']]+"\n";
      }
      monsterMessage += "\n";
      monsterMessage += "You can find out more about your roles using `/townrole`.\n\n";
      monsterMessage += "Best of luck this season! :bigglesworth:";
      mpimIDList = '';
      for (var i in monsterArray) {
        if (i > 0) {
          mpimIDList += ',';
        }
        mpimIDList += monsterArray[i]['slackid'];
      }
      module.exports.sendMPIM(monsterMessage, mpimIDList);
    }
    if (duelistArray.length > 1) {
      duelistMessage = "Hello ";
      for (var i in duelistArray) {
        if (i > 0 && i < duelistArray.length - 1) {
          duelistMessage += ', ';
        }
        if (i == duelistArray.length - 1) {
          duelistMessage += " and ";
        }
        duelistMessage += "<@"+duelistArray[i]['slackid']+">";
      }
      duelistMessage += ". Just letting you know that Season "+gameData[0]['season']+" of <#"+process.env.CHANNEL_ID+"> has begun.\n\n";
      duelistMessage += "This game all of you are: DUELIST "+EMOJI_DATA['DUELIST']+"\n\n";
      duelistMessage += "You can find out more about your roles using `/townrole`.\n\n";
      duelistMessage += "*Basic Strategy Advice:* "+STRATEGY_DATA['DUELIST']+"\n\n";
      duelistMessage += "Best of luck this season! :bigglesworth:";
      mpimIDList = '';
      for (var i in duelistArray) {
        if (i > 0) {
          mpimIDList += ',';
        }
        mpimIDList += duelistArray[i]['slackid'];
      }
      module.exports.sendMPIM(duelistMessage, mpimIDList);
    }
    if (masonArray.length > 1) {
      masonMessage = "Hello ";
      for (var i in masonArray) {
        if (i > 0 && i < masonArray.length - 1) {
          masonMessage += ', ';
        }
        if (i == masonArray.length - 1) {
          masonMessage += " and ";
        }
        masonMessage += "<@"+masonArray[i]['slackid']+">";
      }
      masonMessage += ". Just letting you know that Season "+gameData[0]['season']+" of <#"+process.env.CHANNEL_ID+"> has begun.\n\n";
      masonMessage += "This game all of you are: MASON "+EMOJI_DATA['MASON']+"\n\n";
      masonMessage += "You can find out more about your roles using `/townrole`.\n\n";
      masonMessage += "*Basic Strategy Advice:* "+STRATEGY_DATA['MASON']+"\n\n";
      masonMessage += "Best of luck this season! :bigglesworth:";
      mpimIDList = '';
      for (var i in masonArray) {
        if (i > 0) {
          mpimIDList += ',';
        }
        mpimIDList += masonArray[i]['slackid'];
      }
      module.exports.sendMPIM(masonMessage, mpimIDList);
    }

    gameData[0]['active'] = true;
    gameData[0]['days'] = 1;

    return vetoResult;
  },
  sendPrivateMessage: function sendPrivateMessage(text, slackid) {
    request.post('https://slack.com/api/im.list', {
      form:{
        token: process.env.BOT_TOKEN,
        user: slackid
      },
    },function(error, response, body){
      if (error) {
        console.log("Error: "+JSON.stringify(error));
      }

      imList = JSON.parse(body)['ims'];
      imChannel = null;
      debugArray = [];
      for (var i=0; i < imList.length; ++i) {
        debugArray.push(imList[i]['user']);
        if (imList[i]['user'] == slackid) {
          imChannel = imList[i]['id'];
        }
      }

      console.log("Body: "+JSON.stringify(body));
      if (imChannel) {
        request.post('https://slack.com/api/chat.postMessage', {
          form:{
            token: process.env.BOT_TOKEN,
            channel: imChannel,
            text: text
          }
        },function(error, response, body){
          if (error) {
            console.log("Error: "+JSON.stringify(error));
          }
        });
      }
    });
  },
  sendEmoji: function sendEmoji(channel, timestamp, emoji) {
    request.post('https://slack.com/api/reactions.add', {
      form:{
        token: process.env.BOT_TOKEN,
        channel: channel,
        timestamp: timestamp,
        name: emoji
      }
    },function(error, response, body){
      if (error) {
        module.exports.bugpost("PM ERROR: "+error);
        console.log("Error: "+JSON.stringify(error));
      }
    });
  },
  createIM: function createIM(slackid) {
    request.post('https://slack.com/api/im.open', {
      form:{
        token: process.env.BOT_TOKEN,
        user: slackid
      },
    },function(error, response, body){
      if (error) {
        console.log("Error: "+JSON.stringify(error));
      }
    });
  },
  sendMPIM: function createMPIM(text, slackidList) {
    //module.exports.bugpost("Slack ID List: "+slackidList);
    request.post('https://slack.com/api/mpim.open', {
      form:{
        token: process.env.BOT_TOKEN,
        users: slackidList
      },
    },function(error, response, body){
      if (error || JSON.parse(body)['ok'] == false) {
        console.log("Error: "+JSON.stringify(error));
      } else {
        //module.exports.bugpost("OK RESULT FOR MPIM: "+JSON.parse(body)['ok']);
        request.post('https://slack.com/api/chat.postMessage', {
          form:{
            token: process.env.BOT_TOKEN,
            channel: JSON.parse(body)['group']['id'],
            text: text
          }
        },function(error, response, body){
          if (error) {
            console.log("Error: "+JSON.stringify(error));
          }
        });
      }
    });
  },
  createPINPost: function createPINPost(text) {
    request.post('https://slack.com/api/chat.postMessage', {
      form:{
        token: process.env.BOT_TOKEN,
        channel: process.env.CHANNEL_ID,
        text: text
      }
    },function(error, response, body){
      if (error) {
        console.log("Error: "+JSON.stringify(error));
      } else {
        request.post('https://slack.com/api/pins.add', {
          form:{
            token: process.env.BOT_TOKEN,
            channel: process.env.CHANNEL_ID,
            timestamp: JSON.parse(body)['ts']
          }
        },function(error, response, body){
          if (error) {
            console.log("Error: "+JSON.stringify(error));
          }
        });
        module.exports.sendEmoji(process.env.CHANNEL_ID, JSON.parse(body)['ts'], 'bigglesworth');
      }
    });
  }
}
