var GymDb = require('./gymdb');
var Db = require('../db');
var instances = require('./instances');
var fs = require('fs');
var PlayersCollection = require('./collections/players');

GymDb.init(instances.GYMPRODVK).then(
    function () {
      Db.getColl('players').find({$query: {}}).toArray(function(err, data){
        console.log(data.length);
        fs.writeFile("players.txt", JSON.stringify(data), function(err) {
          if(err) {
            return console.log(err);
          }

          console.log("The file was saved!");
          GymDb.close();
        }); 
      });
    },
    function (err) {
        console.log(err);
    });

