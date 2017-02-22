This is a blog post I made, based on a presentation I gave at a Meteor meetup in early 2015.

## Part 1: 

### The call stack, the event loop, the task queue, and how asyncronous functions work<br><br>

First, some basic context. When you run some JavaScript code, it's added to the **task queue**. Think of this as a todo list.

When we reach the first item on the todo list, we move it over to another todo list called the **call stack**. Think of this as a todo list that you want to complete before moving on to the rest of the stuff in your main todo list. The reason you do this is because things in this todo list (the **call stack**) might expand into more than one thing.

Have you seen [Rick and Morty](http://www.adultswim.com/videos/rick-and-morty/)? No..? Well, there are magical creatures on that show called Meeseeks. The way they work is you press a button and a Meeseeks pops out. Its one goal in life is to accomplish a single task, whatever you want, and then disappear forever. When it gets really frustrated though, it might choose to press the button again itself and out will pop another Meeseeks, who will also try to accomplish the original goal.

![Meeseeks](https://s3.amazonaws.com/webnet/smashing-things/post-call-stack/meeseeks.gif)

When a function in your code calls another function, think of this as a Meeseeks pressing the button and summoning another Meeseeks to help him accomplish the original function's goal. This can get pretty deep pretty fast, with one function that calls another function that calls another function. You can end up with hundreds of Meeseeks, I mean functions, which were all called by one original function.

Let me give you an example of this.

```javascript
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
  // ...
}

doLaundry();
```

**Note:** You can access all of the code mentioned in this article here: [June 2015 Meteor Meetup](https://github.com/panphora/meteorMeetup)

In the code above, we call `doLaundry()`, which in turn calls `getQuarters()`, which in turn calls `getQuartersFromBank()`, which finally calls `walkToBank()`. 

This could go on and on.

If you run this code on the server in a meteor app, using `meteor debug` instead of the standard `meteor` command &mdash; and put a `debugger;` statement in the `walkToBank()` function, you can see the **call stack** in your developer tools.

Add the `debugger` statement:

```javascript
function walkToBank () {
  debugger;
  // ...
}
```

Run meteor in debug mode:

```bash
cd /repoDirectory
meteor debug
```

Go to the url it prints out:

```bash
To debug the server process using a graphical debugging interface, visit this URL in your web browser:
http://localhost:8080/debug?port=5858
```

Here's what the **call stack** will look like (look at the right sidebar after loading up that url):

![call stack](https://s3.amazonaws.com/webnet/smashing-things/post-call-stack/call-stack-screenshot.png)

The function at the top of the **call stack**, `walkToBank`, is the one we're currently processing. After that's finished, we'll return to the previous function and finish it up before moving on.

So... as you can see, we can end up doing a lot of things that we weren't intending to do in the first place, like going to the bank when all we wanted to do was do laundry. 

Now, this can cause some issues for our main todo list (the **task queue**). Let's pretend we need to not only get laundry done today, but also go shopping and go to a Meteor Meetup. If we spend all our time doing laundry, we won't have time for other things.

This is why we use asynchronous functions. Asynchronous functions allow us to pass off tasks to another server or database or to the file system &mdash; and get the results whenever they're handed back to us. This way, if we want to resize an image and add a watermark to it, for example, we can upload it to an external service and wait for the response while the rest of our program does something else.

Let me give you an example of an asynchronous function in code.

```javascript
function doLaundryWithWashio () {
  // "Washio" is a service that does laundry for you
  var clothes = gatherClothes();

  scheduleWashio('12pm', function () {
    // Washio arrives for initial pick-up
    giveWashioClothes(clothes, function (cleanClothes) {
      // Washio arrives to drop off clothes
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

// a lot could happen here while the above asynchronous function is running, but we're just printing a message
console.log('do something else'); 
```

As you can see, we have some callbacks that take some time to return. The callback function `scheduleWashio`, for example, won't return for 5 seconds. This will give us time to do other things and won't block the rest of our code. 

When the **call stack** is clear, for example after some asynchronous code is called that won't return for a while, the JavaScript runtime will take the next thing off the **task queue** and add it to the **call stack**. This code, in turn, can call other functions that will also be added to the **call stack**. And the JavaScript runtime won't be able to do anything else until all of this code is done running.

This is why, when you write blocking code, like a `for` loop ([for loop docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for)) that iterates over 10,000 items, it can lock up the page. The JavaScript runtime isn't able to update the page or even handle events until the call stack is clear.

## Part 2: 
### A simple example of using fibers<br><br>

You may have noticed that the asynchronous code in the last section got a little unwieldy. You can get very used to thinking linearly, so when you have to write code that will be run "some time in the future" your abstractions can break down. We can also end up with a lot of nested callbacks, which makes it a little harder to think about what our code is actually going to do.

This is where fibers come in. ([node-fibers docs](https://github.com/laverdet/node-fibers))

Fibers make asynchronous code look and behave like synchronous code. They simultaneously allow us to avoid callbacks while also not blocking the execution of the rest of our code. 

Here's an example of a fiber, using our previous code as a template. Run it using `meteor debug` if you want to observe the call stack at different points.

```javascript
var Fiber = Npm.require('fibers');

function doLaundryWithWashio () {
  console.log('Doing laundry');

  var clothes = gatherClothes();

  debugger; //look at the call stack here
  var isConfirmed = scheduleWashio('12pm');
  console.log('Washio is: ', isConfirmed ? 'confirmed' : 'not confirmed');

  debugger; //look at the terminal... the for loop at the bottom of this code should have completed before the "Washio is: confirmed" string gets printed out

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
```

As you can see, this can get a bit complicated. Luckily, most Meteor server code runs in fibers automatically, so it takes care of the heavy lifting &mdash; like the code at the bottom of the snippet above that creates and runs the fibers. If you've ever wondered why you can return a result from the database in Meteor without using a callback, it's because all of the Meteor database functions use Fibers under the hood.

In the code above, we're running the `doLaundryWithWashio()` function in a fiber. We're also running a `for` loop in another fiber right underneath it. 

In the main `doLaundryWithWashio` function you'll notice we're treating our asynchronous functions (`scheduleWashio` and `giveWashioClothes`) like synchronous function and using the results we get back from them right away in the next computation. The magic of fibers happens inside of these functions. 

First, we get the current fiber using `var fiber = Fiber.current;`. Then, at the end of the function, we call `Fiber.yield()`. Think of this `yield` method like you're pressing the pause button while playing a video game so you can go off and do something else. 

When you come back to your video game later, you can start where you left off. This is what the `fiber.run()` function does inside of the asynchronous `setTimeout` function. It starts the fiber that we paused and adds it to the **task queue**. This means that after we call `giveWashioClothes()` (i.e. our first async function), the `for` loop in the next fiber has time to run. After that's complete, we wait a little and then the fiber will resume and continue running.

There are a couple of good reasons you might want to know about all of this stuff. One reason is that you can get a very annoying error sometimes if you work with a lot of server code. It says something like, "Meteor code must always run within a Fiber." You could build lots of stuff in Meteor without knowing what this error means, but I think it's fun and useful to actually know.

The second reason you might want to know about fibers is because there's a massive ecosystem of [npm modules](https://www.npmjs.com/#explicit), specifically built for Node.js, a lot of which use asynchronous callbacks -- and, because these modules are not normally compatible with running inside of fibers, you can't use them without modifying them a little bit to work with Meteor.

## Part 3 
### A simple example of using Meteor.wrapAsync()

There's an excellect blog post by the Discover Meteor team called ["Wrapping NPM Packages for Meteor"](https://www.discovermeteor.com/blog/wrapping-npm-packages/). I highly recommend you check it out. I was originally going to write this blog post on how to wrap the [Mailgun NPM module](https://github.com/1lobby/mailgun-js) for Meteor, because I needed to be able to send attachments in my application and Meteor's `Email` functionality ([Email docs](http://docs.meteor.com/#/full/email)) doesn't support this (even though it will in [version 1.1.1](https://github.com/meteor/meteor/blob/devel/History.md#in-progress-v111)). But they cover most of how to do that in the Discover Meteor post, so I decided to talk more about the lower level stuff here.

To wrap up, I want to show you a Meteor method that makes working with asynchronous code easier. Not only does it use fibers under the hood, but it also binds the Meteor environment to that function, so you can access things like the `Meteor` object and built-ins like `this.Blaze` and `this.Deps`.

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
    }
  }
}).run();
```

This code is remarkably similar to our initial fibers example. The only difference is we simplify our asynchronous functions by wrapping them with `Meteor.wrapAsync`. We don't have to do anything else except wrap it, which makes it perfect for working with code you don't want to modify.

Two things to keep in mind when using `Meteor.wrapAsync`: it expects the callback function that's called inside your asynchronous function to be the last argument and it expects the callback's first parameter to be an error or `null` value (if there is no error). This is standard practice and you'll find that most NPM modules do this already.

So, now you know &mdash; if you want to include an external, asyncronous module in Meteor (and be able to use it like it's running syncronously), you should use `Meteor.wrapAsync`!

And now you also know why!

If you have any question, you can leave a comment here, contact me on twitter at [artisfyhq](https://twitter.com/artisfyhq), or email me at [david@storylog.com](mailto:david@storylog.com).

**Note:** You can access all of the code mentioned in this article here: [June 2015 Meteor Meetup](https://github.com/panphora/meteorMeetup)

If you want an alternate explanation with extra-cute explanatory comics, visit this awesome article: [Everything You Need To Know About Async & Meteor](http://phucnguyen.info/blog/everything-you-need-to-know-about-async-meteor/)
