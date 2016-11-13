/*
Usage:

// Register the service worker
navigator.serviceWorker.register('serviceworker.js', { scope: "/" }).then(
  function(registration) {
    if (registration.installing) {
      registration.installing.postMessage('Howdy from your installing page.');
    }
  },
  function(why) {
    console.error('Installing the worker failed!:', why);
  }
);

// Send the image data to the service worker with
// the filename of and the file data
var message = {
  filename: 'cat.jpg',
  file: new ArrayBuffer(8)
};
navigator.serviceWorker.controller.postMessage(message);

// To load or download the data, create an element with a url
// that points to "files/<filename>"
var img = document.createElement('img');
img.src = 'files/cat.jpg';
document.body.appendChild(img);

*/


var files = new Map();

this.addEventListener('message', function(event) {
  files.set(event.data.filename, event.data.file);
});


this.addEventListener('install', function(e) {
  var getCaches = caches.open('shell-v1').then(function(cache) {
    return cache.addAll([]);
  });

  e.waitUntil(getCaches);
});

this.addEventListener('fetch', function(e) {

  var response;

  var urlParser = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

  var matches = urlParser.exec(e.request.url);
  var path = matches[13];
  var filename = path.replace('/files/', '');

  if (files.has(filename)) {
    response = new Response(files.get(filename), {
      status: 200,
      statusText: 'OK',
    });
  } else {
    response = caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    }).catch(function() {
      return caches.match('/fallback.html');
    });
  }

  e.respondWith(response);

});
