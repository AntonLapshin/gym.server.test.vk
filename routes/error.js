var Db = require('../db');
var $ = require('jquery-deferred');

module.exports = {
  default: {
    params: {
      message: {
        required: true
      }
    },
    handler: function(session, params) {
      // Db.insert('errors', {
      //   _id: (new Date()).getTime(),
      //   playerId: session.player._id,
      //   side: 'client',
      //   message: params.message
      // });

      var defer = $.Deferred();

      defer.resolve({
        success: true
      });

      return defer;
    }
  }
};