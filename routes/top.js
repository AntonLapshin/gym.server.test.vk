var Player = require('../controllers/player'),
  $ = require('jquery-deferred');

module.exports = {
  default: {
    handler: function(session) {
      var defer = $.Deferred();

      Player.top().then(function(players) {
        defer.resolve({
          success: true,
          players: players
        });
      });

      return defer;
    }
  },

  cat: {
    params: {
      cat: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var defer = $.Deferred();

      Player.cat(params.cat).then(function(players) {
        defer.resolve({
          success: true,
          players: players
        });
      });

      return defer;
    }
  },
};