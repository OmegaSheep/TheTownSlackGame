module.exports = {
  get: function get(name) {
    var dMap = new Map();

    // 12 - 14
    dMap.set("CLASSICVILLE",
    ["GHOUL", "SHADE", "LICH", "SEER", "CURSED", "ASSASSIN", "FOOL", "PALADIN", "HUNTER", "BEHOLDER"]);

    // 14 - 16
    dMap.set("MILLENIAL MINES",
    ["MASON", "MASON", "SEER", "FOOL", "BEHOLDER", "PALADIN", "HUNTER", "ASSASSIN", "CURSED", "LICH", "GHOUL", "SHADE"]);

    // 13 - 15
    dMap.set("BIGGLESWORTH BAY",
    ["COURIER", "SEER", "FOOL", "BEHOLDER", "PALADIN", "HUNTER", "ASSASSIN", "CURSED", "LICH", "GHOUL", "SHADE"]);

    // 12 - 14
    dMap.set("PEACEFUL PIER",
    ["SEER", "FOOL", "APPRENTICE", "PALADIN", "HUNTER", "DRUNK", "CURSED", "LICH", "IMP", "SHADE"]);

    // 14 - 16
    dMap.set("CHARON'S CRATER",
    ["MASON", "MASON", "SEER", "FOOL", "APPRENTICE", "PALADIN", "HUNTER", "ASSASSIN", "TECHIE", "HELLION", "LICH", "GHOUL"]);

    // 12 - 14
    dMap.set("WINCHESTERTONVILLE",
    ["SEER", "FOOL", "CRYPTKEEPER", "PALADIN", "HUNTER", "ASSASSIN", "TECHIE", "ZOMBIE", "LICH", "GHOUL"]);

    // 13 - 15
    dMap.set("CARNAGE CATACOMBS",
    ["DUELIST", "DUELIST", "SEER", "FOOL", "APPRENTICE", "COURIER", "PALADIN", "HUNTER", "SPECTRE", "BONEWHEEL", "IMP"]);

    // 13 - 15
    dMap.set("HAVOC HILLS",
    ["SEER", "FOOL", "CRYPTKEEPER", "MAYOR", "PALADIN", "HUNTER", "TECHIE", "CURSED", "LICH", "GHOUL", "SHADE"]);

    // 13 - 15
    dMap.set("DYNAMITE DESERT",
    ["SEER", "FOOL", "CRYPTKEEPER", "EXECUTIONER", "PALADIN", "TECHIE", "MANTIS", "ASSASSIN", "SPECTRE", "HELLION", "GHOUL"]);

    // 13 - 15
    dMap.set("CARMINE COURT",
    ["SEER", "FOOL", "EXECUTIONER", "MAYOR", "HUNTER", "ASSASSIN", "DRUNK", "TECHIE", "JESTER", "SHADE", "HELLION", "LICH"]);

    // 14 - 16
    dMap.set("NORONTO CITY",
    ["SEER", "FOOL", "BEHOLDER", "CRYPTKEEPER", "MAYOR", "PALADIN", "HUNTER", "TECHIE", "CURSED", "LICH", "ZOMBIE", "SHADE"]);

    // 12 - 14
    dMap.set("TINY TOWN",
    ["MAYOR", "MASON", "MASON", "PALADIN", "MANTIS", "HAZMAT", "HUNTER", "GHOUL", "SPECTRE"]);

    // 14 - 16
    dMap.set("WANDERING WASTES",
    ["PALADIN", "HUNTER", "SEER", "APPRENTICE", "CRYPTKEEPER", "ASSASSIN", "TECHIE", "JESTER", "CURSED", "SPECTRE", "LICH", "SHADE"]);

    // 14 - 16
    dMap.set("EL DORITO",
    ["MASON", "MASON", "DUELIST", "DUELIST", "SEER", "FOOL", "DRUNK", "ASSASSIN", "MAYOR", "ARCHDEMON", "SHADE", "GHOUL"]);

    // 12 - 14
    dMap.set("AGILE OASIS",
    ["PALADIN", "SEER", "FOOL", "APPRENTICE", "COURIER", "CRYPTKEEPER", "MANTIS", "LICH", "ZOMBIE", "SPECTRE"]);

    // 12 - 14
    dMap.set("WEEKEND'S BANE",
    ["SEER", "FOOL", "IMP", "COURIER", "DUELIST", "DUELIST", "EXECUTIONER", "ARCHDEMON", "BONEWHEEL", "MANTIS"]);

    // 13 - 15
    dMap.set("TESTER'S BIGHT",
    ["SEER", "FOOL", "CRYPTKEEPER", "PALADIN", "COURIER", "HUNTER", "MANTIS", "ZOMBIE", "LICH", "IMP", "HAZMAT"]);

    // 14 - 16
    dMap.set("MAYHEM MOUNTAIN",
    ["SEER", "FOOL", "HUNTER", "PALADIN", "EXECUTIONER", "ASSASSIN", "HAZMAT", "MANTIS", "TECHIE", "BONEWHEEL", "SPECTRE", "ARCHDEMON"]);

    // FINALE - 13+, but even 12 will do.
    dMap.set("THE FINALE",
    ["SEER", "FOOL", "HUNTER", "PALADIN", "ASSASSIN", "MANTIS", "TECHIE", "HAZMAT", "BONEWHEEL", "ARCHDEMON", "HELLION", "JESTER"]);

    // TEST ONLY
    dMap.set("TEST",
    ["SEER", "FOOL", "HUNTER", "PALADIN", "EXECUTIONER", "ASSASSIN", "HAZMAT", "DRUNK", "TECHIE", "BONEWHEEL", "SPECTRE", "ARCHDEMON"]);

    // 8 - 11 maps below THIS
    dMap.set("FAMINE FIELDS",
    ["SEER", "FOOL", "HUNTER", "TECHIE", "ZOMBIE", "LICH"]);
    dMap.set("PESTILENT PYRAMID",
    ["DRUNK", "SEER", "FOOL", "PALADIN", "BEHOLDER", "SHADE", "SPECTRE"]);
    dMap.set("DEATHLY DISTRICT",
    ["SEER", "FOOL", "EXECUTIONER", "MAYOR", "HELLION", "BONEWHEEL"]);
    dMap.set("WAR WAREHOUSE",
    ["MANTIS", "SEER", "FOOL", "COURIER", "CRYPTKEEPER", "GHOUL", "ARCHDEMON"]);

    /* MAP ARRAY SECTION FOR RANDOMING */
    dMap.set(8, ["FAMINE FIELDS", "PESTILENT PYRAMID", "DEATHLY DISTRICT", "WAR WAREHOUSE"]);
    dMap.set(9, ["FAMINE FIELDS", "PESTILENT PYRAMID", "DEATHLY DISTRICT", "WAR WAREHOUSE"]);
    dMap.set(10, ["FAMINE FIELDS", "PESTILENT PYRAMID", "DEATHLY DISTRICT", "WAR WAREHOUSE"]);
    dMap.set(11, ["FAMINE FIELDS", "PESTILENT PYRAMID", "DEATHLY DISTRICT", "WAR WAREHOUSE"]);
    dMap.set(12, ["CLASSICVILLE", "PEACEFUL PIER", "WINCHESTERTONVILLE", "TINY TOWN", "AGILE OASIS", "WEEKEND'S BANE"]);
    dMap.set(13, ["CLASSICVILLE", "PEACEFUL PIER", "WINCHESTERTONVILLE", "TINY TOWN", "BIGGLESWORTH BAY", "CARNAGE CATACOMBS", "HAVOC HILLS", "DYNAMITE DESERT", "CARMINE COURT", "AGILE OASIS", "WEEKEND'S BANE", "TESTER'S BIGHT"]);
    dMap.set(14, ["CLASSICVILLE", "PEACEFUL PIER", "WINCHESTERTONVILLE", "TINY TOWN", "BIGGLESWORTH BAY", "CARNAGE CATACOMBS", "HAVOC HILLS", "DYNAMITE DESERT", "CARMINE COURT", "MILLENIAL MINES", "CHARON'S CRATER", "NORONTO CITY", "WANDERING WASTES", "AGILE OASIS", "EL DORITO", "WEEKEND'S BANE", "TESTER'S BIGHT", "MAYHEM MOUNTAIN"]);
    dMap.set(15, ["BIGGLESWORTH BAY", "CARNAGE CATACOMBS", "HAVOC HILLS", "DYNAMITE DESERT", "CARMINE COURT", "MILLENIAL MINES", "CHARON'S CRATER", "NORONTO CITY", "WANDERING WASTES", "EL DORITO", "TESTER'S BIGHT", "MAYHEM MOUNTAIN"]);
    dMap.set(16, ["MILLENIAL MINES", "CHARON'S CRATER", "NORONTO CITY", "WANDERING WASTES", "EL DORITO", "MAYHEM MOUNTAIN"]);

    return dMap.get(name);
  },
  description: function get(name) {
    var descMap = new Map();

    // 12 - 14
    descMap.set("CLASSICVILLE",
    "The original town map featuring a well-balanced and relatively simple role distribution.");

    // 12 - 14
    descMap.set("PEACEFUL PIER",
    "Anything but peaceful, this map is a slightly more passive variation of the original Classicville.");

    // 12 - 14
    descMap.set("WINCHESTERTONVILLE",
    "This town features a slightly more aggressive set of roles than the original Classicville.");

    // 12 - 14
    descMap.set("TINY TOWN",
    "With no Seer or Lich, more Villagers and more neutral roles, this is a town ruled by uncertainty and intuition.");

    // 12 - 14
    descMap.set("AGILE OASIS",
    "An incredibly strong monster triad is kept in check by an armed and capable set of townfolk.");

    // 12 - 14
    descMap.set("WEEKEND'S BANE",
    "With less predictable townfolk, the monsters must bind the Archdemon carefully to avoid impaling the bound player.");

    // 13 - 15
    descMap.set("BIGGLESWORTH BAY",
    "Named after the original Mayor, this town is a slightly easier variation on Classicville featuring extra support from a Courier.");

    // 13 - 15
    descMap.set("CARNAGE CATACOMBS",
    "The townfolk must be cautious that the bickerings Duelists do not setup a path of destruction for the sinister Bonewheel Skeleton.");

    // 13 - 15
    descMap.set("HAVOC HILLS",
    "A twist on Bigglesworth Bay, the Mayor must struggle to keep the town in order while the Cryptkeeper investigates.");

    // 13 - 15
    descMap.set("DYNAMITE DESERT",
    "This town is dangerous and filled with lethal roles, but the monsters must tread carefully without their precious Lich.");

    // 13 - 15
    descMap.set("CARMINE COURT",
    "Few Villagers, and nearly every lethal role make this town a bloodbath, with a laughing Jester at its core.");

    // 13 - 15
    descMap.set("TESTER'S BIGHT",
    "All sides good and evil must be careful of the dangerous infection making rounds through the town.");

    // 14 - 16
    descMap.set("MILLENIAL MINES",
    "A slightly easier variation of Classicville featuring an added pair of Masons.");

    // 14 - 16
    descMap.set("CHARON'S CRATER",
    "With several explosive abilities at play, the Masons must coordinate with the town to survive the fire and brimstone.");

    // 14 - 16
    descMap.set("NORONTO CITY",
    "The city that never sleeps, this large map features tough roles on both sides with a Techie wedged in the middle.");

    // 14 - 16
    descMap.set("WANDERING WASTES",
    "Unrestrained by the absence of a Fool, the Seer and its allies face one of the most powerful monster groups possible.");

    // 14 - 16
    descMap.set("EL DORITO",
    "A standoffish role set means the town must work carefully with the neutral players to determine who the Archdemon has bound.");

    // 14 - 16
    descMap.set("MAYHEM MOUNTAIN",
    "The most lethal town possible. Plans will be undone. Alliances will be broken. All will be claimed by the mountain.");
    descMap.set("THE FINALE",
    "The final town. Unknown roles, and plenty of surprises. Will you triumph? Or crumble under the pressure?");
    descMap.set("FAMINE FIELDS",
    "Tiny map featuring Lich + Zombie.");
    descMap.set("PESTILENT PYRAMID",
    "Tiny map featuring Shade + Spectre.");
    descMap.set("DEATHLY DISTRICT",
    "Tiny map featuring Hellion + Bonewheel.");
    descMap.set("WAR WAREHOUSE",
    "Tiny map featuring Ghoul + Archdemon.");

    return descMap.get(name);
  },
  name: function get(number) {
    var numMap = new Map();
    numMap.set(1, "CLASSICVILLE");
    numMap.set(2, "PEACEFUL PIER");
    numMap.set(3, "WINCHESTERTONVILLE");
    numMap.set(4, "TINY TOWN");
    numMap.set(5, "AGILE OASIS");
    numMap.set(6, "WEEKEND'S BANE");

    numMap.set(7, "BIGGLESWORTH BAY");
    numMap.set(8, "CARNAGE CATACOMBS");
    numMap.set(9, "HAVOC HILLS");
    numMap.set(10, "DYNAMITE DESERT");
    numMap.set(11, "CARMINE COURT");
    numMap.set(12, "TESTER'S BIGHT");

    numMap.set(13, "MILLENIAL MINES");
    numMap.set(14, "CHARON'S CRATER");
    numMap.set(15, "NORONTO CITY");
    numMap.set(16, "WANDERING WASTES");
    numMap.set(17, "EL DORITO");
    numMap.set(18, "MAYHEM MOUNTAIN");

    numMap.set(19, "FAMINE FIELDS");
    numMap.set(20, "PESTILENT PYRAMID");
    numMap.set(21, "DEATHLY DISTRICT");
    numMap.set(22, "WAR WAREHOUSE");

    return numMap.get(number);
  }
}
