var Player = require('../../controllers/player'),
    GymDb = require('../../gymdb/gymdb'),
    Auth = require('../../routes/auth');

var PLAYER_ID = 0,
    AUTH_KEY = '884e02e93401a63c16614681a2a82808',
    AUTH_KEY_WRONG = 'wrong';

module.exports = {
    setUp: function (callback) {
        GymDb.init().then(callback, console.log);
    },
    tearDown: function (callback) {
        GymDb.close().then(callback, console.log);
    },
    authSuccess: function (test) {
        var session = {},
            params = {
                playerId: PLAYER_ID,
                authKey: AUTH_KEY
            };

        Auth.default.handler(session, params).then(
            function (answer) {
                test.equal(answer, Auth.MES_SUCCESS);
                test.equal(session.player._id, PLAYER_ID);
                test.done();
            },
            console.log
        );
    },
    authFail: function (test) {
        var session = {},
            params = {
                playerId: PLAYER_ID,
                authKey: AUTH_KEY_WRONG
            };

        Auth.default.handler(session, params).then(
            function () {
            }, function(answer){
                test.equal(answer, Auth.ERR_AUTH_FAIL);
                test.done();
            }
        );
    }
};
