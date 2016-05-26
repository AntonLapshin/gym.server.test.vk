var Db = require('../../db'),
    GymDb = require('../../gymdb/gymdb'),
    Job = require('../../routes/job'),
    DateHelper = require('../../controllers/date');

var PLAYER_ID_TEST = 0;

module.exports = {
    setUp: function (callback) {
        GymDb.init().then(callback, console.log);
    },
    tearDown: function (callback) {
        GymDb.close().then(callback, console.log);
    },
    getSuccess: function (test) {
        var session = {auth: {id: PLAYER_ID_TEST, job: {}}};
        var past = DateHelper.setNextTime(new Date(), -Job.PERIOD - 1);

        Job.setNextTime(PLAYER_ID_TEST, past).then(
            function () {
                return Job.get(session);
            },
            console.log
        ).then(
            function (weight) {
                test.equal(!!session.auth.job.time, true);
                test.equal(Job.WEIGHT_MIN <= weight && weight <= Job.WEIGHT_MAX, true);
                test.done();
            },
            console.log
        );
    },
    getFail: function (test) {
        var session = {auth: {id: PLAYER_ID_TEST, job: {}}};
        var future = DateHelper.addMinutes(new Date(), 1);

        Job.setNextTime(PLAYER_ID_TEST, future).then(
            function () {
                return Job.get(session);
            },
            console.log
        ).then(
            function (answer) {
                test.equal(answer, Job.MES_TOOEARLY);
                test.done();
            },
            console.log
        );
    },
    completeSuccess: function (test) {
        var session = {auth: {id: PLAYER_ID_TEST, job: {}}};
        var past = DateHelper.setNextTime(new Date(), -Job.PERIOD - 1);

        Job.setNextTime(PLAYER_ID_TEST, past).then(
            function () {
                return Job.get(session);
            },
            console.log
        ).then(
            function () {
                test.equal(!!session.auth.job.time, true);
                return Job.complete(session);
            },
            console.log
        ).then(
            function (money) {
                test.equal(!!session.auth.job.time, false);
                test.equal(money == Job.MONEY, true);
                test.done();
            },
            console.log
        );
    },
    completeNotStarted: function (test) {
        var session = {auth: {id: PLAYER_ID_TEST, job: {}}};
        var now = DateHelper.addMinutes(new Date(), 1);

        Job.setNextTime(PLAYER_ID_TEST, now).then(
            function () {
                return Job.complete(session);
            },
            console.log
        ).then(
            function (answer) {
                test.equal(answer, Job.MES_NOTSTARTED);
                test.done();
            },
            console.log
        );
    },
    completeTimeIsUp: function (test) {
        var session = {auth: {id: PLAYER_ID_TEST, job: {}}};
        var past = DateHelper.setNextTime(new Date(), -Job.PERIOD - 1);

        Job.setNextTime(PLAYER_ID_TEST, past).then(
            function () {
                return Job.get(session);
            },
            console.log
        ).then(
            function () {
                test.equal(!!session.auth.job.time, true);

                session.auth.job.time =
                    DateHelper.addSeconds(session.auth.job.time, -Job.TIMER - 10);

                return Job.complete(session);
            },
            console.log
        ).then(
            function (answer) {
                test.equal(answer, Job.MES_TIMEISUP);
                test.done();
            },
            console.log
        );
    }
};