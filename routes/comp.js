var Db = require('../db');
var $ = require('jquery-deferred');
var Curve = require('../controllers/curve');
var Coach = require('../controllers/coach');
var Rank = require('../controllers/rank');
var Stimul = require('../controllers/stimul');
var Workout = require('./workout');

var WEIGHT_MIN = 0;
var REPEATS_MIN = 0;
var REPEATS_MAX = 200;
var COEFF_POWER = 7;
var COEFF_FRAZZLE = 10;
var TONUS_MAX = 10;

module.exports = {

  start: {
    params: {
      id: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {

      var defer = $.Deferred();

      var player = session.player;
      var id = params.id;

      if (player.public.comp && player.public.comp[id] && player.public.comp[id].status == 'started') {
        defer.reject('COMPPOWER_ALREADY_STARTED');
        return defer;
      }

      if (player.public.comp && player.public.comp[id] && player.public.comp[id].status == 'finished') {
        defer.reject('COMPPOWER_FINISHED');
        return defer;
      }

      if (!player.public.comp)
        player.public.comp = {};

      player.public.comp[id] = {
        status: 'started',
        index: 0,
        attempts: []
      };

      session.isDirty = true;
      defer.resolve({
        success: true,
      });

      return defer;
    }
  },

  getPrize: {
    params: {},
    handler: function(session, params) {

      var player = session.player;
      var comps = player.public.comp;
      var gold = 0;
      var money = 0;
      for (var name in comps) {
        var c = comps[name];
        if (c.status !== 'results')
          continue;

        c.status = 'end';
        gold += c.gold || 0;
        money += c.money || 0;
        session.isDirty = true;
      }

      var result = {
        success: true
      };

      if (gold) {
        player.private.gold += gold;
        result.gold = gold;
      }

      if (money) {
        player.private.money += money;
        result.money = money;
      }

      var defer = $.Deferred();

      defer.resolve(result);

      return defer;
    }
  },

  get: {
    params: {},
    handler: function(session, params) {

      var wcat = Rank.getCatIndex(session.player.public.mass || 45);

      var defer = $.Deferred();

      Db.getColl('comp').findOne({
          _id: wcat
        }, {
          'comps.members': 0
        },
        function(err, data) {
          defer.resolve(data.comps);
        });

      return defer;
    }
  },

  execute: {
    params: {
      weight: {
        required: true,
        parseMethod: parseFloat
      }
    },
    handler: function(session, params) {
      var player = session.player;

      var defer = $.Deferred();

      if (!player.public.comp) {
        defer.reject('COMPPOWER_NOTSTARTED');
        return defer;
      }
      var compPower = player.public.comp[0]
      var index = compPower.index;

      if (index > 8) {
        defer.reject('COMPPOWER_FINISHED');
        return defer;
      }

      var exId = Math.floor(index / 3);
      var realExId =
        exId === 0 ? 3 : (exId === 1 ? 2 : 4);
      var attempt = index % 3;

      params.gymId = 3;
      params.exerciseId = realExId;
      params.repeats = 1;
      params.comp = 1;

      Workout.execute.handler(session, params).then(function(res) {

        if (res.fact >= 1) {
          compPower.attempts.push(params.weight);
          if (index === 8) {
            // Calc sum
            var sum = 0;
            for (var i = 0; i < 9; i = i + 3) {
              var msum = 0;
              for (var j = 0; j < 3; j++) {
                var v = compPower.attempts[i + j];
                if (v > msum)
                  msum = v;
              }
              sum += msum;
            }
            saveSum(sum);
            return;
          }
        } else {
          compPower.attempts.push(0);
          if (index % 3 === 0) {
            saveSum(0);
            return;
          }
        }

        function saveSum(sum) {
          compPower.status = 'finished';
          compPower.sum = sum;
          var wcat = Rank.getCatIndex(player.public.mass || 45);

          var now = (new Date()).getTime();
          var p = {
            "id": player._id,
            "sum": sum,
            "mass": player.public.mass
          };

          GLOBAL.GYM.COMPS[wcat].comps[0].members.push(p);
          GLOBAL.GYM.COMPS[wcat].comps[0].last = now;
          GLOBAL.GYM.COMPS[wcat].comps[0].q++;

          Db.update('comp', wcat, {
            "$push": {
              "comps.0.members": {
                "$each": [p],
                "$sort": {
                  "sum": -1
                }
              }
            },
            "$inc": {
              "comps.0.q": 1
            },
            "$set": {
              "comps.0.last": now
            }
          }).then(function(result) {
            defer.resolve(res);
          });
        }

        compPower.index++;
        defer.resolve(res);

      }, defer.reject);

      return defer;

    }
  }
};

function setFrazzle(player, exRef, effect) {
  var frazzle = player.private.frazzle;
  var stress = player.private.stress;
  var tonus = player.private.tonus;
  exRef.body.forEach(function(muscleExercise, i) {

    var f = frazzle[muscleExercise._id] + muscleExercise.stress * effect;
    if (f > 1) f = 1;
    var s = stress[muscleExercise._id] + (muscleExercise.stress < 0.5 ? muscleExercise.stress / 5 : muscleExercise.stress) * effect;
    if (s > 1) s = 1;

    var mid = muscleExercise._id;

    var tdiff = s * 0.025;
    tdiff = tdiff - tdiff * (tonus[mid] / TONUS_MAX);
    tonus[mid] += $.round(tdiff);
    if (tonus[mid] > TONUS_MAX)
      tonus[mid] = TONUS_MAX;

    frazzle[mid] = $.round(f);
    stress[mid] = $.round(s);
  });
}