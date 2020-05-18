# The Town

Murder mystery game for Slack. 

Derivative of Werewolf/Mafia type games.

Built with Node.js/Heroku.

## Video Trailer [Click]
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/vzNNUwETjxs/0.jpg)](https://www.youtube.com/watch?v=vzNNUwETjxs)

## Setup

There are several parts to this process because I built this app gradually. This was made before Events API became a thing, so nowadays you must construct it as a "Classic Slack App" so that it uses the RTM ecosystem.

### 1. Build a Classic Slack App. 

I recommend calling it "The Narrator".

### 2. Gather environment variables.

You'll eventually need to set these on Heroku accordingly, and you can use your own .ENV to run things locally for test purposes.

* ADMIN_LIST - Admin users seperated by Hyphen.

* ANNOUNCEHOOK - Webhook URL to the Slack channel where the game is played. Used for announcements sometimes.

* BOT_ID - Slack Bot User ID. Add the Bot User to the game channel and bug channel.

* BOT_Token - Slack Bot User Token. Add the Bot User to the game channel and bug channel.

* BUGHOOK - Webhook URL to the Slack channel where users can anonymously post bugs for the Admin(s) to see.

* CHANNEL_ID - The Slack Channel ID of the Channel where the game is played.

* CLIENT_ID - Slack App Client ID.

* CLIENT_SECRET - Slack App Client Secret.

* MONGOLAB_URI - I use Mlab.com for MongoDB hosting. You can make a free storage sandbox here and use the provided URI it generates.

* OAUTH - Slack App OAUTH URL.

### 3. Deploy the app to heroku.

### 4. Configure the necessary Slash Commands as shown below. 

These are POST endpoints which the app exposes that are meant to be accessed via the Slash Command. There are 26. Slack Apps have a limit of 25 Slash commands, but several of the commands are for simulating a game while alone, and not necessary for normal gameplay so they can be excluded.

To avoid confusing with other apps on your Slack, I recommend prefixing these with "town" on Slack itself. 

eg. /townstats should be the command for calling the /stats endpoint.

#### All Players: 

* /signup - Join the game.

* /commands - Sends the player a list of all relevant commands.

* /auto - Toggle auto-signup on and off.

* /veto # - Cast a private veto vote for the corresponding map #.

* /vetoinfo - See the current veto votes.

* /info - Entire dump of everything you know so far.

* /mapinfo - Learn what roles are on the current map.

* /role - Learn what role you have been assigned. Add a role name as an argument, to learn about that role.

* /lynch @victim - Publicly vote to lynch @victim. You may abstain by not specifying a victim.

* /ability @person - If you have an ability, use it on @person.

* /votes - See the list of current lynch votes.

* /stats @person - See the stats of @person. (Leave blank for your own stats.)

* /history # - Learn what happened in Season #.

* /leaderboard - See who tops the charts. Add the word "role" as an argument to see win % by role.

* /love @person - Indicate you love someone. Does absolutely nothing.

* /bug TEXT - Send a bug anonymously to the developers.

### Monsters Only:

* /monsters - Privately tells you who the other monster faction players are.

* /feast @victim - Privately vote to feast on @victim.

#### Seer, Lich & Fool:

* /scans - Privately tells you all the scans you have performed.

#### Admin Commands:

* /startgame - Admin Only. Starts the game if there are enough players.

* /stopgame - Admin Only. Completely nukes everything and stops the game. Cannot be undone.

* /announce TEXT - Admin Only. Announce something as the Narrator.

#### Can Be Excluded:

* /testdata - Admin Only.Creates fake users to play the game. 

* /testaction - Admin Only.Causes the fake users to perform a random, but possible action.

* /admin - Admin Only. I was planning to merge all the test actions under a single Admin commmand, but never finished.

* /skip - Admin Only. Causes the game to evaluate "days" every minute. Continues until the game ends. 

### 5. Configure the emojis. 

These can be found in the /public/icons/ folder. I've included a normal, and colour version of them. I recommend using the colour versions. Warlock and Chaos were two characters I never managed to develop, and can be ignored.

The emojis each represent a game role and need to be mapped as follows:
* VILLAGER: :villager:
* SEER: :seer:
* BEHOLDER: :beholder:
* FOOL: :fool:
* PALADIN: :paladin:
* HUNTER: :hunter:
* MAYOR: :mayor:
* CURSED: :cursed:
* JESTER: :jester:
* MASON: :townmason:
* CRYPTKEEPER: :cryptkeeper:
* APPRENTICE: :apprentice:
* EXECUTIONER: :executioner:
* GHOUL: :ghoul:
* LICH: :lich:
* SHADE: :shade:
* HELLION: :hellion:
* IMP: :townimp:
* ZOMBIE: :townzombie:
* SPECTRE: :spectre:
* ASSASSIN: :assassin:
* TECHIE: :techie:
* MANTIS: :mantis:
* COURIER: :courier:
* DUELIST: :duelist:
* ARCHDEMON: :archdemon:
* HAZMAT: :hazmat:
* DRUNK: :towndrunk:
* BONEWHEEL: :bonewheelskeleton:

### 6. Regarding App Permissions. 

Honestly, I've just given the full permissions to the application when using it, but that's not a great idea, and at some point I will try to post a proper outlook of what permissions are necessary for it to function. 

Informally, the app sends private messages as a Bot User, posts to channels and applies emojis to things. It also uses RTM to read messages in the main game channel at all times. Anything beyond these scopes is probably not needed. For now, experiment as necessary.

### 7. After these steps, just boot up Heroku and you should be able to play the game. Hooray.

