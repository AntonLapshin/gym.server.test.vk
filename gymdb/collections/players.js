exports.ENERGY_MAX = 100;
exports.START_MONEY = 0;
exports.START_GOLD = 2;

exports.getScore = function(level, achievements, friends) {
  return level * 1000000 + achievements * 10000 + friends * 100;
};

exports.newPlayer = function(id, level, coach) {
  var nowTime = (new Date()).getTime();
  var p = {
    _id: id,
    score: exports.getScore(level, 0, 0),
    public: {
      level: level,
      awards: [],
      exercises: [{
        _id: 0
      }, {
        _id: 1
      }]
    },
    private: {
      friends: 0,
      garb: 14,
      gold: exports.START_GOLD,
      money: exports.START_MONEY,
      energy: exports.ENERGY_MAX,
      energyMax: exports.ENERGY_MAX,
      reg: {
        lastUpdateTime: nowTime,
        lastCheckLevelUpTime: nowTime
      },
      job: {
        nextTime: nowTime
      },
      achievements: [],
      gyms: [],
      food: [],
      rest: [],
      stimul: []
    }
  };

  if (coach)
    p.public.coach = {
      s: 12,
      q: 10
    };

  exports.initStress(p);
  exports.initFrazzle(p);
  exports.initTonus(p);

  return p;
};

exports.initStress = function(p) {
  if (p.private.stress)
    return;
  p.private.stress = [];
  for (var i = 0; i <= 15; i++) {
    p.private.stress.push(p.private.body ? p.private.body[i].stress : 0);
  }
};

exports.initFrazzle = function(p) {
  if (p.private.frazzle)
    return;
  p.private.frazzle = [];
  for (var i = 0; i <= 15; i++) {
    p.private.frazzle.push(p.private.body ? p.private.body[i].frazzle : 0);
  }
  delete p.private.body;
};

exports.initTonus = function(p) {
  if (p.private.tonus)
    return;
  p.private.tonus = [];
  for (var i = 0; i <= 15; i++) {
    p.private.tonus.push(0);
  }
};

exports.initAwards = function(p) {
  if (p.public.awards)
    return;
  p.public.awards = [];
};

var CollinMartie = exports.newPlayer(254444141, 29, true);

exports.players = [
  CollinMartie
];