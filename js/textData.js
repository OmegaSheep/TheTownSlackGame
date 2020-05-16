module.exports = {
  villagerData: "*Role:* VILLAGER :villager:\n"+
  "You just want to feed your family and be left alone.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.```",
  seerData: "*Role:* SEER :seer:\n"+
  "Your prophetic powers might come in handy. Or get you killed. . .\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townability @target` - Reveal someones role to yourself. However the SHADE :shade:, JESTER :jester: and DRUNK :towndrunk: will appear as a VILLAGER :villager:.\n"+
  "`/townscans` - Review your previous scans.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Scan a monster once. (Applies only if monsters lose.)```",
  foolData: "*Role:* FOOL :fool:\n"+
  "You know things! They have to believe you! Right!?\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townability @target` - Incorrectly learn someones role. However the Seer :seer: will always appear as Fool :fool:.\n"+
  "`/townscans` - Review your previous scans.\n"+
  "`PASSIVE` - You think you are the Seer :seer: until slain.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Scan the Seer. (Applies only if monsters lose.)```",
  beholderData: "*Role:* BEHOLDER :beholder:\n"+
  "Your blindness has awoken other magical senses.\n\n"+
  "*Main Commands:*\n"+
  "`PASSIVE` - You receive a message when scanned by another player.\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/towninfo` - Day 1 - Learn the approximate identity of the Seer :seer: or Fool. :fool:\n"+
  "`/towninfo` - Day 2 - Learn the identity of the Seer :seer: and Fool :fool: but not which is which.\n"+
  "`/towninfo` - Day 3 - Learn the exact identity of the Seer :seer: and Fool. :fool:\n"+
  "`/towninfo` - Day 4 - Learn the identity of the Shade. :shade:\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Survive until day 3. (Applies only if monsters lose.)```",
  hunterData: "*Role:* HUNTER :hunter:\n"+
  "The last person to mess with you took an arrow to the chest.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townability @target` - Mark someone for death. If you are LYNCHED, EATEN, SCUFFLED, ASSASSINATED, IMPALED or die of INFECTION this person will be SHOT by an arrow killing them.\n"+
  "`PASSIVE` - You can see the role of the player you SHOT.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Shoot a monster with your bow. (Applies only if monsters lose.)```",
  paladinData: "*Role:* PALADIN :paladin:\n"+
  "Your holy might strikes fear into the hearts of monsters.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townability @target` - Apply a blessing to a target. Blessing prevents the target from being EATEN by monsters. If the blessed target is a monster, and the monsters eat you, they will be PURGED.\n"+
  "`PASSIVE` - You are automatically blessed on the first night.\n"+
  "`PASSIVE` - You can see the role of any monster you PURGED.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Purge a monster with your blessing. (Applies only if monsters lose.)\n"+
  "  OR\n"+
  "- Protect someone with your blessing. Includes self. (Applies only if monsters lose.)```",
  assassinData: "*Role:* ASSASSIN :assassin:\n"+
  "Three names. Lethal abilities. The contract above all else.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/towninfo` - Learn who your targets are.\n"+
  "`/townability @target` - Instantly ASSASSINATE a player from the shadows. You gain this ability on day 2, and day 4. Can only store 1 usage at a time.\n"+
  "`PASSIVE` - You can see the roles of players who you have ASSASSINATED.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all 3 targets have been slain.```",
  cursedData: "*Role:* CURSED :cursed:\n"+
  "Someone has cast quite a wicked enchantment on you.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - When eaten by monsters, you instead turn into one. On night 1 and 2, you become a HELLION :hellion:. Afterwards you become an IMP :townimp:.\n"+
  "`PASSIVE` - If still alive on day 4, you become CELESTIAL :celestial:.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.```",
  ghoulData: "*Role:* GHOUL :ghoul:\n"+
  "Sometime ago you gained a taste for living flesh.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`/towninfo` - You can sense the roles of eaten people, until slain yourself.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  shadeData: "*Role:* SHADE :shade:\n"+
  "Your shrouded, abyssal form wards off unwanted magic.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`PASSIVE` - When revealed by others you appear as a VILLAGER :villager:.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  lichData: "*Role:* LICH :lich:\n"+
  "Lord of the monsters, you possess threatening magic.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`/townability @target` - Reveal someones role to yourself.\n"+
  "`/townscans` - Review your previous scans.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  hellionData: "*Role:* HELLION :hellion:\n"+
  "Even the other demons are afraid of you. Time to raise some hell.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`/townability @target` - Instantly INCINERATE a player. You can only do this once, starting on day 2.\n"+
  "`PASSIVE` - You can see the role of the player you INCINERATE.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  impData: "*Role:* IMP :townimp:\n"+
  "A curse has transformed you into a lesser demon.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  masonData: "*Role:* MASON :townmason: \n"+
  "You are part of a secret society, thought lost to time by most.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/towninfo` - Learn the identity of the other MASONS, and if the ASSASSIN is after them.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- At least 1 Mason survives. (Applies only if monsters lose.)```",
  zombieData: "*Role:* ZOMBIE :townzombie: \n"+
  "Brains. . . Must. . . Eat. . .\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`PASSIVE` - You are immune to all causes of death except for being DETONATED or PURGED until the LICH :lich: is slain.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  celestialData: "*Role:* CELESTIAL :celestial: \n"+
  "The curse that once shackled you, now makes you immortal.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - You cannot be slain by any means. Attempting to do so reveals your role.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.```",
  techieData: "*Role:* TECHIE :techie: \n"+
  "You know how to use gunpowder, and are a little bit insane.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - When slain by any means, you trigger an explosive causing two random players to be DETONATED.\n"+
  "`PASSIVE` - You can see the role of any player you DETONATED.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Survive the first two days, regardless of outcome.```",
  cryptkeeperData: "*Role:* CRYPTKEEPER :cryptkeeper: \n"+
  "You work the night shift and have a grave sense of humour.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - You know the role of all dead players.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Outlive 4 players. (Applies only if monsters lose.)```",
  apprenticeData: "*Role:* APPRENTICE :apprentice: \n"+
  "You possess clairvoyancy, but are still learning.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - When the SEER or FOOL is slain, your role changes into SEER or FOOL respectively. Priority is given to SEER in the event they die in the same instance.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.```",
  mayorData: "*Role:* MAYOR :mayor: \n"+
  "You've taken over for poor Bigglesworth.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member. Your vote counts as two!\n"+
  "`PASSIVE` - Your role is public. Everyone knows who you are.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- You win if the monsters are defeated. You do not need to survive.```",
  executionerData: "*Role:* EXECUTIONER :executioner: \n"+
  "You operate the gallows. Might come in handy.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - If the town attempts to lynch you, the person you voted for is lynched instead. This reveals you.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Outlive 1 monster. (Applies only if monsters lose.)```",
  spectreData: "*Role:* SPECTRE :spectre: \n"+
  "Your haunting presence seeps into the minds of all who witness you.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`PASSIVE` - When slain for the first time, you possess a random Villager :villager: who takes your place. Does not apply when PURGED.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  mantisData: "*Role:* MANTIS :mantis: \n"+
  "You're easily agitated and with a face like that who can blame you?\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - You think you are a Villager :villager: until slain.\n"+
  "`PASSIVE` - When LYNCHED, EATEN, ASSASSINATED, INCINERATED or INFECTED you lash out and SCUFFLE with someone responsible.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Survive until the game ends, regardless of outcome.```",
  jesterData: "*Role:* JESTER :jester: \n"+
  "You're certifiably crazy, and have always wanted to make a spectacle of yourself.'\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - When revealed by others you appear as a VILLAGER :villager:.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Die by being LYNCHED, SHOT, ASSASSINATED, INCINERATED, SCUFFLED, IMPALED or DETONATED.```",
  courierData: "*Role:* COURIER :courier: \n"+
  "You deliver things. Often in secret.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townability @target` - Deliver mail, secretly exposing your identity to someone once per day. Mail owners, can see who else has mail.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be alive when all the monsters are slain.\n"+
  "  OR\n"+
  "- Deliver mail to 2 non-monsters. (Applies only if monsters lose.)```",
  duelistData: "*Role:* DUELIST :duelist: \n"+
  "This town ain't big enough for all of ya.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - Every non-Duelist vote you receive each night decreases Moxie by 1.\n"+
  "`PASSIVE` - If your Moxie reaches 0 you die of SHAME, unless you're the last Duelist.\n"+
  "`PASSIVE` - You know the identity of all Duelists.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Be the last Duelist standing at any point.\n"+
  "  OR\n"+
  "- Have the highest Moxie of all Duelists when the game ends.```",
  archdemonData: "*Role:* ARCHDEMON :archdemon: \n"+
  "You possess such raw power that you must bind your soul to a host to remain in the material plane.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`/townability @target` - Bind yourself to a non-monster. *Can only be done once*.\n"+
  "`PASSIVE` - If you do not bind yourself to someone on the first day, you are BANISHED.\n"+
  "`PASSIVE` - You know the role of the person you bind to.\n"+
  "`PASSIVE` - You will be BANISHED if the bound player dies, but you are immune to all other causes of death.\n"+
  "`PASSIVE` - If the monsters are defeated, the bound player wins.\n"+
  "`PASSIVE` - Failed attempts on your life reveal your role, but lynching you also reveals three potential bound players.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  hazmatData: "*Role:* HAZMAT :hazmat: \n"+
  "A viral infection has maddened you into spreading it.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - You start each day Infected. Any command used on an Infected player, transfers it to the user or randomly to someone else.\n"+
  "`PASSIVE` - After lynching has occurred, if the Infected player is still standing they die of INFECTION.\n"+
  "`PASSIVE` - You are immune to death by INFECTION once. A public message will indicate when this happens.\n"+
  "`PASSIVE` - You can see who is currently Infected, and the role of any player who has died of INFECTION.\n"+
  "`PASSIVE` - The Infected status is removed immediately from all players when you die.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Two or more players have died of Infection (not including self).```",
  drunkData: "*Role:* DRUNK :towndrunk: \n"+
  "You should perhaps slow down on the booze.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`PASSIVE` - If you say anything other than commands, emojis and whitespace *YOU INSTANTLY DIE OF PASSING OUT*.\n"+
  "`PASSIVE` - When LYNCHED, EATEN, ASSASSINATED, INCINERATED or INFECTED you lash out and SCUFFLE with someone responsible.\n"+
  "`PASSIVE` - When revealed by others you appear as a VILLAGER :villager:.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Survive until the game ends, regardless of outcome.```",
  bonewheelData: "*Role:* BONEWHEEL :bonewheelskeleton:\n"+
  "Some moron thought it would be funny to strap a skeleton to a spiked carriage wheel. Now _everyone_ will pay the price.\n\n"+
  "*Main Commands:*\n"+
  "`/townlynch @target` - Vote to lynch a town member.\n"+
  "`/townmonsters` - Learn who the other monsters are.\n"+
  "`/townfeast @target` - Secretly decide who to eat with your fellow monsters.\n"+
  "`/townability @target` - You roll at the target impaling them. This continues to the person they voted for, and so on, until a dead end or yourself is reached. At the end of the roll you CRASH. You can only do this once, starting on day 2.\n"+
  "`PASSIVE` - You are immune to death by all causes except being LYNCHED, PURGED or CRASHING.\n\n"+
  "*Winning Objective(s):*\n"+
  "```- Monsters match or outnumber non-monsters.```",
  commands: '```EVERYONE\n'+
  '/townsignup - Join the game.\n'+
  '/townauto - Toggle auto-signup on and off.\n'+
  '/townveto # - Cast a private veto vote for the corresponding map #.\n'+
  '/townvetoinfo - See the current veto votes.\n'+
  '/towninfo - Entire dump of everything you know so far.\n'+
  '/townmapinfo - Learn what roles are on the current map.\n'+
  '/townrole - Learn what role you have been assigned. Add a role name as an argument, to learn about that role.\n'+
  '/townlynch @victim - Publicly vote to lynch @victim. You may abstain by not specifying a victim.\n'+
  '/townability @person - If you have an ability, use it on @person.\n'+
  '/townvotes - See the list of current lynch votes.\n'+
  '/townstats @person - See the stats of @person. (Leave blank for your own stats.)\n'+
  '/townhistory # - Learn what happened in Season #.\n'+
  '/townleaderboard - See who tops the charts. Add the word "role" as an argument to see win % by role.\n'+
  '/townlove @person - Indicate you love someone. Does absolutely nothing.\n'+
  '/townbug TEXT - Send a bug anonymously to the developers.\n\n'+

  'MONSTER ROLES\n'+
  '/townmonsters - Privately tells you who the other monster faction players are.\n'+
  '/townfeast @victim - Privately vote to feast on @victim.\n\n'+

  'SEER & LICH & FOOL\n'+
  '/townscans - Privately tells you all the scans you have performed.'+
  '```',
  genericDeath: 'The people feel a deep sense of regret for their hasty mistake.\n\n',
  assassinDeathSuccess: 'The people are baffled. What was a hired killer doing in town?'+
  ' Unfortunately, based on their sharp grin and bloodied weapons you have a'+
  ' feeling they already accomplished their grim task . . .\n\n',
  assassinDeathFailure: 'The people are baffled. What was a hired killer doing in town?'+
  ' An indecipherable list of names written in blood falls out of their hand. It seems they'+
  ' had some unfinished business. . .\n\n',
  cursedDeath: 'The people are uneasy, but they take solace in knowing they prevented the creation of another potential monster.\n\n',
  hunterDeath: 'The people are stricken with remorse, but the executioner noted the victim had an unusually empty quiver.\n\n',
  paladinDeath: 'Devastated, the people construct the holy warrior a tomb. Their hopes of defeating the monsters, were buried there as well.\n\n',
  beholderDeath: 'The people whisper eachother with feelings of fear, superstition and hopelessness.\n\n',
  foolDeath: 'The people are unhappy to lynch one of their own, but at least the confusing lies will finally stop.\n\n',
  seerDeath: 'The crowd devolves into a frightened panic! If only they had foreseen this utterly disastrous misjudgement!\n\n',
  ghoulDeath: 'The monster croaks and curses before falling silent. The people sigh with relief for having slain this vile creature.\n\n',
  shadeDeath: 'The creature evaporates into a cloud of black magic, swearing its revenge on residents of the town before vanishing.\n\n',
  lichDeath: 'The deathly creature dissolves into a pile of dust. The people cheer with relief for having slain such a powerful monster.\n\n',
  hellionDeath: 'The hellion lets out a demonic howl before an abyssal hand reaches out and pulls it back into the depths from whence it came. Good riddance.\n\n',
  impDeath: 'The imp lets out a cowardly shriek, before a dancing black flame erodes it into nothing. The lesser demon meets its lesser ending.\n\n',
  masonDeath: 'Though their link to the lost organization is now apparent, it unfortunately provides no leads to any other potential members.\n\n',
  zombieDeathSuccess: 'The creature gives a blank stare. Is it really dead? Its hard to even tell with how lifeless it looked before, but it seems the gruesome thing has come to a permanent halt.\n\n',
  zombieDeathSuccessRevealed: 'With the source of its unliving vitality now slain, the gruesome monster finally succumbs to the power of the lynching noose.\n\n',
  zombieDeathFailure: 'The creature stares blankly forward. A powerful necromantic energy surges through it, and it refuses to yield to the grip of the lynching noose. It shambles towards the screaming crowd. Perhaps it will be more vulnerable when the source of its vitality is slain.\n\n',
  celestialDeathFailure: 'The power that once cursed this individual now tethers them to life. With a calm demeanour they remove the noose and return home.\n\n',
  celestialDeathFailureRevealed: 'The town members look at each other with confusion. Attempts at killing this person had failed before, why would they succeed now? They inevitably head home, frustrated at the time waste.\n\n',
  techieDeath: 'They only had one final word. "Boom."\n\n',
  cryptkeeperDeath: 'The irony of killing the towns only gravetender is not lost on the reluctant villagers who attend the funeral.\n\n',
  apprenticeDeath: 'Sadness plagues the crowd. If only this young visionary had been given more time to refine their powers.\n\n',
  mayorDeath: 'You should all be ashamed of yourselves.\n\n',
  executionerDeath: 'They had every chance to avoid this fate by simply casting a lynch vote, but alas they chose not to. Most unfortunate.\n\n',
  spectreDeathOriginal: 'It lets out a howling scream! It swoops into the crowd of onlookers and possesses a new host, who quickly disappears into the panicked mob.\n\n',
  spectreDeathFinal: 'A piercing, defeated scream flies out of it and at last its haunting image dissipates.\n\n',
  mantisDeath: 'It glares at the onlookers, mandibles twitching with anticipation. Someone is about to pay.\n\n',
  jesterDeath: 'An unsettlingly happy cackle quiets the audience to a hush. Clearly this maniac got _exactly_ what they wanted.\n\n',
  courierDeath: 'They cry out, dropping a sack of letters on the ground before being delivered to the great beyond.\n\n',
  duelistDeath: "Whatever scores they may have had left to settle, it seems this vigilante ain't gonna be riding off into the sunset.\n\n",
  archdemonDeathFailure: "The terrifying creature struggles against the power of the lynching noose, and ultimately manages to resist it, but not before howling out a set of names.\n\n",
  archdemonDeathFailureRevealed: "The lynching noose forces another set of names out of the demon, but is still unable to inflict anything more than intense irritation.\n\n",
  hazmatDeath: "The masked plaguebearer's suit explodes into a cloud of toxic spores before their mad ramblings cease.\n\n",
  drunkDeath: 'Moments ago they seemed barely able to function, yet now a drunken fury is visible in their eyes. Someone is about to pay.\n\n',
  bonewheelDeath: "The grinning skeleton falls silently onto their spiked wheel. There will be no such carnage on this day.\n\n"
};
