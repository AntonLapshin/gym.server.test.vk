var GymDb = require('../../gymdb/gymdb'),
    Db = require('../../db');

module.exports = {
    setUp: function (callback) {
        GymDb.init().then(callback, console.log);
    },
    tearDown: function (callback) {
        GymDb.close();
        callback();
    },
    get: function (test) {
        var references = Db.getRefs();
        test.equal(references != undefined, true);
        test.equal(references.muscles != undefined, true);
        test.equal(references.muscles.length, 16);
        test.done();
    }
};
