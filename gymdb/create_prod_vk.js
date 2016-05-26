var GymDb = require('./gymdb');
var instances = require('./instances');

GymDb.create(instances.GYMPRODVK).then(
    function () {
        console.log("Database has been created");
        GymDb.close();
    },
    function (err) {
        console.log(err);
    });