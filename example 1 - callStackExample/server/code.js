

function doLaundry () {
  var quarters = getQuarters();

  // gatherClothes();
  // goToLaundromat();
  // putQuartersInMachine();
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
  debugger;
  // ...
}

doLaundry();