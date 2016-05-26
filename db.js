var Mongo = require('mongodb'),
  $ = require('jquery-deferred');

var _db = null,
  _collections = {},
  _references = {};

$.handle = function(err, data, defer) {
  if (err)
    defer.reject(err);
  else {
    defer.resolve(data);
  }
};

$.grep = function(array, callback) {
  var res = [];
  array.forEach(function(item) {
    if (callback(item))
      res.push(item);
  });
  return res;
};

$.round = function(v) {
  return Math.round(v * 100000) / 100000;
};

$.random = function(min, max) {
  return (Math.random() * (max - min) + min) | 0;
};

$.sum = function(arr) {
  var s = 0;
  arr.forEach(function(v) {
    s += v;
  });
  return s;
};

module.exports = {
  init: function(options, collNames, refNames) {
    return this.connect(options)
      .then(function() {
        return module.exports.getCollections(collNames);
      })
      .then(function() {
        return loadReferences(refNames)
      })
  },
  connect: function(options) {
    var dbInstance = new Mongo.Db(
      options.database,
      new Mongo.Server(
        options.host,
        options.port, {
          auto_reconnect: true
        }, {}
      )
    );

    return $.Deferred(function(defer) {
      dbInstance.open(function(err, db) {
        if (err)
          defer.reject(err);
        else {
          _db = db;
          auth(options).then(function() {
            defer.resolve();
          }, defer.reject);
        }
      });
    });
  },
  clearCollections: function(names) {
    var defers = [];
    names.forEach(function(name) {
      defers.push(clearCollection(name));
    });

    return $.when.apply($, defers);
  },
  clearCollection: clearCollection,
  getCollections: function(names) {
    var defers = [];
    names.forEach(function(name) {
      defers.push(getCollection(name));
    });

    return $.when.apply($, defers);
  },
  insert: function(coll, value) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    return $.Deferred(function(defer) {
      if (value === undefined || value === null || value.length === 0) {
        defer.resolve();
        return;
      }
      coll.insert(value, function(err) {
        $.handle(err, value, defer);
      });
    });
  },
  update: function(coll, id, updateClause) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    return $.Deferred(function(defer) {
      coll.update({
        _id: id
      }, updateClause, function(err, value) {
        $.handle(err, value, defer);
      });
    });
  },
  remove: function(coll, id) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    return $.Deferred(function(defer) {
      coll.remove({
        _id: id
      }, function(err, data) {
        $.handle(err, data, defer);
      });
    });
  },
  exists: function(coll, id) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    return $.Deferred(function(defer) {
      coll.findOne({
        _id: id
      }, {
        _id: 1
      }, function(err, data) {
        $.handle(err, data, defer);
      });
    });
  },
  find: function(coll, id, shown) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    var shownBase = shown;
    if (typeof shown === 'string') shown = [shown];
    var target = {};
    for (var i = 0; i < shown.length; i++) target[shown[i]] = 1;

    return $.Deferred(function(defer) {
      coll.findOne({
        _id: id
      }, target, function(err, data) {
        if (err)
          defer.reject(err);
        else {
          if (data == null) defer.resolve(null);
          else if (typeof shownBase === 'string')
            defer.resolve(data[shownBase]);
          else
            defer.resolve(data);
        }
      });
    });
  },
  ensureIndex: function(coll, index) {
    if (typeof coll === 'string')
      coll = _collections[coll];

    return $.Deferred(function(defer) {
      if (index == undefined) {
        defer.resolve();
        return;
      }

      coll.ensureIndex(index, function(err, data) {
        $.handle(err, data, defer);
      });
    });
  },
  getRefs: function() {
    return _references;
  },
  getDb: function() {
    return _db;
  },
  getColl: function(name) {
    return _collections[name];
  }
};

function auth(options) {
  return $.Deferred(function(defer) {
    _db.authenticate(options.username, options.password, function(err, data) {
      $.handle(err, data, defer);
    });
  });
}

function loadReference(name) {
  return getAllValues(name).then(function(result) {
    _references[name] = result;
  });
}

function loadReferences(names) {
  var defers = [];
  names.forEach(function(name) {
    defers.push(loadReference(name));
  });

  return $.when.apply($, defers);
}

function getCollection(name) {
  return $.Deferred(function(defer) {
    _db.collection(name, function(err, value) {
      if (err)
        defer.reject(err);
      else {
        _collections[name] = value;
        defer.resolve(value);
      }
    });
  });
}

function getAllValues(coll) {
  if (typeof coll === 'string')
    coll = _collections[coll];

  return $.Deferred(function(defer) {
    coll.find({
      $query: {},
      $orderby: {
        _id: 1
      }
    }).toArray(function(err, data) {
      $.handle(err, data, defer);
    });
  });
}

function clearCollection(coll) {
  if (typeof coll === 'string')
    coll = _collections[coll];

  return $.Deferred(function(defer) {
    if (coll === undefined) {
      defer.resolve();
      return;
    }
    coll.remove(function(err, data) {
      $.handle(err, data, defer);
    });
  });
}