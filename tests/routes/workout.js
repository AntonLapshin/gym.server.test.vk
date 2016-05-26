var Db = require('../../db'),
    Player = require('../../controllers/player'),
    GymDb = require('../../gymdb/gymdb'),
    PlayersCollection = require('../../gymdb/collections/players'),
    Workout = require('../../routes/workout');

var PLAYER_ID_TEST = 0;
var GYM = 0;
var EXERCISE = 0;
var session = { auth: { id: PLAYER_ID_TEST } };
var params = {
    gymId: GYM,
    exerciseId: EXERCISE,
    weight: 90,
    repeats: 0
};

module.exports = {
    setUp: function (callback) {
        GymDb.create().then(function () {
            GymDb.init().then(callback, console.log);
        }, console.log);
    },
    tearDown: function (callback) {
        GymDb.close().then(function(){
            callback();
        });
    },
    getExercisePower: function (test) {
        var exRef = Db.getRefs().exercises[2];
        var body = null;

        Player.find(session.auth.id, ['private', 'public']).then(
            function (player) {
                var totalPower = Workout.getExercisePower(player.private.body, player.public, exRef);
                test.equal(totalPower, 334);
                test.done();
            }
        );
    },
    executeSuccessForce: function (test) {
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(answer.repeats, 34.39);
                test.equal(answer.repeatsMax, 34.39);
                test.equal(answer.energy, 5);
                test.equal(answer.records.length, 2);

                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer.repeats, 34.02);
                test.equal(answer.repeatsMax, 34.02);
                test.equal(answer.energy, 5);
                test.equal(answer.records.length, 0);

                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer.repeats, 33.63);
                test.equal(answer.repeatsMax, 33.63);
                test.equal(answer.energy, 5);

                test.done();
            }
        );
    },
    executeSuccess: function (test) {
        params.weight = 35;
        params.repeats = 12;
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(answer.repeats, 12);
                test.equal(answer.repeatsMax, 54.48);
                test.equal(answer.energy, 2);

                test.done();
            }
        );
    },
    executeWarmup: function (test) {
        params.weight = 100;
        params.repeats = 1;
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(answer.repeats, 1);
                test.equal(answer.repeatsMax, 31.16);
                test.equal(answer.energy, 1);

                test.done();
            }
        );
    },
    executeFailWeight: function (test) {
        params.weight = 10;
        params.repeats = 12;
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(answer, Workout.MES_WEIGHT);
                params.weight = 100;
                params.repeats = 12;
                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.notEqual(answer, Workout.MES_WEIGHT);
                params.weight = 33.231;
                params.repeats = 12;
                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer, Workout.MES_WEIGHT);
                test.done();
            });
    },
    executeFailRepeats: function (test) {
        params.weight = 50;
        params.repeats = 500;
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(answer, Workout.MES_REPEATS_MAX);
                params.weight = 50;
                params.repeats = -1;
                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer, Workout.MES_REPEATS_MIN);
                test.done();
            }
        );
    },
    executeFailLessOneRepeat: function (test) {
        params.weight = 240;
        params.repeats = 1;
        Workout.execute.handler(session, params).then(
            function (answer) {
                test.equal(0 < answer.repeatsMax && answer.repeatsMax < 1, true);
                test.equal(0 < answer.repeats && answer.repeats < 1, true);
                test.equal(answer.energy, Db.getRefs().exercises[0].energy);
                test.done();
            }
        );
    },
    executeFailEnergy: function (test) {
        Player.update(PLAYER_ID_TEST, {$set: {'private.energy': Db.getRefs().exercises[EXERCISE].energy - 1}}).then(
            function () {
                params.weight = 50;
                params.repeats = 0;
                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer, Workout.MES_ENERGY);
                return Player.update(PLAYER_ID_TEST, {$set: {'private.energy': 1}});
            }
        ).then(
            function () {
                params.weight = 160;
                params.repeats = 10;
                return Workout.execute.handler(session, params);
            }
        ).then(
            function (answer) {
                test.equal(answer, Workout.MES_ENERGY);
                test.done();
            }
        );
    }
};