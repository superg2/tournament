var $ = require('interlude');

// constants TODO: move in here? (at least kill T.findMatch)
//var T = require('./public');

function Base(np, ms) {
  this.matches = ms;
  this.numPlayers = np;
}

// stuff that individual implementations can override
// TODO: isDone could optionally get in matches to check => can use it in FFA
Base.prototype.isDone = function () {
  return this.matches.every($.get('m'));
};

// TODO: upcoming without playerId?
Base.prototype.upcoming = function (playerId) {
  // find first unplayed, pick by round asc [matches are sorted, can pick first]
  for (var i = 0; i < this.matches.length; i += 1) {
    var m = this.matches[i];
    if (m.p.indexOf(playerId) >= 0 && !m.m) {
      return m.id;
    }
  }
};

/*
Base.prototype.score = function (id, mapScore) {
  // assumes !SubClass.unscorable
  var m = this.findMatch(id);
  m.m = mapScore;

  // TODO: recalculate rounds
};
*/

// Public API extensions

// tells if every match in the same section and same round as `id` have scores set
Base.prototype.isRoundDone = function (id) {
  return this.matches.every(function (m) {
    return m.id.s === id.s && m.id.r === id.r && Array.isArray(m.m);
  });
};

// partition matches into rounds
Base.prototype.getRounds = function (section) {
  var rnds = [];
  for (var i = 0; i < this.matches.length; i += 1) {
    var m = this.matches[i];
    if (m.id.s !== section) {
      continue;
    }
    if (!Array.isArray(rnds[m.id.r - 1])) {
      rnds[m.id.r - 1] = [];
    }
    rnds[m.id.r - 1].push(m);
  }
  return rnds;
};

Base.prototype.currentRound = function (section) {
  var rnds = this.getRounds(section);
  for (var i = 0; i < rnds.length; i += 1) {
    var r = rnds[i];
    if (this.isRoundDone(r[0].id)) {
      return r;
    }
  }
};

Base.prototype.nextRound = function (section) {
  var rnds = this.getRounds(section);
  for (var i = 0; i < rnds.length; i += 1) {
    var r = rnds[i];
    if (!this.isRoundDone(r)) {
      return rnds[i + 1]; // may be undefined
    }
  }
};


// get all matches in the same round and section as `id`
Base.prototype.getRound = function (id) {
  // TODO: if we cache rounds, lookup rather than filter
  return this.matches.filter(function (m) {
    return (id.s === m.id.s && id.r === m.id.r);
  });
};

// pass it subset of matches, or a round to get players in a round
Base.prototype.getPlayers = function (matches) {
  var ms = matches || this.matches;
  var ps = [];
  for (var i = 0; i < ms.length; i += 1) {
    var m = ms[i];
    ps = ps.concat(m.p);
  }
  return $.nub(ps);
};

Base.prototype.findMatch = function (id) {
  for (var i = 0; i < this.matches.length; i += 1) {
    var m = this.matches[i];
    if (m.id.s === id.s && m.id.r === id.r && m.id.m === id.m) {
      return m;
    }
  }
};

module.exports = Base;


function Results(res) {
  this.results = res;
}

Results.prototype.forSeed = function (seed) {
  for (var i = 0; i < this.results.length; i += 1) {
    var r = this.results[i];
    if (r[i].seed === seed) {
      return r;
    }
  }
};