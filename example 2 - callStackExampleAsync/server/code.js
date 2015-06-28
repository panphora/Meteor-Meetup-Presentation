

function doLaundryWithWashio () {
  // "Washio" is a service that does laundry for you
  var clothes = gatherClothes();

  scheduleWashio('12pm', function () {
    // washio arrives for initial pick-up
    giveWashioClothes(clothes, function (cleanClothes) {
      //washio arrives for drop-off
      getCleanClothes(cleanClothes);
    });
  });
}

function gatherClothes () {
  return ['shirt', 'pants', 'socks'];
}

function scheduleWashio (time, callback) {
  // call callback when Washio arrives at house
  // 5 seconds here for demonstration purposes
  
  setTimeout(function () {
    callback('confirmed');
  }, 5000);
}

function giveWashioClothes (clothes, callback) {
  // call callback after clothes are cleaned
  // 5 seconds here for demonstration purposes

  setTimeout(function () {
    callback(clothes.map(function (item) { return 'clean ' + item}));
  }, 5000);
}

function getCleanClothes (cleanClothes) {
  console.log('clean clothes: ', cleanClothes.join(', '));
}

doLaundryWithWashio();

// a lot could happen while the above async function is running
console.log('do something else'); 