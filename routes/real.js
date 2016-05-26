var Db = require('../db'),
  $ = require('jquery-deferred');

var _rates = {
  money: 20,
  gold: 1
};
var _bonus = 0.05;

module.exports = {
  default: {
    params: {
      type: {
        required: true,
      },
      id: {
        required: true,
        parseMethod: parseInt
      },
      real: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var type = params.type;
      var id = params.id;
      var real = params.real;

      if (!GLOBAL.GYM.test && (!session.pendingPayment || session.pendingPayment.amount != real)) {
        return $.Deferred(function(defer) {
          defer.resolve({
            success: false
          });
        });
      }

      var answer = {
        success: true,
        purchase: {
          type: type,
          id: id,
          success: true
        }
      };

      if (type === 'gyms' || type === 'food' || type === 'rest' || type === 'stimul') {
        session.player.private[type].push(id);
      } else if (type === 'exercises') {
        session.player.public[type].push({
          _id: id
        });
      } else if (type === 'hs' || type === 'bd' || type === 'gl' || type === 'sh') {
        add(session, type, id);
      } else if (type === 'money' || type === 'gold') {
        var diff = Math.floor(real * _rates[type] + real * _bonus * (real * _rates[type]));
        session.player.private[type] += diff;
        answer[type] = diff;
        delete answer.purchase;
      }

      var defer = $.Deferred();

      session.pendingPayment = null;
      session.isDirty = true;
      defer.resolve(answer);

      return defer;
    }
  }
};

function add(session, type, id) {
  session.player.public[type] = id;
  if (!session.player.public[type + 's']) {
    session.player.public[type + 's'] = [];
  }
  if (session.player.public[type + 's'].indexOf(id) == -1)
    session.player.public[type + 's'].push(id);
}