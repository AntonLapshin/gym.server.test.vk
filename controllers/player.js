var Db=require("../db"),PlayersCollection=require("../gymdb/collections/players"),$=require("jquery-deferred"),LIMIT_TOP_PLAYERS=20;module.exports={create:function(e){var r=PlayersCollection.newPlayer(e,0);return Db.insert("players",r),r},update:function(e,r){return r.score=PlayersCollection.getScore(r["public"].level,r["private"].achievements.length,r["private"].friends),Db.update("players",e,r)},exists:function(e){return Db.exists("players",e)},find:function(e,r){var n=$.Deferred();return Db.getColl("players").find({_id:e},r).toArray(function(e,r){$.handle(e,r[0],n)}),n},remove:function(e){return Db.remove("players",e)},top:function(){return $.Deferred(function(e){Db.getColl("players").find({$query:{},$orderby:{"public.level":-1}},{_id:1,"public":1}).limit(LIMIT_TOP_PLAYERS).toArray(function(r,n){$.handle(r,n,e)})})},getPlayers:function(e){return $.Deferred(function(r){Db.getColl("players").find({_id:{$in:e}},{_id:1,"public":1}).limit(LIMIT_TOP_PLAYERS).toArray(function(e,n){$.handle(e,n,r)})})}};