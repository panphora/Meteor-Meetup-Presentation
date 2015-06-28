

var Fiber = Npm.require('fibers');

function doLaundryWithWashio () {
  console.log('Doing laundry');

  var clothes = gatherClothes();

  debugger; //look at the call stack here
  var isConfirmed = scheduleWashio('12pm');
  console.log('Washio is: ', isConfirmed ? 'confirmed' : 'not confirmed');

  debugger; //look at the terminal, the for loop at the bottom of this code should have completed before the "Washio is: confirmed" string gets printed out

  var cleanClothes = giveWashioClothes(clothes);

  getCleanClothes(cleanClothes);
}

function gatherClothes () {
  return ['shirt', 'pants', 'socks'];
}

function scheduleWashio (time) {
  // call callback when Washio arrives at house
  console.log('Scheduling Washio');

  var fiber = Fiber.current;
  
  setTimeout(function () {
    fiber.run(true);
  }, 3000);

  return Fiber.yield();
}

function giveWashioClothes (clothes) {
  // call callback after clothes are cleaned
  console.log('Giving Washio some clothes');

  var fiber = Fiber.current;
  
  setTimeout(function () {
    fiber.run(clothes.map(function (item) {return 'clean ' + item}));
  }, 3000);

  return Fiber.yield();
}

function getCleanClothes (cleanClothes) {
  console.log('clean clothes: ' , cleanClothes.join(', '));
}


Fiber(function () {
  doLaundryWithWashio();
}).run();

// yields to this
Fiber(function () {
  for (var i = 0; i < 10000; i++) {
    if (i === 9999) {
      console.log('for loop complete!');
    }
  }
}).run();