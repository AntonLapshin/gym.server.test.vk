var GymDb = require('./gymdb');
var Db = require('../db');
var instances = require('./instances');
var fs = require('fs');
var PlayersCollection = require('./collections/players');

GymDb.init(instances.GYMPRODVK).then(
    function () {
        var p = PlayersCollection.newPlayer(5653333, 4);
        Db.insert('players', p).then(function(){
        	GymDb.close();
        });    	
    },
    function (err) {
        console.log(err);
    });

