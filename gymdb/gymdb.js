var Db = require('../db');
var $ = require('jquery-deferred');

var COLL_NAMES = ['exercises', 'gyms', 'muscles', 'players', 'achievements', 'shop', 'coaches', 'errors'],
  REF_NAMES = ['exercises', 'gyms', 'muscles', 'achievements', 'shop'],
  INDEX = {
    'players': {
      'score': -1
    },
    'coaches': {
      'q': -1
    }
  };

module.exports = {
  init: function(DB_INSTANCE) {
    return Db.init(DB_INSTANCE, COLL_NAMES, REF_NAMES);
  },
  close: function() {
    return $.Deferred(function(defer) {
      Db.getDb().close(function() {
        defer.resolve();
      });
    });
  },
  create: function(DB_INSTANCE) {
    return Db.connect(DB_INSTANCE)
      .then(function() {
        return Db.getCollections(COLL_NAMES);
      })
      .then(function() {
        return Db.clearCollections(COLL_NAMES);
      })
      .then(function() {
        return createCollections();
      });
  },
  COLL_NAMES: COLL_NAMES,
  REF_NAMES: REF_NAMES
};

function createColl(name) {
  var values = require('./collections/' + name)[name];
  return Db.insert(name, values)
    .then(function() {
      return Db.ensureIndex(name, INDEX[name]);
    });
}

function createCollections() {
  var defers = [];
  COLL_NAMES.forEach(function(name) {
    defers.push(createColl(name));
  });
  return $.when.apply($, defers);
}