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
  debugger;
  console.log('message handled');
  files.set(event.data.filename, {
    file: event.data.file,
    type: event.data.type
  });
});


this.addEventListener('install', function(e) {
  const getCaches = caches.open('shell-v1').then(function(cache) {
    return cache.addAll([]);
  });

  e.waitUntil(getCaches);
});

this.addEventListener('fetch', function(e) {
  debugger;

  var response;

  var urlParser = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

  var matches = urlParser.exec(e.request.url);
  var path = matches[13];
  var filename = path.replace('/files/', '');

  if (files.has(filename)) {
    const file = files.get(filename);
    const header = new Headers();
    header.append('Content-Type', 'image/jpeg');
    console.log('building response');
    console.log(headers);
    response = new Response(file, {
      status: 200,
      statusText: 'OK',
      headers: headers
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
