var Player=require("../controllers/player"),$=require("jquery-deferred");module.exports={"default":{handler:function(e){var r=$.Deferred();return Player.top().then(function(e){r.resolve({success:!0,players:e})}),r}}};