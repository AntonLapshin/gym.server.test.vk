var Curve = require('./curve');
var $ = require('jquery-deferred');

module.exports = {

  getMass: function(player, growth) {
    var level = player.public.level;
    var mass = Curve.getMass(level);
    var massTo = Curve.getMass(level + 1);
    var levelRequirements = Curve.getLevelRequirements(level);
    var perc = ((player.private.growth || 0) + growth) / levelRequirements;
    if (perc > 1)
      perc = 1;
    var massDiff = perc * (massTo - mass);
    return mass + massDiff;
  },

};