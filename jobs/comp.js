var Db = require('../db');
var $ = require('jquery-deferred');
var Curve = require('../controllers/curve');
// var Coach = require('../controllers/coach');
// var Rank = require('../controllers/rank');
// var Stimul = require('../controllers/stimul');
// var Workout = require('./workout');

// var WEIGHT_MIN = 0;
// var REPEATS_MIN = 0;
// var REPEATS_MAX = 200;
// var COEFF_POWER = 7;
// var COEFF_FRAZZLE = 10;
// var TONUS_MAX = 10;

var FUND_LEVELS = [{
  id: 0,
  members: 10,
  fund: [0.6, 0.4]
}, {
  id: 1,
  members: 20,
  fund: [0.5, 0.3, 0.2]
}, {
  id: 2,
  members: 40,
  fund: [0.4, 0.27, 0.19, 0.14]
}, {
  id: 3,
  members: 80,
  fund: [0.36, 0.25, 0.175, 0.128, 0.087]
}, {
  id: 4,
  members: 150,
  fund: [0.34, 0.23, 0.165, 0.119, 0.08, 0.06]
}, {
  id: 5,
  members: 300,
  fund: [0.317, 0.207, 0.153, 0.108, 0.072, 0.058, 0.046, 0.039]
}, {
  id: 6,
  members: 500,
  fund: [0.305, 0.195, 0.137, 0.1, 0.067, 0.054, 0.042, 0.037, 0.033, 0.030]
}, {
  id: 7,
  members: 1000,
  fund: [0.29, 0.187, 0.135, 0.095, 0.065, 0.052, 0.04, 0.034, 0.029, 0.026, 0.024, 0.023]
}, {
  id: 8,
  members: 2000,
  fund: [0.28, 0.18, 0.13, 0.093, 0.063, 0.05, 0.039, 0.033, 0.029, 0.0255, 0.0225, 0.02, 0.018, 0.017]
}];

function getCompDetails(id, wcat, members) {

  var money = members;
  var gold = Math.ceil(members / 20);

  var level = $.grep(FUND_LEVELS, function(v) {
    return v.members > members;
  })[0];

  return {
    money: money,
    gold: gold,
    fund: level.fund,
    goal: level.members,
    level: level.id
  };
};

function makeCompActive(wcat, id) {
  var now = (new Date()).getTime();

  var clause = 'comps.' + id + '.';
  var updateClause = {};
  updateClause[clause + 'uid'] = now;
  updateClause[clause + 'status'] = 1;
  updateClause[clause + 'q'] = 0;
  updateClause[clause + 'members'] = [];
  updateClause[clause + 'last'] = now;

  var comp = getComp(wcat).comps[id];
  comp.uid = now;
  //comp.res = [];
  comp.status = 1;
  comp.q = 0;
  comp.members = [];
  comp.last = now;

  Db.update('comp', wcat, {
    "$set": updateClause
  });
}

function getComp(wcat) {
  return $.grep(GLOBAL.GYM.COMPS, function(v) {
    return v._id == wcat;
  })[0];
}

module.exports = {

  init: function() {

    Db.getColl('comp').find({}).toArray(function(err, data) {
      GLOBAL.GYM.COMPS = data;
    });

  },

  run: function() {

    for (var wcat = 0; wcat < GLOBAL.GYM.COMPS.length; wcat++) {

      var comps = getComp(wcat).comps;
      for (var i = 0; i < comps.length; i++) {
        var comp = comps[i];

        //
        // Skip disabled comp
        //
        if (comp.disabled)
          continue;

        //
        // Make active and continue
        //
        if (comp.status === 0) {
          makeCompActive(wcat, i);
          continue;
        }

        if (comp.q < 1)
          continue;

        //
        // Check if time for finish the comp
        //
        var delay = Curve.getCompDelay(comp.q);
        var now = (new Date()).getTime();
        if (comp.last + delay * 60 * 1000 * GLOBAL.GYM.COMP_TIME_COEFF > now)
          continue;

        var players = comp.members.sort(function(a, b) {
          var res = a.sum - b.sum;
          if (res === 0)
            res = b.mass - a.mass;
          return res;
        });

        var compDetails = getCompDetails(0, i, comp.q);

        var winners = [];

        for (var j = 0; j < players.length; j++) {
          var player = players[j];

          var place = j + 1;
          var gold = null;
          var money = null;

          if (compDetails.fund[j]) {
            winners.push(player);
            var percent = compDetails.fund[j];
            gold = Math.round(percent * compDetails.gold);
            money = Math.round(percent * compDetails.money);
          }

          var clause = 'public.comp.' + i + '.';

          var setClause = {};
          setClause[clause + "place"] = place;
          setClause[clause + "status"] = 'results';

          if (gold)
            setClause[clause + "gold"] = gold;

          if (money)
            setClause[clause + "money"] = money;

          Db.update('players', player.id, {
            "$set": setClause
          });
          GLOBAL.GYM.force[player.id] = true; // Force to reload the player
        }

        var now = (new Date()).getTime();

        var updateClause = {};
        updateClause["comps." + i + ".res"] = winners;
        updateClause["comps." + i + ".resQ"] = players.length;
        updateClause["comps." + i + ".status"] = 0;

        getComp(wcat).comps[0].status = 0;
        Db.update('comp', wcat, {
          "$set": updateClause
        });
      }

    }

  }

};