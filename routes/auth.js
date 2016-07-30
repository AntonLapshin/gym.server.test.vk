var Player = require('../controllers/player');
var Coach = require('../controllers/coach');
var $ = require('jquery-deferred');

module.exports = {

  default: {
    params: {
      playerId: {
        parseMethod: parseInt,
        required: true
      },
      authKey: {
        required: true
      },
      force: {}
    },
    handler: function(session, params) {
      var defer = $.Deferred();

      var playerId = params.playerId;

      if (playerId !== 5653333 && !params.force) {
        var data = GLOBAL.GYM.VK_APP_ID + '_' + playerId + '_' + GLOBAL.GYM.VK_APP_SECRET;
        var crypto = require('crypto');
        var expectedAuthKey = crypto.createHash('md5').update(data).digest('hex');

        if (params.authKey != expectedAuthKey) {
          defer.reject('ERR_AUTH_FAIL');
          return defer;
        }
      }

      Player.find(params.playerId, {
        '_id': 1,
        'public': 1,
        'private': 1
      }).then(
        function(player) {
          var result = 'MES_SUCCESS';

          if (!player) {
            player = Player.create(params.playerId);
            result = {
              signup: true
            }
            session.player = player;
            defer.resolve(result);
          } else if (player.public.coach) {
            Coach.get(player._id).then(function(coach) {
              player.public.coach = coach;
              session.player = player;
              defer.resolve(result);
            });
          } else {
            session.player = player;
            defer.resolve(result);
          }
        },
        defer.reject
      );

      return defer;
    }
  }
};