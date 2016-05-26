var Db = require('../db');
var instances = require('./instances');

var name = 'achievements';

Db.connect(instances.GYMTESTVK)
    .then(function () {
        return Db.getCollections([name]);
    })
	.then(function () {
	    return Db.clearCollection(name);
	}, console.log)
	.then(function () {
	    var values = require('./collections/' + name)[name];
	    return Db.insert(name, values);
	}, console.log)
	.then(function(){
		Db.getDb().close();
	}, console.log);


