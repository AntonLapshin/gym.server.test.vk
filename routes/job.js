var Db = require('../db'),
  DateHelper = require('../controllers/date'),
  $ = require('jquery-deferred');

var PERIOD = 60, // Minutes
  TIMER = 60,
  WEIGHT_MIN = 20,
  WEIGHT_MAX = 60,
  WEIGHT_DELTA = 2.5,
  MAX_DELAY = 3,
  MONEY_MIN = 5,
  MONEY_MAX = 7;

module.exports = {

  getExpectTime: function(player) {
    var now = new Date();
    var nextTime = new Date(player.private.job.nextTime);
    return (nextTime - now) / 1000;
  },

  isStartedAlready: function(player) {
    if (!player.private.job.time)
      return false;
    var now = new Date();
    return now <= getDeadline(new Date(player.private.job.time));
  },

  get: {
    handler: function(session) {
      var player = session.player,
        now = new Date(),
        job = player.private.job;

      var defer = $.Deferred();

      if (module.exports.isStartedAlready(player)) {
        defer.reject('MES_STARTEDALREADY');
        return defer;
      }

      var expectTime = module.exports.getExpectTime(player)
      if (expectTime > 0) {
        defer.resolve({
          success: false,
          time: expectTime
        });
        return defer;
      }

      job.weight = (Math.floor(Math.random() * (WEIGHT_MAX - WEIGHT_MIN + 1)) + WEIGHT_MIN) * WEIGHT_DELTA;
      job.time = now.getTime();
      job.nextTime = DateHelper.setNextTime(now, PERIOD).getTime();
      session.isDirty = true;
      defer.resolve({
        success: true,
        weight: job.weight
      });

      return defer;
    }
  },

  complete: {
    handler: function(session) {
      var player = session.player;
      var job = player.private.job;

      var defer = $.Deferred();

      if (!job.time) {
        defer.reject('MES_NOTSTARTED');
        return defer;
      }

      var deadline = getDeadline(new Date(job.time));
      job.weight = null;
      job.time = null;

      if (new Date() >= deadline) {
        defer.reject('MES_TIMEISUP');
        return defer;
      }
      var money = $.random(MONEY_MIN, MONEY_MAX);
      player.private.money += money;
      session.isDirty = true;
      var result = {
        success: true,
        job: 'success',
        money: money
      };
      if (Math.random() < 0.1) {
        player.private.gold++;
        result.gold = 1;
      }
      defer.resolve(result);

      return defer;
    }
  },

  PERIOD: PERIOD,
  TIMER: TIMER,
  MONEY_MIN: MONEY_MIN,
  MONEY_MAX: MONEY_MAX,
  WEIGHT_MIN: WEIGHT_MIN * WEIGHT_DELTA,
  WEIGHT_MAX: WEIGHT_MAX * WEIGHT_DELTA
};

function getDeadline(time) {
  return DateHelper.addSeconds(new Date(time), TIMER + MAX_DELAY);
}