var Db = require('../db'),
  $ = require('jquery-deferred');

module.exports = {
  default: {
    params: {
      type: {
        required: true,
      },
      id: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var type = params.type;
      var id = params.id;

      var answer = {
        success: true
      };

      if (type === 'hs' || type === 'bd' || type === 'gl' || type === 'sh' || type === 'ts' || type === 'sn') {
        var result = set(session, type, id);
        if (!result) {
          answer.success = false;
        }
      }

      var defer = $.Deferred();

      defer.resolve(answer);

      return defer;
    }
  },
  bulk: {
    params: {
      statement: {
        required: true,
      }
    },
    handler: function(session, params) {
      var statement = params.statement;

      var pairs = statement.split(',');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        var type = pair[0];
        var id = pair[1];
        set(session, type, id);
      }

      var answer = {
        success: true
      };

      var defer = $.Deferred();

      defer.resolve(answer);

      return defer;
    }
  }
};

function set(session, type, id) {
  var storage = session.player.public[type + 's']
  if (!storage || (storage.indexOf(id) == -1 && id != 0)) {
    return false;
  }
  session.player.public[type] = id;
  session.isDirty = true;
  return true
}