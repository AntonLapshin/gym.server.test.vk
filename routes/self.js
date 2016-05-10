function getStress(e){for(var r=Db.getRefs().muscles,t=function(){for(var e=0,t=0;t<r.length;t++)e+=r[t].power;return e},a=t(),o=0,s=0;s<e["private"].body.length;s++){var i=e["private"].body[s],l=r[i._id];o+=l.power*i.stress/a}return o}function update(e){var r=module.exports.getRegen(e);0==r.frazzle&&(r.frazzle=.2),0==r.energy&&(r.energy=.2);var t=new Date,a=DateHelper.intervalHours(Date.parse(t)-Date.parse(new Date(e["private"].reg.lastUpdateTime))),o=$.round(r.frazzle*a),s=$.round(r.tonus*a),i=Math.round(e["private"].energy+r.energy*a);i>PlayersCollection.ENERGY_MAX&&(i=PlayersCollection.ENERGY_MAX),e["private"].garb+=Math.round(REG_GARB*a),e["private"].garb>GARB_MAX&&(e["private"].garb=GARB_MAX),e["private"].energy=i,e["private"].reg.lastUpdateTime=t.getTime();for(var l=0;l<e["private"].body.length;l++){var n=e["private"].body[l];n.frazzle=$.round(n.frazzle-o),n.frazzle<0&&(n.frazzle=0),e["private"].tonus&&(e["private"].tonus[l]=$.round(e["private"].tonus[l]-s),e["private"].tonus[l]<0&&(e["private"].tonus[l]=0))}}function getLevelChange(e){var r=new Date,t=module.exports.getPlayerStat(e),a=curve.getLevelRequirements(e["public"].level),o=(e["private"].growt||e["private"].growth||0)+t.growth;if(e["public"].level>0&&a>o){var s=DateHelper.addHoursClone(new Date(e["private"].reg.lastCheckLevelUpTime),server.CHECK_LEVELUP_PERIOD);if(s>r)return-2}e["private"].reg.lastCheckLevelUpTime=r.getTime();var i=0;if(o>=a)e["public"].level++,e["private"].growth=0,e["private"].energy=PlayersCollection.ENERGY_MAX,i=1;else{if(0===e["public"].level)return-2;e["private"].growth=o}return e["private"].body.forEach(function(e){e.frazzle=0,e.stress=0}),e["private"].rest=[],e["private"].food=[],e["private"].stimul=[],0===i&&0===e["public"].level?-2:i}var Db=require("../db"),DateHelper=require("../controllers/date"),PlayersCollection=require("../gymdb/collections/players"),Player=require("../controllers/player"),$=require("jquery-deferred"),curve=require("../controllers/curve"),server=require("../server"),Rank=require("../controllers/rank"),Stimul=require("../controllers/stimul"),UPDATE_PERIOD=2,REG_FRAZZLE_PER_HOUR=.4,REG_ENERGY=.4,REG_TONUS_PER_HOUR=.001,REG_GARB=30,MAX_LEVEL=67,GARB_MAX=14,BONUS_MAX=10;module.exports={getPlayerStat:function(e){function r(e,r,t){var a=r*t,o=3*e;return o/a}for(var t=e["public"].level,a=getStress(e),o=curve.getMass(t),s=0,i=0,l=0,n=0;n<e["private"].food.length;n++){var p=e["private"].food[n],v=Db.getRefs().shop[0].items[p];s+=v.carbs,i+=v.fats,l+=v.proteins}var u=curve.getFoodProfit("carbs",r(s,o,6)),p=curve.getFoodProfit("fats",r(i,o,1)),g=curve.getFoodProfit("proteins",r(l,o,2.5)),d=0+(u+p+g)/3;d>1&&(d=1);for(var f=0,n=0;n<e["private"].rest.length;n++){var c=e["private"].rest[n],y=Db.getRefs().shop[1].items[c];f+=y.coeff}f>1&&(f=1);var E=1+Stimul.getGrowth(e),R=a*f*d*E;return{period:"each "+server.CHECK_LEVELUP_PERIOD+" hours",growth:R,stress:a,rest:f,food:d,stimulGrowth:E}},getRegen:function(e){for(var r=0,t=0;t<e["private"].rest.length;t++){var a=e["private"].rest[t],o=Db.getRefs().shop[1].items[a];r+=o.coeff}r>1&&(r=1);var s=Stimul.getRegen(e);return{energy:REG_ENERGY*(r+s)*PlayersCollection.ENERGY_MAX,frazzle:REG_FRAZZLE_PER_HOUR*(r+s),tonus:REG_TONUS_PER_HOUR}},get:{params:{friends:{parseMethod:parseInt},garb:{parseMethod:parseInt},bonus:{parseMethod:parseInt}},handler:function(e,r){var t=$.Deferred(),a=e.player;r.bonus&&(a["private"].money+=Math.min(r.bonus,BONUS_MAX),e.isDirty=!0),r.garb&&(a["private"].garb-=r.garb,a["private"].garb<0&&(a["private"].garb=0),e.isDirty=!0),r.friends&&(a["private"].friends=r.friends,e.isDirty=!0);var o=new Date,s=a["private"].reg,i=DateHelper.addMinutesClone(new Date(s.lastUpdateTime),UPDATE_PERIOD);if(i>o)return t.resolve({success:!0,player:a}),t;var l={success:!0,player:a};if(i.getDay()!=o.getDay()){var n=Rank.getSalary(a);n&&(l.money=n.money,a["private"].money+=n.money,n.gold>0&&(l.gold=n.gold,a["private"].gold+=n.gold))}update(a);var p=getLevelChange(a);return e.isDirty=!0,-2!=p&&(l.levelChange=p),t.resolve(l),t}},getPlayer:{params:{playerId:{required:!0,parseMethod:parseInt}},handler:function(e,r){var t=$.Deferred();return console.time("getPlayer"),Player.find(r.playerId,{_id:1,"public":1}).then(function(e){console.timeEnd("getPlayer"),t.resolve({success:!0,player:e})}),t}},getPlayers:{params:{playerIds:{required:!0,parseMethod:function(e){var r=[];return e.split(",").forEach(function(e){r.push(parseInt(e))}),r}}},handler:function(e,r){var t=$.Deferred();return console.time("getPlayers"),Player.getPlayers(r.playerIds).then(function(e){console.timeEnd("getPlayers"),t.resolve({success:!0,players:e})}),t}}};