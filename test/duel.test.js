var tap = require('tap')
  , test = tap.test
  , $ = require('interlude')
  , T = require('../');

test("duel WB general", function (t) {
  var duel = new T.Duel(32, T.WB)
    , gs = duel.matches
    , p = duel.p;

  t.equal(gs.length, Math.pow(2, p), "size of big t"); // incl bronzefinal

  var lastM = gs[gs.length-1];
  t.ok(!lastM.m, "no map scores recorded for last match yet");

  gs.forEach(function (g) {
    // will produce some warnings when there are WO markers present
    duel.score(g.id, [0, 2]);
  });

  t.ok(lastM.m, "map scores recorded for last match");
  var lastPls = lastM.p.filter(function (n) {
    return (n !== 0 && n !== T.WO);
  });
  // note this only true because this case gets a double final
  t.equal(lastPls.length, 2, "got two players at the end when scoring everything");

  var res = duel.results();
  t.ok(res, "results produced");
  t.equal(res.length, 32, "all players included in results");

  t.end();
});

test("duel LB general", function (t) {
  var duel = new T.Duel(32, T.LB)
    , gs = duel.matches
    , p = duel.p;

  // size == sizeof wb (powers of two consecutively)
  // += size of lb == 2x size of smaller WB (gfs cancels out 2x -1s)
  t.equal(gs.length, Math.pow(2, p) - 1 + 2*Math.pow(2, p - 1), "size of big t");

  var lastM = gs[gs.length-1];
  t.ok(!lastM.m, "no map scores recorded for last match yet");

  gs.forEach(function (g) {
    // will produce some warnings when there are WO markers present
    duel.score(g.id, [0, 2]);
  });

  t.ok(lastM.m, "map scores recorded for last match");
  var lastPls = lastM.p.filter(function (n) {
    return (n !== 0 && n !== T.WO);
  });
  // note this only true because this case gets a double final
  t.equal(lastPls.length, 2, "got two players at the end when scoring everything");

  var res = duel.results();
  t.ok(res, "results produced");
  t.equal(res.length, 32, "all players included in results");

  t.end();
});

test("duel simple WB", function (t) {
  // try scoring everything in order
  var duel = new T.Duel(5, T.WB)
    , gs = duel.matches
    , p = 3;

  var lastM = gs[gs.length-1];
  t.ok(!lastM.m, "no map scores recorded for last match yet");

  gs.forEach(function (g) {
    // will produce some warnings when there are WO markers present
    duel.score(g.id, (g.p[0] < g.p[1]) ? [2, 0] : [0, 2]); // score highest winner
  });

  t.ok(lastM.m, "map scores recorded for last match");
  var lastPls = lastM.p.filter(function (n) {
    return (n !== 0 && n !== T.WO);
  });
  // note this only true because this case gets a double final
  t.equal(lastPls.length, 2, "got two players at the end when scoring everything");

  var res = duel.results();
  t.ok(res, "results produced");

  res.forEach(function (p) {
    if (p.seed === 1) {
      t.equal(p.pos, 1, "player 1 gets 1st");
      t.equal(p.wins, 2, "player 1 win count"); // got 1 wo free
      t.equal(p.maps, 2*2, "player 1 map count");
    }
    else if (p.seed === 2) {
      t.equal(p.pos, 2, "player 2 gets 2nd");
      t.equal(p.wins, 1, "player 2 win count"); // 1 (+wo)
      t.equal(p.maps, 1*2, "player 2 map count");
    }
    else if (p.seed === 3) {
      t.equal(p.pos, 3, "player 3 gets 3rd");
      t.equal(p.wins, 1, "player 3 win count"); // 1 + bf (+wo)
      t.equal(p.maps, 1*2, "player 3 map count");
    }
    else if (p.seed === 4) {
      t.equal(p.pos, 4, "player 4 gets 4th");
      t.equal(p.wins, 1, "player 4 win count"); // 1
      t.equal(p.maps, 1*2, "player 4 map count");
    }
    else if (p.seed === 5) {
      t.equal(p.pos, 5, "player 5 gets 5");
      t.equal(p.wins, 0, "player 5 win count");
      t.equal(p.maps, 0*2, "player 5 map count");
    }
    else {
      t.ok(false, "should not be any other players in results");
    }
  });

  var sorted = $.pluck('seed', res);
  t.deepEqual(sorted, $.range(5), "results sorted after position");

  t.end();
});

