var files = new Map();

this.addEventListener('message', function(event) {
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
  var response;

  var urlParser = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

  var matches = urlParser.exec(e.request.url);
  var path = matches[13];
  var filename = path.replace('/files/', '');

  if (files.has(filename)) {
    const file = files.get(filename);
    const headers = new Headers();
    headers.append('Content-Type', 'image/jpeg');
    var blob = new Blob([file.file]);
    response = new Response(blob, {
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
