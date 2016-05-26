exports.newCoach = function(id){
    return {
        _id: id,
        s: 0, // salary
        q: 0  // quantity
    }
};

var CollinMartie = exports.newCoach(254444141);

exports.coaches = [
    CollinMartie
];