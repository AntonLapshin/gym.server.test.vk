var Db = require('../db');
var PlayersCollection = require('../gymdb/collections/players');
var $ = require('jquery-deferred');
var Rank = require('./rank');

var LIMIT_TOP_PLAYERS = 20;

module.exports = {
  create: function(id) {
    var p = PlayersCollection.newPlayer(id, 0);
    Db.insert('players', p);
    return p;
  },
  update: function(id, player) {
    player.score = PlayersCollection.getScore(
      player.public.level,
      player.private.achievements.length,
      player.private.friends
    );
    return Db.update('players', id, player);
  },
  exists: function(id) {
    return Db.exists('players', id);
  },
  find: function(id, shown) {
    var defer = $.Deferred();
    Db.getColl('players').find({
      _id: id
    }, shown)
      .toArray(function(err, data) {
        $.handle(err, data[0], defer);
      });
    return defer;
    //return Db.find('players', id, shown);
  },
  remove: function(id) {
    return Db.remove('players', id);
  },
  cat: function(cat) {
    var catData = Rank.getCatData(cat);
    return $.Deferred(function(defer) {
      Db.getColl('players').find({
        $query: {
          "public.mass": {
            "$gte": catData.min,
            "$lt": catData.max
          }
        },
        $orderby: {
          'public.sum': -1
        }
      }, {
        _id: 1,
        public: 1
      })
        .limit(LIMIT_TOP_PLAYERS)
        .toArray(function(err, data) {
          $.handle(err, data, defer);
        });
    });
  },
  top: function() {
    return $.Deferred(function(defer) {
      Db.getColl('players').find({
        $query: {},
        $orderby: {
          'public.sum': -1
        }
      }, {
        _id: 1,
        public: 1
      })
        .limit(LIMIT_TOP_PLAYERS)
        .toArray(function(err, data) {
          $.handle(err, data, defer);
        });
    });
  },
  getPlayers: function(ids) {
    return $.Deferred(function(defer) {
      Db.getColl('players').find({
        _id: {
          $in: ids
        }
      }, {
        _id: 1,
        public: 1
      })
        .limit(LIMIT_TOP_PLAYERS)
        .toArray(function(err, data) {
          $.handle(err, data, defer);
        });
    });
  }
};