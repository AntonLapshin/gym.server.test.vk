var Curve = require('./curve');
var Db = require('../db');
var $ = require('jquery-deferred');

function getStimul(player, type) {
  var dose = Curve.getDose(player.public.level);
  var q = 0;
  player.private.stimul.forEach(function(s) {
    var sRef = Db.getRefs().shop[2].items[s];
    if (sRef && sRef[type])
      q++;
  });

  if (q > dose)
    q = dose;

  var doseEffect = Curve.getDoseEffect(q / dose);
  return doseEffect;
}

function getFood(player) {
  var dose = Curve.getDose(player.public.level);
  var q = 0;
  player.private.food.forEach(function(s) {
    var sRef = Db.getRefs().shop[0].items[s];
    if (sRef && sRef.food)
      q += sRef.food;
  });

  if (q > dose)
    q = dose;

  var doseEffect = Curve.getDoseEffect(q / dose);
  return doseEffect;
}

module.exports = {

  getGrowth: function(player) {
    return getStimul(player, 'growth');
  },

  getPower: function(player) {
    return getStimul(player, 'power');
  },

  getRegen: function(player) {
    return getStimul(player, 'regen');
  },

  getFood: function(player) {
    return getFood(player);
  }

};