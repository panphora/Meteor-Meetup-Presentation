

function doLaundryWithWashio () {
  var clothes = gatherClothes();

  debugger;
  scheduleWashio('12pm', function () {
    giveWashioClothes(clothes, function (cleanClothes) {
      getCleanClothes(cleanClothes);
    });
  });
}

function gatherClothes () {
  return ['shirt', 'pants', 'socks'];
}

function scheduleWashio (time, callback) {
  // call callback when Washio arrives at house
  
  setTimeout(function () {
    callback('confirmed');
  }, 5000);
}

function giveWashioClothes (clothes, callback) {
  // call callback after clothes are cleaned

  setTimeout(function () {
    callback(clothes.map(function (item) { return 'clean ' + item}));
  }, 5000);
}

function getCleanClothes (cleanClothes) {
  console.log('clean clothes: ', cleanClothes.join(', '));
}


doLaundryWithWashio();
console.log('do something else'); // a lot could happen here