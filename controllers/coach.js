var Db = require('../db'),
  CoachesCollection = require('../gymdb/collections/coaches'),
  $ = require('jquery-deferred');

var LIMIT_TOP_COACHES = 20;

module.exports = {
  create: function(id) {
    var c = CoachesCollection.newCoach(id);
    Db.insert('coaches', c);
    return c;
  },
  dec: function(id) {
    return Db.update('coaches', id, {
      $inc: {
        'q': -1
      }
    });
  },
  inc: function(id) {
    return Db.update('coaches', id, {
      $inc: {
        'q': 1
      }
    });
  },
  getPay: function(id) {
    return Db.update('coaches', id, {
      $set: {
        's': 0
      }
    });
  },
  earn: function(id, rate) {
    return Db.update('coaches', id, {
      $inc: {
        's': rate
      }
    });
  },
  get: function(id) {
    return Db.find('coaches', id, {
      s: 1,
      q: 1
    });
  }
};