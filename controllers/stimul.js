function getStimul(e,r){var t=Curve.getDose(e["public"].level),o=0;e["private"].stimul.forEach(function(e){var t=Db.getRefs().shop[2].items[e];t&&t[r]&&o++}),o>t&&(o=t);var u=Curve.getDoseEffect(o/t);return u}function getFood(e){var r=Curve.getDose(e["public"].level),t=0;e["private"].food.forEach(function(e){var r=Db.getRefs().shop[0].items[e];r&&r.food&&(t+=r.food)}),t>r&&(t=r);var o=Curve.getDoseEffect(t/r);return o}var Curve=require("./curve"),Db=require("../db"),$=require("jquery-deferred");module.exports={getGrowth:function(e){return getStimul(e,"growth")},getPower:function(e){return getStimul(e,"power")},getRegen:function(e){return getStimul(e,"regen")},getFood:function(e){return getFood(e)}};