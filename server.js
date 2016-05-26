var Express = require('express');
var Db = require('./db');
var Compression = require('compression');
var Session = require('express-session');
var GymDb = require('./gymdb/gymdb');
var $ = require('jquery-deferred');
var Player = require('./controllers/player');

function reloadSession(req) {
  var defer = $.Deferred();

  if (!req.sessionStore.sessions[req.sessionID]) {
    defer.resolve();
    return defer;
  }

  req.session.reload(function() {
    defer.resolve();
  });

  return defer;
}

function handler(req, res, route) {

  function rejectHandler(err) {
    var message = err.message || err;
    var answer = {
      error: message,
      url: req.url
    };
    if (err.stack) {
      Db.insert('errors', {
        _id: (new Date()).getTime(),
        playerId: req.session.player._id,
        side: 'server',
        message: message,
        stack: err.stack
      });
    }
    res.jsonp(JSON.stringify(answer));
  }

  function resolveHandler(result) {
    var answer = {
      data: result || true,
      url: req.url
    };
    res.jsonp(JSON.stringify(answer));
  }

  reloadSession(req).then(function() {

    try {
      var auth = require('./routes/auth');
      var session = req.session;
      if (route !== auth) {
        if (!session.player)
          throw 'ERR_UNAUTH';
      }
      var methodName = getMethodName(req, route);
      var method = route[methodName];
      if (!method) {
        rejectHandler("Method " + methodName + " is not exists");
        return;
      }

      var params = getParams(req, method);
      method.handler(session, params)
        .then(function(result) {
          require('./controllers/ach').handler(session, result, req);
          if (session.isDirty) {
            session.isDirty = false;

            session.save(function() {
              resolveHandler(result);
            });

            Player.update(session.player._id, session.player);
          } else
            resolveHandler(result);
        }, rejectHandler);
    } catch (err) {
      rejectHandler(err);
    }

  });
}

function getMethodName(req, route) {
  for (var name in req.query) {
    if (name === 'method')
      return req.query[name];
  }
  return 'default';
}

function getParams(req, method) {
  var params = {};
  if (!method.params)
    return params;

  for (var name in method.params) {
    var meta = method.params[name];
    var value = req.query[name];
    if (meta.required && value === undefined)
      throw ERR_PARAMS;

    if (meta.parseMethod)
      value = meta.parseMethod(value);

    params[name] = value;
  }

  return params;
}

exports.start = function(port) {
  var app = Express();
  app.use(Compression());
  app.use(Session({
    genid: function(req) {
      var id = req.query.playerId;
      return id;
    },
    secret: 'iuBviX21'
  }));

  var routes = ['auth', 'refs', 'workout', 'job', 'self', 'top', 'coach', 'buy', 'real', 'god', 'payment', 'inv', 'error'];

  return $.Deferred(function(defer) {
    try {
      GymDb.init(GLOBAL.GYM.instance).then(function() {

        routes.forEach(function(routeName) {
          var route = require('./routes/' + routeName);
          app.get('/' + routeName, function(req, res) {
            handler(req, res, route);
          });
        });

        app.listen(port);
        defer.resolve();
      }, defer.reject);
    } catch (e) {
      defer.reject(e);
    }
  });
};