test("duel simple but big LB", function (t) {
  // try scoring everything in order
  var duel = new T.Duel(128, T.LB)
    , gs = duel.matches
    , p = duel.p;

  t.equal(gs.length, Math.pow(2, p) - 1 + 2*Math.pow(2, p - 1), "size of big t");

  var lastM = gs[gs.length-2]; // wont be a double final
  t.ok(!lastM.m, "no map scores recorded for last match yet");

  gs.forEach(function (g) {
    // will produce some warnings when there are WO markers present
    duel.score(g.id, (g.p[0] < g.p[1]) ? [2, 0] : [0, 2]); // score highest winner
  });

  t.ok(lastM.m, "map scores recorded for last match");
  var lastPls = lastM.p.filter(function (n) {
    return (n !== 0 && n !== T.WO);
  });
  // note this only true because this case gets a double final
  t.equal(lastPls.length, 2, "got two players at the end when scoring everything");

  var res = duel.results(); // TODO: fails here ATM
  t.ok(res, "results produced");

  var sorted = $.pluck('seed', res.slice(0, 4));
  t.deepEqual(sorted, $.range(4), "results sorted after position");

  t.end();
});



test("duel detailed LB", function (t) {
  // try scoring everything in order
  var duel = new T.Duel(5, T.LB)
    , gs = duel.matches
    , p = 3;

  var lastM = gs[gs.length-1];
  t.ok(!lastM.m, "no map scores recorded for last match yet");

  gs.forEach(function (g) {
    // will produce some warnings when there are WO markers present
    duel.score(g.id, [0, 2]);
  });

  t.ok(lastM.m, "map scores recorded for last match");
  var lastPls = lastM.p.filter(function (n) {
    return (n !== 0 && n !== T.WO);
  });
  // note this only true because this case gets a double final
  t.equal(lastPls.length, 2, "got two players at the end when scoring everything");

  var res = duel.results();
  t.ok(res, "results produced");

  res.forEach(function (p) {
    if (p.seed === 2) {
      t.equal(p.pos, 1, "player 2 gets 1st");
      t.equal(p.wins, 3, "player 2 win count");
      t.equal(p.maps, 3*2, "player 2 map count");
    }
    else if (p.seed === 3) {
      t.equal(p.pos, 2, "player 3 gets 2nd");
      t.equal(p.wins, 3, "player 3 win count");
      t.equal(p.maps, 3*2, "player 3 map count");
    }
    else if (p.seed === 4) {
      t.equal(p.pos, 3, "player 4 gets 3rd");
      t.equal(p.wins, 2, "player 4 win count");
      t.equal(p.maps, 2*2, "player 4 map count");
    }
    else if (p.seed === 5) {
      t.equal(p.pos, 4, "player 5 gets 4th");
      t.equal(p.wins, 1, "player 5 win count");
      t.equal(p.maps, 1*2, "player 5 map count");
    }
    else if (p.seed === 1) {
      t.equal(p.pos, 5, "player 1 gets 5-6th");
      t.equal(p.wins, 0, "player 1 win count");
      t.equal(p.maps, 0*2, "player 1 map count");
    }
    else {
      t.ok(false, "should not be any other players in results");
    }
  });

  var sorted = $.pluck('seed', res);
  t.deepEqual(sorted, [2, 3, 4, 5, 1], "results sorted after position");

  t.end();
});
