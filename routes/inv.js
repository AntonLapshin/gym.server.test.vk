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

      if (type === 'hs' || type === 'bd' || type === 'gl' || type === 'sh' || type === 'ts') {
        var result = set(session, type, id);
        if (!result) {
          answer.success = false;
        }
      }

      var defer = $.Deferred();

      defer.resolve(answer);

      return defer;
    }
  }
};

function set(session, type, id) {
  var storage = session.player.public[type + 's']
  if (!storage || storage.indexOf(id) == -1) {
    return false;
  }
  session.player.public[type] = id;
  session.isDirty = true;
  return true
}