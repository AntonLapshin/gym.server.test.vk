var Db = require('../db');
var DateHelper = require('../controllers/date');
var PlayersCollection = require('../gymdb/collections/players');
var Player = require('../controllers/player');
var $ = require('jquery-deferred');
var Curve = require('../controllers/curve');
var Rank = require('../controllers/rank');
var Stimul = require('../controllers/stimul');
var Mass = require('../controllers/mass');

var MAX_LEVEL = 67;
var GARB_MAX = 14;
var BONUS_MAX = 10;

//
// Calculates Stress
//
function getStress(player) {
  var muscles = Db.getRefs().muscles;
  var getPowerAll = function() {
    var powerAll = 0;
    for (var i = 0; i < muscles.length; i++) {
      powerAll += muscles[i].power;
    }
    return powerAll;
  };
  var powerAll = getPowerAll();
  var stress = 0;
  for (var i = 0; i < player.private.body.length; i++) {
    var muscleBody = player.private.body[i];
    var muscle = muscles[muscleBody._id];

    stress += muscle.power * muscleBody.stress / powerAll;
  }
  return stress;
}

module.exports = {

  getPlayerStat: function(player) {

    var level = player.public.level;

    var stress = getStress(player);

    //
    // Calculates mass
    //
    var mass = Curve.getMass(level);

    //
    // Calculates Food
    //
    var food = Stimul.getFood(player);

    //
    // Calculates Rest
    //
    var rest = 0;
    for (var i = 0; i < player.private.rest.length; i++) {
      var r = player.private.rest[i];
      var rRef = Db.getRefs().shop[1].items[r];
      if (rRef)
        rest += rRef.coeff;
    }
    if (rest > 1)
      rest = 1;

    //
    // Calculates Stimul Growth
    //
    var stimulGrowth = 1 + Stimul.getGrowth(player);

    //
    // Calclates growth
    //
    var growth = stress * rest * food * stimulGrowth;


    return {
      period: 'each ' + GLOBAL.GYM.CHECK_LEVELUP_PERIOD + ' hours',
      growth: growth,
      stress: stress,
      rest: rest,
      food: food,
      stimulGrowth: stimulGrowth
    };
  },

  getRegen: function(player) {
    var regRest = 0;
    for (var i = 0; i < player.private.rest.length; i++) {
      var r = player.private.rest[i];
      var rRef = Db.getRefs().shop[1].items[r];
      if (rRef)
        regRest += rRef.coeff;
    }
    if (regRest > 1)
      regRest = 1;

    var regStimul = Stimul.getRegen(player);

    var data = {
      energy: (GLOBAL.GYM.REG_ENERGY * (regRest + regStimul)) * PlayersCollection.ENERGY_MAX,
      frazzle: GLOBAL.GYM.REG_FRAZZLE * (regRest + regStimul),
      tonus: GLOBAL.GYM.REG_TONUS,
      garb: GLOBAL.GYM.REG_GARB
    };

    if (data.energy < GLOBAL.GYM.REG_ENERGY_SLOW * PlayersCollection.ENERGY_MAX)
      data.energy = GLOBAL.GYM.REG_ENERGY_SLOW * PlayersCollection.ENERGY_MAX;
    if (data.frazzle < GLOBAL.GYM.REG_FRAZZLE_SLOW)
      data.frazzle = GLOBAL.GYM.REG_FRAZZLE_SLOW;

    return data;
  },

  get: {
    params: {
      friends: {
        parseMethod: parseInt
      },
      garb: {
        parseMethod: parseInt
      },
      bonus: {
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var defer = $.Deferred();
      var player = session.player;

      if (params.bonus) {
        player.private.money += Math.min(params.bonus, BONUS_MAX);
        session.isDirty = true;
      }

      if (params.garb) {
        player.private.garb -= params.garb;
        if (player.private.garb < 0)
          player.private.garb = 0;
        session.isDirty = true;
      }

      if (params.friends) {
        player.private.friends = params.friends;
        session.isDirty = true;
      }

      var now = new Date();
      var reg = player.private.reg;
      var minUpdateTime = DateHelper.addMinutesClone(new Date(reg.lastUpdateTime), GLOBAL.GYM.UPDATE_PERIOD);
      if (minUpdateTime > now) {
        defer.resolve({
          success: true,
          player: player
        });
        return defer;
      }

      var stat = module.exports.getPlayerStat(player);
      var mass = Mass.getMass(player, stat.growth);
      player.public.mass = mass;
      player.public.sum = Rank.getSum(player);

      var result = {
        success: true,
        player: player
      };

      if (minUpdateTime.getDay() != now.getDay()) {
        var salary = Rank.getSalary(player);
        if (salary) {
          result.money = salary.money;
          player.private.money += salary.money;

          if (salary.gold > 0) {
            result.gold = salary.gold;
            player.private.gold += salary.gold;
          }
        }
      }

      update(player);
      var levelChange = getLevelChange(player, stat);
      if (levelChange === 1) {
        var rankResult = Rank.update(player);
        if (rankResult !== null)
          result.rank = rankResult;
      }

      session.isDirty = true;

      if (levelChange != -2) {
        result.levelChange = levelChange;
      }

      defer.resolve(result);
      return defer;
    }
  },

  getPlayer: {
    params: {
      playerId: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var defer = $.Deferred();
      Player.find(params.playerId, {
        '_id': 1,
        'public': 1
      }).then(function(player) {
        defer.resolve({
          success: true,
          player: player
        })
      });
      return defer;
    }
  },

  getPlayers: {
    params: {
      playerIds: {
        required: true,
        parseMethod: function(value) {
          var result = [];
          value.split(',').forEach(function(val) {
            result.push(parseInt(val));
          });
          return result;
        }
      }
    },
    handler: function(session, params) {
      var defer = $.Deferred();
      Player.getPlayers(params.playerIds).then(function(players) {
        defer.resolve({
          success: true,
          players: players
        })
      });
      return defer;
    }
  }

};

// Resting: regenerating energy and muscles (energy->energy_max, frazzle->0)
// todo: decreasing food and stimulant factors
function update(player) {
  var regen = module.exports.getRegen(player);
  if (regen.frazzle == 0)
    regen.frazzle = 0.3;
  if (regen.energy == 0)
    regen.energy = 0.3;

  var now = new Date();
  var interval = DateHelper.intervalHours(Date.parse(now) - Date.parse(new Date(player.private.reg.lastUpdateTime)));
  var frazzleDecrease = $.round(regen.frazzle * interval);
  var tonusDecrease = $.round(regen.tonus * interval);
  var energyValue = $.round(player.private.energy + regen.energy * interval);

  if (energyValue > PlayersCollection.ENERGY_MAX)
    energyValue = PlayersCollection.ENERGY_MAX;

  player.private.garb += Math.round(regen.garb * interval);
  if (player.private.garb > GARB_MAX)
    player.private.garb = GARB_MAX;

  player.private.energy = energyValue;
  player.private.reg.lastUpdateTime = now.getTime();


  for (var i = 0; i < player.private.body.length; i++) {
    var muscle = player.private.body[i];
    muscle.frazzle = $.round(muscle.frazzle - frazzleDecrease);
    if (muscle.frazzle < 0)
      muscle.frazzle = 0;
    if (player.private.tonus) {
      player.private.tonus[i] = $.round(player.private.tonus[i] - tonusDecrease);
      if (player.private.tonus[i] < 0)
        player.private.tonus[i] = 0;
    }
  }
}

function getLevelChange(player, stat) {
  var now = new Date();

  var levelRequirements = Curve.getLevelRequirements(player.public.level);
  var totalGrowth = (player.private.growth || player.private.growt || 0) + stat.growth;

  if (player.public.level > 0 && totalGrowth < levelRequirements) {
    var minFixTime = DateHelper.addHoursClone(new Date(player.private.reg.lastCheckLevelUpTime), GLOBAL.GYM.CHECK_LEVELUP_PERIOD);
    if (minFixTime > now)
      return -2;
  }

  player.private.reg.lastCheckLevelUpTime = now.getTime();

  var levelUp = 0;
  if (totalGrowth >= levelRequirements) {
    player.public.level++;
    player.private.growth = 0;
    player.private.energy = PlayersCollection.ENERGY_MAX;
    levelUp = 1;
  } else if (player.public.level === 0) {
    return -2;
  } else {
    player.private.growth = totalGrowth;
  }

  // 
  // Clear all properties.
  //
  player.private.body.forEach(function(m) {
    m.frazzle = 0;
    m.stress = 0;
  });

  player.private.rest = [];
  player.private.food = [];
  player.private.stimul = [];

  if (levelUp === 0 && player.public.level === 0)
    return -2;
  return levelUp;
}