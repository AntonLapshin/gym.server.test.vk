var $ = require('jquery-deferred');

module.exports = {
  default: {
    params: {
      playerId: {
        required: true,
        parseMethod: parseInt
      },
      amount: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {

      session.pendingPayment = {
        amount: params.amount
      };

      var defer = $.Deferred();

      session.save(function() {
        defer.resolve(true);
      });

      return defer;
    }
  }
};