Meteor.methods({
  accomplishTodoList: function () {
    doLaundry();
    learnAboutMeteor();
    goForAWalk();
    buyBreadAndMilk();
    watchGameOfThrones();
    return 'done!';
  }
});










function learnAboutMeteor () {
  var knowledge = readDiscoverMeteorBlog();
  knowledge += readOfficialDocs();
  writeABlogPost(knowledge);
}

function doLaundry () {
  debugger;
  var clothes = gatherClothes();
  var bag = putClothesInBag(clothes);
  var quarters = findQuarters();
  var direction = getDirectionToward('laundromat');

  goForAWalk(direction);
  putQuartersAndClothesIntoWashingMachine(quarters, clothes);
  //etc
}

function goForAWalk (isDressed, direction) {
  if (!isDressed) {
    getDressed();
  }

  goOutside();

  if (!direction) {
    direction = pickADirectionAtRandom();
  }

  walk(direction);
}

function buyBreadAndMilk (directionTowardStore) {
  goForAWalk(directionTowardStore);
  getBreadAndMilk();
  payForBreadAndMilk();
}

function watchGameOfThrones () {
  goToHboNow();
  clickOnGameOfThrones();
}

function findQuarters () {
  var quarters = gatherQuartersFromHouse();

  if (quarters < 33) {
    quarters = getQuartersFromBank();
  }

  return quarters
}

function getQuartersFromBank () {
  goToBank();

  //goToATM();
  //typeInPasscode(2255);
  //retreiveMoney();
  //etc
  
  return 40;
}

function gatherQuartersFromHouse () {
  return 2;
}

function getDirectionToward (place) {
  switch (place) {
    case 'laundromat':
      return 'east'
      break;
    case 'bank':
      return 'west';
      break;
  }
}

function goToBank () {
  var direction = getDirectionToward('bank');
  goForAWalk(true, direction);
  //etc
}

function readDiscoverMeteorBlog () {

}

function readOfficialDocs () {
  
}

function writeABlogPost () {
  
}

function gatherClothes () {
  
}

function putClothesInBag () {
  // unfinished, todo
}


function putQuartersAndClothesIntoWashingMachine (quarters, clothes) {
  // unfinished, todo
}

function getDressed () {
  
}

function goOutside () {
  
}

function pickADirectionAtRandom () {
  
}

function walk () {
  
}

function getBreadAndMilk () {
  
}

function payForBreadAndMilk () {
  
}

function goToHboNow () {
  
}

function clickOnGameOfThrones () {
  
}