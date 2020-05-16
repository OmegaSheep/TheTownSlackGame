var UTILITY = require('../utility.js');

module.exports = function(req, res) {
    var text = req.body['text'];
    var user = req.body['user_name'];
    var channel = req.body['channel_name'];
    if (channel != UTILITY.ACTIVE_CHANNEL) {
      res.send("Please perform this action in #"+UTILITY.ACTIVE_CHANNEL+".");
      return;
    }

    // NO ANNOUNCING SHIT UNLESS YOU ARE ME
    if (!UTILITY.ADMIN_LIST.includes(user)) {
      res.send("You recall that only ADMINs had permission to make announcements as the Narrator.");
      return;
    } else {
      res.send("Preparing announcement. . .");
      UTILITY.slackpost(text);
      //UTILITY.createPINPost(text);
    }
}
