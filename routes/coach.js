var Db = require('../db');
var $ = require('jquery-deferred');
var Coach = require('../controllers/coach');

module.exports = {
  hire: {
    params: {
      id: {
        required: true,
        parseMethod: parseInt
      }
    },
    handler: function(session, params) {
      var defer = $.Deferred();

      var oldCoachId = session.player.private.coach;
      if (oldCoachId)
        Coach.dec(oldCoachId);
      Coach.inc(params.id);

      session.player.private.coach = params.id;
      session.isDirty = true;
      defer.resolve({
        success: true,
        id: params.id
      });

      return defer;
    }
  },
  fire: {
    handler: function(session) {
      var defer = $.Deferred();

      var oldCoachId = session.player.private.coach;
      if (oldCoachId)
        Coach.dec(oldCoachId);

      delete session.player.private.coach;
      session.isDirty = true;
      defer.resolve({
        success: true
      });

      return defer;
    }
  },
  getPay: {
    handler: function(session) {
      var defer = $.Deferred();

      var answer = {
        success: true
      };
      var coachId = session.player._id;
      var coach = session.player.public.coach;
      if (coach.s) {
        session.player.private.money += coach.s;
        answer.money = coach.s;
        session.player.public.coach.s = 0;
        Coach.getPay(coachId);
        session.isDirty = true;
      }
      defer.resolve(answer);

      return defer;
    }
  },
};