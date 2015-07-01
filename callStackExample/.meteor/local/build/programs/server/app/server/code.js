(function(){function doLaundry () {
  debugger;
  var quarters = getQuarters();

  // ...
  // etc.
}

function getQuarters () {
  var quarters = getQuartersFromCoinJar();

  if (quarters < 33) {
    quarters = getQuartersFromBank();
  }
}

function getQuartersFromCoinJar () {
  return 4;
}

function getQuartersFromBank () {
  walkToBank();

  // ...
  // etc.
}

function walkToBank () {
  // ...
}

doLaundry();

})();
