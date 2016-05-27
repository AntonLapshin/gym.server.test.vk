var $ = require('jquery-deferred');

var WCATS = [
  53, 59, 66, 74, 83, 93, 105, 120, 200
];

var T = [
  // tonus adds 100%
  // stimul adds 10%
  // From 3 to MSMK
  [260, 282.5, 325, 410], // 53 // 4 level // 60 100 100                  
  [290, 315, 362.5, 455, 570, 625], // 59 // 8 level // 70 110 110    
  [320, 350, 402.5, 510, 635, 700], // 66 // 12 level // 80 120 120
  [352.5, 385, 440, 537.5, 695, 770], // 74 // 17 level // 86 132 134
  [387.5, 422, 482.5, 582.5, 747.5, 835], // 83 // 23 level // 91 147 149
  [412.5, 465, 520, 610, 787.5, 880], // 93 // 29 level // 95 157 159
  [460, 500, 552.5, 645, 815, 920], // 105 // 36 level // 105 174 182
  [497.5, 530, 600, 687.5, 835, 955], // 120 // 45 level // 115 187 200  
  [510, 545, 617.5, 735, 860, 980], // 120+ // 60 level // 135 240 265
];

var PRIZE = [
  ['0,1', '0,3', '0,6', '0,8'], // 53
  ['0,1', '0,4', '0,8', '0,12', '0,14', '1,2'], // 59
  ['0,2', '0,5', '0,10', '0,15', '0,20', '1,8'], // 66
  ['0,2', '0,6', '0,12', '0,18', '0,24', '1,14'], // 74
  ['0,3', '0,7', '0,14', '0,21', '0,28', '1,20'], // 83
  ['0,3', '0,8', '0,16', '0,24', '0,32', '1,24'], // 93
  ['0,4', '0,9', '0,18', '0,27', '0,36', '1,28'], // 105
  ['0,4', '0,10', '0,20', '0,30', '1,12', '1,32'], // 120
  ['0,5', '0,11', '0,22', '0,33', '1,20', '2,25'], // 120+        
];

function getCat(weight) {
  return $.grep(WCATS, function(wc) {
    return weight < wc;
  })[0];
}

function getRank(wcatIndex, sum) {
  if (!T[wcatIndex]) // TODO: bug fix
    return null;
  var res = $.grep(T[wcatIndex], function(weight) {
    return weight <= sum;
  });
  if (res.length === 0)
    return null;

  return res.length - 1;
}

function getRanks(player) {
  var r = [];
  var ranks = [].concat(player.public.ranks || []);
  for (var i = 0; i < WCATS.length; i++) {
    var v = ranks.pop();
    if (!v)
      break;
    r[parseInt(v[0])] = parseInt(v[1]);
  }
  return r;
}

function setRanks(player, ranks) {
  var res = [];
  for (var i = 0; i < ranks.length; i++) {
    var r = ranks[i];
    if (r == undefined)
      continue;
    res.push('' + i + r);
  }
  player.public.ranks = res;
}

function hasRank(ranks, wcatId, rankId) {
  return (ranks[wcatId] || -1) >= rankId;
}

function getSum(player) {
  var prs = [];
  player.public.exercises.forEach(function(ex) {
    if (ex._id === 2 || ex._id === 3 || ex._id === 4)
      prs.push(ex ? ex.pr || 0 : 0);
  });

  var sum = $.sum(prs);
  return sum;
}

module.exports = {
  getCatData: function(cat) {
    var i = WCATS.indexOf(cat);
    return {
      max: cat,
      min: i > 0 ? WCATS[i - 1] : 0
    };
  },
  update: function(player) {
    var wcPlayer = getCat(player.public.mass);
    var wcIndex = WCATS.indexOf(wcPlayer);
    var sum = getSum(player);
    var rank = getRank(wcIndex, sum);
    if (rank === null)
      return null;
    var ranks = getRanks(player);

    if (!hasRank(ranks, wcIndex, rank)) {
      ranks[wcIndex] = rank;
      setRanks(player, ranks);
      return rank;
    }
  },

  getSum: getSum,

  getSalary: function(player) {
    var wcPlayer = getCat(player.public.mass);
    var wcIndex = WCATS.indexOf(wcPlayer);
    var sum = getSum(player);
    var rank = getRank(wcIndex, sum);

    if (rank === null)
      return null;

    var s = PRIZE[wcIndex][rank];

    if (s == null)
      return null;

    s = s.split(',');
    return {
      gold: parseInt(s[0]),
      money: parseInt(s[1])
    };
  }
};