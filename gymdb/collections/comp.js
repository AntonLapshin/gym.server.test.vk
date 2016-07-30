// Two comps: power and body. Body is disabled
var comps = [
  1, 0
];

function getComp(id, disabled) {
  return {
    _id: id,
    uid: (new Date()).getTime(),
    status: disabled ? 0 : 1, // 0 - inactive, 1 - active
    res: [],
    q: 0,
    disabled: disabled,
    members: [],
    last: (new Date()).getTime()
  };
}

var compCollection = [];

for (var wcat = 0; wcat < 9; wcat++) {
  var wcatDetails = {
    _id: wcat,
    comps: []
  };

  for (var i = 0; i < comps.length; i++) {
    wcatDetails.comps.push(getComp(i, !comps[i]));
  }

  compCollection.push(wcatDetails);
}

exports.comp = compCollection;