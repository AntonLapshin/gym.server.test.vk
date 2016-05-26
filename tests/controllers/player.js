var Db = require('../../db'),
    Player = require('../../controllers/player'),
    GymDb = require('../../gymdb/gymdb'),
    PlayersCollection = require('../../gymdb/collections/players'),
    DateHelper = require('../../controllers/date');

var PLAYER_ID_TEST = 0;
var PLAYER_ID_NOT_EXISTS = -1;
var PLAYER_NOT_CREATED = 99;

module.exports = {
    setUp: function (callback) {
        GymDb.init().then(GymDb.create, console.log).then(callback, console.log);
    },
    tearDown: function (callback) {
        GymDb.close().then(callback, console.log);
    },
    exists: function (test) {
        Player.exists(PLAYER_ID_TEST).then(function (_id) {
            test.equal(_id != null, true);
            test.done();
        });
    },
    notExists: function (test) {
        Player.exists(PLAYER_ID_NOT_EXISTS).then(function (_id) {
            test.equal(!_id, true);
            test.done();
        });
    },
    find: function (test) {
        var field = 'public';
        Player.find(PLAYER_ID_TEST, {'public': 1}).then(
            function (data) {
                test.equal(data != null, true);
                test.done();
            }
        );
    },
    top: function(test){
        Player.top().then(
            function (data) {
                test.equal(data != null, true);
                test.done();
            }
        );
    },
    create: function(test){
        Player.find(PLAYER_NOT_CREATED, {'public': 1}).then(
            function (publicInfo) {
                test.equal(publicInfo == undefined, true);
                return Player.create(PLAYER_NOT_CREATED);
            }
        ).then(
            function () {
                return Player.find(PLAYER_NOT_CREATED, {'public': 1});
            }
        ).then(
            function (publicInfo) {
                test.equal(publicInfo != undefined, true);
                test.done();
            }
        );
    }
};
