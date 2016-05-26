var Db = require('../db');
var $ = require('jquery-deferred');
var job = require('./job');
var self = require('./self');
var workout = require('./workout');
var curve = require('../controllers/curve');

module.exports = {
  default: {
    params: {
      player: {
        required: true,
        parseMethod: JSON.parse
      }
    },
    handler: function(session, params) {
      var player = params.player;

      var defer = $.Deferred();

      var mass = curve.getMass(player.public.level);

      var exercises = [
        "Подтягивание",
        "Брусья",
        "Жимлежа",
        "Присед",
        "Сумо",
        "Тяга в наклоне",
        "Подъемы на бицепс",
      ];

      var workoutResult = {};

      exercises.forEach(function(ex, i) {
        weightMax = workout.getTotalWeightMax(player, i);
        workoutResult[ex] = {
          weightMax: weightMax
        };
        var w = weightMax;
        var exRef = Db.getRefs().exercises[i];
        if (exRef.selfweight)
          w -= mass;
        if (w < 0)
          w = 0;
        [w * 0.9, w * 0.8, 0].forEach(function(weight) {
          var meta = workout.getRepeatsAndEff(player, i, weight, weightMax);
          workoutResult[ex][weight] = 'repeatsMax = ' + meta.repeatsMax.toFixed(2) + ' (effWeight = ' + meta.weightEffect.toFixed(2) + ')';
        });
      });

      var result = {
        mass: mass,
        job: {
          period: 'each ' + job.PERIOD + ' minutes',
          expectTime: job.getExpectTime(player),
          isStartedAlready: job.isStartedAlready(player)
        },
        stat: self.getPlayerStat(player),
        regen: self.getRegen(player),
        workout: workoutResult,
      };

      defer.resolve(result);

      return defer;
    }
  }
};