var _rates = {
  money: 20,
  gold: 1
};
var _bonus = 0.05;

module.exports = {
  go: function(session, type, id, answer, real) {
    var player = session.player;
    if (type === 'stimul' && id === 3) {
      answer.energy = Math.ceil(player.private.energyMax - player.private.energy);
      player.private.energy = player.private.energyMax;
    } else if (type === 'gyms' || type === 'food' || type === 'rest' || type === 'stimul')
      player.private[type].push(id);
    if (type === 'exercises') {
      player.public.exercises.push({
        _id: id
      });
    } else if (type === 'hs' || type === 'bd' || type === 'gl' || type === 'sh' || type === 'ts') {
      add(player, type, id);
    } else if (type === 'money' || type === 'gold') {
      var diff = Math.floor(real * _rates[type] + real * _bonus * (real * _rates[type]));
      player.private[type] += diff;
      answer[type] = diff;
      delete answer.purchase;
    } else {
      player.private[type].push(id);
    }
  },
};

function add(player, type, id) {
  player.public[type] = id;
  if (!player.public[type + 's']) {
    player.public[type + 's'] = [];
  }
  if (player.public[type + 's'].indexOf(id) == -1)
    player.public[type + 's'].push(id);
}