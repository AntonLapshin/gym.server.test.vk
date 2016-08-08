var Db = require('../db');
var $ = require('jquery-deferred');
var Curve = require('../controllers/curve');
var Coach = require('../controllers/coach');
var Rank = require('../controllers/rank');
var Stimul = require('../controllers/stimul');

var WEIGHT_MIN = 0;
var REPEATS_MIN = 0;
var REPEATS_MAX = 200;
var COEFF_POWER = 7;
var COEFF_FRAZZLE = 10;
var TONUS_MAX = 10;

module.exports = {

  getTotalWeightMax: function(player, id) {
    var level = player.public.level;
    var tonus = player.private.tonus;
    var exRef = Db.getRefs().exercises[id];

    var weightMax = Curve.getWeightMax(level, id);

    var powerStimul = Stimul.getPower(player);

    var totalM = 0;
    var totalMf = 0;
    var totalMt = 0;
    for (var i = 0; i < exRef.body.length; i++) {
      var muscleEx = exRef.body[i];
      var muscleRef = Db.getRefs().muscles[muscleEx._id];
      var muscleTonus = tonus ? tonus[muscleEx._id] : 0;

      var m = muscleRef.power * muscleEx.stress;
      var mf = m * player.private.frazzle[muscleEx._id];
      var mt = m * muscleTonus;

      totalM += m;
      totalMf += mf;
      totalMt += mt;
    }

    var frazzle = (totalMf / totalM);
    var tonus = (totalMt / totalM);

    var totalWeightMax =
      weightMax + 0.1 * weightMax * powerStimul - 0.1 * weightMax * frazzle + 0.1 * weightMax * tonus;

    return totalWeightMax;
  },

  getRepeatsAndEff: function(player, id, weight, weightMax) {

    var repeatsMax = Curve.getRepeatsMax(player.public.level, id, weight, weightMax);
    var weightEffect = Curve.getRepeatsEffect(repeatsMax);

    return {
      repeatsMax: repeatsMax,
      weightEffect: weightEffect
    };
  },

  auto: {
    params: {
      rate: {
        required: true,
        parseMethod: parseInt
      },
      eff: {
        required: true,
        parseMethod: parseFloat
      }
    },
    handler: function(session, params) {

      var defer = $.Deferred();

      var player = session.player;
      var rate = params.rate;
      var eff = params.eff;

      if (player.private.money < rate) {
        defer.resolve({
          success: false
        });
        return defer;
      }

      var answer = {
        success: true
      };
      var percent = player.private.energy / player.private.energyMax;
      eff = percent * eff;

      var frazzle = player.private.frazzle;
      var stress = player.private.stress;
      var tonus = player.private.tonus;

      for (var i = 0; i <= 15; i++) {
        frazzle[i] += $.round(eff);
        stress[i] += $.round(eff);
        if (frazzle[i] > 1)
          frazzle[i] = 1;
        if (stress[i] > 1)
          stress[i] = 1;
        var tdiff = eff * 0.01;
        tdiff = tdiff - tdiff * (tonus[i] / TONUS_MAX);
        tonus[i] += $.round(tdiff);
        if (tonus[i] > TONUS_MAX)
          tonus[i] = TONUS_MAX;
      }

      session.isDirty = true;
      answer.effect = eff;
      answer.energy = -player.private.energy;
      answer.money = -rate;
      player.private.energy = 0;
      Coach.earn(player.private.coach, rate);

      defer.resolve(answer);

      return defer;
    }
  },

  execute: {
    params: {
      gymId: {
        required: true,
        parseMethod: parseInt
      },
      exerciseId: {
        required: true,
        parseMethod: parseInt
      },
      weight: {
        required: true,
        parseMethod: parseFloat
      },
      repeats: {
        required: true,
        parseMethod: parseInt
      },
      comp: {
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var player = session.player;
      var comp = params.comp;
      var gymId = params.gymId;
      var exerciseId = params.exerciseId;
      var weight = params.weight;
      var repeats = params.repeats;

      var defer = $.Deferred();

      var gymRef = Db.getRefs().gyms[gymId];
      if (!comp && gymRef.exercises.indexOf(exerciseId) == -1) {
        defer.reject('MES_EXERCISE');
        return defer;
      }
      var playerEx = $.grep(player.public.exercises, function(ex) {
        return ex._id === exerciseId;
      });
      if (!comp && playerEx.length === 0) {
        defer.reject('MES_EXERCISE');
        return defer;
      }
      playerEx = playerEx[0];

      var exRef = Db.getRefs().exercises[exerciseId];
      var maxWeight = exRef.max * gymRef.weight;

      if (!comp && (weight < WEIGHT_MIN || maxWeight < weight)) {
        defer.reject('MES_WEIGHT');
        return defer;
      }
      if (!comp && repeats < REPEATS_MIN) {
        defer.reject('MES_REPEATS_MIN');
        return defer;
      }
      if (!comp && repeats > REPEATS_MAX) {
        defer.reject('MES_REPEATS_MAX');
        return defer;
      }

      var answer = {
        success: true,
        id: exerciseId,
        weight: weight,
        plan: repeats,
      };

      var weightMax = module.exports.getTotalWeightMax(player, exerciseId);

      if (weightMax < weight && exRef.energy > player.private.energy) {
        defer.reject('MES_ENERGY');
        return defer;
      }

      var meta = module.exports.getRepeatsAndEff(player, exerciseId, weight, weightMax);

      var repeatsPlan = repeats > 0 ? repeats : meta.repeatsMax;
      var repeatsFact = Math.floor(repeatsPlan < meta.repeatsMax ? repeatsPlan : meta.repeatsMax);
      var energyFact;
      var repeatsEffect;

      if (weightMax < weight) {
        repeatsEffect = 0.5;
        energyFact = exRef.energy;
      } else {
        repeatsEffect = Curve.getRepeatsEffect(repeatsPlan);
        energyFact = Math.ceil((repeatsFact / meta.repeatsMax) * exRef.energy);
        if (energyFact > player.private.energy) {
          defer.reject('MES_ENERGY');
          return defer;
        }
      }

      var effect = meta.weightEffect * repeatsEffect * 0.3 * (repeatsFact / meta.repeatsMax);

      answer.effect = effect;
      answer.fact = meta.repeatsMax;
      answer.energy = -energyFact;

      if (playerEx && repeatsFact >= 1) {
        // Personal Record
        var pr = playerEx.pr || 0;
        if (weight > pr) {
          if (playerEx) {
            playerEx.pr = weight;
          }

          var rankResult = Rank.update(player);
          if (rankResult !== null)
            answer.rank = rankResult;

          answer.pr = true;
        }

        // Absolute Record
        var wr = exRef.wr;
        if (weight > (wr ? wr.value : 0)) {
          exRef.wr = {
            value: weight,
            _id: player._id
          };

          Db.update('exercises', exerciseId, {
            $set: {
              wr: exRef.wr
            }
          });
          answer.wr = true;
        }
      }

      player.private.energy -= energyFact;
      setFrazzle(player, exRef, effect, energyFact);
      session.isDirty = true;

      defer.resolve(answer);

      return defer;
    }
  }
};

function setFrazzle(player, exRef, effect, energyFact) {
  var frazzle = player.private.frazzle;
  var stress = player.private.stress;
  var tonus = player.private.tonus;

  var feffect = energyFact / exRef.energy * 0.2;

  exRef.body.forEach(function(muscleExercise, i) {

    var f = frazzle[muscleExercise._id] + muscleExercise.stress * feffect;
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