# Part 1: Understanding the call stack, the event loop, the task queue, and how asyncronous functions work

First, some basic context. When you run your JS code, it is added to the task queue. Think of this as a todo list.

When we reach the first item on the todo list, we move it over to another todo list called the call stack. Think of this as another todo list that you want to complete before moving on to the rest of the stuff in your main todo list. 

Have you guys seen Rick and Morty? No? Well, there are magical creatures on that show called Meeseeks. The way they work is you press a button and a Meeseeks pops out. Its one goal in life is to accomplish one task, whatever you want, and then disappear. When it gets really frustrated though, it might press the button itself and out will pop another Meeseeks, who will help him achieve his original goal.

When a function in your code calls another function, think of this as a Meeseeks pressing the button and summoning another Meeseeks to help him accomplish his original goal. This can get pretty deep. You can end up with hundreds of Meeseeks, I mean functions, which were all called by some original function.

Let me give you an example of this.

```javascript
function doLaundry () {
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
```

As you can see, we can end up doing a lot of things that we weren't intending to do in the first place, like going to the bank when all we wanted to do was do laundry.

Now, this can cause some issues for our todo list. Let's pretend we need to not only get laundry done today, but also go shopping and go to a Meteor Meetup. If we spent all our time doing laundry, we wouldn't have time for these other things.

This is why we use asyncronous functions. Asyncronous functions allow us to pass off tasks to other servers or databases and get the results whenever they come back. This way, if we want to resize an image and add a watermark to it,for example, we can upload it to an external service and wait for the response while the rest of our program does something else.

Let me give you an example of this in code.

```javascript
function doLaundryWithWashio () {
  var clothes = gatherClothes();

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
  }, 1000);
}

function giveWashioClothes (clothes, callback) {
  // call callback after clothes are cleaned

  setTimeout(function () {
    callback(clothes.map(function (item) { return 'clean ' + item}));
  }, 1000);
}

function getCleanClothes (cleanClothes) {
  console.log('clean clothes: ', cleanClothes.join(', '));
}
```

As you can see here, we have some callbacks that take some time to return. The callback function for scheduleWashio, for example, won't return for 1 second. This will give us time to do other things and won't block the rest of out code. 

When the call stack is clear, for example after some asyncronous code is called, the JS runtime will take the next thing off of the event queue and add it to the call stack. This, in turn, can call other functions that will also be added to the call stack. And the JS runtime won't be able to do anything else until all of these functions are complete.

This is why, when you write blocking code, like a for loop that iterates over 10,000 items, it can lock up the page. The JS runtime isn't able to update the page or even handle events until the call stack is clear.



# Part 2: A simple example of using fibers

You may have noticed that the asyncronous code in the last section got a little unwieldy. We're very used to thinking linearly, so when we have to write code that will be run "some time in the future" our abstractions can break down. We can also end up with a lot of nested callbacks, which makes it a little harder to think about what our code is doing.

This is where fibers come in.

Fibers make asyncronous code look and behave like syncronous code. They simultaneously allow us to avoid callbacks while also not blocking the execution of the rest of our code.

Here's an example of a fiber, using our previous code as a template.

var Fiber = Npm.require('fibers');

```javascript
function doLaundryWithWashio () {
  console.log('Doing laundry');

  var clothes = gatherClothes();

  debugger; //look at call stack
  var isConfirmed = scheduleWashio('12pm');
  console.log('Washio is: ', isConfirmed ? 'confirmed' : 'not confirmed');
  debugger;

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
      debugger;
    }
  }
}).run();
```

As you can see, this can get a bit complicated. Luckily, all Meteor server code runs in Fibers automatically, so they take care of the heavy lifting. If you've ever wondered why you can return a result from the database without using a callback, it's because all of the database functions use Fibers under the hood.

There are a couple of reasons you might want to know about all of this. One is a very annoying error you can get sometimes if you work with a lot of server code. It says something like, "Meteor code must always run within a Fiber." You could build a lot of stuff in Meteor without knowing what this error really means, but I think it's fun and useful to know.

The second reason you would want to know about fibers is because there is a massive ecosystem of npm modules that use asyncronous callbacks. And, because these aren't compatible with fibers, you can't use these modules without modifying them a little bit.


# Part 3: A simple example of using Meteor.wrapAsync()

There is an excellect blog post by the Discover Meteor team called "Wrapping NPM Packages for Meteor". I highly recommend you check it out. I was going to do most of this talk on how to wrap the Mailgun NPM module, because I needed to be able to send attachments and the current build-in Email functionality doesn't support this. But they cover most of how to do that in that post, so I decided to talk more about the lower level stuff here.

To wrap up, I want to show you a Meteor method that makes working with asyncronous code a lot easier. Not only does it use fibers under the hood, but it also binds the Meteor environment to that function, so you can access things like this.userId and this.connection.


```javascript
var Fiber = Npm.require('fibers');

var scheduleWashioSync = Meteor.wrapAsync(scheduleWashio);
var giveWashioClothesSync = Meteor.wrapAsync(giveWashioClothes);

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
```

thank you!

check out smashingthingstogether.com and my brand new meteor app artisfy.com

you can contact me on twitter at panphora or via email at david@storylog.com

any questions?
















