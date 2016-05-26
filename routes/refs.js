var Db = require('../db'),
  $ = require('jquery-deferred');

module.exports = {
  default: {
    handler: function() {
      return $.Deferred(function(defer) {
        defer.resolve({
          success: true,
          refs: Db.getRefs()
        });
      });
    }
  }
};