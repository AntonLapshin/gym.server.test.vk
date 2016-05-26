exports.ENERGY_MAX = 100;
exports.START_MONEY = 0;
exports.START_GOLD = 2;

exports.getScore = function(level, achievements, friends){
    return level * 1000000 + achievements * 10000 + friends * 100; 
};

exports.newPlayer = function (id, level, coach) {
    var nowTime = (new Date()).getTime();
    var p = {
        _id: id,
        score: exports.getScore(level, 0, 0),
        public: {
            level: level,
            awards: [],
            exercises: [{ _id: 0 }, { _id : 1 }]
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
            stimul: [],
            body: []
        }
    };

    if (coach)
        p.public.coach = {
            s: 12,
            q: 10
        };

    for(var i = 0; i <= 15; i++){
        p.private.body.push({
            _id: i,
            stress: 0,
            frazzle: 0
        });
    }

    return p;
};

var CollinMartie = exports.newPlayer(254444141, 29, true);

exports.players = [
    CollinMartie
];