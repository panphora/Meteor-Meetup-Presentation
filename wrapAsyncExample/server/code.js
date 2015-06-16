function doLaundryWithWashio () {
  console.log('Doing laundry');

  var clothes = gatherClothes();

  // async
  var isConfirmed = scheduleWashioSync('12pm');
  console.log('Washio is: ', isConfirmed ? 'confirmed' : 'not confirmed');
  
  var cleanClothes = giveWashioClothesSync(clothes);

  getCleanClothes(cleanClothes);
}

function gatherClothes () {
  return ['shirt', 'pants', 'socks'];
}

function scheduleWashio (time, callback) {
  // call callback when Washio arrives at house
  console.log('Scheduling Washio');
  
  setTimeout(function () {
    callback(null, true);
  }, 3000);
}

function giveWashioClothes (clothes, callback) {
  // call callback after clothes are cleaned
  console.log('Giving Washio some clothes');
  
  setTimeout(function () {
    callback(null, clothes.map(function (item) {return 'clean ' + item}));
  }, 3000);
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
      debugger;
    }
  }
}).run();