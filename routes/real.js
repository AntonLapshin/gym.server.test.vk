var Db = require('../db');
var $ = require('jquery-deferred');
var Purchase = require('../controllers/purchase');

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

      Purchase.go(session, type, id, answer, real);

      var defer = $.Deferred();

      session.pendingPayment = null;
      session.isDirty = true;
      defer.resolve(answer);

      return defer;
    }
  }
};